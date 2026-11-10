import React,{useRef,useState} from 'react';
import {useMotionValueEvent,useReducedMotion,useScroll} from 'framer-motion';
import {AppLink,SectionIntro} from './ui';
import {useRoomAnalytics} from '../radar/energy/useRoomAnalytics';
import {LandingIcon, type LandingIconName} from './icons/LandingIcon';
const stageIcons:LandingIconName[]=['buildings','stack','stack','map-trifold','cursor-click'];
const stages=[['Building','Explore the building.','exterior'],['Separate','Discover every floor.','half'],['Five floors','Five levels. One spatial perspective.','exploded'],['Floor plan','Inspect individual rooms.','floor'],['Room insights','Understand energy usage.','room']];
export function DigitalTwinShowcase(){
 const ref=useRef<HTMLElement>(null),[stage,setStage]=useState(0),last=useRef(-1),reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 const {dataset}=useRoomAnalytics('demo','hour');const reading=dataset.readings.find(value=>value.metadata.id==='6206LA');
 useMotionValueEvent(scrollYProgress,'change',value=>{if(reduced||!matchMedia('(min-width: 900px)').matches)return;const next=Math.min(4,Math.floor(value*5));if(next!==last.current){last.current=next;setStage(next);}});
 return <section ref={ref} id="digital-twin" className="landing-twin"><div className="twin-sticky landing-container"><div className="section-split"><SectionIntro eyebrow="EXPLORE THE CAMPUS" title={<>See the building.<br/>Understand every floor.</>}/><p className="twin-explainer">Architecture is the interface.<br/>Scroll to uncover a new perspective.</p></div>
  <div className="twin-preview" aria-label="Staged preview captured from the actual Building No. 6 model">{stages.map(([label,,file],index)=><img key={file} className={stage===index?'is-active':''} src={`/landing/building-${file}.png`} width="1200" height="800" alt={`Actual architectural model: ${label}`} loading="lazy" aria-hidden={stage!==index}/>)}
   <span className="twin-frame-label">BUILDING 06 / ARCHITECTURAL PREVIEW</span>
   {stage===4&&<div className="twin-room-preview"><span>ROOM 6206 / LABORATORY</span><strong>{reading?.powerKw?.toFixed(2)??'Unavailable'} <small>kW</small></strong><p>DEMO DATA · {dataset.periodLabel}</p></div>}
  </div>
  <div className="twin-bottom"><div><p className="landing-eyebrow">0{stage+1} / DIGITAL TWIN</p><h3>{stages[stage][1]}</h3></div><AppLink view="RADAR" className="landing-button">Enter Campus Radar <span className="button-icon"><LandingIcon name="arrow-up-right" size={18}/></span></AppLink></div>
  <div className="twin-stage-buttons" role="group" aria-label="Digital twin preview stages">{stages.map(([label],index)=><button key={label} aria-pressed={stage===index} onClick={()=>setStage(index)}><span>0{index+1}</span><LandingIcon name={stageIcons[index]} size={18}/>{label}</button>)}</div>
  <p className="twin-capture-note">Verified renders from the working model. Launch Campus Radar to interact with the simulation.</p>
 </div></section>;
}
