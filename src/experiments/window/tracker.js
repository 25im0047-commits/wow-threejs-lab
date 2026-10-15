import { faceToEye } from './math.js';
export class HeadTracker {
  constructor(onEye, onState, getStream = constraints => navigator.mediaDevices.getUserMedia(constraints)) {
    this.getStream = getStream;
    this.onEye = onEye; this.onState = onState; this.generation = 0;
    this.video = document.createElement('video');
    this.video.muted = true; this.video.playsInline = true;
    this.video.setAttribute('aria-hidden','true');
    this.video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0';
    document.body.append(this.video);
  }
  async start() {
    this.stop(); const generation = this.generation;
    const current = () => this.generation === generation;
    this.onState('loading','カメラの許可を待っています…');
    try {
      const stream = await this.getStream({ audio:false, video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}} });
      if (!current()) { stream.getTracks().forEach(t=>t.stop()); return; }
      this.stream = stream; this.video.srcObject = stream;
      stream.getVideoTracks()[0].addEventListener('ended',()=> { if(current()) this.fail('カメラが切断されました。マウス・指で操作できます。'); });
      await this.video.play();
      if (!current()) return;
      this.onState('loading','顔認識を準備中… 映像はこの端末内で処理します');
      this.worker = new Worker('/face-worker.js');
      this.timeout = setTimeout(()=>this.fail('顔認識の準備がタイムアウトしました。もう一度お試しください。'),25000);
      this.worker.onerror = ()=> { if(current()) this.fail('顔認識を起動できませんでした。マウス・指で操作できます。'); };
      this.worker.onmessage = ({data})=> {
        if(!current()) return;
        if(data.type==='ready') { clearTimeout(this.timeout); this.active=true; this.busy=false; this.onState('searching','正面を向いてください。最初の顔位置を基準にします。'); this.loop(); }
        if(data.type==='error') this.fail('顔認識に失敗しました。マウス・指で操作できます。');
        if(data.type==='face') {
          this.busy=false;
          if(data.face && data.face.span>0.015) {
            this.center ??= {...data.face}; this.lastSeen=performance.now();
            this.onEye(faceToEye(data.face,this.center));
            this.onState('tracking','顔に追従中 — ゆっくり左右・上下に動いてみて');
          } else if(performance.now()-(this.lastSeen??0)>700) {
            this.onState('searching','顔が見つかりません。明るい場所で正面を向いてください。');
            this.onEye({x:0,y:0,z:7.8});
          }
        }
      };
      this.worker.postMessage({type:'init'});
    } catch(e) {
      if(!current()) return;
      const denied=e.name==='NotAllowedError';
      this.fail(denied ? 'カメラは許可されていません。マウス・指でそのまま遊べます。' : 'カメラを利用できません。接続・HTTPS・ブラウザ設定を確認してください。');
    }
  }
  loop = async () => {
    if(!this.active) return;
    this.timer=setTimeout(this.loop,70);
    if(this.busy || this.video.readyState<2 || this.lastFrame===this.video.currentTime || document.hidden) return;
    this.busy=true; this.lastFrame=this.video.currentTime;
    const generation=this.generation;
    try {
      const frame=await createImageBitmap(this.video,{resizeWidth:480,resizeQuality:'low'});
      if(generation!==this.generation || !this.worker) { frame.close(); return; }
      this.worker.postMessage({type:'frame',frame,time:performance.now()},[frame]);
    } catch { if(generation===this.generation) this.fail('映像を処理できませんでした。マウス・指で操作できます。'); }
  };
  calibrate() { this.center=null; }
  fail(message) { this.stop(); this.onState('error',message); }
  stop() {
    this.generation++; this.active=false; clearTimeout(this.timeout); clearTimeout(this.timer);
    this.stream?.getTracks().forEach(t=>t.stop()); this.stream=null;
    this.worker?.terminate(); this.worker=null; this.video.srcObject=null;
    this.center=null; this.busy=false; this.lastFrame=null; this.lastSeen=null;
  }
  dispose() { this.stop(); this.video.remove(); }
}
