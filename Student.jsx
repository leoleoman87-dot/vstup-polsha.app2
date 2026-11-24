import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {t,getLang} from './i18n'
export default function Student({me}){
const [tests,setTests]=useState([]),[cur,setCur]=useState(null),[qs,setQs]=useState([]),[ans,setAns]=useState({}),[out,setOut]=useState(null)
useEffect(()=>{supabase.from('tests').select('*').eq('level',me.level).then(({data})=>setTests(data||[]))},[me.level])
const open=async x=>{const {data}=await supabase.from('questions').select('*').eq('test_id',x.id).order('id');setQs(data||[]);setAns({});setOut(null);setCur(x)}
const finish=async()=>{let s=0,m=0;qs.forEach(q=>{m+=Number(q.points);if(ans[q.id]===q.answer)s+=Number(q.points)})
await supabase.from('results').insert({student_id:me.id,test_id:cur.id,score:s,max_score:m,answered:Object.keys(ans).length});setOut({s,m})}
if(!cur)return <div><h2>{t('tests')} · {me.level}</h2>{tests.length?tests.map(x=><div className="row" key={x.id}><span>{x.title}</span><button onClick={()=>open(x)}>{t('start')}</button></div>):<p>{t('noTests')}</p>}</div>
return <div>{qs.map((q,i)=><div className="q" key={q.id}><p><b>{i+1}.</b> {q.prompt_pl}</p>
{q.options.map((o,j)=><label key={j} className={out?(j===q.answer?'ok':ans[q.id]===j?'bad':''):''}><input type="radio" disabled={!!out} checked={ans[q.id]===j} onChange={()=>setAns({...ans,[q.id]:j})}/> {o}</label>)}
{out&&ans[q.id]!==q.answer&&<small>{getLang()==='uk'?q.explain_uk:q.explain_pl}</small>}</div>)}
{out?<><h3>{t('score')}: {out.s} / {out.m}</h3><button onClick={()=>setCur(null)}>{t('tests')}</button></>:<button onClick={finish}>{t('submit')}</button>}</div>}
