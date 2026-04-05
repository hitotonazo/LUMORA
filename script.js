
const MODES = ["normal", "anomaly1", "anomaly2", "anomaly3", "truth"];
const state = {
  mode: "normal",
  products: [],
  reviews: null,
  news: null,
  config: null,
  currentProductId: "shiromimi",
  showingBack: false
};

const els = {
  body: document.body,
  overlay: document.getElementById("transition-overlay"),
  siteLogo: document.getElementById("site-logo"),
  heroTitle: document.getElementById("hero-title"),
  heroText: document.getElementById("hero-text"),
  heroImage: document.getElementById("hero-image"),
  productGrid: document.getElementById("product-grid"),
  detailSeries: document.getElementById("detail-series"),
  detailName: document.getElementById("detail-name"),
  detailPrice: document.getElementById("detail-price"),
  detailDescription: document.getElementById("detail-description"),
  detailBirthplace: document.getElementById("detail-birthplace"),
  detailCraft: document.getElementById("detail-craft"),
  detailImage: document.getElementById("detail-image"),
  craftPanel: document.getElementById("craft-panel"),
  craftText: document.getElementById("craft-text"),
  newsList: document.getElementById("news-list"),
  reviewList: document.getElementById("review-list"),
  toggleBackBtn: document.getElementById("toggle-back-btn"),
  openCraftBtn: document.getElementById("open-craft-btn"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchMessage: document.getElementById("search-message"),
  brandTitle: document.getElementById("brand-title"),
  brandText: document.getElementById("brand-text"),
  shareWrap: document.getElementById("share-wrap"),
  shareBtn: document.getElementById("share-btn"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const [products, reviews, news] = await Promise.all([
    fetch("data/products.json").then(r => r.json()),
    fetch("data/reviews.json").then(r => r.json()),
    fetch("data/news.json").then(r => r.json())
  ]);
  const config = window.SITE_CONFIG || null;
  state.products = products;
  state.reviews = reviews;
  state.news = news;
  state.config = config;
  applyStaticAssetPaths();
  setMode(getModeFromUrl());
  bindEvents();
}


function resolveAssetPath(path) {
  if (!path || !state.config || !state.config.useR2) return path;

  const publicBase = (state.config.r2PublicBase || "").replace(/\/$/, "");
  if (!publicBase) return path;

  if (path.startsWith("images/normal/")) {
    return `${publicBase}/normal/${path.replace("images/normal/", "")}`;
  }
  if (path.startsWith("images/ui/")) {
    return `${publicBase}/shared/ui/${path.replace("images/ui/", "")}`;
  }
  if (path.startsWith("images/anomaly1/")) {
    return `${publicBase}/anomaly1/${path.replace("images/anomaly1/", "")}`;
  }
  if (path.startsWith("images/anomaly2/")) {
    return `${publicBase}/anomaly2/${path.replace("images/anomaly2/", "")}`;
  }
  if (path.startsWith("images/anomaly3/")) {
    return `${publicBase}/anomaly3/${path.replace("images/anomaly3/", "")}`;
  }
  if (path.startsWith("images/truth/")) {
    return `${publicBase}/truth/${path.replace("images/truth/", "")}`;
  }
  return path;
}

function withFallback(primary, fallback) {
  return primary || fallback;
}

function bindImageFallback(img, fallback) {
  if (!img || !fallback || img.dataset.fallbackBound === "1") return;
  img.dataset.fallbackBound = "1";
  img.addEventListener("error", () => {
    if (state.config?.useLocalFallback && img.src !== new URL(fallback, location.href).href) {
      img.src = fallback;
    }
  });
}

function setImageSource(img, originalPath) {
  if (!img || !originalPath) return;
  const resolved = resolveAssetPath(originalPath);
  bindImageFallback(img, originalPath);
  img.src = resolved;
}

function applyStaticAssetPaths() {
  document.querySelectorAll('img[src^="images/"]').forEach(img => {
    const original = img.getAttribute("src");
    img.dataset.originalSrc = original;
    setImageSource(img, original);
  });
}

function bindEvents() {
  els.overlay.addEventListener("click", () => {
    const next = els.overlay.dataset.nextMode;
    if (next) {
      updateUrlMode(next);
      setMode(next);
    }
    els.overlay.classList.remove("active");
    els.overlay.removeAttribute("data-next-mode");
  });

  els.toggleBackBtn.addEventListener("click", () => {
    if (state.mode === "anomaly2") {
      triggerTransition("anomaly3");
      return;
    }
    state.showingBack = !state.showingBack;
    renderDetail();
  });

  els.openCraftBtn.addEventListener("click", () => {
    els.craftPanel.classList.remove("hidden");
    renderDetail();
    if (state.mode === "anomaly3") {
      triggerTransition("truth");
    }
  });

  els.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const q = els.searchInput.value.trim().toLowerCase();
    if (!q) {
      els.searchMessage.textContent = "検索語を入力してください。";
      return;
    }
    const product = state.products.find(p => p.name.includes(q) || p.id.includes(q));
    if (product) {
      state.currentProductId = product.id;
      state.showingBack = false;
      renderProducts();
      renderDetail();
      document.getElementById("detail").scrollIntoView({behavior:"smooth", block:"start"});
      els.searchMessage.textContent = `「${product.name}」を表示しました。`;
    } else {
      els.searchMessage.textContent = `「${els.searchInput.value}」に一致する商品は見つかりませんでした。`;
    }
  });

  els.shareBtn.addEventListener("click", () => {
    const config = window.SHARE_CONFIG || {};
    const text = `${config.shareText || ""}\n${config.originTweetUrl || location.href}`.trim();
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  window.addEventListener("popstate", () => setMode(getModeFromUrl()));
}

function getModeFromUrl() {
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "normal";
  return MODES.includes(mode) ? mode : "normal";
}

function updateUrlMode(mode) {
  const url = new URL(location.href);
  url.searchParams.set("mode", mode);
  history.pushState({}, "", url);
}

function setMode(mode) {
  state.mode = mode;
  els.body.dataset.mode = mode;
  state.showingBack = false;
  if (mode === "truth") {
    els.craftPanel.classList.remove("hidden");
    els.shareWrap.classList.remove("hidden");
  } else {
    els.craftPanel.classList.add("hidden");
    els.shareWrap.classList.add("hidden");
  }
  renderHeaderAndHero();
  renderProducts();
  renderDetail();
  renderNews();
  renderReviews();
  renderBrand();
  if (mode === "truth") {
    startTruthGlitch();
  }
}

function renderHeaderAndHero() {
  const truth = state.mode === "truth";
  setImageSource(els.siteLogo, truth ? "images/truth/img_logo_header_truth_600x160.png" : "images/ui/img_logo_header_600x160.png");
  setImageSource(els.heroImage, truth ? "images/truth/img_hero_collage_truth_1200x800.png" : "images/normal/img_hero_collage_1200x800.png");
  if (truth) {
    document.title = "記録保管ページ";
    els.heroTitle.textContent = "これは販売ページではなく、記録の保管ページです。";
    els.heroText.textContent = "商品説明、制作工程、レビュー、お知らせの意味を読み直してください。";
  } else {
    document.title = "こもれびぬい｜やさしいぬくもりのぬいぐるみ";
    els.heroTitle.textContent = "やさしいぬくもりを、暮らしのそばに。";
    els.heroText.textContent = "毎日の景色になじむ、物語のあるぬいぐるみをお届けします。";
  }
}

function renderProducts() {
  els.productGrid.innerHTML = "";
  state.products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    const imgSrc = getProductImage(product);
    card.innerHTML = `
      <img src="${resolveAssetPath(imgSrc)}" alt="${product.name}" data-fallback="${imgSrc}">
      <div class="product-copy">
        <div class="meta"><span>${product.series}</span><span>${product.price}</span></div>
        <h3>${product.name}</h3>
        <p>${state.mode === "truth" ? product.craftTruth : product.tagline}</p>
        <div class="product-actions">
          <button class="mini-btn" data-view="${product.id}">詳細を見る</button>
          ${state.mode === "anomaly1" && product.id === "shiromimi" ? `<button class="mini-btn anomaly-trigger" data-trigger="anomaly2">この子を見る</button>` : ``}
        </div>
      </div>`;
    els.productGrid.appendChild(card);
  });

  els.productGrid.querySelectorAll("img[data-fallback]").forEach(img => bindImageFallback(img, img.dataset.fallback));

  els.productGrid.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentProductId = btn.dataset.view;
      state.showingBack = false;
      renderProducts();
      renderDetail();
      document.getElementById("detail").scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  els.productGrid.querySelectorAll("[data-trigger='anomaly2']").forEach(btn => {
    btn.addEventListener("click", () => triggerTransition("anomaly2"));
  });
}

function renderDetail() {
  const product = state.products.find(p => p.id === state.currentProductId) || state.products[0];
  els.detailSeries.textContent = product.series;
  els.detailName.textContent = product.name;
  els.detailPrice.textContent = product.price;
  els.detailDescription.textContent = state.mode === "truth" ? product.craftTruth : product.description;
  els.detailBirthplace.textContent = product.birthplace;
  els.detailCraft.textContent = state.mode === "anomaly3" || state.mode === "truth" ? product.craftTruth : product.craftNormal;
  els.craftText.textContent = state.mode === "truth"
    ? "手順の一つひとつが、通常の制作工程ではなく“処理の記録”として読めるように変化しています。"
    : "表情・縫製・綿入れの順に仕上げ、最終調整後に出荷します。";

  let imgSrc = getProductImage(product);
  if (state.showingBack && state.mode === "anomaly2") imgSrc = product.backImage;
  else if (state.showingBack && state.mode !== "anomaly2") imgSrc = product.image;
  setImageSource(els.detailImage, imgSrc);
  els.detailImage.alt = product.name;
  els.toggleBackBtn.textContent = state.mode === "anomaly2" ? "裏面を見る" : (state.showingBack ? "表面に戻す" : "裏面を見る");
}

function renderNews() {
  const items = state.mode === "truth" ? state.news.truth : state.news.normal;
  els.newsList.innerHTML = items.map(item => `
    <article class="news-item">
      <time>${item.date}</time>
      <p>${item.title}</p>
    </article>
  `).join("");
}

function renderReviews() {
  const items = state.mode === "truth" ? state.reviews.truth : state.reviews.normal;
  els.reviewList.innerHTML = items.map(item => `
    <article class="review-card">
      <h3>${item.name}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderBrand() {
  if (state.mode === "truth") {
    els.brandTitle.textContent = "保管記録について";
    els.brandText.textContent = "ここに並んでいた名称や説明は、すべて別の出来事を隠すための置き換えです。かわいい商品に見えたものは、別の形で残された記録でした。";
  } else {
    els.brandTitle.textContent = "こもれびぬいについて";
    els.brandText.textContent = "こもれびぬいは、日常にそっと寄り添うぬいぐるみをテーマに、小さな工房で制作を続けています。素材のやわらかさと、長く一緒に過ごせる表情づくりを大切にしています。";
  }
}

function getProductImage(product) {
  if (state.mode === "truth" && product.imageTruth) return product.imageTruth;
  if (state.mode === "anomaly1" && product.id === "shiromimi" && product.imageAnomaly1) return product.imageAnomaly1;
  return product.image;
}

function triggerTransition(nextMode) {
  els.overlay.dataset.nextMode = nextMode;
  els.overlay.classList.add("active");
}

let glitchTimerStarted = false;
function startTruthGlitch() {
  if (glitchTimerStarted) return;
  glitchTimerStarted = true;
  setInterval(() => {
    if (state.mode !== "truth") return;
    document.body.classList.add("glitching");
    setTimeout(() => document.body.classList.remove("glitching"), 1000);
  }, 30000);
}

const noiseOverlay=document.getElementById("noise-overlay");
function runSiteAlteredOverlay(next){
 if(!noiseOverlay)return;
 noiseOverlay.classList.add("is-active");
 noiseOverlay.onclick=()=>{
  noiseOverlay.classList.remove("is-active");
  if(next)next();
 };
}
