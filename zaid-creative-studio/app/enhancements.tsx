'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';

export function useTheme(){
 const [theme,setTheme]=useState<'light'|'dark'>('light');
 useEffect(()=>{
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const sync=()=>{let saved:string|null=null;try{saved=localStorage.getItem('zaid-theme')}catch{}const next=saved==='light'||saved==='dark'?saved:media.matches?'dark':'light';document.documentElement.dataset.theme=next;setTheme(next)};
  sync();media.addEventListener('change',sync);window.addEventListener('storage',sync);
  return()=>{media.removeEventListener('change',sync);window.removeEventListener('storage',sync)};
 },[]);
 function toggle(){const next=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;setTheme(next);try{localStorage.setItem('zaid-theme',next)}catch{}}
 return {theme,toggle};
}

export function usePageMotion(){
 const [backTop,setBackTop]=useState(false);
 useEffect(()=>{
  const root=document.documentElement;
  const elements=document.querySelectorAll<HTMLElement>('[data-reveal]');
  const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer?.unobserve(entry.target)}})},{threshold:0.07}):null;
  elements.forEach(el=>{el.classList.add('reveal');if(observer)observer.observe(el);else el.classList.add('is-visible')});
  if(observer)root.classList.add('motion-ready');
  let frame=0;
  function update(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const height=root.scrollHeight-window.innerHeight;root.style.setProperty('--scroll-progress',String(height>0?Math.min(1,Math.max(0,window.scrollY/height)):0));setBackTop(window.scrollY>600)})}
  update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)};
 },[]);
 return backTop;
}

export function AnimatedDialog({open,onClose,label,busy=false,children}:{open:boolean;onClose:()=>void;label:string;busy?:boolean;children:(dismiss:()=>void)=>ReactNode}){
 const ref=useRef<HTMLDialogElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [closing,setClosing]=useState(false);
 const dismiss=()=>{if(busy||closing)return;setClosing(true);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;timer.current=setTimeout(()=>{setClosing(false);onClose()},reduced?0:180)};
 useEffect(()=>{
  const dialog=ref.current;if(!open||!dialog)return;
  const trigger=document.activeElement as HTMLElement|null;
  const previous=document.body.style.overflow;
  setClosing(false);dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector<HTMLElement>('.close')?.focus({preventScroll:true});
  return()=>{if(timer.current)clearTimeout(timer.current);dialog.close();document.body.style.overflow=previous;if(trigger?.isConnected)trigger.focus({preventScroll:true})};
 },[open]);
 return <dialog ref={ref} className={'modal'+(closing?' is-closing':'')} aria-label={label} onCancel={e=>{e.preventDefault();dismiss()}} onClick={e=>{if(e.target===e.currentTarget)dismiss()}}>{open?children(dismiss):null}</dialog>;
}
