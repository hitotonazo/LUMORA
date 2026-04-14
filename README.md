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


## 修正内容
- 「裏面を見る」でメインの商品画像を裏面画像に切り替える仕様に修正
- しろみみの裏面画像は `images/anomaly1/img_product_shiromimi_eye_800x800.png` を使用
- 裏面表示中に商品画像をクリックすると、「サイトが改変されました。」演出後に `?mode=anomaly2` へ進む


## 修正
- 裏面画像クリック時の改変演出トリガーを追加修正
- `#detail-image` を直接監視し、裏面画像表示中なら確実にオーバーレイを起動
- オーバーレイ後に `?mode=anomaly2` へ遷移
\n\n## 修正
- 裏面画像クリック時の改変演出を、要素直結ではなく document 全体の委譲クリックで監視するよう変更
- `runSiteAlteredOverlay` が未定義でも、このZIP内で強制的に使えるよう補完
- オーバーレイCSSも上書きし、`is-active` 時に必ず前面表示されるよう修正\n

## 修正
- script.js 内に混入していた文字列 `\\n\\n` を除去し、SyntaxError を修正


## 修正
- 改変演出の対象を存在しない `#noise-overlay` から、実際にある `#transition-overlay` に修正
- 裏面画像クリック時に `runSiteAlteredOverlay()` が必ず既存オーバーレイを出すよう修正


## 修正
- 「裏面を見る」ボタンの切替処理を末尾で上書き
- ローカル裏面画像に確実に切替
- 裏面表示中の画像クリックで既存 transition-overlay を表示


## R2優先版
- 全画像を R2 優先で参照
- r2PublicBase:
  https://pub-12f05472082049758097370dd8aaab52.r2.dev/images
- 裏面画像も R2 の anomaly1 配下を優先
- R2にない場合のみローカル画像へフォールバック


## 追加修正
- 詳細画像の裏面切替を document 委譲で上書き
- 全画像R2優先を維持したまま、`#toggle-back-btn` で確実に front/back 切替
- 裏面表示中の `#detail-image` クリックで改変演出 → anomaly2


## 追加修正
- 各ぬいぐるみカードのクリックで詳細切替できる処理を復旧
- `data-product-id` を持つ要素や商品カードクリックで `selectedId` を更新して詳細再描画
- 裏面切替・詳細画像クリックの挙動は維持


## 追加修正
- カード切替時に詳細画像も selectedId に合わせて同期
- しろみみ/もりくま/くろねこ/よるねこ/ほしうみ で front画像を切替
- R2優先のまま表示


## 追加修正 V2
- 詳細画像の同期元を `selectedId` ではなく実際に使われている `state.currentProductId` に修正
- カード切替後、現在の商品の front 画像を R2優先で再設定
- しろみみ以外へ切替時は裏面状態を自動解除


## 追加修正 V3
- `renderDetail()` をラップして、詳細再描画のたびに画像を現在の商品IDへ同期
- `data-view` クリック後にも再同期
- 全画像R2優先は維持


## 直接修正版
- `renderProducts()` を直接修正
- `renderDetail()` を直接修正
- `toggle-back-btn` の処理を直接修正
- `detail-image` のクリック処理を直接修正
- `window.state`, `window.els`, `window.checkLumoraState()` を追加

確認用Consoleコマンド
```js
state.currentProductId
document.getElementById("detail-image").src
checkLumoraState()
```


## 各ぬいぐるみの背面ダミー対応
- 全商品に `backImage` を追加
- 追加したダミー画像
  - `images/anomaly1/img_product_shiromimi_back_800x800.png`
  - `images/anomaly1/img_product_morikuma_back_800x800.png`
  - `images/anomaly1/img_product_koroneko_back_800x800.png`
  - `images/anomaly1/img_product_yoruneko_back_800x800.png`
  - `images/anomaly1/img_product_hoshiumi_back_800x800.png`
- どの商品でも「裏面を見る」で背面ダミー画像を表示
- 背面表示中に画像クリックで改変演出 → anomaly2


## 今回の修正内容
このZIPは、添付ZIPをベースに「各カードごとの背面画像をR2から読む」ことだけに絞って直接修正しています。

### 背面画像パス
- shiromimi: `images/anomaly1/img_product_shiromimi_eye_800x800.png`
- morikuma: `images/anomaly1/img_product_morikuma_back_800x800.png`
- koroneko: `images/anomaly1/img_product_koroneko_back_800x800.png`
- yoruneko: `images/anomaly1/img_product_yoruneko_back_800x800.png`
- hoshiumi: `images/anomaly1/img_product_hoshiumi_back_800x800.png`

### 仕様
- どの商品でも「裏面を見る」で `product.backImage` を表示
- R2は既存の `resolveAssetPath()` / `r2PublicBase` 経由で参照
- 改変演出への進行は `shiromimi` のみ

### 確認用
```js
checkBackImageConfig()
state.currentProductId
document.getElementById("detail-image").src
```


## Syntax fix
- script.js の detailImage クリック処理に混入していた重複コードを削除


## 修正
- 旧 overlay CSS を削除し、#noise-overlay 配下だけに効く scoped CSS へ置換
- 初期状態で noise-message が見え続ける問題を修正
