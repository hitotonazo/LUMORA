# R2 truth back deploy guide

## 1) Upload to R2
Upload everything inside `r2-upload/images/` to your public R2 bucket under the `images/` prefix.

Expected new files:
- `images/truth/back/img_product_shiromimi_back_truth_800x800.png`
- `images/truth/back/img_product_morikuma_back_truth_800x800.png`
- `images/truth/back/img_product_koroneko_back_truth_800x800.png`
- `images/truth/back/img_product_yoruneko_back_truth_800x800.png`
- `images/truth/back/img_product_hoshiumi_back_truth_800x800.png`

## 2) Cloudflare Pages
Deploy the full ZIP contents, including `functions/`.

## 3) Config check
Current site config:
- `useR2: true`
- `useProxy: true`
- `proxyPrefix: /r2`

That means the site will read `/r2/images/...` through the proxy.

## 4) Replace dummy images later
You can replace only the 5 PNG files in R2 without changing code.

## 5) Truth mode behavior
In `?mode=truth`:
- each plush detail opens in back view by default
- `truthBackImage` is used when available
- anomaly 1 to 3 visual changes remain reflected
