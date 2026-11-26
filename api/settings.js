import {applyConfig,noStore} from '../lib/config.mjs';
export default function handler(req,res){
  noStore(res);
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const {calendar,webhook}=applyConfig();
  return res.status(200).json({ready:Boolean(calendar&&webhook)});
}
