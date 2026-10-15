import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { frustum } from './math.js';

export function createRoom(canvas, onKnock) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.45;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#171e1c');
  const camera=new THREE.PerspectiveCamera(); camera.position.set(0,0,7.8);
  const pmrem=new THREE.PMREMGenerator(renderer); const roomEnv=new RoomEnvironment();
  const env=pmrem.fromScene(roomEnv,0.04); scene.environment=env.texture;
  roomEnv.dispose(); pmrem.dispose(); scene.environmentIntensity=0.35;
  const materials=[];
  function mat(color,roughness=0.75,metalness=0) {const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;}
  const plaster=mat('#577b71'), dark=mat('#284b44'), wood=mat('#b77f50'), trim=mat('#cfaa78'), cream=mat('#fff1c6',0.35), gold=mat('#c99d53',0.3,0.65), ink=mat('#182925',0.22), orange=mat('#e79459');
  function mesh(geo,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,m,x,y,z,parent=scene,r=0){return mesh(r?new RoundedBoxGeometry(w,h,d,2,r):new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
  function sphere(r,m,x,y,z,parent=scene){return mesh(new THREE.SphereGeometry(r,24,16),m,x,y,z,parent);}
  function cyl(rt,rb,h,m,x,y,z,parent=scene){return mesh(new THREE.CylinderGeometry(rt,rb,h,32),m,x,y,z,parent);}
  scene.add(new THREE.HemisphereLight('#e5ead8','#8b5e3d',1.5));
  const sun=new THREE.DirectionalLight('#ffdfab',4);sun.position.set(-3,5,2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.035;scene.add(sun);
  const warm=new THREE.PointLight('#ffc47e',32,13,2);warm.position.set(-2,1,-3.7);scene.add(warm);
  const fill=new THREE.PointLight('#b7e7cf',13,9,2);fill.position.set(2,0,-.1);scene.add(fill);
  // A room six units deep, with a real, fixed opening on the screen plane.
  box(7,5,.2,plaster,0,0,-6.1);box(.2,5,6.2,plaster,-3.5,0,-3);box(.2,5,6.2,dark,3.5,0,-3);
  box(7,.2,6.2,dark,0,2.5,-3);box(7,.18,6.2,wood,0,-2.5,-3);
  for(let i=0;i<18;i++) {const plank=box(.374,.035,6, i%3===0?trim:wood,-3.3+i*.39,-2.387,-3);plank.receiveShadow=true;}
  for(const z of [-5.95,-3.15,-.08]) {box(7,.13,.12,trim,0,2.35,z);box(.13,4.8,.12,trim,-3.36,0,z);box(.13,4.8,.12,trim,3.36,0,z);}
  box(6.9,.19,.13,trim,0,-2.3,-5.91);
  // Sunlit circular window and concentric sill, recessed behind the furniture.
  const sky=new THREE.ShaderMaterial({uniforms:{},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv; void main(){vec3 a=vec3(.96,.58,.29);vec3 b=vec3(.54,.75,.69);gl_FragColor=vec4(mix(a,b,smoothstep(0.,1.,vUv.y)),1.);}'});
  mesh(new THREE.CircleGeometry(1.45,64),sky,-.5,.35,-5.95);
  const rim=mesh(new THREE.TorusGeometry(1.47,.10,12,64),trim,-.5,.35,-5.84);
  mesh(new THREE.CircleGeometry(.36,48),new THREE.MeshBasicMaterial({color:'#ffe8a3'}),-.9,.6,-5.9);
  box(.055,2.85,.08,trim,-.5,.35,-5.73);box(2.85,.055,.08,trim,-.5,.35,-5.73);
  // Low sideboard, books and a tiny ceramic cup.
  box(2.15,1,.8,dark,-1.6,-1.8,-4.9,scene,.08);box(2.3,.12,.95,trim,-1.6,-1.22,-4.9,scene,.035);
  for(const x of [-2.35,-.85]){cyl(.045,.045,.5,gold,x,-2.16,-4.65);sphere(.045,gold,x,-1.7,-4.46);}
  for(let i=0;i<5;i++)box(.16,.43+i%2*.1,.32,[orange,cream,dark,trim,orange][i],-2.35+i*.19,-.95,-4.9,scene,.01);
  cyl(.14,.1,.23,cream,-.95,-1.04,-4.8);const handle=mesh(new THREE.TorusGeometry(.09,.025,8,20),cream,-.78,-1.01,-4.8);handle.rotation.y=.3;
  // Shelf with framed miniature art and hanging leaves.
  box(1.3,.09,.55,trim,2.5,.65,-5.4);box(.6,.8,.08,trim,2.55,1.09,-5.64);box(.48,.68,.025,orange,2.55,1.09,-5.58);
  mesh(new THREE.CircleGeometry(.16,32),cream,2.56,1.18,-5.56);
  function plant(x,y,z,s=1){
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);
    cyl(.27,.21,.43,orange,0,.215,0,g);cyl(.24,.24,.025,ink,0,.435,0,g);
    for(let i=0;i<8;i++){const a=i*2.4;const h=.5+(i%3)*.21;const stem=cyl(.014,.016,h,dark,Math.sin(a)*.12,.43+h/2,Math.cos(a)*.12,g);stem.rotation.z=Math.sin(a)*.35;const leaf=sphere(.24,i%2?dark:plaster,Math.sin(a)*.28,.55+h,Math.cos(a)*.24,g);leaf.scale.set(.65,1.65,.2);leaf.rotation.set(.25,a,Math.sin(a)*.7);}
  }
  plant(2.55,-2.36,-3.3,1.5);plant(1.95,.7,-5.4,.48);
  // Rug, ottoman, a desk lamp, and a suspended mobile provide depth cues.
  const rug=cyl(1.65,1.65,.035,mat('#b9b78a'),.2,-2.35,-2.5);rug.scale.z=.77;
  for(const radius of [1.35,1.47]){const ring=mesh(new THREE.TorusGeometry(radius,.014,6,72),trim,.2,-2.325,-2.5);ring.rotation.x=Math.PI/2;ring.scale.y=.77;}
  const stool=cyl(.48,.5,.5,orange,-2.35,-2.06,-1.7);stool.scale.z=.85;
  cyl(.23,.29,.08,gold,-2.7,-2.32,-3.3);cyl(.026,.026,3.3,gold,-2.7,-.65,-3.3);
  cyl(.24,.55,.46,cream,-2.7,1.15,-3.3);sphere(.12,new THREE.MeshBasicMaterial({color:'#fff0c9'}),-2.7,.91,-3.3);
  const mobile=new THREE.Group();mobile.position.set(1.6,1.6,-2.3);scene.add(mobile);
  cyl(.012,.012,1.6,gold,0,.5,0,mobile);box(1.4,.025,.025,gold,0,-.25,0,mobile);
  for(const [x,y,r] of [[-.58,-.68,.16],[.55,-.92,.26],[.08,-.62,.09]]){cyl(.007,.007,-y-.25,gold,x,(y-.25)/2,0,mobile);sphere(r,x>0?orange:gold,x,y,0,mobile);}
  // The resident: hand-modelled ceramic creature, with independent gaze and hand.
  const resident=new THREE.Group();scene.add(resident);
  const body=sphere(.52,cream,0,.57,0,resident);body.scale.set(.85,1.12,.73);
  const head=new THREE.Group();head.position.set(0,1.25,.06);resident.add(head);
  const skull=sphere(.58,cream,0,0,0,head);skull.scale.set(1,.85,.77);
  for(const x of [-.22,.22]){
    const eye=sphere(.105,ink,x,.03,.407,head);eye.scale.set(.8,1.2,.4);
    sphere(.026,new THREE.MeshBasicMaterial({color:'#fffdf1'}),x-.025,.065,.448,head);
    const blush=sphere(.075,orange,x*1.65,-.13,.35,head);blush.scale.set(1,.5,.12);
  }
  const antenna=cyl(.018,.018,.32,gold,0,.55,0,head);sphere(.075,orange,0,.73,0,head);
  for(const x of [-.24,.24]){const foot=sphere(.19,cream,x,.12,.1,resident);foot.scale.set(.85,.6,1.4);}
  const left=sphere(.16,cream,-.47,.68,0,resident);left.scale.set(.7,1.6,.8);left.rotation.z=-.3;
  const hand=new THREE.Group();hand.position.set(.46,.78,.02);resident.add(hand);const palm=sphere(.16,cream,0,0,0,hand);palm.scale.set(.75,1.2,.8);
  box(.15,.1,.035,gold,0,.68,.39,resident,.02);
  // Frame stays on the physical window plane, so movement reveals the room behind it.
  box(.16,5.05,.22,trim,-3.5,0,.02);box(.16,5.05,.22,trim,3.5,0,.02);box(7.15,.16,.22,trim,0,2.5,.02);box(7.15,.18,.32,trim,0,-2.5,.06);
  const dustPositions=new Float32Array(90*3);
  for(let i=0;i<90;i++){dustPositions[i*3]=Math.sin(i*23.73)*3.3;dustPositions[i*3+1]=Math.sin(i*8.17)*2.2;dustPositions[i*3+2]=-0.5-(i%17)/17*5;}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#ffe3a1',size:.019,transparent:true,opacity:.55,depthWrite:false}));scene.add(dust);
  const ripple=mesh(new THREE.RingGeometry(.09,.103,64),new THREE.MeshBasicMaterial({color:'#fff2c7',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),.46,-.9,.23);ripple.castShadow=false;
  const eye=new THREE.Vector3(0,0,7.8), target=new THREE.Vector3(0,0,7.8);
  let width=1,height=1, halfWidth=3.62,halfHeight=2.58, raf, last=performance.now(), time=0, knockStart=-100, lastBeat=-1, paused=false, disposed=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let interactive=false;
  function resize(){const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;renderer.setSize(width,height,false);const aspect=width/height;halfWidth=Math.max(3.62,2.58*aspect);halfHeight=halfWidth/aspect;}
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  function knock(){knockStart=time;lastBeat=-1;}
  function frame(now){
    if(disposed)return;raf=requestAnimationFrame(frame);if(document.hidden){last=now;return;}
    const dt=Math.min((now-last)/1000,.05);last=now;if(!paused)time+=dt;
    if(!interactive&&!reduced&&!paused){target.set(Math.sin(time*.38)*1.25,Math.sin(time*.29)*.35,7.8);}
    eye.lerp(target,1-Math.exp(-dt*9));camera.position.copy(eye);camera.rotation.set(0,0,0);
    const f=frustum(eye,halfWidth,halfHeight);camera.projectionMatrix.makePerspective(f.left,f.right,f.top,f.bottom,f.near,f.far);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    const k=time-knockStart;const approach=k>=0&&k<5.5?Math.min(1,k/1.4)*Math.min(1,(5.5-k)/1.3):0;
    resident.position.set(.45,-2.3,-2.35+approach*1.82);
    resident.position.y+=paused||reduced?0:Math.sin(time*2.4)*.035;
    const gaze=new THREE.Vector3(eye.x,eye.y,eye.z);head.lookAt(gaze);
    head.rotation.x=THREE.MathUtils.clamp(head.rotation.x,-.3,.3);head.rotation.y=THREE.MathUtils.clamp(head.rotation.y,-.55,.55);
    const tapping=k>1.4&&k<3.6;const tap=tapping?Math.max(0,Math.sin((k-1.4)*11)):0;
    hand.position.set(.46,.78+approach*.55,.02+approach*.55+tap*.09);
    hand.rotation.x=-approach*.6;
    if(tapping){const beat=Math.floor((k-1.4)*11/(Math.PI*2));if(tap>.9&&beat!==lastBeat){lastBeat=beat;onKnock?.();}}
    ripple.material.opacity=tapping?tap*.48:0;ripple.scale.setScalar(1+tap*4);ripple.position.set(.91,-.97,.23);
    if(!reduced&&!paused){mobile.rotation.y=Math.sin(time*.32)*.22;dust.rotation.y=Math.sin(time*.08)*.04;}
    renderer.render(scene,camera);
  }
  raf=requestAnimationFrame(frame);
  return {
    setEye(p){interactive=true;target.set(p.x,p.y,p.z);},
    reset(){interactive=false;target.set(0,0,7.8);}, knock,
    pause(value){paused=value;},
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});env.dispose();renderer.dispose();},
    diagnostics(){return {eye:eye.toArray(),target:target.toArray(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,width,height};}
  };
}
