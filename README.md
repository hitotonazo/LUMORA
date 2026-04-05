# LUMORA デプロイ用ZIP（R2対応版）

このZIPは Cloudflare Pages + Cloudflare R2 前提です。

## 公開ルート
- index.html が ZIP 直下にあります。

## 追加内容
- data/config.json
- functions/assets/[...path].js
- script.js を R2参照対応に変更

## data/config.json の主な設定
- r2PublicBase: 通常素材の公開R2ベースURL
- r2PrivateBase: 非公開素材を配信するPages Functions側のURL
- useLocalFallback: R2未配置時にZIP内画像へフォールバックするか

## 想定R2構成
- arg-assets/site01/normal/
- arg-assets/site01/anomaly1/
- arg-assets/site01/anomaly2/
- arg-assets/site01/anomaly3/
- arg-assets/site01/truth/
- arg-assets/site01/shared/ui/

## Pages Functions
R2バケットを以下のどちらかの名前でバインドしてください。
- ASSETS_BUCKET
- ARG_ASSETS_BUCKET

## 非公開配信URL例
- /assets/site01/anomaly1/example.png
- /assets/site01/truth/example.png


## Cloudflare Pages Functions fix
This ZIP uses `functions/assets/[[path]].js` for Pages catch-all routing.
In Cloudflare Pages, bind your R2 bucket with:

- Binding name: `ASSETS_BUCKET`

Example private asset URL:
- `/assets/site01/anomaly1/img_product_shiromimi_eye_800x800.png`

In R2, store the object key without `/assets/`, for example:
- `site01/anomaly1/img_product_shiromimi_eye_800x800.png`


## config.js方式について
この版は Cloudflare Pages の R2 バインディングを使いません。
`data/config.js` にある `r2PublicBase` を、あなたの R2 公開URLに書き換えてください。

例:
https://pub-xxxxxxxxxxxxxxxx.r2.dev/arg-assets/site01

R2 の推奨配置:
- normal/
- anomaly1/
- anomaly2/
- anomaly3/
- truth/
- shared/ui/

この版では、通常画像・違和感画像・真相画像をすべて公開R2から参照します。
そのため、非公開配信や Functions は不要です。


## 追加仕様
- 「裏面を見る」ボタンで裏面画像モーダルを表示
- 裏面画像クリックで「サイトが改変されました。」演出を再生
- 演出クリック後に `?mode=anomaly2` へ遷移
- 裏面画像は違和感①素材を参照


## 追加ダミー画像
- 裏面用ダミー画像を配置済み
- パス: images/anomaly1/img_product_shiromimi_eye_800x800.png
- R2未設定時はこのローカル画像をフォールバック表示します


## 修正
- 裏面画像は R2 ではなくローカル画像 `images/anomaly1/img_product_shiromimi_eye_800x800.png` を優先表示するよう修正
