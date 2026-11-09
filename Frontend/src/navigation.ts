import {useSyncExternalStore} from 'react';
import type {NavView} from './components/layout/Sidebar';
import {APP_PATHS} from './routeConfig';
export {APP_PATHS,viewForPath} from './routeConfig';
export function navigatePath(path:string) {
  if(location.pathname+location.hash===path)return;
  history.pushState(null,'',path);window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});
}
export const navigateView=(view:NavView)=>navigatePath(APP_PATHS[view]);
const subscribe=(listener:()=>void)=>{window.addEventListener('popstate',listener);return()=>window.removeEventListener('popstate',listener);};
export const useAppPath=()=>useSyncExternalStore(subscribe,()=>location.pathname,()=>'/');
