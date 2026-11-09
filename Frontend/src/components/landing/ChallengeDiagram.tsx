import React from 'react';

/** Qualitative explanatory diagrams, not telemetry or measured comparisons. */
export function ChallengeDiagram({kind}:{kind:number}) {
  return <svg className="challenge-diagram" viewBox="0 0 280 72" fill="none" aria-hidden="true">
    {kind===0&&<>
      <path d="M8 36H58M98 36H144M184 36H230"/>
      {[58,144,230].map((x,index)=><g key={x}><rect x={x} y="17" width="38" height="38" rx="8"/><path className={index===1?'diagram-accent':''} d={`M${x+19} 25v10m-6-8a10 10 0 1 0 12 0`}/></g>)}
      <path className="diagram-accent" d="M8 36H42"/>
    </>}
    {kind===1&&<>
      {[0,1,2,3,4,5,6,7].map(index=><rect key={index} x={8+index*34} y="19" width="25" height="34" rx="4" className={index===3||index===4?'diagram-soft':''}/>)}
      <path d="M8 63H271M8 61v4m68-4v4m68-4v4m68-4v4m59-4v4"/>
      <path className="diagram-accent" d="M123 9v53m-4-50 4-4 4 4"/>
    </>}
    {kind===2&&<>
      <path d="M8 9h264v54H8zM8 36h264M61 9v54m53-54v54m53-54v54m53-54v54"/>
      <path className="diagram-soft" d="M115 37h51v25h-51z"/>
      <path className="diagram-accent" d="M119 42h43v16h-43z"/>
      <circle className="diagram-accent" cx="140" cy="50" r="2"/>
    </>}
    {kind===3&&<>
      <path d="M8 58h264M8 14v44"/>
      <path d="m8 44 30-9 29 4 31-20 30 7 29-5 31 9 29-10 30 5 25-11"/>
      <path className="diagram-accent" d="m8 44 30-9 29 4 31-20 30 7 29 13 31 4 29 5 30-3 25 2"/>
      <circle className="diagram-accent" cx="128" cy="26" r="4"/>
    </>}
  </svg>;
}
