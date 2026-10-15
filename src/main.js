import './style.css';
import { experiments } from './experiments.js';
import { createRoom } from './experiments/window/scene.js';
import { createAmbience } from './experiments/window/ambience.js';
import { HeadTracker } from './experiments/window/tracker.js';
import { clamp } from './experiments/window/math.js';
const experiment=experiments[0];
const isDemo=[experiment.path,`${experiment.path}/`].includes(location.pathname);
const isUnknown=location.pathname!=='/'&&!isDemo;
const icon={arrow:'↗',camera:'◉',close:'×'};
document.body.classList.toggle('demo',isDemo);
document.querySelector('#app').innerHTML=`
<header class="header"><a class="brand" href="/" aria-label="WOW Lab ギャラリー"><span class="brand-mark">w<span>o</span>w<span class="brand-dot">.</span></span><span class="brand-caption">THREE.JS<br>EXPERIMENT LAB</span></a><nav><a href="/#collection">実験室 <span>01</span></a><a href="https://github.com/25im0047-commits/wow-threejs-lab" target="_blank" rel="noopener">GitHub ${icon.arrow}</a></nav></header>
<main>
${isUnknown?'<p class="not-found">この作品はまだありません。<a href="/">実験室へ戻る ↗</a></p>':''}
<div class="edition"><span><i></i> SMALL EXPERIMENTS, BIG WONDER.</span><span>VOL. 001 <b>／</b> INTERACTIVE 3D</span></div>
<section class="hero" aria-labelledby="title">
<div class="intro"><p class="eyebrow">EXPERIMENT 01 <span>—</span> THE OTHER SIDE</p><h1 id="title">画面の向こうに、<br><em>誰かいる。</em></h1><p class="lead">覗き込むと、目が合う。<br>あなたの動きで、モニターが窓になる。</p><div class="intro-actions"><a class="primary" href="${experiment.path}">窓をひらく <span>↗</span></a><span class="duration">カメラなしでも<br>すぐに体験できます</span></div><div class="intro-foot"><span class="orbit-icon">✳</span><p>ブラウザの、その先へ。<br><span>Made of light, code & a little curiosity.</span></p></div></div>
<div class="experience">
<div class="stage" tabindex="0" aria-label="3Dの小部屋。マウス移動または指でドラッグ。矢印キーで視点移動、プラス・マイナスキーで距離変更。" aria-describedby="instructions">
<canvas id="room" aria-label="奥行きのある小部屋と、こちらを見る住人"></canvas>
<div class="stage-top"><span class="world-tag"><i></i> THE OTHER SIDE</span><span class="live-tag" id="mode-label">AUTO TOUR</span></div>
<div class="room-label"><span class="tiny-line"></span> M O M O <small>YOUR CURIOUS NEIGHBOR</small></div>
<div class="stage-bottom"><span id="stage-hint">マウスを動かして、向こう側を覗こう</span><button class="icon-button" id="fullscreen" aria-label="全画面で表示">⛶</button></div>
<div class="stage-loading" id="stage-loading"><span class="loading-dot"></span> 小さな世界を準備しています</div>
<div class="knock-ring" aria-hidden="true"></div><div class="immersion-caption" aria-hidden="true"><span>THE OTHER SIDE</span><p>ここでは、少しだけ、ゆっくり。</p></div>
</div>
<div class="control-panel"><div class="control-top"><div class="control-heading"><span class="status-dot" id="status-dot"></span><span id="control-mode">マウス・タッチで体験</span></div><button id="pause" class="text-button" aria-pressed="false">動きを止める</button></div><div class="control-actions"><button id="camera" class="primary camera-button">${icon.camera} カメラで覗く <span>↗</span></button><button id="manual" class="secondary" hidden>カメラを停止</button><button id="knock" class="secondary">住人を呼ぶ <span>✧</span></button><button id="sound" class="secondary" aria-pressed="false">音をひらく ♫</button><button id="reset" class="secondary" aria-label="視点を中央に戻す、カメラ時は基準位置を再設定">視点をリセット</button></div><div class="distance-control"><label for="distance">近づく</label><input id="distance" type="range" min="4.3" max="12" value="7.8" step=".1" aria-label="窓からの距離"/><span>離れる</span></div><p id="status" role="status" aria-live="polite">カメラはボタンを押したときだけ起動します。映像は端末内で処理し、保存・送信しません。</p></div>
</div>
</section>
<button id="cinema" class="cinema-toggle" aria-pressed="false">景色だけにする ↗</button>
<section class="how" id="instructions"><div class="section-label">HOW TO LOOK <span>／ 遊び方</span></div><div class="how-steps"><article><span class="step">01</span><div><h2>顔を、ゆっくり動かす。</h2><p>カメラを許可して、まず正面へ。左右・上下に動くと、隠れた部屋の奥が見えてきます。</p></div></article><article><span class="step">02</span><div><h2>もう少し、近づいてみる。</h2><p>窓に顔を近づけると、視差が変わります。距離のスライダーでも試せます。</p></div></article><article><span class="step">03</span><div><h2>向こうも、気づいている。</h2><p>「住人を呼ぶ」を押すと、MOMOが窓をコンコン。こちらを、不思議そうに見つめます。</p></div></article></div><p class="access-note">カメラなし：マウスを動かす／指でドラッグ。キーボード：窓を選択して矢印キー、＋／−で距離変更。顔認識中は距離も自動で変わります。</p></section>
<section class="collection" id="collection"><div class="collection-heading"><h2>小さな、ありえない体験。</h2><span>THE COLLECTION <b>(${String(experiments.length).padStart(2,'0')})</b></span></div>${experiments.map(e=>`<a class="experiment-row" href="${e.path}"><span class="experiment-id">${e.id}</span><span class="experiment-title">${e.title}<small>${e.english}</small></span><span class="experiment-category">${e.category}</span><span class="experiment-arrow">↗</span></a>`).join('')}<p class="collection-note">この実験室には、これからも新しい「驚き」を。</p></section>
</main><footer><span>WOW LAB <b>© 2026</b></span><span>つくる。覗く。驚く。</span><a href="https://github.com/25im0047-commits/wow-threejs-lab" target="_blank" rel="noopener">View source ↗</a></footer>`;
const $=s=>document.querySelector(s);
const ambience=createAmbience();
let room,tracker,cameraMode=false,paused=false,manualEye={x:0,y:0,z:7.8};
function setStatus(text){if($('#status').textContent!==text)$('#status').textContent=text;}
function state(type,message){
  const running=['loading','tracking','searching'].includes(type);cameraMode=running;
  $('#camera').hidden=running;$('#manual').hidden=!running;
  $('#status-dot').dataset.state=type;
  $('#control-mode').textContent=type==='tracking'?'顔に追従しています':type==='loading'?'カメラを準備中':type==='searching'?'顔を探しています':'マウス・タッチで体験';
  $('#mode-label').textContent=type==='tracking'?'FACE TRACKING':type==='loading'?'LOADING':type==='searching'?'FINDING YOU':'MANUAL VIEW';
  $('#distance').disabled=running;
  setStatus(message);
}
try{
  room=createRoom($('#room'),pan=>{ambience.knock(pan);const ring=$('.knock-ring');ring.classList.remove('tap');void ring.offsetWidth;ring.classList.add('tap');},{immersive:isDemo});
  $('#stage-loading').hidden=true;
  $('#sound').addEventListener('click',async()=>{$('#sound').disabled=true;try{const on=await ambience.toggle();$('#sound').setAttribute('aria-pressed',String(on));$('#sound').textContent=on?'音を閉じる ♫':'音をひらく ♫';}catch{setStatus('音を再生できませんでした。音なしで体験を続けられます。');}finally{$('#sound').disabled=false;}});
  function setCinema(active){document.body.classList.toggle('cinema',active);$('.control-panel').inert=active;$('.stage-bottom').inert=active;$('.header').inert=active;$('.edition').inert=active;$('#cinema').setAttribute('aria-pressed',String(active));$('#cinema').textContent=active?'操作を表示する':'景色だけにする ↗';}
  $('#cinema').addEventListener('click',()=>setCinema(!document.body.classList.contains('cinema')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setCinema(false);});
  tracker=new HeadTracker(p=>{room.setEye(p);$('#distance').value=p.z;},state);
  $('#camera').addEventListener('click',()=>{if(paused)togglePause();tracker.start();});
  $('#manual').addEventListener('click',()=>{tracker.stop();state('manual','カメラを停止しました。マウス・指で操作できます。');room.setEye(manualEye);});
  $('#reset').addEventListener('click',()=>{manualEye={x:0,y:0,z:7.8};$('#distance').value=7.8;room.setEye(manualEye);if(cameraMode){tracker.calibrate();setStatus('正面を向いてください。基準位置を設定し直します。');}else setStatus('視点を中央に戻しました。');});
  $('#knock').addEventListener('click',()=>{if(paused)togglePause();room.knock();setStatus('MOMOがこちらに気づきました。窓まで、もう少し。');});
  function togglePause(){paused=!paused;room.pause(paused);$('#pause').textContent=paused?'動きを再開':'動きを止める';$('#pause').setAttribute('aria-pressed',String(paused));}
  $('#pause').addEventListener('click',togglePause);
  const stage=$('.stage');let dragging=false,activePointer=null;
  function pointer(e){if(cameraMode||e.target.closest('button'))return;if(e.pointerType==='touch'&&(!dragging||e.pointerId!==activePointer))return;const r=stage.getBoundingClientRect();manualEye.x=clamp(((e.clientX-r.left)/r.width-.5)*5,-2.5,2.5);manualEye.y=clamp((.5-(e.clientY-r.top)/r.height)*3,-1.5,1.5);room.setEye(manualEye);$('#mode-label').textContent='MANUAL VIEW';}
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button')||activePointer!==null)return;activePointer=e.pointerId;dragging=true;stage.setPointerCapture(e.pointerId);pointer(e);});
  stage.addEventListener('pointermove',pointer);const release=e=>{if(e.pointerId===activePointer){dragging=false;activePointer=null;}};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('keydown',e=>{if(cameraMode||e.target!==stage)return;const changes={ArrowLeft:['x',-.25],ArrowRight:['x',.25],ArrowUp:['y',.2],ArrowDown:['y',-.2],'+':['z',-.3],'=':['z',-.3],'-':['z',.3]};const c=changes[e.key];if(!c)return;e.preventDefault();manualEye[c[0]]+=c[1];manualEye.x=clamp(manualEye.x,-3.2,3.2);manualEye.y=clamp(manualEye.y,-2,2);manualEye.z=clamp(manualEye.z,4.3,12);$('#distance').value=manualEye.z;room.setEye(manualEye);$('#mode-label').textContent='MANUAL VIEW';});
  $('#distance').addEventListener('input',e=>{manualEye.z=Number(e.target.value);room.setEye(manualEye);});
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else location.href=experiment.path;}catch{setStatus('全画面に切り替えられませんでした。通常表示で操作できます。');}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){ambience.mute();$('#sound').setAttribute('aria-pressed','false');$('#sound').textContent='音をひらく ♫';}if(document.hidden&&cameraMode){tracker.stop();state('manual','ページを離れたためカメラを停止しました。再開するには「カメラで覗く」を押してください。');}});
  window.addEventListener('pagehide',()=>{tracker.dispose();room.dispose();ambience.dispose();},{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
  if(import.meta.env.DEV)window.__room=room;
}catch(error){
  console.error('Unable to start room',error);
  $('#stage-loading').textContent='3D表示を開始できませんでした。WebGL対応ブラウザで、ハードウェアアクセラレーションを有効にしてください。';
  setStatus('3Dの初期化に失敗しました。ページを再読み込みするか、別のブラウザでお試しください。');
  for(const button of document.querySelectorAll('.control-panel button,.control-panel input'))button.disabled=true;
}
if(isDemo){$('.intro').hidden=true;$('.edition').innerHTML='<a href="/">← 実験室へ戻る</a><span>01 — 向こう側 / THE OTHER SIDE</span>';$('#title')?.removeAttribute('id');$('.hero').setAttribute('aria-label','向こう側の体験');$('#stage-hint').textContent='ゆっくり動いて、窓の向こうを覗いてみよう';}
