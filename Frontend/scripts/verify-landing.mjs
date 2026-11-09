/** Optional browser audit. Reuses installed Chrome and Puppeteer; installs nothing. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,'docs/landing-verification');
const port=Number(process.env.LANDING_TEST_PORT??5224);
assert(Number.isInteger(port)&&port>=1024&&port<=65535);
const tooling=await import(process.env.VIDYUTIQ_BROWSER_MODULE??'puppeteer');
const puppeteer=tooling.puppeteer??tooling.default;
const executable=process.env.VIDYUTIQ_CHROME_PATH??[
 'C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium',
 '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync);
const report={startedAt:new Date().toISOString(),checks:[],screenshots:[],errors:[],expectedDevelopmentNotices:[],environment:{renderer:'Chrome software WebGL; not a hardware FPS benchmark'}};
mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'pipe',windowsHide:true});
let browser;
const save=()=>writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
const check=async(name,run)=>{await run();report.checks.push({name,passed:true});console.log(`PASS ${name}`);};
try {
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Vite startup timed out.')),15000);
  server.once('exit',code=>{clearTimeout(timer);reject(Error(`Vite exited (${code}).`));});
  server.stdout.on('data',chunk=>{if(chunk.toString().includes('Local:')){clearTimeout(timer);resolve();}});
 });
 browser=await puppeteer.launch({executablePath:executable,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 report.environment.browser=await browser.version();
 const page=await browser.newPage();await page.setViewport({width:1440,height:1000});
 const requests=[];
 page.on('request',request=>requests.push(request.url()));
 page.on('pageerror',error=>report.errors.push(error.message));
 page.on('console',message=>{
  if(!['error','warn'].includes(message.type()))return;
  const text=message.text();
  if(message.type()==='warn'&&text.startsWith('You have Reduced Motion enabled on your device.'))report.expectedDevelopmentNotices.push(text);
  else report.errors.push(text);
 });
 const goto=path=>page.goto(`http://127.0.0.1:${port}${path}`,{waitUntil:'networkidle0'});
 const capture=async name=>{await page.screenshot({path:resolve(output,`${name}.png`)});report.screenshots.push(`${name}.png`);};
 const path=()=>new URL(page.url()).pathname;
 const anchor=async id=>{await page.click(`.landing-nav nav a[href="#${id}"]`);await wait(1100);};
 const clickText=async text=>{for(const button of await page.$$('button'))if(await button.evaluate((node,text)=>node.textContent.trim()===text,text)){await button.click();return;}throw Error(`Missing button: ${text}`);};
 const noOverflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page must fit the viewport.');
 const featureIndex=()=>page.$eval('.feature-indicators [aria-pressed="true"]',node=>node.textContent.trim());
 const loopX=()=>page.$eval('#why .loop-track',node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
 await goto('/');await page.waitForSelector('[data-scene-ready="true"]');
 await check('Hero: real model, single demand-driven Canvas, native page scroll and constrained orbit',async()=>{
  assert.equal(await page.$$eval('canvas',nodes=>nodes.length),1);
  assert.match(await page.$eval('h1',node=>node.textContent),/Every watthas a story\./);
  const fiberURL=requests.find(url=>url.includes('/node_modules/.vite/deps/@react-three_fiber.js'));
  const scene=()=>page.evaluate(async url=>{const fiber=await import(url),state=Array.from(fiber._roots.values())[0].store.getState();return {frame:state.gl.info.render.frame,camera:state.camera.position.toArray(),model:!!state.scene.getObjectByName('pccoe-building-6')};},fiberURL);
  await wait(750); // Let font/layout observers finish their initial camera fit.
  const before=await scene();assert(before.model);await wait(400);assert.equal((await scene()).frame,before.frame,'Stationary hero should not render continuously.');
  const canvas=await page.$('canvas'),box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.55,{steps:14});await page.mouse.up();await wait(500);
  assert.notDeepEqual((await scene()).camera,before.camera);await capture('desktop-hero');
  await page.mouse.wheel({deltaY:480});await wait(500);assert(await page.evaluate(()=>scrollY>250),'Wheel over the model must scroll the page.');
  await noOverflow();
 });
 await check('Problem carousel: autoplay, hover/focus pause, arrows, pointer drag and non-focusable clones',async()=>{
  await anchor('why');await page.mouse.move(20,100);const a=await loopX();await wait(350);assert(Math.abs(await loopX()-a)>1);
  await page.hover('#why .loop-viewport');await wait(100);const b=await loopX();await wait(300);assert(Math.abs(await loopX()-b)<1);
  await page.focus('#why [aria-label="Next campus challenges"]');await page.mouse.move(20,100);const c=await loopX();await wait(300);assert(Math.abs(await loopX()-c)<1);
  await page.click('#why [aria-label="Next campus challenges"]');await wait(550);assert(Math.abs(await loopX()-c)>250);
  assert(await page.$('#why [aria-label="Play campus challenges"]'));
  const viewport=await page.$('#why .loop-viewport'),box=await viewport.boundingBox(),start=await loopX();
  await page.mouse.move(box.x+700,box.y+150);await page.mouse.down();await page.mouse.move(box.x+450,box.y+150,{steps:12});await page.mouse.up();assert(Math.abs(await loopX()-start)>180);
  assert.equal(await page.$$eval('.loop-group[aria-hidden="true"] a,.loop-group[aria-hidden="true"] button',nodes=>nodes.length),0);
  await capture('desktop-problem');
 });
 await check('Feature gallery: slow autoplay, manual override, arrows, indicators and mouse drag',async()=>{
  await anchor('features');await page.mouse.move(20,100);assert.equal(await featureIndex(),'01');await wait(9200);assert.equal(await featureIndex(),'02');
  await page.click('[aria-label="Next feature"]');await wait(700);assert.equal(await featureIndex(),'03');assert(await page.$('[aria-label="Play feature gallery"]'));
  await page.click('[aria-label="Feature 5: ENERGY ANALYTICS"]');await wait(700);assert.equal(await featureIndex(),'05');
  await page.click('[aria-label="Previous feature"]');await wait(700);assert.equal(await featureIndex(),'04');
  const track=await page.$('.feature-track'),box=await track.boundingBox(),dragY=Math.max(180,box.y+200);
  await page.mouse.move(box.x+box.width*.75,dragY);await page.mouse.down();await page.mouse.move(box.x+box.width*.2,dragY,{steps:16});await page.mouse.up();await wait(800);assert.equal(await featureIndex(),'05');
  assert(await page.$('.feature-panel[aria-hidden="true"][inert]'));await capture('desktop-features');
 });
 await check('Process controls: manual selection persists and hands back to deliberate scrolling',async()=>{
  await anchor('how-it-works');await page.click('.process-steps > button:first-of-type');await wait(400);
  assert.equal(await page.$eval('.process-steps > button:first-of-type',node=>node.getAttribute('aria-pressed')),'true');
  await page.mouse.move(700,500);await page.mouse.wheel({deltaY:240});await wait(500);
  assert.equal(await page.$eval('.process-steps > button:first-of-type',node=>node.getAttribute('aria-pressed')),'false');
 });
 await check('Twin preview: normal scroll drives five stages; manual stage buttons work',async()=>{
  await anchor('digital-twin');await page.mouse.move(20,100);await page.mouse.wheel({deltaY:900});await wait(800);
  const index=await page.$eval('.twin-stage-buttons [aria-pressed="true"]',node=>node.textContent);assert(!index.startsWith('01'));
  await page.click('.twin-stage-buttons button:last-child');await wait(450);assert(await page.$('.twin-room-preview'));assert.match(await page.$eval('.twin-room-preview',node=>node.textContent),/DEMO DATA/);await capture('desktop-twin');
 });
 await check('Campus reference: full uncropped image, conceptual callouts, modal focus/Escape',async()=>{
  await anchor('future');assert.equal(await page.$eval('.campus-map-frame img',node=>node.naturalWidth),996);
  assert.equal(await page.$eval('.campus-map-frame img',node=>getComputedStyle(node).objectFit),'contain');
  await page.click('.campus-concept:nth-last-child(2) button');await capture('desktop-campus');
  await page.click('.campus-map-frame > button');await page.waitForSelector('[aria-modal="true"]');
  assert(await page.$eval('[aria-modal="true"]',node=>node.contains(document.activeElement)));await capture('campus-full-image');
  await page.keyboard.press('Escape');assert.equal(await page.$$eval('[aria-modal="true"]',nodes=>nodes.length),0);
  assert(await page.$eval('.campus-map-frame > button',node=>node===document.activeElement));
 });
 await check('Public/app navigation: CTA, sidebar, history, refresh and all eight direct views',async()=>{
  await page.click('.landing-nav-launch');await page.waitForSelector('.sidebar');assert.equal(path(),'/app/dashboard');assert.equal(await page.$$eval('.landing-nav',nodes=>nodes.length),0);
  await clickText('Campus Radar');await page.waitForSelector('section.building-viewer[data-camera-busy="false"]');assert.equal(path(),'/app/radar');assert.equal(await page.$$eval('canvas',nodes=>nodes.length),1);
  await page.goBack();await page.waitForSelector('.dashboard');assert.equal(path(),'/app/dashboard');
  await page.goBack();await page.waitForSelector('.landing-page');assert.equal(path(),'/');
  await page.goForward();await page.waitForSelector('.sidebar');assert.equal(path(),'/app/dashboard');
  await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('.sidebar');
  for(const [view,label] of [['dashboard','Dashboard'],['radar','Campus Radar'],['analytics','Analytics'],['alerts','Waste Alerts'],['audit','Audit Trail'],['faculty','Faculty Portal'],['rooms','Room Finder'],['settings','Settings']]){
   await goto(`/app/${view}`);await page.waitForSelector('.sidebar [aria-current="page"]');assert.equal(await page.$eval('.sidebar [aria-current="page"] span',node=>node.textContent),label);
  }
  await page.click('.brand');await page.waitForSelector('.landing-page');assert.equal(path(),'/');
 });
 await check('Shared simulator and theme survive a landing/workspace round trip',async()=>{
  await page.click('.landing-nav-launch');await page.waitForSelector('.dashboard');
  await clickText('Light mode');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  const saved=()=>page.$eval('.kpi-card:last-child strong',node=>parseFloat(node.textContent));
  const before=await saved();await page.click('.remediate-button');await wait(200);const after=await saved();assert(after>before);
  await page.click('.brand');await page.waitForSelector('.landing-page');assert.equal(await page.$eval('.landing-page',node=>getComputedStyle(node).backgroundColor),'rgb(22, 17, 38)');
  const impact=await page.$eval('.impact-metrics > div:first-child .sr-only',node=>Number(node.textContent));assert(impact>before);assert.equal(Number(impact.toFixed(1)),after);
  await page.click('.landing-nav-launch');await page.waitForSelector('.dashboard');assert.equal(await saved(),after);assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  await clickText('Dark mode');await page.click('.brand');await page.waitForSelector('.landing-page');
 });
 await check('Responsive: desktop, tablet, mobile, menu keyboard, touch carousel and fixed palette',async()=>{
  for(const [width,height] of [[768,1024],[390,844],[320,740]]){
   await page.setViewport({width,height,isMobile:width<600,hasTouch:width<600});await goto('/');await wait(900);await noOverflow();
   assert.equal(await page.$$eval('canvas',nodes=>nodes.length),0,'Small screens start with the lightweight static preview.');
   await capture(`responsive-${width}`);
   if(width===768){await page.click('.hero-model-instruction button');await page.waitForSelector('[data-scene-ready="true"]');assert.equal(await page.$$eval('canvas',nodes=>nodes.length),1);}
  }
  await page.click('.landing-menu-toggle');assert.equal(await page.$eval('.landing-menu-toggle',node=>node.getAttribute('aria-expanded')),'true');await page.keyboard.press('Escape');assert.equal(await page.$eval('.landing-menu-toggle',node=>node.getAttribute('aria-expanded')),'false');
  await page.click('.landing-menu-toggle');await page.click('.landing-nav a[href="#features"]');await wait(800);await noOverflow();
  const box=await (await page.$('.feature-track')).boundingBox(),cdp=await page.createCDPSession();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+270,y:box.y+120}]});
  for(let step=1;step<=12;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+270-step*18,y:box.y+120}]});await wait(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(700);assert.equal(await featureIndex(),'02');await capture('mobile-features');
  assert.equal(await page.$eval('.landing-page',node=>getComputedStyle(node).backgroundColor),'rgb(22, 17, 38)');
 });
 await check('Reduced motion: static hero, manual previews, no carousel autoplay',async()=>{
  await page.setViewport({width:1440,height:1000,isMobile:false,hasTouch:false});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await goto('/');
  assert.equal(await page.$$eval('canvas',nodes=>nodes.length),0);assert(await page.$('.hero-building-fallback'));
  await anchor('why');await page.mouse.move(20,100);const start=await loopX();await wait(450);assert.equal(await loopX(),start);
  await anchor('digital-twin');await page.click('.twin-stage-buttons button:last-child');assert(await page.$('.twin-room-preview'));await capture('reduced-motion');
 });
 await check('WebGL unavailable: usable architectural fallback and working app CTA',async()=>{
  // A separate Chrome process disables WebGL at initialization, without injecting page behavior.
  const disabled=await puppeteer.launch({executablePath:executable,headless:true,args:['--no-sandbox','--disable-webgl']});
  try{const tab=await disabled.newPage();await tab.setViewport({width:1440,height:1000});await tab.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle0'});await tab.waitForFunction(()=>document.querySelector('.hero-model-instruction')?.textContent.includes('VERIFIED ARCHITECTURAL PREVIEW'));assert(await tab.$eval('.hero-building-fallback',node=>node.complete&&node.naturalWidth===1200&&getComputedStyle(node).opacity==='1'));await tab.screenshot({path:resolve(output,'webgl-fallback.png')});report.screenshots.push('webgl-fallback.png');await tab.click('.landing-nav-launch');await tab.waitForSelector('.sidebar');}finally{await disabled.close();}
 });
 assert.deepEqual(report.errors,[],'Normal browser run must have no page errors or warnings.');
 report.completedAt=new Date().toISOString();save();
}catch(error){report.failure=error.stack;save();throw error;}
finally{if(browser)await browser.close();server.kill();}
