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
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const mouseHover=matchMedia('(hover: hover)');
const motionButton=document.querySelector('#proof-autoplay');
let manuallyPaused=false;

function updateMotionButton(){
  motionButton.hidden=reducedMotion.matches;
  motionButton.textContent=manuallyPaused?'Resume motion':'Pause motion';
}
motionButton.addEventListener('click',()=>{
  manuallyPaused=!manuallyPaused;
  updateMotionButton();
});

function makeMarquee(rail,speed){
  const originals=[...rail.children];
  const copies=originals.map((item,index)=>{
    const copy=item.cloneNode(true);
    copy.setAttribute('aria-hidden','true');
    const link=copy.querySelector('a');
    if(link) link.tabIndex=-1;
    item.dataset.slide=index;
    copy.dataset.slide=index;
    return copy;
  });
  const span=()=>copies[0].getBoundingClientRect().left-originals[0].getBoundingClientRect().left;
  let inView=false, frame=0, last=0, fraction=0, holdUntil=0, touching=false;

  function reset(){
    if(reducedMotion.matches){
      copies.forEach(copy=>copy.remove());
      rail.classList.remove('is-looping');
      rail.scrollLeft=0;
    }else{
      rail.append(...copies);
      rail.classList.add('is-looping');
      rail.scrollLeft=speed<0?span():0;
    }
    last=fraction=0;
    updateMotionButton();
    schedule();
  }

  function schedule(){
    if(inView&&!reducedMotion.matches&&!document.hidden&&!frame) frame=requestAnimationFrame(tick);
  }

  function tick(now){
    frame=0;
    if(!inView||reducedMotion.matches||document.hidden){last=fraction=0;return;}
    const focused=rail.parentElement.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');
    if(manuallyPaused||dialog.open||touching||now<holdUntil||focused||(mouseHover.matches&&rail.matches(':hover'))){
      last=fraction=0;
    }else{
      if(last) fraction+=Math.min(now-last,40)*speed/1000;
      last=now;
      const step=Math.trunc(fraction);
      if(step){
        const width=span();
        if(width>rail.clientWidth){
          const next=rail.scrollLeft+step;
          rail.scrollLeft=((next%width)+width)%width;
        }
        fraction-=step;
      }
    }
    schedule();
  }

  new IntersectionObserver(([entry])=>{
    inView=entry.isIntersecting;
    if(!inView) last=fraction=0;
    schedule();
  }).observe(rail);
  document.addEventListener('visibilitychange',()=>{last=fraction=0;schedule();});
  reducedMotion.addEventListener('change',reset);
  rail.addEventListener('pointerdown',()=>{touching=true;holdUntil=performance.now()+1500;});
  function release(){
    if(!touching)return;
    touching=false;
    holdUntil=performance.now()+1500;
  }
  window.addEventListener('pointerup',release);
  window.addEventListener('pointercancel',release);
  rail.addEventListener('wheel',()=>{holdUntil=performance.now()+1500;},{passive:true});

  rail.parentElement.querySelectorAll('[data-dir]').forEach(button=>{
    button.addEventListener('click',()=>{
      holdUntil=performance.now()+1750;
      const limit=rail.scrollWidth-rail.clientWidth;
      const direction=Number(button.dataset.dir);
      const step=Math.max(originals[0].getBoundingClientRect().width+13,rail.clientWidth*.8);
      const next=direction>0&&rail.scrollLeft>=limit-3?0:direction<0&&rail.scrollLeft<=3?limit:rail.scrollLeft+direction*step;
      rail.scrollTo({left:next,behavior:reducedMotion.matches?'instant':'smooth'});
    });
  });
  reset();
}

makeMarquee(document.querySelector('#proof-logos'),32);
const results=document.querySelector('#proof-results');
makeMarquee(results,-24);
results.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!dialog.showModal)return;
  event.preventDefault();
  show(Number(link.closest('li').dataset.slide));
  dialog.showModal();
});
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
