import {questions} from './questions.mjs';
const form = document.querySelector('#application'), panel = document.querySelector('#question'), feedback = document.querySelector('#feedback');
const SVG = [
  '<path d="M3 9h18v10H3zM3 14h18M8 14v5m8-5v5M10 9V5a2 2 0 0 1 4 0v1"/>',
  '<path d="m3 11 9-8 9 8M5 10v11h14V10m-9 11v-7h4v7"/>',
  '<path d="m2 12 10-8 10 8M5 12l7-5 7 5m-3-6V3h4v6"/>',
  '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 5l3 3 3-3m-6 14 3-3 3 3"/>',
  '<path d="M4 7h16m-13 0 1 13h8l1-13M9 7V4h6v3m-5 3v7m4-7v7"/>',
  '<path d="M5 12h.01m7 0h.01m7 0h.01" stroke-width="3"/>'
];
const answers=[], fields=[['name','Full name','text','name'],['business','Company name','text','organization'],['email','Email','email','email'],['phone','Phone number','tel','tel']];
const savedContact={}; let at=0, pending=false, requestId=crypto.randomUUID();
const config=fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
const clickButton=(label,fn,cls='')=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.addEventListener('click',fn);return b};
function text(tag, value, cls=''){const n=document.createElement(tag);n.textContent=value;n.className=cls;return n}
function draw(focus=true){
  feedback.textContent='';
  const inner=document.createElement('div');
  if(focus) inner.className='incoming';
  let heading;
  if(at<questions.length){
    const [label,items]=questions[at];
    inner.append(text('p',at===0?'Choose one ↓':'Choose one','choose'));
    heading=text('h2',label);inner.append(heading);
    const grid=document.createElement('div');grid.className='answers'+(at===0?' start':'');
    items.forEach((item,i)=>{
      const b=clickButton(item,()=>{answers[at]=item;at++;draw()});
      if(at===0){
        const ico=document.createElementNS('http://www.w3.org/2000/svg','svg');ico.setAttribute('viewBox','0 0 24 24');ico.setAttribute('aria-hidden','true');ico.classList.add('icon');ico.innerHTML=SVG[i];b.prepend(ico);
      }
      grid.append(b);
    });inner.append(grid);
  } else {
    heading=text('h2','Where can we reach you?');inner.append(heading);
    const grid=document.createElement('div');grid.className='contact-grid';
    for(const [key,label,type,autocomplete] of fields){
      const wrap=text('label',label);const input=document.createElement('input');
      Object.assign(input,{name:key,type,autocomplete,required:true,maxLength:key==='email'?254:key==='phone'?32:100,value:savedContact[key]||''});
      input.addEventListener('input',()=>savedContact[key]=input.value);wrap.append(input);grid.append(wrap);
    }
    const trap=text('label','Leave blank','trap');const hidden=document.createElement('input');Object.assign(hidden,{name:'website_fax',tabIndex:-1,autocomplete:'off'});trap.append(hidden);trap.setAttribute('aria-hidden','true');
    inner.append(grid,trap,text('p','We’ll use these details to respond to this application. Next you’ll choose a time for a 15-minute call with Asher.','small'));
    const go=text('button','Continue to scheduling','primary form-submit');go.type='submit';inner.append(go);
    config.then(c=>{if(at===questions.length&&!c.ready&&!pending) feedback.textContent='Scheduling is not open yet. Please check back when the offer launches.';});
  }
  if(at>0)inner.append(clickButton('Back',()=>{if(!pending){at--;draw()}},'secondary'));
  panel.replaceChildren(inner);
  if(focus){heading.tabIndex=-1;heading.focus({preventScroll:true})}
}
form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending||at!==questions.length||!form.reportValidity())return;
  const c=await config;if(!c.ready){feedback.textContent='Scheduling is not open yet. Please check back when the offer launches.';return}
  if(pending)return;pending=true;
  const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Saving your application…';feedback.textContent='';
  try{
    const data=Object.fromEntries(new FormData(form));
    const attribution={};const qs=new URLSearchParams(location.search);
    for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'])if(qs.has(k)) attribution[k]=qs.get(k).slice(0,512);
    const r=await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contact:data,answers,attribution,requestId})});
    const out=await r.json();
    if(!r.ok||!out.bookingUrl){feedback.textContent=out.error||'We couldn’t save your application. Please try again.';return}
    location.assign(out.bookingUrl);
  }catch{feedback.textContent='We couldn’t save your application. Please try again.'}
  finally{pending=false;button.disabled=false;button.textContent='Continue to scheduling'}
});
draw(false);
