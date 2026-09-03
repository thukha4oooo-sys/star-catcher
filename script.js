const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const messageTitle = message.querySelector('h2');
const messageText = message.querySelector('p');
const playBtn = document.getElementById('playBtn');
const startBtn = document.getElementById('startBtn');
const installBtn = document.getElementById('installBtn');
let installPrompt = null;

let score = 0, lives = 3, best = Number(localStorage.getItem('starCatcherBest') || 0);
let playing = false, lastTime = 0, spawnTimer = 0, stars = [], particles = [], keys = {};
const player = { x: 450, y: 500, w: 108, h: 25, speed: 520 };
bestEl.textContent = best;

const skyStars = Array.from({length:90}, () => ({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.8+.3, a:Math.random()*.7+.2 }));
function resizeCanvas(){ /* CSS keeps the game responsive while the internal canvas stays crisp. */ }
function reset(){ score=0; lives=3; stars=[]; particles=[]; player.x=canvas.width/2; updateUI(); }
function updateUI(){ scoreEl.textContent=score; livesEl.textContent=lives; bestEl.textContent=best; }
function start(){ reset(); playing=true; message.classList.add('hidden'); lastTime=performance.now(); requestAnimationFrame(loop); }
function end(){ playing=false; if(score>best){best=score; localStorage.setItem('starCatcherBest',best);} updateUI(); messageTitle.textContent='ဂိမ်းပြီးပါပြီ'; messageText.textContent=`သင့်အမှတ် ${score} ပါ။ ထပ်ပြီး စမ်းကြည့်ပါ!`; playBtn.textContent='ပြန်ကစားမယ်'; message.classList.remove('hidden'); }
function spawn(){ const special=Math.random()<.15; stars.push({ x:25+Math.random()*(canvas.width-50), y:-30, r:special?13:10, speed:130+Math.random()*100+score*.25, type:special?'bonus':(Math.random()<.16?'bomb':'star'), rot:Math.random()*7 }); }
function burst(x,y,color){ for(let i=0;i<12;i++) particles.push({x,y,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,life:.6,color}); }
function circleHit(o){ return o.x>player.x-player.w/2-o.r && o.x<player.x+player.w/2+o.r && o.y>player.y-o.r && o.y<player.y+player.h+o.r; }
function update(dt){
  if(keys.ArrowLeft||keys.a) player.x-=player.speed*dt;
  if(keys.ArrowRight||keys.d) player.x+=player.speed*dt;
  player.x=Math.max(player.w/2,Math.min(canvas.width-player.w/2,player.x));
  spawnTimer+=dt; const interval=Math.max(.33,.82-score/900); if(spawnTimer>interval){spawn();spawnTimer=0;}
  stars.forEach(o=>o.y+=o.speed*dt);
  for(let i=stars.length-1;i>=0;i--){ const o=stars[i]; if(circleHit(o)){ if(o.type==='bomb'){lives--; burst(o.x,o.y,'#ff6382');} else {score+=o.type==='bonus'?30:10; burst(o.x,o.y,o.type==='bonus'?'#72e3ff':'#ffd166');} stars.splice(i,1); updateUI(); if(lives<=0) end(); } else if(o.y>canvas.height+35) stars.splice(i,1); }
  particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}); particles=particles.filter(p=>p.life>0);
}
function draw(){
  const g=ctx.createLinearGradient(0,0,0,canvas.height); g.addColorStop(0,'#090721'); g.addColorStop(1,'#1d1740'); ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  skyStars.forEach(s=>{ctx.globalAlpha=s.a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  ctx.fillStyle='#302765';ctx.fillRect(0,530,canvas.width,30);
  stars.forEach(o=>{ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);if(o.type==='bomb'){ctx.fillStyle='#ff5475';ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffccd5';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(-2,-o.r-7,4,7);ctx.restore();return;} ctx.fillStyle=o.type==='bonus'?'#69ddff':'#ffd166';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=18;drawStar(0,0,o.r);ctx.fill();ctx.restore();});
  particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/.6);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4);});ctx.globalAlpha=1;
  ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle='#7c5cff';ctx.shadowColor='#7c5cff';ctx.shadowBlur=22;roundRect(-player.w/2,0,player.w,player.h,10);ctx.fill();ctx.fillStyle='#c9bfff';roundRect(-player.w/2+13,5,player.w-26,6,4);ctx.fill();ctx.restore();
}
function drawStar(x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function loop(t){if(!playing)return;const dt=Math.min((t-lastTime)/1000,.04);lastTime=t;update(dt);draw();requestAnimationFrame(loop);}
window.addEventListener('keydown',e=>{keys[e.key]=true;if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});window.addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('.touch-btn').forEach(btn=>{const k=btn.dataset.key;btn.addEventListener('pointerdown',()=>keys[k]=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>keys[k]=false));});
playBtn.addEventListener('click',start);startBtn.addEventListener('click',start);draw();

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});
window.addEventListener('appinstalled', () => { installBtn.hidden = true; });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
