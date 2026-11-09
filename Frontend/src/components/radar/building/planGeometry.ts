import { FOOTPRINT_SPANS } from './architecture';
import type { DrawingRect, PlanPoint, PlanRoom } from './planTypes';

export function planRect([left, top, right, bottom]: DrawingRect) {
  const x = ((top + bottom) / 2 - 700) * 72 / 1070, width = (bottom - top) * 72 / 1070;
  const back = Math.max(...FOOTPRINT_SPANS.filter(span => span.start < x + width / 2 && span.end > x - width / 2).map(span => span.back)) + .2;
  const z0 = Math.max(back, 9 - (right - 210) * 18 / 870), z1 = Math.min(8.7, 9 - (left - 210) * 18 / 870);
  return { x, z: (z0 + z1) / 2, width, depth: z1 - z0 };
}
export function rectangle(x: number, z: number, width: number, depth: number): PlanPoint[] {
  return [[x-width/2,z+depth/2],[x-width/2,z-depth/2],[x+width/2,z-depth/2],[x+width/2,z+depth/2]];
}
export function polygonBounds(points: PlanPoint[]) {
  const xs=points.map(p=>p[0]), zs=points.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  return { x:(x0+x1)/2,z:(z0+z1)/2,width:x1-x0,depth:z1-z0 };
}
export function pointInPolygon([x,z]: PlanPoint, polygon: PlanPoint[]) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,zi]=polygon[i],[xj,zj]=polygon[j];
    if((zi>z)!==(zj>z) && x<(xj-xi)*(z-zi)/(zj-zi)+xi) inside=!inside;
  }
  return inside;
}
export interface WallSegment { from: PlanPoint; to: PlanPoint }
const merge = (values: [number,number][]) => {
  const result: [number,number][]=[];
  for(const [a,b] of values.sort((a,b)=>a[0]-b[0])) {
    const last=result[result.length-1];
    if(last && a<=last[1]+.002) last[1]=Math.max(last[1],b); else result.push([a,b]);
  }
  return result;
};
/** Union shared wall segments before subtracting documented door apertures. */
export function roomWallSegments(rooms: PlanRoom[]): WallSegment[] {
  const axes=new Map<string,{axis:0|1;constant:number;ranges:[number,number][];doors:[number,number][]}>();
  const other: WallSegment[]=[];
  for(const room of rooms) {
    if(room.kind==='CORRIDOR') continue;
    room.polygon.forEach((a,index)=>{
      const b=room.polygon[(index+1)%room.polygon.length];
      const axis:0|1=Math.abs(a[0]-b[0])<.001?1:0;
      if(Math.abs(a[1-axis]-b[1-axis])>.001) { other.push({from:a,to:b});return; }
      const constant=a[1-axis],key=`${axis}:${constant.toFixed(3)}`;
      const entry=axes.get(key)??{axis,constant,ranges:[],doors:[]};
      entry.ranges.push([Math.min(a[axis],b[axis]),Math.max(a[axis],b[axis])]);
      for(const door of room.doors.filter(door=>door.edge===index)) {
        const start=a[axis]+(b[axis]-a[axis])*door.span[0],end=a[axis]+(b[axis]-a[axis])*door.span[1];
        entry.doors.push([Math.min(start,end),Math.max(start,end)]);
      }
      axes.set(key,entry);
    });
  }
  for(const {axis,constant,ranges,doors} of axes.values()) {
    let pieces=merge(ranges);
    for(const [start,end] of merge(doors)) pieces=pieces.flatMap(([a,b])=>end<=a||start>=b?[[a,b]]:([[a,Math.min(b,start)],[Math.max(a,end),b]] as [number,number][]).filter(([x,y])=>y-x>.015));
    for(const [a,b] of pieces) other.push({from:axis===0?[a,constant]:[constant,a],to:axis===0?[b,constant]:[constant,b]});
  }
  return other;
}
