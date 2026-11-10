/** Capture real project scenes and screens. No image generation or external assets. */
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=resolve(root,'public/landing');
const tooling=await import(process.env.VIDYUTIQ_BROWSER_MODULE??'puppeteer'),puppeteer=tooling.puppeteer??tooling.default;
const server=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','5222','--strictPort'],{cwd:root,stdio:'pipe',windowsHide:true});let browser;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const manifest={createdAt:new Date().toISOString(),source:'Actual VidyutIQ model and simulated workspace',files:[]};
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Vite timeout')),15000);server.stdout.on('data',data=>{if(data.toString().includes('Local:')){clearTimeout(timer);resolve();}});});
 browser=await puppeteer.launch({executablePath:process.env.VIDYUTIQ_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();mkdirSync(output,{recursive:true});await page.setViewport({width:1200,height:800});
 for(const pose of ['exterior','half','exploded','floor','room']){
  await page.goto(`http://127.0.0.1:5222/scripts/landing-scene-capture.html?pose=${pose}`,{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>document.querySelector('[data-scene-ready="true"]'),{timeout:15000});await wait(250);
  await page.screenshot({path:resolve(output,`building-${pose}.png`)});manifest.files.push({file:`building-${pose}.png`,route:`scripts/landing-scene-capture.html?pose=${pose}`});console.log('Captured building '+pose);
 }
 await page.setViewport({width:1440,height:1000});
 const captures=[['dashboard','dashboard'],['radar','radar'],['alerts','alerts'],['analytics','analytics'],['operations','faculty'],['audit','audit']];
 for(const [file,view] of captures){
  await page.goto(`http://127.0.0.1:5222/app/${view}`,{waitUntil:'networkidle0'});await page.waitForSelector('.app-header');await wait(350);
  if(view==='radar'){await page.click('.floor-panel-buttons button[aria-label^="F2"]');await page.waitForFunction(()=>document.querySelector('section.building-viewer')?.dataset.cameraBusy==='false');}
  await page.screenshot({path:resolve(output,`${file}.png`)});manifest.files.push({file:`${file}.png`,route:`/app/${view}`,data:'Simulation'});console.log('Captured '+file);
 }
 await page.goto('http://127.0.0.1:5222/app/dashboard',{waitUntil:'networkidle0'});await page.select('#inspect-room','6103CR');await page.waitForSelector('[aria-modal="true"]');for(const button of await page.$$('[aria-modal="true"] button'))if(await button.evaluate(element=>element.textContent.trim()==='Actions')){await button.click();break;}await wait(300);await page.screenshot({path:resolve(output,'ecooff.png')});manifest.files.push({file:'ecooff.png',route:'/app/dashboard → Room 6103 → Actions',data:'Simulation'});
 writeFileSync(resolve(output,'captures.json'),JSON.stringify(manifest,null,2)+'\n');
}finally{if(browser)await browser.close();server.kill();}
