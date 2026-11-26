export function publicHttps(value){
  try{const u = new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u:null}catch{return null}
}
export function booking(value){
  const u=publicHttps(value);
  return u && /\/widget\/booking\/[^/]+\/?$/.test(u.pathname) ? u : null;
}
export function intake(value){
  const u=publicHttps(value);
  return u && u.hostname==='services.leadconnectorhq.com' && /^\/hooks\/[^/]+\/webhook-trigger\/[^/]+\/?$/.test(u.pathname) ? u : null;
}
export function applyConfig(){
  return {calendar:booking(process.env.OFFER_DISCOVERY_CALENDAR_URL),webhook:intake(process.env.OFFER_GHL_WEBHOOK_URL)};
}
export function noStore(res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
}
