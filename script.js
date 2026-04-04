
:root{
  --bg:#fbf7f2;
  --bg-alt:#f3ede6;
  --surface:#fffdfa;
  --line:#e5dbcf;
  --text:#2a2522;
  --muted:#72675f;
  --accent:#8f6f5c;
  --truth-bg:#130d10;
  --truth-surface:#1e1519;
  --truth-line:#56313b;
  --truth-text:#f0e8ea;
  --truth-muted:#c5adb4;
  --truth-accent:#b9475e;
  --container:min(1120px, calc(100% - 32px));
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:"Hiragino Sans","Yu Gothic","Meiryo",sans-serif;
  color:var(--text);
  background:var(--bg);
  line-height:1.7;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button,input{font:inherit}
.container{width:var(--container);margin:0 auto}
.narrow{max-width:760px}
.site-header{
  position:sticky;top:0;z-index:30;
  background:rgba(251,247,242,.92);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}
.header-row{display:flex;align-items:center;gap:20px;min-height:76px}
.logo-wrap img{height:40px;width:auto}
.nav{display:flex;gap:18px;flex:1;justify-content:center;font-size:14px}
.nav a{opacity:.85}
.icon-row{display:flex;gap:10px}
.icon-btn{
  width:42px;height:42px;border:1px solid var(--line);border-radius:999px;background:#fff;
  display:grid;place-items:center;padding:0;cursor:pointer;
}
.icon-btn img{width:20px;height:20px}
.hero{padding:44px 0 24px}
.hero-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:28px;align-items:center}
.eyebrow{letter-spacing:.12em;font-size:12px;color:var(--muted);margin:0 0 12px}
h1,h2,h3,p{margin:0}
h1{font-size:clamp(30px,4vw,48px);line-height:1.2;margin-bottom:14px}
h2{font-size:clamp(24px,3vw,34px);line-height:1.3}
.hero-copy p:not(.eyebrow):not(.search-message){font-size:16px;color:var(--muted)}
.hero-visual img{
  border-radius:28px;overflow:hidden;border:1px solid var(--line);background:#fff;
  box-shadow:0 18px 45px rgba(40,29,20,.08);
}
.search-bar{display:flex;gap:10px;margin-top:20px}
.search-bar input{
  flex:1;border:1px solid var(--line);border-radius:999px;padding:14px 18px;background:#fff;color:var(--text)
}
.search-bar button,.share-btn,.ghost-btn{
  border:1px solid var(--line);background:#fff;color:var(--text);border-radius:999px;padding:12px 18px;cursor:pointer
}
.search-message{min-height:26px;margin-top:10px;color:var(--accent);font-size:14px}
.section{padding:36px 0}
.alt-section{background:var(--bg-alt)}
.section-head{margin-bottom:22px}
.section-head p{color:var(--muted);margin-top:6px}
.product-grid,.character-grid,.series-grid,.review-list{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px
}
.product-card,.character-card,.series-card,.review-card,.detail-card{
  background:var(--surface);border:1px solid var(--line);border-radius:24px;overflow:hidden;
  box-shadow:0 12px 30px rgba(40,29,20,.05)
}
.product-card img,.character-card img,.series-card img{aspect-ratio:1/1;object-fit:cover;background:#fff}
.series-card img{aspect-ratio:4/3}
.product-copy,.character-card,.series-card,.review-card{padding:14px}
.product-copy h3,.character-card h3,.series-card h3{font-size:20px;margin-bottom:6px}
.meta{display:flex;justify-content:space-between;gap:8px;font-size:14px;color:var(--muted);margin-bottom:8px}
.product-copy p,.character-card p,.series-card p,.review-card p,.news-item p,.detail-copy p{color:var(--muted)}
.product-actions{display:flex;gap:10px;margin-top:14px}
.mini-btn{
  border:1px solid var(--line);background:transparent;border-radius:999px;padding:10px 14px;cursor:pointer
}
.detail-card{display:grid;grid-template-columns:1fr 1fr;gap:0}
.detail-media,.detail-copy{padding:18px}
.detail-media img{border-radius:20px;border:1px solid var(--line);background:#fff}
.detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.detail-series{font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.detail-price{font-weight:700;color:var(--text)!important;margin:8px 0 14px}
.spec-list{display:grid;gap:14px;margin:18px 0 0}
.spec-list div{padding-top:14px;border-top:1px solid var(--line)}
.spec-list dt{font-weight:700;margin-bottom:6px}
.craft-panel{margin-top:16px;padding:14px;border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.7)}
.craft-panel.hidden,.share-wrap.hidden{display:none}
.craft-title{font-weight:700;color:var(--text)!important;margin-bottom:8px}
.craft-panel img{margin-top:12px;border-radius:16px;border:1px solid var(--line)}
.news-list{display:grid;gap:12px}
.news-item{
  display:grid;grid-template-columns:100px 1fr;gap:16px;padding:14px 16px;border:1px solid var(--line);
  border-radius:18px;background:var(--surface)
}
.news-item time{font-weight:700}
.brand-section{text-align:center}
#brand-text{margin-top:12px;color:var(--muted)}
.share-wrap{margin-top:20px}
.share-note{margin-bottom:12px;color:var(--muted)}
.share-btn{background:#111;color:#fff;border-color:#333}
.site-footer{
  padding:24px 16px 34px;text-align:center;border-top:1px solid var(--line);font-size:13px;color:var(--muted)
}

.overlay{
  position:fixed;inset:0;z-index:100;display:none;place-items:center;background:rgba(8,4,6,.88);overflow:hidden
}
.overlay.active{display:grid}
.overlay__noise,.overlay__noise::before,.overlay__noise::after,
#screen-noise::before,#screen-noise::after{
  content:"";position:absolute;inset:-20%;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 2px, transparent 2px 4px),
    repeating-linear-gradient(90deg, rgba(255,0,60,.05) 0 3px, rgba(0,0,0,0) 3px 6px);
  mix-blend-mode:screen;
  animation:noiseShift .18s infinite steps(2);
}
.overlay__content{
  position:relative;z-index:2;text-align:center;padding:24px
}
.overlay__text{font-size:clamp(28px,6vw,64px);font-weight:700;color:#ffe9ef;text-shadow:0 0 18px rgba(255,45,88,.55)}
.overlay__sub{margin-top:10px;color:#d3c0c6}
@keyframes noiseShift{
  0%{transform:translate(0,0)}
  25%{transform:translate(-1%,1%)}
  50%{transform:translate(1%,-1%)}
  75%{transform:translate(2%,-2%)}
  100%{transform:translate(0,0)}
}
#screen-noise{
  position:fixed;inset:0;pointer-events:none;z-index:90;opacity:0;transition:opacity .3s ease
}
body[data-mode="truth"] #screen-noise{opacity:.08}
body.glitching #screen-noise{opacity:.75}
body.glitching{transform:translateX(1px)}
body[data-mode="truth"]{
  background:var(--truth-bg);color:var(--truth-text)
}
body[data-mode="truth"] .site-header{
  background:rgba(19,13,16,.92);border-color:var(--truth-line)
}
body[data-mode="truth"] .site-header,
body[data-mode="truth"] .site-footer,
body[data-mode="truth"] .section-head p,
body[data-mode="truth"] .hero-copy p:not(.eyebrow):not(.search-message),
body[data-mode="truth"] .product-copy p,
body[data-mode="truth"] .character-card p,
body[data-mode="truth"] .series-card p,
body[data-mode="truth"] .review-card p,
body[data-mode="truth"] .news-item p,
body[data-mode="truth"] .detail-copy p,
body[data-mode="truth"] .share-note,
body[data-mode="truth"] #brand-text{color:var(--truth-muted)}
body[data-mode="truth"] .alt-section{background:#171115}
body[data-mode="truth"] .product-card,
body[data-mode="truth"] .character-card,
body[data-mode="truth"] .series-card,
body[data-mode="truth"] .review-card,
body[data-mode="truth"] .detail-card,
body[data-mode="truth"] .news-item,
body[data-mode="truth"] .craft-panel,
body[data-mode="truth"] .icon-btn,
body[data-mode="truth"] .search-bar input,
body[data-mode="truth"] .search-bar button,
body[data-mode="truth"] .ghost-btn{
  background:var(--truth-surface);border-color:var(--truth-line);color:var(--truth-text)
}
body[data-mode="truth"] .site-footer{border-color:var(--truth-line)}
body[data-mode="truth"] .hero-visual img,
body[data-mode="truth"] .detail-media img,
body[data-mode="truth"] .product-card img,
body[data-mode="truth"] .character-card img,
body[data-mode="truth"] .series-card img,
body[data-mode="truth"] .craft-panel img{
  filter:grayscale(.25) contrast(1.05) saturate(.6)
}
body[data-mode="truth"] .share-btn{background:#0f0f10;color:#fff;border-color:#6a3f49}
body[data-mode="truth"] .search-message{color:#ff8699}

@media (max-width: 900px){
  .hero-grid,.detail-card{grid-template-columns:1fr}
  .nav{display:none}
}
@media (max-width: 720px){
  .product-grid,.character-grid,.series-grid,.review-list{grid-template-columns:1fr}
  .news-item{grid-template-columns:1fr;gap:6px}
  .header-row{min-height:68px}
  .logo-wrap img{height:34px}
  .hero{padding-top:28px}
  .section{padding:28px 0}
}
