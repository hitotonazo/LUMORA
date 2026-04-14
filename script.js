
const MODES = ["normal","anomaly1","anomaly2","anomaly3","truth"];
const state = {
  mode:"normal",
  products:[],
  reviews:null,
  news:null,
  config:null,
  currentProductId:"shiromimi",
  showingBack:false,
  anomaly3Clicks:0,
  noiseNextMode:null
};

const els = {
  body: document.body,
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
  noiseOverlay: document.getElementById("noise-overlay")
};

window.state = state;
window.els = els;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const [products, reviews, news] = await Promise.all([
    fetch("data/products.json").then(r => r.json()),
    fetch("data/reviews.json").then(r => r.json()),
    fetch("data/news.json").then(r => r.json())
  ]);
  state.products = products;
  state.reviews = reviews;
  state.news = news;
  state.config = window.SITE_CONFIG || null;

  applyStaticAssetPaths();
  bindEvents();
  closeSiteAlteredOverlay();
  setMode(getModeFromUrl());
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

function resolveAssetPath(path) {
  if (!path || !state.config || !state.config.useR2) return path;
  const publicBase = (state.config.r2PublicBase || "").replace(/\/$/, "");
  if (!publicBase) return path;
  if (path.startsWith("images/")) {
    return `${publicBase}/${path.replace(/^images\//, "")}`;
  }
  return path;
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
  bindImageFallback(img, originalPath);
  img.src = resolveAssetPath(originalPath);
}

function applyStaticAssetPaths() {
  document.querySelectorAll('img[src^="images/"]').forEach(img => {
    const original = img.getAttribute("src");
    if (!original) return;
    bindImageFallback(img, original);
    img.src = resolveAssetPath(original);
  });
}

function currentProduct() {
  return state.products.find(p => p.id === state.currentProductId) || state.products[0];
}

function getProductImage(product) {
  if (state.mode === "truth" && product.imageTruth) return product.imageTruth;
  if (state.mode === "anomaly1" && product.id === "shiromimi" && product.imageAnomaly1) return product.imageAnomaly1;
  return product.image;
}

function getBackImage(product) {
  if (product.id === "shiromimi") {
    if (state.mode === "normal" || state.mode === "anomaly1") {
      return product.anomaly1BackImage || product.backImage || product.image;
    }
    return product.normalBackImage || product.backImage || product.image;
  }
  return product.backImage || product.image;
}

function closeSiteAlteredOverlay() {
  if (!els.noiseOverlay) return;
  els.noiseOverlay.classList.remove("is-active");
  els.noiseOverlay.setAttribute("aria-hidden", "true");
}

function runSiteAlteredOverlay(nextMode = null) {
  if (!els.noiseOverlay) {
    if (typeof nextMode === "string" && nextMode) {
      updateUrlMode(nextMode);
      setMode(nextMode);
    }
    return;
  }
  state.noiseNextMode = nextMode;
  els.noiseOverlay.classList.add("is-active");
  els.noiseOverlay.setAttribute("aria-hidden", "false");
}

function setMode(mode) {
  closeSiteAlteredOverlay();
  state.noiseNextMode = null;
  state.mode = mode;
  state.showingBack = false;
  state.anomaly3Clicks = 0;
  els.body.dataset.mode = mode;
  renderHeaderAndHero();
  renderProducts();
  renderDetail();
  renderNews();
  renderReviews();
  renderBrand();
}

function renderHeaderAndHero() {
  const truth = state.mode === "truth";
  if (els.siteLogo) setImageSource(els.siteLogo, truth ? "images/truth/img_logo_header_truth_600x160.png" : "images/ui/img_logo_header_600x160.png");
  if (els.heroImage) setImageSource(els.heroImage, truth ? "images/truth/img_hero_collage_truth_1200x800.png" : "images/normal/img_hero_collage_1200x800.png");
  if (truth) {
    document.title = "記録保管ページ";
    if (els.heroTitle) els.heroTitle.textContent = "これは販売ページではなく、記録の保管ページです。";
    if (els.heroText) els.heroText.textContent = "商品説明、制作方法、出身地はすべて別の出来事を隠すための置き換えです。";
    if (els.shareWrap) els.shareWrap.classList.remove("hidden");
  } else {
    document.title = "こもれびぬい｜やさしいぬくもりのぬいぐるみ";
    if (els.heroTitle) els.heroTitle.textContent = "やさしいぬくもりを、暮らしのそばに。";
    if (els.heroText) els.heroText.textContent = "毎日の景色になじむ、物語のあるぬいぐるみをお届けします。";
    if (els.shareWrap) els.shareWrap.classList.add("hidden");
  }
}

function renderProducts() {
  if (!els.productGrid) return;
  els.productGrid.innerHTML = "";
  state.products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    const imgSrc = getProductImage(product);
    card.innerHTML = `
      <img src="${resolveAssetPath(imgSrc)}" alt="${product.name}" data-fallback="${imgSrc}">
      <div class="product-copy">
        <div class="meta"><span>${product.series || ""}</span><span>${product.price || ""}</span></div>
        <h3>${product.name || ""}</h3>
        <p>${state.mode === "truth" ? (product.craftTruth || "") : (product.tagline || "")}</p>
        <div class="product-actions">
          <button class="mini-btn" data-view="${product.id}">詳細を見る</button>
        </div>
      </div>`;
    els.productGrid.appendChild(card);
  });

  els.productGrid.querySelectorAll("img[data-fallback]").forEach(img => bindImageFallback(img, img.dataset.fallback));
  els.productGrid.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      state.currentProductId = btn.dataset.view;
      state.showingBack = false;
      state.anomaly3Clicks = 0;
      renderProducts();
      renderDetail();
      const detail = document.getElementById("detail");
      if (detail) detail.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
}

function renderDetail() {
  const product = currentProduct();
  if (!product) return;

  if (els.detailSeries) els.detailSeries.textContent = product.series || "";
  if (els.detailName) els.detailName.textContent = product.name || "";
  if (els.detailPrice) els.detailPrice.textContent = product.price || "";
  if (els.detailDescription) {
    els.detailDescription.textContent = state.mode === "truth"
      ? (product.craftTruth || product.description || "")
      : (product.description || "");
  }

  if (els.detailBirthplace) {
    els.detailBirthplace.classList.remove("birthplace-dogear","revealed-place");
    if (state.mode === "anomaly3") {
      els.detailBirthplace.classList.add("birthplace-dogear");
      if (state.anomaly3Clicks >= 5) {
        els.detailBirthplace.textContent = product.foundPlace || product.birthplace || "";
        els.detailBirthplace.classList.add("revealed-place");
      } else {
        els.detailBirthplace.textContent = product.birthplace || "";
      }
    } else {
      els.detailBirthplace.textContent = product.birthplace || "";
    }
  }

  if (els.detailCraft) {
    if (state.mode === "anomaly2") {
      els.detailCraft.textContent = product.anomaly2Craft || "対象者を内部へ押し込み、外見が崩れないよう縫合線を再調整します。";
    } else if (state.mode === "anomaly3" || state.mode === "truth") {
      els.detailCraft.textContent = product.craftTruth || product.craftNormal || "";
    } else {
      els.detailCraft.textContent = product.craftNormal || "";
    }
  }

  let imgSrc = getProductImage(product);
  if (state.showingBack) imgSrc = getBackImage(product);

  if (els.detailImage) {
    setImageSource(els.detailImage, imgSrc);
    els.detailImage.alt = state.showingBack ? `${product.name}の裏面` : product.name;
  }

  if (els.toggleBackBtn) els.toggleBackBtn.textContent = state.showingBack ? "表面に戻す" : "裏面を見る";
  if (els.openCraftBtn) els.openCraftBtn.style.display = "none";
  if (els.craftPanel) {
    els.craftPanel.classList.add("hidden");
    els.craftPanel.style.display = "none";
  }
}

function renderNews() {
  if (!els.newsList || !state.news) return;
  const items = state.mode === "truth" ? state.news.truth : state.news.normal;
  els.newsList.innerHTML = items.map(item => `<article class="news-item"><time>${item.date}</time><p>${item.title}</p></article>`).join("");
}

function renderReviews() {
  if (!els.reviewList || !state.reviews) return;
  const items = state.mode === "truth" ? state.reviews.truth : state.reviews.normal;
  els.reviewList.innerHTML = items.map(item => `<article class="review-card"><h3>${item.name}</h3><p>${item.text}</p></article>`).join("");
}

function renderBrand() {
  if (!els.brandTitle || !els.brandText) return;
  if (state.mode === "truth") {
    els.brandTitle.textContent = "保管記録について";
    els.brandText.textContent = "ここに並んでいた名称や説明は、すべて別の出来事を隠すための置き換えです。かわいい商品に見えたものは、別の形で残された記録でした。";
  } else {
    els.brandTitle.textContent = "こもれびぬいについて";
    els.brandText.textContent = "こもれびぬいは、日常にそっと寄り添うぬいぐるみをテーマに、小さな工房で制作を続けています。素材のやわらかさと、長く一緒に過ごせる表情づくりを大切にしています。";
  }
}

function bindEvents() {
  if (els.noiseOverlay) {
    els.noiseOverlay.addEventListener("click", () => {
      const nextMode = state.noiseNextMode;
      state.noiseNextMode = null;
      closeSiteAlteredOverlay();
      if (typeof nextMode === "string" && nextMode) {
        updateUrlMode(nextMode);
        setMode(nextMode);
      }
    });
  }

  if (els.toggleBackBtn) {
    els.toggleBackBtn.addEventListener("click", e => {
      e.preventDefault();
      state.showingBack = !state.showingBack;
      renderDetail();
    });
  }

  if (els.detailImage) {
    els.detailImage.addEventListener("click", () => {
      const product = currentProduct();
      if (!product || !state.showingBack) return;
      if (product.id === "shiromimi" && (state.mode === "normal" || state.mode === "anomaly1")) {
        runSiteAlteredOverlay("anomaly2");
      }
    });
  }

  if (els.detailCraft) {
    els.detailCraft.addEventListener("click", () => {
      if (state.mode !== "anomaly2") return;
      runSiteAlteredOverlay("anomaly3");
    });
  }

  if (els.detailBirthplace) {
    els.detailBirthplace.addEventListener("click", () => {
      if (state.mode !== "anomaly3") return;
      if (state.anomaly3Clicks < 5) {
        state.anomaly3Clicks += 1;
        renderDetail();
        return;
      }
      runSiteAlteredOverlay("truth");
    });
  }

  if (els.searchForm) {
    els.searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const q = (els.searchInput?.value || "").trim().toLowerCase();
      if (!q) {
        if (els.searchMessage) els.searchMessage.textContent = "検索語を入力してください。";
        return;
      }
      const product = state.products.find(p => (p.name || "").includes(q) || (p.id || "").includes(q));
      if (product) {
        state.currentProductId = product.id;
        state.showingBack = false;
        state.anomaly3Clicks = 0;
        renderProducts();
        renderDetail();
        const detail = document.getElementById("detail");
        if (detail) detail.scrollIntoView({behavior:"smooth", block:"start"});
        if (els.searchMessage) els.searchMessage.textContent = `「${product.name}」を表示しました。`;
      } else {
        if (els.searchMessage) els.searchMessage.textContent = `「${els.searchInput.value}」に一致する商品は見つかりませんでした。`;
      }
    });
  }

  if (els.shareBtn) {
    els.shareBtn.addEventListener("click", () => {
      const config = window.SHARE_CONFIG || {};
      const text = `${config.shareText || ""}\n${config.originTweetUrl || location.href}`.trim();
      const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  window.addEventListener("popstate", () => setMode(getModeFromUrl()));
}

window.inspectOverlayDom = function () {
  return {
    noiseOverlayCount: document.querySelectorAll("#noise-overlay").length,
    noiseMessageCount: document.querySelectorAll("#noise-message").length,
    overlayAria: document.getElementById("noise-overlay") ? document.getElementById("noise-overlay").getAttribute("aria-hidden") : null
  };
};

window.inspectImageSources = function () {
  return Array.from(document.querySelectorAll('img')).map(img => ({
    alt: img.alt || "",
    src: img.getAttribute("src"),
    resolved: img.src
  }));
};
