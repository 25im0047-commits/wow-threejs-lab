import { cp, mkdir } from 'node:fs/promises';
await mkdir('public/wasm', { recursive: true });
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/wasm', { recursive: true });
console.log('MediaPipe WASM copied for same-origin, browser-only inference.');

const { build } = await import('esbuild');
await build({entryPoints:['src/experiments/window/tracker.worker.js'],outfile:'public/face-worker.js',bundle:true,format:'iife',minify:true,target:'es2020'});
