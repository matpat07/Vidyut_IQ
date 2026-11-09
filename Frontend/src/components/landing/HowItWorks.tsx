import React,{useEffect,useRef,useState} from 'react';
import {motion,useMotionValueEvent,useReducedMotion,useScroll} from 'framer-motion';
import type {MotionStyle} from 'framer-motion';
import {Reveal,SectionIntro} from './ui';
import {LandingIcon, type LandingIconName} from './icons/LandingIcon';
const stepIcons:LandingIconName[]=['calendar-blank','circuitry','scan','eye','leaf'];
const steps=[['Understand','Campus timetables establish expected room occupancy.','Timetable → Expected occupancy'],['Monitor','Energy and appliance states are modeled through the existing IoT simulation.','Appliances → Modeled demand'],['Detect','Rules compare the signals to identify potentially avoidable consumption.','Occupancy + Load → Rule evaluation'],['Recommend','The platform explains anomalies and presents supported operational actions.','Evidence → Suggested action'],['Optimize','Eco-Off scenarios estimate potential reductions in consumption and cost.','Simulated action → Estimated impact']];
export function HowItWorks(){
 const ref=useRef<HTMLDivElement>(null),[active,setActive]=useState(0),last=useRef(-1),manual=useRef(false),reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start 75%','end 35%']});
 // A clicked step keeps ownership until the next deliberate scrolling gesture.
 useEffect(()=>{const resume=()=>{manual.current=false;};const key=(event:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))resume();};window.addEventListener('wheel',resume,{passive:true});window.addEventListener('touchmove',resume,{passive:true});window.addEventListener('keydown',key);return()=>{window.removeEventListener('wheel',resume);window.removeEventListener('touchmove',resume);window.removeEventListener('keydown',key);};},[]);
 useMotionValueEvent(scrollYProgress,'change',value=>{const next=Math.min(4,Math.floor(value*5));if(!reduced&&!manual.current&&next!==last.current){last.current=next;setActive(next);}});
 return <Reveal id="how-it-works" className="landing-section process-section"><div className="landing-container" ref={ref}><SectionIntro eyebrow="THE INTELLIGENCE ENGINE" title={<>From energy signals<br/>to smarter decisions.</>}/>
  <div className="process-steps"><div className="process-line" aria-hidden="true"><motion.i style={{'--process-progress':reduced?1:scrollYProgress} as MotionStyle}/></div>{steps.map(([title,description],index)=><button key={title} className={active===index?'is-active':''} aria-pressed={active===index} onClick={()=>{manual.current=true;last.current=index;setActive(index);}}><span className="process-number"><LandingIcon name={stepIcons[index]} size={23}/></span><span className="process-index">0{index+1}</span><h3>{title}</h3><p>{description}</p></button>)}</div>
  <div className="process-output" aria-live="polite"><span>0{active+1} / {steps[active][0].toUpperCase()}</span><p>{steps[active][2]}</p><small>Simulation and existing rules. No live meter or deployed hardware claim.</small></div>
 </div></Reveal>;
}
