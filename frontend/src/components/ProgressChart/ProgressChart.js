import React from "react";

export default function ProgressChart({ value=0 }){
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{border:"1px solid #ddd",borderRadius:12,padding:6}}>
      <div style={{height:12, background:"#eee", borderRadius:8, overflow:"hidden"}}>
        <div style={{height:"100%", width:v+"%"}} />
      </div>
      <div style={{fontSize:12, opacity:.7, marginTop:6}}>{v}%</div>
    </div>
  );
}
