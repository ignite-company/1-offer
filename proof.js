const dialog=document.querySelector('#proof-dialog');
const slides=[...document.querySelectorAll('#proof-results a')];
const image=dialog.querySelector('#proof-image');
const openFull=dialog.querySelector('#proof-full');
const title=dialog.querySelector('#proof-current');
let selected=0;
function show(index){
  selected=(index+slides.length)%slides.length;
  const item=slides[selected];
  image.src=item.href;
  image.alt=item.querySelector('img').alt;
  openFull.href=item.href;
  title.textContent=`Result ${selected+1} of ${slides.length}`;
}
document.querySelectorAll('[data-rail]').forEach(button=>{
  button.addEventListener('click',()=>{
    const rail=document.getElementById(button.dataset.rail);
    const limit=rail.scrollWidth-rail.clientWidth;
    const direction=Number(button.dataset.dir);
    const step=Math.max(rail.firstElementChild.getBoundingClientRect().width+13,rail.clientWidth*.8);
    const next=direction>0&&rail.scrollLeft>=limit-3?0:direction<0&&rail.scrollLeft<=3?limit:rail.scrollLeft+direction*step;
    rail.scrollTo({left:next,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
});
slides.forEach((item,index)=>item.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!dialog.showModal)return;
  event.preventDefault();
  show(index);
  dialog.showModal();
}));
dialog.querySelector('#proof-prev').addEventListener('click',()=>show(selected-1));
dialog.querySelector('#proof-next').addEventListener('click',()=>show(selected+1));
dialog.querySelector('#proof-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();
    show(selected+(event.key==='ArrowLeft'?-1:1));
  }
});
