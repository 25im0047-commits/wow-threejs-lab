// Procedural audio: no recordings, network requests, or microphone access.
export function createAmbience() {
  let context, master, wind, enabled=false,epoch=0;
  const sources=[];
  function init(){
    context=new AudioContext(); master=context.createGain();master.gain.value=0;master.connect(context.destination);
    const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate);
    const data=buffer.getChannelData(0);let last=0;
    for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.018)/1.02;data[i]=last;}
    wind=context.createBufferSource();wind.buffer=buffer;wind.loop=true;
    const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;
    const gain=context.createGain();gain.gain.value=.32;wind.connect(filter).connect(gain).connect(master);wind.start();sources.push(wind);
    for(const frequency of [146.83,220,293.66]){
      const oscillator=context.createOscillator(), gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.value=.009;
      oscillator.connect(gain).connect(master);oscillator.start();sources.push(oscillator);
    }
  }
  return {
    async toggle(){
      if(!context)init();
      const next=!enabled,token=++epoch;
      if(next)await context.resume();
      if(token!==epoch){context.suspend().catch(()=>{});return false;}
      enabled=next;master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(enabled ? 0.55 : 0,context.currentTime,.3);return enabled;
    },
    knock(pan=0){if(!enabled||context?.state!=='running')return;
      const t=context.currentTime, osc=context.createOscillator(), gain=context.createGain(), stereo=context.createStereoPanner();
      stereo.pan.value=Math.max(-.85,Math.min(.85,pan));osc.type='sine';osc.frequency.setValueAtTime(540,t);osc.frequency.exponentialRampToValueAtTime(180,t+.13);
      gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.14,t+.005);gain.gain.exponentialRampToValueAtTime(.0001,t+.22);
      osc.connect(gain).connect(stereo).connect(master);osc.start(t);osc.stop(t+.25);osc.onended=()=>{osc.disconnect();gain.disconnect();stereo.disconnect();};
    },
    mute(){epoch++;enabled=false;if(context){master.gain.value=0;context.suspend().catch(()=>{});}},
    dispose(){epoch++;enabled=false;for(const source of sources)source.stop();context?.close().catch(()=>{});}
  };
}
