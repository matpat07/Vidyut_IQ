import React,{useEffect,useRef} from 'react';
import {animate,motion,useInView,useMotionValue,useReducedMotion,useTransform} from 'framer-motion';
import {useSimulation} from '../../context/SimulationContext';
import {Reveal,SectionIntro,AppLink} from './ui';
import {LandingIcon} from './icons/LandingIcon';
function Count({value,decimals=2}:{value:number;decimals?:number}){
 const ref=useRef<HTMLSpanElement>(null),visible=useInView(ref,{once:true}),reduced=useReducedMotion(),counter=useMotionValue(0),display=useTransform(counter,value=>value.toFixed(decimals));
 useEffect(()=>{if(!visible)return;const animation=animate(counter,value,{duration:reduced?0:1,ease:'easeOut'});return()=>animation.stop();},[visible,value,reduced,counter]);
 return <span ref={ref}><span className="sr-only">{value.toFixed(decimals)}</span><motion.span aria-hidden="true">{display}</motion.span></span>;
}
export function ImpactSection(){
 const {impactSummary,activeAlerts,assumptions}=useSimulation();
 return <Reveal className="landing-section impact-section"><div className="landing-container"><SectionIntro eyebrow="MEASURABLE INTELLIGENCE" title={<>Small interventions.<br/>Meaningful impact.</>}>What changes when energy becomes visible? A clearer view of the potential cost, consumption and emissions avoided.</SectionIntro>
  <p className="impact-source">CURRENT SIMULATION SESSION / ESTIMATED SAVINGS</p><div className="impact-metrics">
   <div><p><LandingIcon name="lightning"/>Energy saved</p><strong><Count value={impactSummary.accumulatedKwhSaved}/><small>kWh</small></strong><span>Estimated from simulated Eco-Off actions</span></div>
   <div><p><LandingIcon name="currency-inr"/>Electricity cost avoided</p><strong><span className="impact-currency">₹</span><Count value={impactSummary.accumulatedCostSavedInr}/></strong><span>At the project’s assumed tariff</span></div>
   <div><p><LandingIcon name="leaf"/>CO₂ emissions avoided</p><strong><Count value={impactSummary.accumulatedCo2AvoidedKg}/><small>kg</small></strong><span>Estimated using the configured grid factor</span></div>
  </div>
  <div className="impact-context"><div><span>{activeAlerts.length} active rule alerts</span><span>{(impactSummary.currentWastedDrawWatts/1000).toFixed(2)} kW avoidable modeled load</span></div><AppLink view="ANALYTICS" className="landing-text-link">Inspect the assumptions <LandingIcon name="arrow-up-right" size={16}/></AppLink></div>
  <details className="impact-assumptions"><summary>How these estimates are calculated</summary><p>These are the existing simulator’s session estimates, including its seeded demonstration state—not measured savings. The current assumed tariff is ₹{assumptions.tariffInrPerKwh.toFixed(2)}/kWh and the emissions factor is {assumptions.carbonEmissionFactorKgPerKwh} kg CO₂/kWh. Eco-Off uses the project’s existing modeled action window. Actual results require metering and validated assumptions.</p></details>
 </div></Reveal>;
}
