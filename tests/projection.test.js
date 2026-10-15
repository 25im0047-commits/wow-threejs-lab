import test from 'node:test';
import assert from 'node:assert/strict';
import { Matrix4, Vector3 } from 'three';
import { frustum, faceToEye, measureFace } from '../src/experiments/window/math.js';
function project(point,eye){const f=frustum(eye,3.62,2.58);const p=new Matrix4().makePerspective(f.left,f.right,f.top,f.bottom,f.near,f.far);return new Vector3(...point).sub(new Vector3(eye.x,eye.y,eye.z)).applyMatrix4(p);}
test('screen-plane corners remain fixed while viewer translates in all axes',()=>{
  for(const eye of [{x:0,y:0,z:7.8},{x:2,y:1,z:4.3},{x:-3,y:-1.8,z:12}])for(const [x,y] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
    const p=project([x*3.62,y*2.58,0],eye);assert.ok(Math.abs(p.x-x)<1e-10);assert.ok(Math.abs(p.y-y)<1e-10);
  }
});
test('objects behind the screen reveal the correct side as viewer moves',()=>{
  const center=project([0,0,-4],{x:0,y:0,z:7.8});
  const right=project([0,0,-4],{x:2,y:1,z:7.8});
  assert.ok(right.x>center.x);assert.ok(right.y>center.y);
});
test('approaching the window reveals a wider field behind the fixed screen',()=>{
  const far=project([1,0,-4],{x:0,y:0,z:12});const near=project([1,0,-4],{x:0,y:0,z:4.3});
  // For a physical window the visible field expands near the glass: objects behind it shrink relative to the frame.
  assert.ok(near.x<far.x);
});
test('face mapping is centered, mirrored, depth-sensitive and bounded',()=>{
  const c={x:.5,y:.5,span:.2};const neutral=faceToEye(c,c);assert.equal(Math.abs(neutral.x)+Math.abs(neutral.y),0);assert.equal(neutral.z,7.8);
  const moved=faceToEye({x:.4,y:.4,span:.3},c);assert.ok(moved.x>0&&moved.y>0&&moved.z<7.8);
  const extreme=faceToEye({x:100,y:-100,span:0},c);assert.ok(extreme.x>=-3.2&&extreme.y<=2&&extreme.z<=13.3);
  assert.equal(measureFace([]),null);
});
test('immersive screen offset keeps the lowered aperture fixed for all eye positions',()=>{
  for(const eye of [{x:0,y:0,z:7.8},{x:2,y:1,z:4.3},{x:-2,y:-1,z:12}]){
    const f=frustum(eye,3.4,1.9,.1,80,-.45);
    const projection=new Matrix4().makePerspective(f.left,f.right,f.top,f.bottom,f.near,f.far);
    for(const [x,y] of [[-1,-1],[1,1]]){
      const p=new Vector3(x*3.4,-.45+y*1.9,0).sub(new Vector3(eye.x,eye.y,eye.z)).applyMatrix4(projection);
      assert.ok(Math.abs(p.x-x)<1e-10&&Math.abs(p.y-y)<1e-10);
    }
  }
});
