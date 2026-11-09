import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnergyPoint } from './energyTypes';
export function RoomHistory({points}:{points:EnergyPoint[]}) {
  if (!points.length) return <p>Historical consumption unavailable.</p>;
  return <div className="radar-room-history" role="img" aria-label={`Historical consumption: ${points.length} intervals, ${points.reduce((sum,point)=>sum+point.kwh,0).toFixed(2)} kWh total`}>
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{top:8,right:5,left:-28,bottom:0}}>
      <XAxis dataKey="label" tick={{fill:'var(--muted)',fontSize:8}} stroke="#9B829A" minTickGap={30} />
      <YAxis tick={{fill:'var(--muted)',fontSize:8}} stroke="#9B829A" width={48} />
      <Tooltip cursor={false} content={({active,payload,label}) => active && payload?.length ? <div className="radar-chart-tooltip">{label}<br />{Number(payload[0].value).toFixed(3)} kWh</div> : null} />
      <Area dataKey="kwh" type="linear" stroke="#CA2127" fill="#E6D1E5" fillOpacity={.3} strokeWidth={1.5} dot={false} activeDot={false} isAnimationActive={false} />
    </AreaChart></ResponsiveContainer>
  </div>;
}
