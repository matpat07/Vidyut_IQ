import React from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {APP_PATHS,navigatePath} from '../../navigation';
import type {NavView} from '../layout/Sidebar';
export function AppLink({view,children,className='',tabIndex}:{view:NavView;children:React.ReactNode;className?:string;tabIndex?:number}){
 return <a href={APP_PATHS[view]} className={className} tabIndex={tabIndex} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();navigatePath(APP_PATHS[view]);}}}>{children}</a>;
}
export function Reveal({children,className='',id}:{children:React.ReactNode;className?:string;id?:string}){
 const reduced=useReducedMotion();return <motion.section id={id} className={className} initial={reduced?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.6,ease:[.2,.7,.2,1]}}>{children}</motion.section>;
}
export function SectionIntro({eyebrow,title,children}:{eyebrow:string;title:React.ReactNode;children?:React.ReactNode}){
 return <div className="landing-section-intro"><p className="landing-eyebrow"><span/>{eyebrow}</p><h2>{title}</h2>{children&&<p className="landing-description">{children}</p>}</div>;
}
