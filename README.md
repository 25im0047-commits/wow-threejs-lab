# WOW Three.js Lab

ブラウザの、その先へ。Three.jsでつくる、小さな「ありえない体験」の実験室。

- ギャラリー: https://wow-threejs-lab.vercel.app/
- #01 向こう側: https://wow-threejs-lab.vercel.app/experiments/01-window

## #01 向こう側 / The Other Side

顔を動かすとモニターが窓に見える、小部屋のデモです。家具・植物・丸窓・モビール・陶器の住人MOMOはコードで生成しています。住人は観察者へ視線を向け、「住人を呼ぶ」で窓に近づいてノックします。

### 操作

- カメラなし: マウスを動かす、指でドラッグする。
- カメラあり: 「カメラで覗く」を押して許可し、まず正面を向く。最初の顔位置が基準になります。
- 顔を左右・上下・前後に動かすと視点が変わります。「視点をリセット」で基準を再設定できます。
- 手動モードの距離スライダーで前後移動。「住人を呼ぶ」でノック。
- キーボード: 窓をフォーカスして矢印キー、`+` / `-` で距離変更。
- 「動きを止める」で室内の自動アニメーションを停止。操作による視点移動は維持します。

### プライバシー

カメラは明示的な操作とブラウザの許可後だけ起動します。音声は取得しません。映像と顔ランドマークはブラウザ内だけで処理し、保存・送信しません。モデルとWASMも同一オリジンで配信します。解析・広告SDK、サーバーAPI、データベースはありません。停止、ページ移動、タブ非表示時にカメラの全トラックを停止し、推論ワーカーも終了します。

### 投影と制限

画面を `z=0` の固定窓として扱い、目の位置から非対称の視錐台を作ります。カメラを目標点へ回転させる通常の視点操作とは異なり、窓面の四隅は視点が動いても固定されます。MediaPipeの両目外側ランドマークの中点と間隔を使い、基準位置からの移動と相対距離を推定します。

実際の画面寸法・カメラ画角・顔サイズを測定した校正ではないため、幾何学的な精度や体感には個人差があります。正面から小さくゆっくり動くと安定します。顔を大きく回転すると距離推定が変化することがあります。単眼の視差表現で、立体視ディスプレイではありません。

WebGL2、WebAssembly、Web Workers、ImageBitmapが必要です。カメラにはHTTPSまたはlocalhostが必要です。スマホの実機性能・ブラウザ差は残るため、認識できない場合は手動モードを利用してください。

## 開発

Node.js 20.19+ / 22+ を推奨。

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`predev` / `prebuild` がMediaPipe WASMを `public/wasm/` にコピーし、顔認識ワーカーをクラシックワーカーとしてバンドルします。MediaPipeのスクリプトローダーが `importScripts` を使うためです。推論はUIとは別のワーカーで約14fpsに制限し、3D描画の更新と分離しています。デバイスピクセル比は最大1.75です。

依存はThree.jsとMediaPipe、開発用にViteとesbuildのみ。バージョンは固定しています。

## 作品を追加する

```text
src/
  experiments.js              # ギャラリーの作品登録
  main.js                     # ページ・操作UI・ルート
  style.css                   # 共通レイアウトとレスポンシブ表示
  experiments/
    window/
      scene.js                # 第1作品の3Dシーン・演出
      math.js                 # 投影と顔位置の変換
      tracker.js              # カメラの開始・停止・状態管理
      tracker.worker.js       # ブラウザ内推論
public/
  models/face_landmarker.task # 固定バージョンのモデル
scripts/prepare-assets.mjs    # ローカル配信用の生成処理
tests/                       # 投影のテスト・ブラウザ検証用ページ
```

次の作品は `src/experiments/<作品名>/` に独立したモジュールとして実装し、`src/experiments.js` に番号・名前・パスを追加します。ギャラリーの作品行は登録から生成されます。`main.js` にその作品のルートと初期化・破棄処理を追加してください。既存の顔認識や投影モジュールは独立して再利用できます。

## 検証

`npm test` は窓面の四隅の不変性、視差方向、接近時の視野、顔座標の変換・範囲制限を確認します。

開発サーバーで `/tests/browser-harness.html` を開くと、実カメラを要求せずCanvasの映像を使って、実際のWASMモデルの推論・停止、許可拒否、許可が遅れて返るキャンセル競合を検証できます。このページは本番ビルドに含まれません。

2026-10-15の検証範囲は [VERIFICATION.md](./VERIFICATION.md) を参照してください。

## 出典

- [Three.js](https://threejs.org/) — MIT
- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js) — Apache-2.0
- [Face Landmarker model](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task) — Google配布のfloat16、バージョン1

モデルのSHA-256と配布元は [THIRD_PARTY.md](./THIRD_PARTY.md) に記録しています。
