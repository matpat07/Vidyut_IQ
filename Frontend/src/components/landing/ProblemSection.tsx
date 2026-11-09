import React from 'react';
import {LandingIcon, type LandingIconName} from './icons/LandingIcon';
import {ChallengeDiagram} from './ChallengeDiagram';
import {Reveal,SectionIntro} from './ui';
import {LoopCarousel} from './LoopCarousel';
const problems:{icon:LandingIconName;title:string;text:string}[]=[{icon:'power',title:'Empty rooms. Active circuits.',text:'Lighting, fans and equipment can keep consuming electricity after a room becomes vacant.'},{icon:'calendar-blank',title:'A timetable without context.',text:'A scheduled class and a powered room tell different stories when those signals stay disconnected.'},{icon:'scan',title:'Waste hides in the aggregate.',text:'A campus total cannot show which classroom or laboratory needs attention.'},{icon:'chart-line-up',title:'Actions without a clear outcome.',text:'Without an action trail, understanding the estimated impact of an intervention gets harder.'}];
export function ProblemSection(){return <Reveal id="why" className="landing-section problem-section"><div className="landing-container"><SectionIntro eyebrow="THE CHALLENGE" title={<>Energy doesn’t disappear.<br/><span>Visibility does.</span></>}>In large institutions, electricity is consumed across classrooms, laboratories, and shared spaces throughout the day. But without room-level visibility, unnecessary consumption can go unnoticed.</SectionIntro></div>
 <LoopCarousel label="campus challenges">{problems.map(({icon,title,text},index)=><article className="problem-card" key={title}><div className="problem-card-top"><span className="card-icon"><LandingIcon name={icon} size={25}/></span><span>0{index+1} / CHALLENGE</span></div><h3>{title}</h3><p>{text}</p><ChallengeDiagram kind={index}/></article>)}</LoopCarousel>
 </Reveal>;}
