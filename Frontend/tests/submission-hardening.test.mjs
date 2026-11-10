import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

async function moduleAt(path) {
  const source=readFileSync(new URL(path,import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;
  return import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
}

test('diagnostics explain rule evidence without model probabilities, invented sensors or annual savings',async()=>{
  const {generateRuleBasedDiagnostic}=await moduleAt('../src/services/aiAnomalyPreview.ts');
  for(const [reason,roomType] of [['Campus-wide Break active','CLASSROOM'],['Lecture CANCELLED','CLASSROOM'],['Vacant lab','LABORATORY'],['Vacant room','CLASSROOM']]) {
    const diagnostic=generateRuleBasedDiagnostic({reason,excessWatts:3182},{simulatedPowerWatts:3200,simulatedPirPresence:false},{roomType});
    assert.match(diagnostic.rootCauseAnalysis,/3,?200 W/);
    assert.match(diagnostic.rootCauseAnalysis,/simulat/i);
    assert.match(diagnostic.recommendedAction,/simulat/i);
    assert.equal('confidenceScore' in diagnostic,false);
    assert.equal('projectedAnnualSavingRoomInr' in diagnostic,false);
    assert.doesNotMatch(JSON.stringify(diagnostic),/probability|PZEM|15 minutes|pre.cool|Wake.on.LAN|Gemini/i);
  }
});

test('deployment covers every workspace route without rewriting unknown assets',async()=>{
  const {APP_PATHS}=await moduleAt('../src/routeConfig.ts');
  const redirects=readFileSync(new URL('../public/_redirects',import.meta.url),'utf8').split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#')).map(line=>line.trim().split(/\s+/));
  for(const route of Object.values(APP_PATHS))assert(redirects.some(([from,to,status])=>from===route&&to==='/index.html'&&status==='200'));
  assert(redirects.every(([from])=>!from.includes('*')&&!from.includes('.')));
  for(const missing of ['/assets/missing.js','/landing/missing.png','/app/radar/missing.js'])assert(!redirects.some(([from])=>from===missing));
  const root=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));
  for(const script of ['dev','build','preview','test'])assert.match(root.scripts[script],/--prefix Frontend/);
});

test('demo context follows current occupancy, time and appliance state rather than a stale preset',async()=>{
  const {getDemoScenario}=await moduleAt('../src/services/demoContext.ts');
  const room=(status,type='CLASSROOM',on=true)=>({metadata:{roomType:type},occupancyProfile:{expectedStatus:status},roomState:{appliances:[{isOn:on}]}});
  assert.equal(getDemoScenario('MON',795,[room('BREAK')],{breakType:'LUNCH_BREAK'}).label,'Lunch Break');
  assert.equal(getDemoScenario('MON',665,[room('BREAK')],{breakType:'SHORT_BREAK'}).label,'Scheduled Break');
  assert.equal(getDemoScenario('TUE',795,[room('VACANT')]),null);
  assert.equal(getDemoScenario('MON',675,[room('CANCELLED')]).label,'Cancelled Lecture');
  assert.equal(getDemoScenario('MON',570,[room('SCHEDULED')]).label,'Scheduled Classes');
  assert.equal(getDemoScenario('MON',930,[room('VACANT','LABORATORY')]).label,'Idle Laboratory');
  assert.equal(getDemoScenario('MON',1080,[room('VACANT')]).label,'After Hours');
  assert.match(getDemoScenario('MON',795,[room('BREAK','CLASSROOM',false)]).description,/standby/i);
  assert.equal(getDemoScenario('MON',795,[]),null);
});
