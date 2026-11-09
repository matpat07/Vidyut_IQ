import React,{lazy,Suspense} from 'react';
import {SimulationProvider} from './context/SimulationContext';
import {useAppPath,viewForPath} from './navigation';
const AppWorkspace=lazy(()=>import('./AppWorkspace'));
const LandingPage=lazy(()=>import('./components/landing/LandingPage'));
export const App:React.FC=()=>{
 const path=useAppPath(),view=viewForPath(path);
 React.useEffect(()=>{document.title=view?'VidyutIQ — Campus Energy Workspace':'VidyutIQ — Campus Energy Intelligence';document.documentElement.dataset.surface=view?'workspace':'landing';},[view]);
 return <SimulationProvider><Suspense fallback={<div className="site-loading" role="status">VidyutIQ / Preparing your view…</div>}>{view?<AppWorkspace view={view}/>:<LandingPage/>}</Suspense></SimulationProvider>;
};
export default App;
