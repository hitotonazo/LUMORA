const MODES = ["normal", "anomaly1", "anomaly2", "anomaly3", "truth"];

const state = {
  mode: "normal",
  products: [],
  reviews: null,
  news: null,
  config: null,
  currentProductId: "shiromimi",
  showingBack: false,
  anomaly3Clicks: 0,
  noiseNextMode: null
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
  newsList: document.getElementById("news-list"),
  reviewList: document.getElementById("review-list"),
  toggleBackBtn: document.getElementById("toggle-back-btn"),
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
  state.config = window.SITE_CONFIG || {};

  const [products, reviews, news] = await Promise.all([
    fetch("data/products.json", { cache: "no-store" }).then((r) => r.json()),
    fetch("data/reviews.json", { cache: "no-store" }).then((r) => r.json()),
    fetch("data/news.json", { cache: "no-store" }).then((r) => r.json())
  ]);

  state.products = products;
  state.reviews = reviews;
  state.news = news;

  bindEvents();
  closeSiteAlteredOverlay();
  setMode(getModeFromUrl());
  applyStaticAssetPaths();
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
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  const normalized = String(path).replace(/^\.\//, "").replace(/^\/+/, "");
  const config = state.config || {};

  if (config.useProxy) {
    return `${config.proxyPrefix || "/r2"}/${normalized}`;
  }

  if (config.useR2) {
    const base = String(config.r2PublicBase || "").replace(/\/$/, "");
    if (!base) return normalized;
    if (normalized.startsWith("images/")) {
      if (base.endsWith("/images")) {
        return `${base}/${normalized.replace(/^images\//, "")}`;
      }
      return `${base}/${normalized}`;
    }
    return `${base}/${normalized}`;
  }

  return normalized;
}

function setImageSource(img, path) {
  if (!img || !path) return;
  img.dataset.originalPath = path;
  img.src = resolveAssetPath(path);
}

function applyStaticAssetPaths(scope = document) {
  scope.querySelectorAll("img[data-r2-src]").forEach((img) => {
    const original = img.getAttribute("data-r2-src");
    if (!original) return;
    setImageSource(img, original);
  });
}

function currentProduct() {
  return state.products.find((p) => p.id === state.currentProductId) || state.products[0] || null;
}

function getProductImage(product) {
  if (!product) return "";
  if (state.mode === "truth" && product.imageTruth) return product.imageTruth;
  if (state.mode === "anomaly1" && product.id === "shiromimi" && product.imageAnomaly1) return product.imageAnomaly1;
  return product.image;
}

function getBackImage(product) {
  if (!product) return "";
  if (product.id === "shiromimi") {
    if (state.mode === "normal") return product.normalBackImage || product.backImage || product.image;
    if (state.mode === "anomaly1") return product.anomaly1BackImage || product.backImage || product.image;
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
    if (nextMode) {
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
  state.mode = mode;
  state.showingBack = false;
  state.anomaly3Clicks = 0;
  state.noiseNextMode = null;
  closeSiteAlteredOverlay();
  if (els.body) els.body.dataset.mode = mode;

  renderHeaderAndHero();
  renderProducts();
  renderDetail();
  renderNews();
  renderReviews();
  renderBrand();
  applyStaticAssetPaths();
  updateAnomaly1Mosaic();
}

function updateAnomaly1Mosaic() {
  const el =
    document.querySelector(".product-visual") ||
    document.querySelector(".detail-visual") ||
    document.querySelector(".product-detail-visual") ||
    document.querySelector(".detail-image-wrap") ||
    document.querySelector(".product-image-wrap") ||
    document.querySelector(".detail-media");

  if (!el) return;

  const currentId =
    state.currentProductId ||
    state.activeProductId ||
    state.selectedProductId ||
    "";

  const isShiromimi = currentId === "shiromimi";
  const isBack = (state.isBackView === true) || (state.showingBack === true);
  const isA1 = state.mode === "anomaly1";

  el.classList.toggle(
    "anomaly1-mosaic",
    isShiromimi && isBack && isA1
  );
}

function updateAnomaly1Fog() {
  updateAnomaly1Mosaic();
}

function renderHeaderAndHero() {
  const truth = state.mode === "truth";
  setImageSource(els.siteLogo, truth ? "images/truth/img_logo_header_truth_600x160.png" : "images/ui/img_logo_header_600x160.png");
  setImageSource(els.heroImage, truth ? "images/truth/img_hero_collage_truth_1200x800.png" : "images/normal/img_hero_collage_1200x800.png");

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

  state.products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const imgSrc = getProductImage(product);
    card.innerHTML = `
      <img data-r2-src="${imgSrc}" alt="${product.name}">
      <div class="product-copy">
        <div class="meta"><span>${product.series || ""}</span><span>${product.price || ""}</span></div>
        <h3>${product.name || ""}</h3>
        <p>${state.mode === "truth" ? (product.craftTruth || "") : (product.tagline || "")}</p>
        <div class="product-actions">
          <button class="mini-btn" type="button" data-view="${product.id}">詳細を見る</button>
        </div>
      </div>`;
    els.productGrid.appendChild(card);
  });

  applyStaticAssetPaths(els.productGrid);

  els.productGrid.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      state.currentProductId = btn.dataset.view;
      state.showingBack = false;
      state.anomaly3Clicks = 0;
      renderProducts();
      renderDetail();
      document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    els.detailBirthplace.classList.remove("birthplace-dogear", "revealed-place");
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

  const imagePath = state.showingBack ? getBackImage(product) : getProductImage(product);
  setImageSource(els.detailImage, imagePath);
  if (els.detailImage) {
    els.detailImage.alt = state.showingBack ? `${product.name}の裏面` : product.name;
  }

  if (els.toggleBackBtn) {
    els.toggleBackBtn.textContent = state.showingBack ? "表面に戻す" : "裏面を見る";
  }
}

function renderNews() {
  if (!els.newsList || !state.news) return;
  const items = state.mode === "truth" ? state.news.truth : state.news.normal;
  els.newsList.innerHTML = items.map((item) => `<article class="news-item"><time>${item.date}</time><p>${item.title}</p></article>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderReviews() {
  if (!els.reviewList || !state.reviews) return;
  const items = state.mode === "truth" ? state.reviews.truth : state.reviews.normal;
  els.reviewList.innerHTML = items.map((item) => {
    const purchaser = escapeHtml(item.name);
    const body = escapeHtml(item.text);
    const title = escapeHtml(item.title || item.name);
    const stars = item.stars || "★★★★★";
    const date = item.date ? `<span class="review-date">${escapeHtml(item.date)}</span>` : "";
    const reply = item.reply
      ? `<div class="review-reply">${escapeHtml(item.reply)}</div>`
      : "";

    return `
      <article class="review-card review-thread-card">
        <div class="review-main">
          <h3 class="review-title">${title}</h3>
          <div class="review-stars" aria-label="${stars}">${stars}</div>
          <p class="review-body">${body}</p>
          <div class="review-meta">購入者：<strong>${purchaser}</strong>${date}</div>
          ${reply}
        </div>
      </article>`;
  }).join("");
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
  els.noiseOverlay?.addEventListener("click", () => {
    const nextMode = state.noiseNextMode;
    closeSiteAlteredOverlay();
    state.noiseNextMode = null;
    if (nextMode) {
      updateUrlMode(nextMode);
      setMode(nextMode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  els.toggleBackBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const product = currentProduct();

    if (product?.id === "shiromimi" && state.mode === "normal" && !state.showingBack) {
      state.mode = "anomaly1";
      state.currentProductId = "shiromimi";
      state.showingBack = true;
      state.anomaly3Clicks = 0;
      updateUrlMode("anomaly1");
      if (els.body) els.body.dataset.mode = "anomaly1";
      renderHeaderAndHero();
      renderProducts();
      renderDetail();
      renderNews();
      renderReviews();
      renderBrand();
      applyStaticAssetPaths();
      updateAnomaly1Mosaic();
      if (els.detailImage) {
        setImageSource(els.detailImage, product.anomaly1BackImage || product.backImage || product.image);
        els.detailImage.alt = `${product.name}の裏面`;
      }
      if (els.toggleBackBtn) {
        els.toggleBackBtn.textContent = "表面に戻す";
      }
      return;
    }

    state.showingBack = !state.showingBack;
    renderDetail();
    updateAnomaly1Mosaic();
  });

  els.detailImage?.addEventListener("click", () => {
    const product = currentProduct();
    if (!product || !state.showingBack) return;
    if (product.id === "shiromimi" && state.mode === "anomaly1") {
      runSiteAlteredOverlay("anomaly2");
    }
  });

  els.detailCraft?.addEventListener("click", () => {
    if (state.mode === "anomaly2") {
      runSiteAlteredOverlay("anomaly3");
    }
  });

  els.detailBirthplace?.addEventListener("click", () => {
    if (state.mode !== "anomaly3") return;
    if (state.anomaly3Clicks < 5) {
      state.anomaly3Clicks += 1;
      renderDetail();
      return;
    }
    runSiteAlteredOverlay("truth");
  });

  els.searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (els.searchInput?.value || "").trim().toLowerCase();
    if (!q) {
      if (els.searchMessage) els.searchMessage.textContent = "検索語を入力してください。";
      return;
    }

    const product = state.products.find((p) => (p.name || "").toLowerCase().includes(q) || (p.id || "").toLowerCase().includes(q));
    if (!product) {
      if (els.searchMessage) els.searchMessage.textContent = `「${els.searchInput.value}」に一致する商品は見つかりませんでした。`;
      return;
    }

    state.currentProductId = product.id;
    state.showingBack = false;
    state.anomaly3Clicks = 0;
    renderProducts();
    renderDetail();
    document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (els.searchMessage) els.searchMessage.textContent = `「${product.name}」を表示しました。`;
  });

  els.shareBtn?.addEventListener("click", () => {
    const config = window.SHARE_CONFIG || {};
    const text = `${config.shareText || ""}\n${config.originTweetUrl || location.href}`.trim();
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  });

  window.addEventListener("popstate", () => setMode(getModeFromUrl()));
}

window.inspectOverlayDom = function inspectOverlayDom() {
  return {
    noiseOverlayCount: document.querySelectorAll("#noise-overlay").length,
    overlayActive: document.getElementById("noise-overlay")?.classList.contains("is-active") || false,
    overlayAria: document.getElementById("noise-overlay")?.getAttribute("aria-hidden") || null
  };
};

window.inspectImageSources = function inspectImageSources() {
  return Array.from(document.querySelectorAll("img")).map((img) => ({
    alt: img.alt || "",
    dataR2Src: img.getAttribute("data-r2-src") || "",
    currentSrcAttr: img.getAttribute("src") || "",
    resolved: img.currentSrc || img.src || "",
    isProxy: (img.currentSrc || img.src || "").includes("/r2/"),
    isR2Direct: (img.currentSrc || img.src || "").includes(".r2.dev")
  }));
};
