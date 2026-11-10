/** Built-app submission audit. Reuses existing Chrome/Puppeteer; installs nothing. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import ts from 'typescript';
const frontend=fileURLToPath(new URL('../',import.meta.url)),root=resolve(frontend,'..'),dist=resolve(frontend,'dist');
assert(existsSync(resolve(dist,'_redirects')),'Run npm run build first.');
const output=resolve(frontend,'docs/submission-verification');mkdirSync(output,{recursive:true});
const redirects=new Map(readFileSync(resolve(dist,'_redirects'),'utf8').split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#')).map(line=>line.trim().split(/\s+/)).map(([from,to])=>[from,to]));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg','.svg':'image/svg+xml','.txt':'text/plain','.json':'application/json'};
// Local static hosting with the checked-in exact rewrites, not a Netlify deployment.
const server=createServer((request,response)=>{try{
 const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);let file=resolve(dist,'.'+pathname);
 if(file!==dist&&!file.startsWith(dist+sep)){response.writeHead(403).end();return;}
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
 if(!existsSync(file)&&redirects.has(pathname))file=resolve(dist,'.'+redirects.get(pathname));
 if(!existsSync(file)){response.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');return;}
 response.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'}).end(readFileSync(file));
}catch{response.writeHead(400).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
const report={startedAt:new Date().toISOString(),checks:[],errors:[],environment:{node:process.version,host:'Local built-file server honoring _redirects; not cloud deployment',renderer:'Chrome software WebGL; not a GPU benchmark'}};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=async(name,run)=>{await run();report.checks.push({name,passed:true});console.log('PASS '+name);};
const save=()=>writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');let browser;
try{
 const module=await import(process.env.VIDYUTIQ_BROWSER_MODULE??'puppeteer'),puppeteer=module.puppeteer??module.default;
 const executable=process.env.VIDYUTIQ_CHROME_PATH??['C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync);
 browser=await puppeteer.launch({executablePath:executable,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();await page.setViewport({width:1480,height:1100});
 page.on('pageerror',error=>report.errors.push(error.message));page.on('console',message=>{if(['warn','error'].includes(message.type()))report.errors.push(message.text());});
 const click=async(text,scope='button')=>{for(const button of await page.$$(scope))if(await button.evaluate((node,label)=>node.textContent.trim()===label,text)){await button.click();return;}throw Error('Missing control: '+text);};
 const goto=path=>page.goto(base+path,{waitUntil:'networkidle0'}),capture=async name=>page.screenshot({path:resolve(output,name+'.png')});
 const choose=async label=>{await click('Simulate scenario');for(const button of await page.$$('button'))if(await button.evaluate((node,label)=>node.textContent.trim().startsWith(label),label)){await button.click();return;}throw Error('Missing preset: '+label);};
 const compiled=ts.transpileModule(readFileSync(resolve(frontend,'src/data/campusRooms.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2020}}).outputText;
 const {CAMPUS_ROOMS,getDefaultAppliances}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const watts=type=>getDefaultAppliances(type).filter(a=>a.isOn).reduce((sum,a)=>sum+a.count*a.wattageEach,0);
 await check('Deployment: known pages/assets load; unknown assets stay 404',async()=>{
  for(const route of ['/',...redirects.keys()]){const response=await fetch(base+route);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);}
  const html=await (await fetch(base+'/')).text(),asset=html.match(/src="([^"]+\.js)"/)[1];assert.equal((await fetch(base+asset)).status,200);assert.match((await fetch(base+asset)).headers.get('content-type'),/javascript/);
  for(const missing of ['/assets/missing.js','/landing/missing.png','/app/radar/missing.js'])assert.equal((await fetch(base+missing)).status,404);
 });
 await goto('/');await page.waitForSelector('.landing-page');await page.click('.landing-nav-launch');await page.waitForSelector('.dashboard');
 await check('Demo context follows state and assumptions disclose preloaded savings',async()=>{
  assert.match(await page.$eval('.simulation-context summary',node=>node.textContent),/Lunch Break/);
  await click('TUE');await page.focus('[aria-label="Simulation time"]');await page.keyboard.press('Home');await wait(200);assert(!await page.$eval('.simulation-context',node=>node.textContent.includes('Lunch Break')));
  await choose('Lunch Break Waste');assert.match(await page.$eval('.simulation-context summary',node=>node.textContent),/Lunch Break/);
  await click('Assumptions');await page.waitForSelector('[aria-modal="true"]');assert.match(await page.$eval('[aria-modal="true"]',node=>node.textContent),/Demonstration seed.*1\.24.*not performed by you/s);await click('Close','[aria-modal="true"] button');await page.waitForFunction(()=>!document.querySelector('[aria-modal="true"]'));await capture('dashboard-demo-context');
 });
 await check('Room diagnostics expose simulation evidence without confidence percentages',async()=>{
  await page.select('#inspect-room','6206LA');await page.waitForSelector('[aria-modal="true"]');await click('Sensors & Simulation','[aria-modal="true"] button');await wait(250);
  const text=await page.$eval('[aria-modal="true"]',node=>node.textContent);assert.match(text,/Rule-Based Diagnostic/);assert.doesNotMatch(text,/Confidence|Gemini|PZEM.*reports|Physical Presence/i);await capture('rule-diagnostic');
 });
 await check('Room Eco-Off preserves the 30-minute formula and records estimated savings',async()=>{
  await click('Actions','[aria-modal="true"] button');await wait(200);await click('Simulate Eco-Off & Close','[aria-modal="true"] button');await page.waitForFunction(()=>!document.querySelector('[aria-modal="true"]'));
  await click('Audit Trail','.sidebar button');await page.waitForSelector('tbody tr');const row=await page.$$eval('tbody tr',rows=>rows.find(row=>row.textContent.includes('6206LA')).textContent),expected=Number((watts('LABORATORY')*.5/1000).toFixed(2));
  assert(row.includes(expected.toFixed(2)+' kWh'));assert(row.includes((expected*9).toFixed(2)));assert.match(await page.$eval('tbody',node=>node.textContent),/Demo seed.*preloaded/);await capture('eco-off-audit');
  await click('Analytics','.sidebar button');await wait(250);assert((await page.$eval('.page-content',node=>node.textContent)).includes((1.24+expected).toFixed(2)));
 });
 await check('Bulk Eco-Off uses nameplate estimates without updater side effects',async()=>{
  await goto('/app/dashboard');await page.click('.remediate-button');await click('Audit Trail','.sidebar button');await page.waitForSelector('tbody tr');const row=await page.$eval('tbody tr',node=>node.textContent),expected=Number((CAMPUS_ROOMS.reduce((sum,room)=>sum+watts(room.roomType),0)*.5/1000).toFixed(2));
  assert.match(row,/CAMPUS-WIDE/);assert(row.includes(expected.toFixed(2)+' kWh'),`Expected ${expected.toFixed(2)} kWh in ${row}`);
 });
 await check('All built app URLs refresh and browser history remains functional',async()=>{
  for(const route of redirects.keys()){await goto(route);await page.waitForSelector('.sidebar [aria-current="page"]');}
  await goto('/app/radar');await page.waitForSelector('section.building-viewer[data-camera-busy="false"]');await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('section.building-viewer[data-camera-busy="false"]');
  await click('Dashboard','.sidebar button');await page.waitForSelector('.dashboard');await page.goBack();await page.waitForSelector('section.building-viewer');await page.goForward();await page.waitForSelector('.dashboard');
 });
 await check('Mobile room controls fit inside the dialog',async()=>{
  for(const width of [390,320]){
   await page.setViewport({width,height:844,isMobile:true,hasTouch:true});await goto('/app/dashboard');await page.select('#inspect-room','6206LA');await page.waitForSelector('[aria-modal="true"]');await click('Actions','[aria-modal="true"] button');await wait(250);
   const bounds=await page.$eval('[aria-modal="true"]',node=>({width:node.clientWidth,scroll:node.scrollWidth,rect:node.getBoundingClientRect().toJSON(),buttons:[...node.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getBoundingClientRect().toJSON())}));assert(bounds.scroll<=bounds.width,`${width}px dialog scrolls horizontally`);assert(bounds.rect.left>=0&&bounds.rect.right<=width);assert(bounds.buttons.every(box=>box.right<=bounds.rect.right+1),`${width}px dialog clips a control`);await capture(width===390?'mobile-room-controls':'mobile-room-controls-320');
  }
 });
 await check('WebGL-disabled Radar opens a room list and leaves 6207 unavailable',async()=>{
  const disabled=await puppeteer.launch({executablePath:executable,headless:true,args:['--no-sandbox','--disable-webgl']});try{
   const tab=await disabled.newPage();await tab.goto(base+'/app/radar',{waitUntil:'networkidle0'});await tab.waitForSelector('.building-fallback');for(const button of await tab.$$('.building-fallback button'))if(await button.evaluate(node=>node.textContent.includes('room list'))){await button.click();break;}await tab.waitForSelector('.radar-plan-list');await tab.type('.radar-plan-filters input','6207');await tab.click('.radar-plan-table td button');assert.match(await tab.$eval('.radar-list-detail',node=>node.textContent),/No telemetry/);await tab.screenshot({path:resolve(output,'radar-webgl-fallback.png')});
  }finally{await disabled.close();}
 });
 await check('Root dev/preview commands use Frontend and forward CLI flags',async()=>{
  assert(process.env.npm_execpath,'Run with npm run verify:submission.');for(const [command,port] of [['dev',5231],['preview',5232]]){
   const child=spawn(process.execPath,[process.env.npm_execpath,'run',command,'--','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'pipe',windowsHide:true});try{
    let ready=false;for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/`)).ok){ready=true;break;}}catch{}await wait(150);}assert(ready,`Root ${command} failed on the requested port.`);
    if(command==='dev')assert.match(await (await fetch(`http://127.0.0.1:${port}/src/components/landing/LandingPage.tsx`)).text(),/HeroSection/);else assert.match(await (await fetch(`http://127.0.0.1:${port}/app/radar`)).text(),/VidyutIQ/);
   }finally{if(process.platform==='win32')spawnSync('taskkill',['/pid',String(child.pid),'/t','/f'],{windowsHide:true,stdio:'ignore'});else child.kill();}
  }
 });
 assert.deepEqual(report.errors,[]);report.completedAt=new Date().toISOString();report.passed=true;save();
}catch(error){report.failure=error.stack;report.passed=false;save();throw error;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
