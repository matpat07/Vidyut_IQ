import React,{useEffect,useRef,useState} from 'react';
import {AppLink} from './ui';
import {LandingIcon} from './icons/LandingIcon';
export const LANDING_SECTIONS=[['Overview','overview'],['Why VidyutIQ','why'],['Features','features'],['How It Works','how-it-works'],['Campus Digital Twin','digital-twin'],['Future Scope','future']] as const;
export function LandingNavbar(){
 const [open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement>(null);
 const [active,setActive]=useState('overview');
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});for(const [,id] of LANDING_SECTIONS){const target=document.getElementById(id);if(target)observer.observe(target);}return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!open)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[open]);
 return <header className="landing-nav"><a href="#overview" className="landing-wordmark" aria-label="VidyutIQ overview">Vidyut<span>IQ</span></a>
  <nav id="landing-menu" className={open?'is-open':''} aria-label="Website navigation">{LANDING_SECTIONS.map(([label,id])=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>{setOpen(false);setActive(id);}}>{label}</a>)}</nav>
  <AppLink view="DASHBOARD" className="landing-nav-launch">Launch Dashboard <LandingIcon name="arrow-up-right" size={16}/></AppLink>
  <button ref={trigger} className="landing-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-controls="landing-menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><LandingIcon name={open?'x':'list'} size={19}/><span>{open?'Close':'Menu'}</span></button>
 </header>;
}
