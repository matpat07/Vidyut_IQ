import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import ts from 'typescript';
async function at(path){const url=new URL(path,import.meta.url),compiled=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));}
const {APP_PATHS,viewForPath}=await at('../src/routeConfig.ts');
const {loopPosition}=await at('../src/components/landing/carouselMath.ts');
const {FEATURES}=await at('../src/components/landing/featureData.ts');
test('landing and workspace URLs preserve every existing app view and deep link',()=>{
 assert.equal(viewForPath('/'),null);assert.equal(viewForPath('/app'),'DASHBOARD');assert.equal(viewForPath('/dashboard'),'DASHBOARD');
 for(const [view,path] of Object.entries(APP_PATHS)){assert.equal(viewForPath(path),view);assert.equal(viewForPath(path+'/'),view);}
 assert.equal(new Set(Object.values(APP_PATHS)).size,8);
});
test('looping cards retain equivalent positions and finite offsets across both seam directions',()=>{
 for(const cycle of [294,1360,1800])for(const value of [-100000,-cycle*2,-cycle,-1,0,1,cycle,100000]){
  const position=loopPosition(value,cycle);assert(position<=-cycle&&position>-2*cycle);
  assert(Math.abs((position-value)/cycle-Math.round((position-value)/cycle))<1e-8);
 }assert.equal(loopPosition(0,0),0);
});
test('all seven feature destinations and verified preview assets resolve',()=>{
 assert.equal(FEATURES.length,7);assert.equal(new Set(FEATURES.map(feature=>feature.tag)).size,7);
 for(const feature of FEATURES){assert(APP_PATHS[feature.view]);assert(existsSync(new URL(`../public/landing/${feature.image}.png`,import.meta.url)));}
 for(const pose of ['exterior','half','exploded','floor','room'])assert(existsSync(new URL(`../public/landing/building-${pose}.png`,import.meta.url)));
 const map=readFileSync(new URL('../public/landing/pccoe-campus.jpeg',import.meta.url));assert.equal(map[0],255);assert.equal(map[1],216);
});
test('landing interface definitions use only the five approved color literals',()=>{
 const allowed=new Set(['#161126','#FFFCFC','#E6D1E5','#9B829A','#CA2127']);
 const directory=new URL('../src/components/landing/',import.meta.url);
 for(const file of readdirSync(directory).filter(file=>/\.(tsx|css)$/.test(file))){
  const colors=readFileSync(new URL(file,directory),'utf8').match(/#[\da-fA-F]{3,8}\b/g)??[];
  for(const color of colors)assert(allowed.has(color.toUpperCase()),`${file}: unapproved color ${color}`);
 }
});
