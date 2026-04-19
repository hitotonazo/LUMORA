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


## truth 専用裏面画像
- 各ぬいぐるみに `truthBackImage` を追加済み
- ダミー画像は `images/truth/back/` と `r2-upload/images/truth/back/` に同梱
- R2差し替え時は同名PNGを上書きするだけで反映できます


## URL mode alias mapping
推測されやすい `anomaly1 / anomaly2 / anomaly3 / truth` をURLに直接出さないよう、
`script.js` で URL表示名 と 内部状態 を分離しています。

現在の設定:
- `?mode=home` -> `normal`
- `?mode=haze` -> `anomaly1`
- `?mode=thread` -> `anomaly2`
- `?mode=trace` -> `anomaly3`
- `?mode=archive` -> `truth`

別サイトで流用する場合は `MODE_ALIASES` だけ差し替えてください。
