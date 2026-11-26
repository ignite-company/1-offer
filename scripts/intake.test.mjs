import test from 'node:test';
import assert from 'node:assert/strict';
import apply from '../api/apply.js';
import settings from '../api/settings.js';
import {questions} from '../questions.mjs';
const sample={contact:{name:'Example Tester',business:'Test Company',email:'qa@example.test',phone:'(201) 555-0102'},answers:questions.map(([,a])=>a[0]),attribution:{utm_source:'test'},requestId:'1ab4485a-0939-49f2-9a2e-31ea61a88101'};
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(value){this.data=value;return this}}}
const run=(body=sample)=>apply({method:'POST',headers:{'content-type':'application/json'},body},response());
test('intake and routing',async t=>{
  delete process.env.OFFER_DISCOVERY_CALENDAR_URL;delete process.env.OFFER_GHL_WEBHOOK_URL;
  assert.equal((await run()).code,503);
  assert.equal(settings({method:'GET'},response()).data.ready,false);
  process.env.OFFER_DISCOVERY_CALENDAR_URL='https://api.leadconnectorhq.com/widget/booking/example';
  process.env.OFFER_GHL_WEBHOOK_URL='https://services.leadconnectorhq.com/hooks/example/webhook-trigger/example';
  assert.equal(settings({method:'GET'},response()).data.ready,true);
  assert.equal((await run({...sample,answers:['fake']})).code,400);
  assert.equal((await run({...sample,contact:{...sample.contact,website_fax:'bot'}})).code,400);
  t.mock.method(globalThis,'fetch',async(url,args)=>{
    assert.equal(url.host,'services.leadconnectorhq.com');
    const p=JSON.parse(args.body);assert.equal(p.phone,'+12015550102');assert.equal(p.work_wanted,'Kitchens and baths');assert.equal(p.meta_ads_ready,'Yes');assert.equal(p.utm_source,'test');assert.equal(p.event_type,'one_dollar_offer_application');
    return {ok:true};
  });
  const ok=await run();
  assert.equal(ok.code,200);assert.equal(ok.data.bookingUrl,process.env.OFFER_DISCOVERY_CALENDAR_URL);assert.equal(ok.headers['Cache-Control'],'no-store');
  fetch.mock.mockImplementation(async()=>({ok:false}));
  assert.equal((await run()).code,502);
});
