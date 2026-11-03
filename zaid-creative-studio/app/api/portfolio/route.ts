import { env } from 'cloudflare:workers';
import { defaultProfile, categories } from '../../data';
export const dynamic='force-dynamic';
const bucket=()=> (env as any).BUCKET;
function owner(req:Request){return req.headers.get('oai-authenticated-user-email')?.toLowerCase()==='bajeerzaid@gmail.com' && !!req.headers.get('oai-authenticated-user-id')}
function json(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
async function read(key:string,fallback:any){const obj=await bucket().get(key);return obj?await obj.json():fallback}
export async function GET(req:Request){try{const listing=await bucket().list({prefix:'projects/',limit:1000});const projects=await Promise.all(listing.objects.map(async (o:any)=>read(o.key,null)));return json({profile:await read('profile.json',defaultProfile),projects:projects.filter(Boolean).sort((a:any,b:any)=>b.createdAt.localeCompare(a.createdAt)),canEdit:owner(req)})}catch{return json({error:'Portfolio storage is temporarily unavailable. Please try again.'},503)}}
export async function POST(req:Request){
 if(!owner(req))return json({error:'Sign in with the portfolio owner’s ChatGPT account.'},403);
 const origin=req.headers.get('origin');if(origin && origin!==new URL(req.url).origin)return json({error:'Invalid request origin.'},403);
 try{
 const form=await req.formData();const action=String(form.get('action')||'');
 if(action==='profile'){
 const val=(k:string,n=1000)=>String(form.get(k)||'').trim().slice(0,n);
 const profile={name:val('name',90),headline:val('headline',150),bio:val('bio'),email:val('email',200),phone:val('phone',30),whatsapp:val('whatsapp',20).replace(/\D/g,''),available:form.get('available')==='true'};
 if(!profile.name || !profile.headline)return json({error:'Name and headline are required.'},400);
 if(profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))return json({error:'Enter a valid email.'},400);
 await bucket().put('profile.json',JSON.stringify(profile));return json({ok:true});
 }
 const id=String(form.get('id')||'');if(id && !/^[a-f0-9-]{36}$/.test(id))return json({error:'Invalid project.'},400);
 const existing=id?await read('projects/'+id+'.json',null):null;
 if(action==='delete'){
 if(!existing)return json({error:'Project not found.'},404);
 await bucket().delete('projects/'+id+'.json');await bucket().delete(existing.image.replace('/api/images/',''));return json({ok:true});
 }
 if(action!=='project')return json({error:'Unknown action.'},400);
 if(id&&!existing)return json({error:'Project not found.'},404);
 if(!existing){const list=await bucket().list({prefix:'projects/',limit:1000});if(list.objects.length>=1000)return json({error:'Portfolio limit reached (1,000 projects).'},400)}
 const title=String(form.get('title')||'').trim().slice(0,140),category=String(form.get('category')||'');
 if(!title||!categories.includes(category))return json({error:'Title and a valid category are required.'},400);
 const file=form.get('image');let image=existing?.image;
 if(file instanceof File && file.size){
 if(file.size>10*1024*1024)return json({error:'Choose an image smaller than 10 MB.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());let type='';
 if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)type='image/png';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)type='image/jpeg';
 if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')type='image/webp';
 if(!type)return json({error:'Use a PNG, JPG or WebP image exported from your design app.'},400);
 const key='images/'+crypto.randomUUID();await bucket().put(key,bytes,{httpMetadata:{contentType:type}});image='/api/images/'+key;
 }
 if(!image)return json({error:'Please choose a project image.'},400);
 const project={id:id||crypto.randomUUID(),title,category,description:String(form.get('description')||'').trim().slice(0,3000),tools:String(form.get('tools')||'').trim().slice(0,200),image,createdAt:existing?.createdAt||new Date().toISOString()};
 await bucket().put('projects/'+project.id+'.json',JSON.stringify(project));
 if(existing && image!==existing.image)await bucket().delete(existing.image.replace('/api/images/',''));
 return json({ok:true});
 }catch{return json({error:'Could not save. Please try again.'},500)}
}
