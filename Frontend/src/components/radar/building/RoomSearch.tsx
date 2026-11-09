import React,{useState} from 'react';
import {filterPlanSpaces} from './labelLayout';
export function RoomSearch({onSelect}:{onSelect:(id:string)=>void}) {
  const [query,setQuery]=useState(''),[message,setMessage]=useState('');
  const matches=filterPlanSpaces(query);
  return <form className="building-room-search" onSubmit={event=>{
    event.preventDefault();
    if(query.trim()&&matches.length===1){onSelect(matches[0].id);setMessage('');}
    else setMessage(matches.length?'Add a room number or floor.':'No matching plan space.');
  }}>
    <input type="search" aria-label="Search building rooms" aria-describedby="building-search-result" placeholder="Search room / facility" list="building-search-options" value={query} onChange={event=>{setQuery(event.target.value);setMessage('');}} />
    <datalist id="building-search-options">{matches.map(room=><option key={room.id} value={`${room.number??room.name} F${room.floor}`}>{room.name}{room.aliases.length?` / ${room.aliases.join(', ')}`:''}</option>)}</datalist>
    <button type="submit">Go</button><span id="building-search-result" className="building-search-message" hidden={!message} role="status">{message}</span>
  </form>;
}
