import React,{Component,lazy,Suspense,useCallback,useRef,useState,useSyncExternalStore} from 'react';
import {useInView,useReducedMotion} from 'framer-motion';
import {LandingIcon} from './icons/LandingIcon';
const LandingScene=lazy(()=>import('./LandingScene'));
const subscribeViewport=(notify:()=>void)=>{const media=matchMedia('(min-width: 900px)');media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);};
const desktopViewport=()=>matchMedia('(min-width: 900px)').matches;
class PreviewBoundary extends Component<{children:React.ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed?null:this.props.children;}
}
export function HeroBuildingPreview(){
 const ref=useRef<HTMLDivElement>(null),visible=useInView(ref,{margin:'100px',once:true}),reduced=useReducedMotion();
 const desktop=useSyncExternalStore(subscribeViewport,desktopViewport,()=>false);
 const [failed,setFailed]=useState(false),[ready,setReady]=useState(false),[enabled,setEnabled]=useState(false);
 const onReady=useCallback(()=>setReady(true),[]),onFailure=useCallback(()=>setFailed(true),[]);
 const live=(enabled||(!reduced&&visible&&desktop))&&!failed;
 return <div ref={ref} className={`hero-building ${ready&&live?'has-scene':''}`}>
  <div className="hero-model-guides" aria-hidden="true"><i/><i/><i/><i/><span>06 / SPATIAL EXPLORER</span></div>
  <img className="hero-building-fallback" src="/landing/building-exterior.png" width="1200" height="800" alt="PCCOE Building No. 6 with five floors, two blue stair towers and its central entrance" loading="eager" decoding="async"/>
  {live&&<PreviewBoundary onFailure={onFailure}><Suspense fallback={null}><LandingScene onReady={onReady} onFailure={onFailure}/></Suspense></PreviewBoundary>}
  <div className="hero-model-caption"><span><LandingIcon name="buildings" size={16}/>PCCOE · BUILDING NO. 6</span><span>5 FLOORS / ONE CONNECTED VIEW</span></div>
  <div className="hero-model-instruction"><LandingIcon name={live?'hand-swipe-left':'cube'} size={16}/>{live?'DRAG TO EXPLORE · SCROLL TO DISCOVER':'VERIFIED ARCHITECTURAL PREVIEW'}{(reduced||!desktop)&&!enabled&&!failed&&<button onClick={()=>setEnabled(true)}><LandingIcon name="cube" size={16}/>Enable 3D</button>}</div>
 </div>;
}
