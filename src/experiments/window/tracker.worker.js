import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { measureFace } from './math.js';
let landmarker;
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const vision = await FilesetResolver.forVisionTasks('/wasm');
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'VIDEO', numFaces: 1, minFaceDetectionConfidence: 0.55,
        minFacePresenceConfidence: 0.55, minTrackingConfidence: 0.55
      });
      self.postMessage({ type: 'ready' });
    } catch (e) { self.postMessage({ type: 'error', message: e.message }); }
  }
  if (data.type === 'frame') {
    try {
      const result = landmarker.detectForVideo(data.frame, data.time);
      const points = result.faceLandmarks?.[0];
      self.postMessage({ type: 'face', face: points ? measureFace(points) : null });
    } catch (e) { self.postMessage({ type: 'error', message: e.message }); }
    finally { data.frame.close(); }
  }
};
