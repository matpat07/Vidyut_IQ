import React from 'react';
import {LandingNavbar,LANDING_SECTIONS} from './LandingNavbar';
import {HeroSection} from './HeroSection';
import {ProblemSection} from './ProblemSection';
import {SolutionShowcase} from './SolutionShowcase';
import {FeatureCarousel} from './FeatureCarousel';
import {HowItWorks} from './HowItWorks';
import {DigitalTwinShowcase} from './DigitalTwinShowcase';
import {ImpactSection} from './ImpactSection';
import {CampusFutureScope} from './CampusFutureScope';
import {AppLink,Reveal} from './ui';
import {LandingIcon} from './icons/LandingIcon';
import './landing.css';
export default function LandingPage(){return <div className="landing-page"><a className="landing-skip" href="#landing-content">Skip to content</a><LandingNavbar/><main id="landing-content"><HeroSection/><ProblemSection/><SolutionShowcase/><FeatureCarousel/><HowItWorks/><DigitalTwinShowcase/><ImpactSection/><CampusFutureScope/>
 <Reveal className="landing-section landing-final"><div className="landing-container"><span className="final-mark"><LandingIcon name="lightning" size={32}/></span><p className="landing-eyebrow">A CLEARER VIEW. A SMARTER CAMPUS.</p><h2>The future of campus energy<br/>starts with <span>visibility.</span></h2><p>Explore how VidyutIQ transforms everyday campus operations into opportunities for intelligent energy management.</p><div><AppLink view="DASHBOARD" className="landing-button">Launch VidyutIQ <span className="button-icon"><LandingIcon name="arrow-up-right" size={18}/></span></AppLink><AppLink view="RADAR" className="landing-text-link">Explore Campus Radar <LandingIcon name="arrow-up-right" size={17}/></AppLink></div></div></Reveal>
 </main><footer className="landing-footer landing-container"><div><a href="#overview" className="landing-wordmark">Vidyut<span>IQ</span></a><p>Campus Energy Intelligence</p></div><nav aria-label="Footer navigation">{LANDING_SECTIONS.filter(([,id])=>['overview','features','digital-twin','future'].includes(id)).map(([label,id])=><a href={`#${id}`} key={id}>{label}</a>)}<a href="https://github.com/matpat07/Vidyut_IQ" target="_blank" rel="noreferrer">GitHub ↗</a></nav><p className="footer-disclosure">Built around visibility. Demonstrated through simulation.</p></footer></div>;}
