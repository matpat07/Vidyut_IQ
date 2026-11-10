import React from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {HeroBuildingPreview} from './HeroBuildingPreview';
import {AmbientBackground} from './AmbientBackground';
import {AppLink} from './ui';
import {LandingIcon} from './icons/LandingIcon';
export function HeroSection(){
 const reduced=useReducedMotion();
 const reveal={hidden:{opacity:0,y:14},visible:{opacity:1,y:0,transition:{duration:.55}}};
 return <AmbientBackground><section id="overview" className="landing-hero">
  <motion.div className="hero-copy" initial={reduced?false:'hidden'} animate="visible" variants={{visible:{transition:{staggerChildren:reduced?0:.1,delayChildren:reduced?0:.12}}}}>
   <motion.p variants={reveal} className="landing-eyebrow hero-eyebrow"><LandingIcon name="lightning" size={15}/>THE INTELLIGENT CAMPUS STARTS HERE</motion.p>
   <motion.h1 variants={reveal}>Every watt<br/>has a <em>story.</em></motion.h1>
   <motion.p variants={reveal} className="hero-description">Meet VidyutIQ—an intelligent energy management platform that makes campus electricity visible, detects avoidable consumption, and helps turn energy insights into meaningful action.</motion.p>
   <motion.div variants={reveal} className="hero-actions"><a href="#why" className="landing-button">Explore VidyutIQ <span className="button-icon"><LandingIcon name="arrow-up-right" size={18}/></span></a><AppLink view="RADAR" className="landing-text-link">Experience the Digital Twin <LandingIcon name="arrow-up-right" size={16}/></AppLink></motion.div>
   <motion.p variants={reveal} className="simulation-note"><span/>A campus energy simulation. A clearer perspective.</motion.p>
  </motion.div>
  <HeroBuildingPreview/>
  <div className="hero-bottom"><span><LandingIcon name="calendar-blank" size={19}/>Timetable-aware intelligence</span><span><LandingIcon name="cube" size={19}/>Room-level perspective</span><a href="#why">SCROLL TO DISCOVER <LandingIcon name="arrow-right" size={18}/></a></div>
 </section></AmbientBackground>;
}
