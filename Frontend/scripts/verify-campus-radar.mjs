/** Optional real-browser checks. Reuses an existing Puppeteer installation; installs nothing. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,'docs/verification');
const port=Number(process.env.RADAR_TEST_PORT??5219);
assert(Number.isInteger(port)&&port>=1024&&port<=65535,'RADAR_TEST_PORT must be a local unprivileged port.');
let puppeteer;
try {
  const module=await import(process.env.VIDYUTIQ_BROWSER_MODULE??'puppeteer');
  puppeteer=module.puppeteer??module.default;
  assert.equal(typeof puppeteer?.launch,'function');
} catch {
  throw new Error('Browser tooling unavailable. Set VIDYUTIQ_BROWSER_MODULE to an existing Puppeteer-compatible module URL. See docs/campus-radar-developer-guide.md. No package was installed.');
}
const executable=process.env.VIDYUTIQ_CHROME_PATH??[
  'C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync);
mkdirSync(output,{recursive:true});
const report={startedAt:new Date().toISOString(),checks:[],screenshots:[],errors:[],environment:{renderer:'Chrome software WebGL; not a hardware FPS benchmark'}};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'pipe',windowsHide:true});
let browser;
const save=()=>writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
const check=async(name,run)=>{await run();report.checks.push({name,passed:true});console.log(`PASS ${name}`);};
try {
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Vite startup timed out.')),15000);
    server.once('exit',code=>{clearTimeout(timer);reject(Error(`Vite exited (${code}). Check the test port.`));});
    server.stdout.on('data',chunk=>{if(chunk.toString().includes('Local:')){clearTimeout(timer);resolve();}});
  });
  browser=await puppeteer.launch({executablePath:executable,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  report.environment.browser=await browser.version();
  const page=await browser.newPage();await page.setViewport({width:1480,height:1100});
  const requests=[];
  page.on('request',request=>requests.push(request.url()));
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(['error','warn'].includes(message.type()))report.errors.push(message.text());});
  const click=async text=>{
    for(const button of await page.$$('button'))if(await button.evaluate((element,label)=>element.textContent.trim()===label,text)){await button.click();return;}
    throw Error(`Missing button: ${text}`);
  };
  const settled=async()=>{
    await page.waitForFunction(()=>document.querySelector('section.building-viewer')?.dataset.cameraBusy==='false',{timeout:15000});
    await wait(180); // allow the final DOM labels/ResizeObserver to settle
  };
  const capture=async name=>{await page.screenshot({path:resolve(output,`${name}.png`),fullPage:true});report.screenshots.push(`${name}.png`);};
  const boxes=()=>page.evaluate(()=>Object.fromEntries(['.app-header','.sidebar','.building-heading','.radar-analytics','.floor-panel-buttons','.floor-exits','.building-stage'].map(selector=>[selector,document.querySelector(selector).getBoundingClientRect().toJSON()])));
  await page.goto(`http://127.0.0.1:${port}/app/dashboard`,{waitUntil:'networkidle0'});
  const originalKpis=await page.$$eval('.kpi-card',elements=>elements.map(element=>element.textContent));
  await click('Campus Radar');await page.waitForSelector('canvas');await settled();
  const fiberURL=requests.find(url=>url.includes('/node_modules/.vite/deps/@react-three_fiber.js'));
  assert(fiberURL,'The installed Fiber runtime was loaded.');
  const scene=()=>page.evaluate(async url=>{
    const fiber=await import(url),state=Array.from(fiber._roots.values())[0].store.getState();
    const building=state.scene.getObjectByName('pccoe-building-6');
    return {camera:state.camera.uuid,frame:state.gl.info.render.frame,geometries:state.gl.info.memory.geometries,
      calls:state.gl.info.render.calls,triangles:state.gl.info.render.triangles,
      floors:[1,2,3,4,5].map(floor=>{const model=building.getObjectByName(`floor-${floor}`);return {floor,y:model.position.y,visible:model.visible,uuid:model.uuid};}),
      roomGeometry:state.scene.getObjectByName('room-6207').geometry.uuid};
  },fiberURL);
  const floor=async number=>{await page.click(`.floor-panel-buttons button[aria-label^="F${number}"]`);await settled();};
  const labels=async()=>{
    const rectangles=await page.$$eval('.plan-room-label',elements=>elements.filter(element=>getComputedStyle(element).visibility==='visible'&&element.offsetWidth>0).map(element=>element.getBoundingClientRect().toJSON()));
    for(let a=0;a<rectangles.length;a++)for(let b=a+1;b<rectangles.length;b++){
      const x=rectangles[a],y=rectangles[b];assert(!(x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top),'Visible room labels must not overlap.');
    }
    return rectangles.length;
  };
  const initial=await scene(),fixed=await boxes();
  await check('A: complete exterior, five levels, three distinct entrances and two lawns',async()=>{
    const architecture=await page.evaluate(async url=>{
      const fiber=await import(url),state=Array.from(fiber._roots.values())[0].store.getState(),building=state.scene.getObjectByName('pccoe-building-6');
      const three=await import('/node_modules/.vite/deps/three.js');
      const central=building.getObjectByName('central-entrance'),north=building.getObjectByName('north-tower-floor-1'),south=building.getObjectByName('south-tower-floor-1');
      let extruded=false;central.traverse(mesh=>{if(mesh.geometry?.type==='ExtrudeGeometry')extruded=true;});
      const cylinder=group=>group.children.find(mesh=>mesh.geometry?.type==='CylinderGeometry').geometry.parameters.thetaLength;
      let lawns=0;building.getObjectByName('entrance-landscaping').traverse(mesh=>{if(mesh.isInstancedMesh&&mesh.material.color.getHexString()==='66784a')lawns+=mesh.count;});
      const bounds={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
      building.traverse(mesh=>{
        if(!mesh.isMesh)return;
        for(let parent=mesh;parent;parent=parent.parent)if(!parent.visible||parent.name==='entrance-landscaping')return;
        const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(materials.every(material=>material.opacity<.01))return;
        const box=new three.Box3().setFromObject(mesh);
        for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
          const point=new three.Vector3(x,y,z).project(state.camera),px=(point.x+1)*state.size.width/2,py=(1-point.y)*state.size.height/2;
          bounds.left=Math.min(bounds.left,px);bounds.right=Math.max(bounds.right,px);bounds.top=Math.min(bounds.top,py);bounds.bottom=Math.max(bounds.bottom,py);
        }
      });
      return {extruded,curves:[cylinder(north),cylinder(south)],canopies:[north,south].filter(group=>group.getObjectByName('curved-entrance-canopy')).length,lawns,bounds,width:state.size.width,height:state.size.height};
    },fiberURL);
    assert(architecture.extruded);assert(architecture.curves.every(angle=>Math.abs(angle-Math.PI)<.001));assert.equal(architecture.canopies,2);assert.equal(architecture.lawns,2);
    assert.equal(initial.floors.length,5);assert(initial.floors.every(level=>level.visible));
    assert(architecture.bounds.left>=0&&architecture.bounds.right<=architecture.width-236,'Building side walls fit beside the fixed rail.');
    assert(architecture.bounds.top>=0&&architecture.bounds.bottom<architecture.height-65,'Building fits above camera controls.');
    report.exterior={...architecture,calls:initial.calls,triangles:initial.triangles};
    await capture('01-exterior');await click('Front');await settled();await capture('01b-front');await click('Isometric');await settled();
  });
  const scrub=async delta=>{const rect=await page.$eval('.building-scene-surface',element=>element.getBoundingClientRect().toJSON());await page.mouse.move(rect.left+100,rect.top+80);await page.mouse.wheel({deltaY:delta});await settled();};
  await check('B: scoped forward/reverse wheel separation, aligned floors and stationary UI',async()=>{
    await scrub(750);assert(Math.abs(await page.$eval('#building-separation',element=>Number(element.value))-.5)<.001);await capture('02-half-exploded');assert.deepEqual(await boxes(),fixed);
    await scrub(900);assert.equal(await page.$eval('#building-separation',element=>Number(element.value)),1);
    const stack=await scene();for(let index=1;index<5;index++)assert(Math.abs(stack.floors[index].y-stack.floors[index-1].y-9.4)<.001);
    assert.deepEqual(await boxes(),fixed);await capture('03-exploded');
    await scrub(-1600);assert.equal(await page.$eval('#building-separation',element=>Number(element.value)),0);
    assert.deepEqual((await scene()).floors.map(level=>level.y),initial.floors.map(level=>level.y));assert.deepEqual(await boxes(),fixed);
  });
  await check('C: five independently defined floor maps, corrected facilities and room types',async()=>{
    report.floors=[];
    for(const number of [1,2,3,4,5]){
      await floor(number);assert.deepEqual((await scene()).floors.filter(level=>level.visible).map(level=>level.floor),[number]);
      const options=await page.$$eval('.plan-room-picker option',elements=>elements.map(element=>({id:element.value,text:element.textContent})));
      assert(options.length>20);assert(!options.some(option=>option.id===`6${number}05`&&(number===4||number===5)));
      if(number===1){assert(options.some(option=>option.text.includes('Data Centre')));assert(!options.some(option=>['6101','6121'].includes(option.id)));}
      if(number>=4)for(const suffix of ['09','10','14','15'])assert(options.find(option=>option.id===`6${number}${suffix}`).text.includes('Classroom'));
      const facilities=await page.$$eval('.plan-room-label',elements=>elements.filter(element=>['WF','LIFT','STAIR'].includes(element.dataset.kind)).map(element=>({kind:element.dataset.kind,text:element.textContent.trim()})));
      assert.equal(facilities.filter(space=>space.kind==='WF'&&space.text==='WR').length,2);assert.equal(facilities.filter(space=>space.kind==='LIFT').length,2);assert.equal(facilities.filter(space=>space.kind==='STAIR').length,2);
      report.floors.push({floor:number,options:options.length-1,visibleLabels:await labels()});assert.deepEqual(await boxes(),fixed);
      if(number===1)await capture('04-floor-1');if(number===4)await capture('05-floor-4');
    }
  });
  await check('D: actual room hover/click, clamped tooltip and honest unavailable details',async()=>{
    await floor(2);
    const roomPoint=await page.evaluate(async url=>{
      const fiber=await import(url),state=Array.from(fiber._roots.values())[0].store.getState();
      const mesh=state.scene.getObjectByName('room-6207'),point=mesh.getWorldPosition(state.camera.position.clone());
      point.x+=2;point.z+=.8;point.y+=.12;point.project(state.camera);
      const canvas=state.gl.domElement.getBoundingClientRect(),x=canvas.left+(point.x+1)*canvas.width/2,y=canvas.top+(1-point.y)*canvas.height/2;
      return {x,y,target:document.elementFromPoint(x,y)?.tagName};
    },fiberURL);
    assert.equal(roomPoint.target,'CANVAS','Picking test targets the actual room polygon, outside its DOM label.');
    await page.mouse.move(roomPoint.x,roomPoint.y);await wait(220);
    const card=await page.$eval('.plan-hover',element=>element.getBoundingClientRect().toJSON()),stage=await page.$eval('.building-stage',element=>element.getBoundingClientRect().toJSON());
    assert(card.left>=stage.left&&card.right<stage.right-236&&card.top>=stage.top&&card.bottom<stage.bottom-65);
    assert.match(await page.$eval('.plan-hover',element=>element.textContent),/6207.*Laboratory.*DEMO DATA.*No telemetry/s);await capture('06-room-hover');
    await page.mouse.click(roomPoint.x,roomPoint.y);await settled();assert.equal(await page.$eval('.plan-room-picker',element=>element.value),'6207');assert.match(await page.$eval('.plan-room-detail',element=>element.textContent),/No telemetry/);await capture('07a-room-6207-unavailable');
    await click('Close room');await settled();
    await page.mouse.move(roomPoint.x,roomPoint.y);await page.mouse.down();await page.mouse.move(roomPoint.x+30,roomPoint.y+10,{steps:5});await page.mouse.up();await settled();
    assert.equal(await page.$eval('.plan-room-picker',element=>element.value),'','Orbit dragging must not select the initial room hit.');
    await page.select('.plan-room-picker','6206');await settled();assert.match(await page.$eval('.plan-room-detail',element=>element.textContent),/DEMO DATA.*Current demand.*kW.*Period energy.*kWh.*Historical consumption/s);await capture('07-room-details');
  });
  await check('E: demo energy/history, evidence-backed anomalies and disconnected live state',async()=>{
    assert(await page.$('.radar-room-history svg'));await click('Energy View');await settled();await capture('08-energy-view');
    await click('Anomaly View');await settled();await capture('09-anomaly-view');
    const color=await page.evaluate(async url=>{const fiber=await import(url),state=Array.from(fiber._roots.values())[0].store.getState();return state.scene.getObjectByName('room-6206').material.color.getHexString();},fiberURL);assert.equal(color,'ca2127');
    await page.select('[aria-label="Energy data source"]','connected');await wait(150);assert.match(await page.$eval('.plan-room-detail',element=>element.textContent),/Not connected/);assert(!await page.$('.radar-room-history svg'));
    await page.select('[aria-label="Energy data source"]','demo');await settled();await floor(4);assert.equal(await page.$eval('.plan-room-picker',element=>element.value),'');assert(!await page.$('.plan-room-detail'));
    assert.equal((await scene()).roomGeometry,initial.roomGeometry);assert.equal((await scene()).camera,initial.camera);
  });
  await check('Resize/reduced motion, equivalent list and WebGL cleanup on navigation',async()=>{
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,900],[1440,900]]){
      await page.setViewport({width,height});await settled();await labels();
      const layout=await page.evaluate(()=>({stage:document.querySelector('.building-stage').getBoundingClientRect().toJSON(),scrub:document.querySelector('.building-scrub').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}));assert(!layout.overflow);assert(layout.stage.bottom<=layout.scrub.top);assert(layout.scrub.bottom<=height);
    }
    await click('Room list');await page.waitForSelector('.radar-plan-list');await page.type('.radar-plan-filters input','6405');await page.click('.radar-plan-table td button');assert.match(await page.$eval('.radar-list-detail',element=>element.textContent),/6406.*6405/s);
    await wait(600);assert.equal(await page.$$eval('canvas',elements=>elements.length),0);assert.equal(await page.evaluate(async url=>(await import(url))._roots.size,fiberURL),0);
    await page.click('#building-tab');await settled();assert.equal(await page.$$eval('canvas',elements=>elements.length),1);assert.equal((await scene()).geometries,initial.geometries);
    const frame=(await scene()).frame;await wait(350);assert.equal((await scene()).frame,frame);
  });
  await check('Existing dashboard, three shortcut destinations and room modal remain functional',async()=>{
    await page.click('.sidebar button[aria-current="page"]');await click('Dashboard');await page.waitForSelector('.dashboard');
    assert.deepEqual(await page.$$eval('.kpi-card',elements=>elements.map(element=>element.textContent)),originalKpis);
    await page.select('#inspect-room','6102CR');await page.waitForSelector('[aria-modal="true"]');await click('Close');await page.waitForFunction(()=>!document.querySelector('[aria-modal="true"]'));
    for(const [title,heading] of [['Campus Insights','Analytics'],['Active Alerts','Waste Alerts'],['Room Monitoring','Campus Radar']]){
      if(!await page.$('.dashboard')){await click('Dashboard');await page.waitForSelector('.dashboard');}
      for(const button of await page.$$('.dashboard-links button'))if(await button.evaluate((element,title)=>element.querySelector('h3')?.textContent===title,title)){await button.click();break;}
      await page.waitForFunction(heading=>document.querySelector('.app-header h1')?.textContent===heading,{},heading);
      if(title==='Room Monitoring')await settled();
    }
  });
  assert.deepEqual(report.errors,[]);report.passed=true;report.finishedAt=new Date().toISOString();save();
  console.log(`Verified ${report.checks.length} milestone/regression groups. Screenshots and report: ${output}`);
} catch(error){report.passed=false;report.failure=String(error);save();throw error;}
finally{if(browser)await browser.close();server.kill();}
