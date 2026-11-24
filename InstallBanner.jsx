import {useEffect,useState} from 'react'
import {t} from './i18n'
export default function InstallBanner(){
const [ev,setEv]=useState(null),[show,setShow]=useState(false)
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)
useEffect(()=>{
const std=matchMedia('(display-mode: standalone)').matches||navigator.standalone
if(std||Date.now()<Number(localStorage.getItem('hideInstall')||0))return
const h=e=>{e.preventDefault();setEv(e);setShow(true)}
addEventListener('beforeinstallprompt',h)
if(ios)setShow(true)
return()=>removeEventListener('beforeinstallprompt',h)},[])
const close=()=>{localStorage.setItem('hideInstall',Date.now()+3*864e5);setShow(false)}
const go=async()=>{ev.prompt();await ev.userChoice;close()}
if(!show)return null
return <div className="install"><div><b>{t('install')}</b>{ios&&<p>{t('installIos')}</p>}</div>{!ios&&<button onClick={go}>{t('installBtn')}</button>}<button className="x" onClick={close}>×</button></div>}
