import React from 'react';
import {iconPaths, type LandingIconName} from './paths';

export type {LandingIconName} from './paths';

/** Decorative icons accompany visible text or an explicitly labeled control. */
export function LandingIcon({name,size=20,className=''}:{name:LandingIconName;size?:number;className?:string}) {
  return <svg className={`landing-icon ${className}`} width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">
    {iconPaths[name].map((d,index)=><path key={index} d={d}/>)}
  </svg>;
}
