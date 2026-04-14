# こもれびぬい 完全版

## 修正内容
- overlay を1つだけに整理
- 初期表示では overlay 非表示
- 画像をすべて R2 配信に統一
- Pages Functions の `/r2/...` プロキシ経由で同一オリジン配信
- 違和感①→②→③→truth の遷移を維持

## デプロイ
Cloudflare Pages にこの ZIP の中身をそのまま配置してください。
`functions/` を含めてデプロイする必要があります。

## 確認URL例
- `/r2/images/truth/img_hero_collage_truth_1200x800.png`
- `/?mode=truth`

## デバッグ
ブラウザコンソールで実行してください。

```js
inspectOverlayDom()
inspectImageSources()
```
