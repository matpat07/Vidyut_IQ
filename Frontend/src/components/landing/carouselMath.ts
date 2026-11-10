/** Three equal groups keep a matching clone on either side of the original. */
export function loopPosition(position:number,cycle:number){return cycle>0?-cycle-(((-position-cycle)%cycle+cycle)%cycle):0;}
