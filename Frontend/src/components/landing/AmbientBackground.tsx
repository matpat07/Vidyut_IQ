import React,{useRef} from 'react';
import {motion,useMotionValue,useReducedMotion,useSpring,useInView,useScroll,useTransform} from 'framer-motion';
export function AmbientBackground({children}:{children:React.ReactNode}){
 const reduced=useReducedMotion(),x=useMotionValue(-500),y=useMotionValue(-500),mx=useSpring(x,{stiffness:140,damping:45}),my=useSpring(y,{stiffness:140,damping:45});
 const ref=useRef<HTMLDivElement>(null),visible=useInView(ref),{scrollYProgress}=useScroll({target:ref,offset:['start start','end start']}),drift=useTransform(scrollYProgress,[0,1],[0,40]);
 return <div ref={ref} className={`landing-ambient${visible?' is-visible':''}`} onPointerMove={event=>{if(reduced||event.pointerType!=='mouse')return;const box=event.currentTarget.getBoundingClientRect();x.set(event.clientX-box.left-200);y.set(event.clientY-box.top-200);}}>
  <motion.svg className="energy-contours" style={{y:reduced?0:drift}} viewBox="0 0 1600 850" fill="none" aria-hidden="true"><path d="M-80 650C280 120 450 1020 920 440S1440 180 1680 250"/><path d="M-80 680C280 150 460 1050 920 470S1440 210 1680 280"/><path d="M-80 710C280 180 470 1080 920 500S1440 240 1680 310"/></motion.svg>
  {!reduced&&<motion.div className="landing-cursor-light" style={{x:mx,y:my}} aria-hidden="true"/>}{children}
 </div>;
}
