export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
// Screen corners stay fixed at z=0. The camera translates, never toes in.
export function frustum(eye, halfWidth, halfHeight, near = 0.1, far = 80, centerY = 0) {
  const z = clamp(eye.z, 3, 16);
  return { left: (-halfWidth-eye.x)*near/z, right: (halfWidth-eye.x)*near/z,
    top: (centerY+halfHeight-eye.y)*near/z, bottom: (centerY-halfHeight-eye.y)*near/z, near, far };
}
export function measureFace(points) {
  const a = points[33], b = points[263];
  if (!a || !b) return null;
  return { x: (a.x+b.x)/2, y: (a.y+b.y)/2, span: Math.hypot(a.x-b.x,a.y-b.y) };
}
export function faceToEye(face, center) {
  const ratio = clamp(center.span / Math.max(face.span, 0.015), 0.55, 1.7);
  // The front camera image is unmirrored: viewer moving right moves image left.
  return {x:clamp(-(face.x-center.x)*16*ratio,-3.2,3.2),
    y:clamp(-(face.y-center.y)*11*ratio,-2,2), z:clamp(7.8*ratio,4.3,13.3)};
}
