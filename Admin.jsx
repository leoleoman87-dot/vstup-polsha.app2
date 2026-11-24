import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {t} from './i18n'
import Videos from './Videos'
import Chat from './Chat'
const LV=['A1','A2','B1','B2','C1','C2'],PASS=0.7
export default function Admin({me}){
const [st,setSt]=useState([]),[tests,setTests]=useState([]),[res,setRes]=useState([]),[vid,setVid]=useState([]),[vw,setVw]=useState([]),[act,setAct]=useState([])
const [view,setView]=useState('home'),[lv,setLv]=useState(null),[q,setQ]=useState(''),[sort,setSort]=useState('all'),[sel,setSel]=useState([]),[open,setOpen]=useState(null),[sheet,setSheet]=useState(false)
const load=async()=>{const r=await Promise.all(['tests','results','videos','video_views','activity'].map(x=>supabase.from(x).select('*')));const p=await supabase.from('profiles').select('*').eq('role','student').order('full_name')
setSt(p.data||[]);setTests(r[0].data||[]);setRes(r[1].data||[]);setVid(r[2].data||[]);setVw(r[3].data||[]);setAct(r[4].data||[])}
useEffect(()=>{load();const i=setInterval(load,30000);return()=>clearInterval(i)},[])
const isOn=s=>s.last_seen&&Date.now()-new Date(s.last_seen)<120000
const info=s=>{const need=tests.filter(x=>x.level===s.level);const done=need.filter(x=>res.some(r=>r.student_id===s.id&&r.test_id===x.id&&r.score/r.max_score>=PASS));const nv=vid.filter(x=>x.level===s.level);const dv=nv.filter(x=>vw.some(w=>w.student_id===s.id&&w.video_id===x.id));const left=need.length-done.length+nv.length-dv.length;return {ok:need.length+nv.length>0&&left===0,left}}
const solved=s=>res.filter(r=>r.student_id===s.id).reduce((a,r)=>a+(r.answered||0),0)
const days=s=>act.filter(a=>a.student_id===s.id&&Date.now()-new Date(a.day)<7*864e5).length
const move=async ids=>{for(const id of ids){const s=st.find(x=>x.id===id),i=LV.indexOf(s.level);if(i<5)await supabase.rpc('set_level',{uid:id,lvl:LV[i+1]})}setSel([]);load()}
const tog=id=>setSel(sel.includes(id)?sel.filter(x=>x!==id):[...sel,id])
const row=s=>{const i=info(s);return <div className="row" key={s.id}>{view==='group'&&<input type="checkbox" checked={sel.includes(s.id)} onChange={()=>tog(s.id)}/>}
<div className="grow" onClick={()=>setOpen(s.id)}><b>{s.full_name}</b> <span className="chip">{s.level}</span><br/><small><i className={isOn(s)?'dot on':'dot'}/>{isOn(s)?t('online'):s.last_seen?new Date(s.last_seen).toLocaleDateString():'—'} · {solved(s)} {t('solvedQ')} · {days(s)}/7 {t('days')}</small></div>{i.ok&&<span className="ready">{t('readyShort')}</span>}</div>}
const go=v=>{setView(v);setSheet(false);setOpen(null)}
let body
if(open){const s=st.find(x=>x.id===open),i=info(s),rs=res.filter(r=>r.student_id===s.id)
body=<div><button onClick={()=>setOpen(null)}>{t('back')}</button><h2>{s.full_name} <span className="chip">{s.level}</span></h2>
<p>{isOn(s)?t('online'):s.last_seen?new Date(s.last_seen).toLocaleString():'—'}<br/>{solved(s)} {t('solvedQ')} · {days(s)}/7 {t('days')} · {vw.filter(w=>w.student_id===s.id).length} {t('videos')}</p>
{rs.map(r=><div className="row" key={r.id}><span className="grow">{tests.find(x=>x.id===r.test_id)?.title}</span><b>{r.score}/{r.max_score}</b></div>)}
{i.ok&&<p><span className="ready">{t('ready')}</span></p>}<button onClick={()=>{move([s.id]);setOpen(null)}}>{t('move')}</button></div>}
else if(view==='home')body=<div><h2>{t('groups')}</h2><div className="grid">{LV.map(l=>{const g=st.filter(s=>s.level===l);return <div className="gcard" key={l} onClick={()=>{setLv(l);setSel([]);setView('group')}}><b>{l}</b><small>{g.length} {t('students')}</small><small>{g.filter(isOn).length} {t('online')}</small><small>{g.filter(s=>info(s).ok).length} {t('readyShort')}</small></div>})}</div></div>
else if(view==='group'){const g=st.filter(s=>s.level===lv);body=<div><button onClick={()=>setView('home')}>{t('back')}</button><h2>{lv}</h2><div className="bar"><button onClick={()=>setSel(g.filter(s=>info(s).ok).map(s=>s.id))}>{t('readyAll')}</button><button disabled={!sel.length} onClick={()=>move(sel)}>{t('move')} ({sel.length})</button></div>{g.map(row)}</div>}
else if(view==='search')body=<div><input autoFocus placeholder={t('search')} value={q} onChange={e=>setQ(e.target.value)}/>{st.filter(s=>(s.full_name||'').toLowerCase().includes(q.toLowerCase())).map(row)}</div>
else if(view==='students'){let l=[...st];if(sort==='solved')l.sort((a,b)=>solved(b)-solved(a));if(sort==='active')l.sort((a,b)=>days(b)-days(a));if(sort==='ready')l=l.filter(s=>info(s).ok)
body=<div><div className="bar">{[['all','all'],['solved','mostSolved'],['active','mostActive'],['ready','readyShort']].map(([k,n])=><button key={k} className={sort===k?'on':''} onClick={()=>setSort(k)}>{t(n)}</button>)}</div>{l.map(row)}</div>}
else if(view==='videos')body=<Videos me={me}/>
else if(view==='chat')body=<Chat me={me}/>
return <div><div className="bar"><b className="grow">{t('students')}: {st.length}</b><button onClick={()=>go('chat')}>💬</button></div>{body}
{sheet&&<div className="sheet"><button onClick={()=>go('videos')}>{t('addVideo')}</button><button disabled>{t('addQuestion')} ({t('soon')})</button></div>}
<div className="bnav">{[['home','🏠','groups'],['search','🔍','search']].map(([k,e,n])=><button key={k} className={view===k?'on':''} onClick={()=>go(k)}>{e}<small>{t(n)}</small></button>)}
<button className="plus" onClick={()=>setSheet(!sheet)}>+</button>
<button className={view==='students'?'on':''} onClick={()=>go('students')}>👥<small>{t('students')}</small></button></div></div>}
