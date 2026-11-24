import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {t} from './i18n'
export default function Chat({me}){
const adm=me.role==='admin'
const [sts,setSts]=useState([]),[sid,setSid]=useState(adm?'':me.id),[m,setM]=useState([]),[txt,setTxt]=useState('')
useEffect(()=>{if(adm)supabase.from('profiles').select('id,full_name').eq('role','student').then(({data})=>setSts(data||[]))},[])
const load=async()=>{if(!sid)return;const {data}=await supabase.from('messages').select('*').eq('student_id',sid).order('created_at');setM(data||[])}
useEffect(()=>{load();const i=setInterval(load,5000);return()=>clearInterval(i)},[sid])
const send=async()=>{if(!txt.trim()||!sid)return;await supabase.from('messages').insert({student_id:sid,sender_id:me.id,body:txt});setTxt('');load()}
return <div>{adm&&<select value={sid} onChange={e=>setSid(e.target.value)}><option value="">{t('students')}</option>{sts.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select>}
<div className="chat">{m.map(x=><div key={x.id} className={x.sender_id===me.id?'msg mine':'msg'}>{x.body}<small>{new Date(x.created_at).toLocaleString()}</small></div>)}</div>
<div className="bar"><input style={{flex:1,margin:0}} value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/><button onClick={send}>{t('send')}</button></div></div>}
