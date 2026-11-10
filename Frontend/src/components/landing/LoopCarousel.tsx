import React,{useEffect,useRef,useState} from 'react';
import {animate,motion,useInView,useMotionValue,useReducedMotion} from 'framer-motion';
import {loopPosition} from './carouselMath';
import {LandingIcon} from './icons/LandingIcon';
export function LoopCarousel({label,children}:{label:string;children:React.ReactNode[]}){
 const ref=useRef<HTMLDivElement>(null),group=useRef<HTMLDivElement>(null),cycle=useRef(0),drag=useRef<{pointer:number;start:number;offset:number}|null>(null);
 const x=useMotionValue(0),visible=useInView(ref,{amount:.1}),reduced=useReducedMotion();
 const [paused,setPaused]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false),[dragging,setDragging]=useState(false);
 const animation=useRef<{stop:()=>void}|null>(null);
 useEffect(()=>{const measure=()=>{animation.current?.stop();cycle.current=group.current?.offsetWidth??0;x.set(-cycle.current);};measure();const observer=new ResizeObserver(measure);if(group.current)observer.observe(group.current);return()=>observer.disconnect();},[x]);
 useEffect(()=>{
  if(!visible||reduced||paused||hover||focused||dragging)return;
  let frame=0,last=0;const tick=(time:number)=>{if(!document.hidden&&!drag.current){if(last)x.set(loopPosition(x.get()-Math.min(time-last,64)*.018,cycle.current));}last=time;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[visible,reduced,paused,hover,focused,dragging,x]);
 useEffect(()=>()=>animation.current?.stop(),[]);
 const move=(direction:number)=>{setPaused(true);animation.current?.stop();const start=x.get(),distance=cycle.current/children.length;animation.current=animate(0,1,{duration:reduced?0:.45,ease:'easeInOut',onUpdate:progress=>x.set(loopPosition(start-direction*distance*progress,cycle.current))});};
 const finish=()=>{drag.current=null;setDragging(false);};
 return <div className="loop-carousel" ref={ref} role="region" aria-roledescription="carousel" aria-label={label} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setFocused(false);}}>
  <div className="loop-viewport" onPointerDown={event=>{if(!event.isPrimary||event.button!==0)return;setPaused(true);animation.current?.stop();drag.current={pointer:event.pointerId,start:event.clientX,offset:x.get()};setDragging(true);event.currentTarget.setPointerCapture(event.pointerId);}}
   onPointerMove={event=>{if(drag.current?.pointer===event.pointerId)x.set(loopPosition(drag.current.offset+event.clientX-drag.current.start,cycle.current));}} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
   <motion.div className="loop-track" style={{x}}>{[0,1,2].map(index=><div key={index} ref={index===1?group:undefined} className="loop-group" aria-hidden={index!==1?true:undefined}>{children.map((child,i)=><div className="loop-card-wrap" key={i}>{child}</div>)}</div>)}</motion.div>
  </div>
  <div className="carousel-controls"><span><LandingIcon name="hand-swipe-left" size={18}/>DRAG TO EXPLORE</span><div><button aria-label={`Previous ${label}`} onClick={()=>move(-1)}><LandingIcon name="arrow-left" size={18}/></button><button aria-label={paused?`Play ${label}`:`Pause ${label}`} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}><LandingIcon name={paused?'play':'pause'} size={15}/><span>{paused?'Play':'Pause'}</span></button><button aria-label={`Next ${label}`} onClick={()=>move(1)}><LandingIcon name="arrow-right" size={18}/></button></div></div>
 </div>;
}
