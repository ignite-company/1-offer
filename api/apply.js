import {questions,answerKeys} from '../questions.mjs';
import {applyConfig,noStore} from '../lib/config.mjs';
const bad='Please check your contact details and try again.';
const clean=(s,max)=>typeof s==='string'&&s.length<=max?s.trim():'';
const tracking=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];
export default async function handler(req,res){
  noStore(res);
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!/^application\/json\b/i.test(req.headers['content-type']||'')||Number(req.headers['content-length'])>8192)return res.status(400).json({error:bad});
  const {calendar,webhook}=applyConfig();
  if(!calendar||!webhook)return res.status(503).json({error:'Scheduling is not open yet. Please check back when the offer launches.'});
  let body=req.body;
  if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:bad})}}
  const {contact,answers,requestId,attribution}=body&&typeof body==='object'?body:{};
  if(contact?.website_fax)return res.status(400).json({error:bad});
  if(!Array.isArray(answers)||answers.length!==questions.length||!answers.every((value,i)=>questions[i][1].includes(value))||typeof requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return res.status(400).json({error:bad});
  const name=clean(contact?.name,100),business_name=clean(contact?.business,100),email=clean(contact?.email,254).toLowerCase(),rawPhone=clean(contact?.phone,32);
  let phone=rawPhone.replace(/[^\d+]/g,'');
  if(/^\d{10}$/.test(phone))phone='+1'+phone;
  if(/^1\d{10}$/.test(phone))phone='+'+phone;
  if(!name||!business_name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[+][1-9]\d{7,14}$/.test(phone)||!/^[+\d\s().-]+$/.test(rawPhone))return res.status(400).json({error:bad});
  const data={event_type:'one_dollar_offer_application',submission_id:requestId,name,business_name,email,phone,
    ...Object.fromEntries(answerKeys.map((key,i)=>[key,answers[i]])),
    ...Object.fromEntries(tracking.map(k=>[k,clean(attribution?.[k],512)]).filter(([,v])=>v)),
    submitted_at:new Date().toISOString()};
  try{
    const result=await fetch(webhook,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(7000),redirect:'error'});
    if(!result.ok)throw new Error('Intake failed');
    return res.status(200).json({bookingUrl:calendar.href});
  }catch{return res.status(502).json({error:'We couldn’t save your application. Please try again.'})}
}
