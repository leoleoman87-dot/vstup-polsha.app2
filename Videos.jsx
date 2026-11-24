import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {t} from './i18n'
const LV=['A1','A2','B1','B2','C1','C2']
const emb=u=>{const m=u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);return m?`https://www.youtube.com/embed/${m[1]}`:u}
export default function Videos({me}){
const adm=me.role==='admin'
const [v,setV]=useState([]),[w,setW]=useState([]),[ti,setTi]=useState(''),[u,setU]=useState(''),[lv,setLv]=useState('A1')
const load=async()=>{const q=supabase.from('videos').select('*').order('created_at');const a=await(adm?q:q.eq('level',me.level));setV(a.data||[])
if(!adm){const b=await supabase.from('video_views').select('video_id').eq('student_id',me.id);setW((b.data||[]).map(x=>x.video_id))}}
useEffect(()=>{load()},[])
const add=async()=>{if(!ti||!u)return;await supabase.from('videos').insert({title:ti,url:u,level:lv});setTi('');setU('');load()}
const done=async id=>{await supabase.from('video_views').insert({student_id:me.id,video_id:id});load()}
return <div>{adm&&<div className="q"><input placeholder={t('title')} value={ti} onChange={e=>setTi(e.target.value)}/><input placeholder={t('link')} value={u} onChange={e=>setU(e.target.value)}/>
<select value={lv} onChange={e=>setLv(e.target.value)}>{LV.map(l=><option key={l}>{l}</option>)}</select><button onClick={add}>{t('addVideo')}</button></div>}
{v.map(x=><div className="q" key={x.id}><b>{x.title}</b> <span className="chip">{x.level}</span>
<iframe title={x.title} src={emb(x.url)} allowFullScreen style={{width:'100%',aspectRatio:'16/9',border:0,marginTop:8,borderRadius:8}}/>
{!adm&&(w.includes(x.id)?<span className="ready">{t('watched')}</span>:<button onClick={()=>done(x.id)}>{t('markWatched')}</button>)}</div>)}</div>}
