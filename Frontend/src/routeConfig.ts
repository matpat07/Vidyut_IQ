import type {NavView} from './components/layout/Sidebar';
export const APP_PATHS:Record<NavView,string>={DASHBOARD:'/app/dashboard',RADAR:'/app/radar',ANALYTICS:'/app/analytics',ALERTS:'/app/alerts',AUDIT:'/app/audit',SETTINGS:'/app/settings',TEACHER:'/app/faculty',STUDENT_FINDER:'/app/rooms'};
export function viewForPath(path:string):NavView|null {
  const normalized=path.replace(/\/+$/,'')||'/';
  if(normalized==='/app'||normalized==='/dashboard')return 'DASHBOARD';
  return (Object.keys(APP_PATHS) as NavView[]).find(view=>APP_PATHS[view]===normalized)??null;
}
