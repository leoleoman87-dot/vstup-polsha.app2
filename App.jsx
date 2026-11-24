import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {t,setLang,getLang} from './i18n'
import Student from './Student'
import Admin from './Admin'
import Videos from './Videos'
import Chat from './Chat'
import InstallBanner from './InstallBanner'
function Login(){
const [m,setM]=useState('login'),[e,setE]=useState(''),[p,setP]=useState(''),[n,setN]=useState(''),[err,setErr]=useState('')
const go=async()=>{const r=m==='login'?await supabase.auth.signInWithPassword({email:e,password:p}):await supabase.auth.signUp({email:e,password:p,options:{data:{full_name:n}}});if(r.error)setErr(r.error.message)}
return <div className="card"><h1>Vstup Polsha</h1>{m==='signup'&&<input placeholder={t('name')} value={n} onChange={x=>setN(x.target.value)}/>}
<input placeholder={t('email')} value={e} onChange={x=>setE(x.target.value)}/><input type="password" placeholder={t('password')} value={p} onChange={x=>setP(x.target.value)}/>
{err&&<small className="err">{err}</small>}<button onClick={go}>{t(m)}</button><a onClick={()=>setM(m==='login'?'signup':'login')}>{t(m==='login'?'signup':'login')}</a></div>}
export default function App(){
const [s,setS]=useState(null),[me,setMe]=useState(null),[tab,setTab]=useState('home'),[,f]=useState(0)
useEffect(()=>{supabase.auth.getSession().then(({data})=>setS(data.session));const {data}=supabase.auth.onAuthStateChange((_,x)=>setS(x));return()=>data.subscription.unsubscribe()},[])
useEffect(()=>{if(!s){setMe(null);return}const ping=()=>{supabase.from('profiles').update({last_seen:new Date().toISOString()}).eq('id',s.user.id);supabase.from('activity').upsert({student_id:s.user.id,day:new Date().toISOString().slice(0,10)},{onConflict:'student_id,day',ignoreDuplicates:true})}
supabase.from('profiles').select('*').eq('id',s.user.id).single().then(({data})=>setMe(data));ping();const i=setInterval(ping,60000);return()=>clearInterval(i)},[s])
return <><header><b>Vstup</b><span>{['uk','pl'].map(l=><button key={l} className={getLang()===l?'on':''} onClick={()=>{setLang(l);f(x=>x+1)}}>{l.toUpperCase()}</button>)}{s&&<button onClick={()=>supabase.auth.signOut()}>{t('logout')}</button>}</span></header>
<main>{!s?<Login/>:!me?null:me.role==='admin'?<Admin me={me}/>:<><nav>{['home','videos','chat'].map(k=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{t(k)}</button>)}</nav>{tab==='videos'?<Videos me={me}/>:tab==='chat'?<Chat me={me}/>:<Student me={me}/>}</>}</main><InstallBanner/></>}
