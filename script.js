
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
  els.detailImage.addEventListener("click", () => {
    if (!state.showingBack) return;
    if (state.mode !== "normal" && state.mode !== "anomaly1") return;

    if (typeof runSiteAlteredOverlay === "function") {
      runSiteAlteredOverlay(() => {
        updateUrlMode("anomaly2");
        setMode("anomaly2");
      });
      return;
    }

    updateUrlMode("anomaly2");
    setMode("anomaly2");
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
  if (state.showingBack) imgSrc = product.backImage || imgSrc;
  setImageSource(els.detailImage, imgSrc);
  els.detailImage.alt = state.showingBack ? `${product.name}の裏面` : product.name;
  els.toggleBackBtn.textContent = state.showingBack ? "表面に戻す" : "裏面を見る";
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

const transitionOverlay = document.getElementById("transition-overlay");
function runSiteAlteredOverlay(next) {
  if (!transitionOverlay) {
    if (typeof next === "function") next();
    return;
  }

  transitionOverlay.classList.add("active");
  transitionOverlay.setAttribute("aria-hidden", "false");

  const handleClose = () => {
    transitionOverlay.classList.remove("active");
    transitionOverlay.setAttribute("aria-hidden", "true");
    transitionOverlay.removeEventListener("click", handleClose);
    if (typeof next === "function") next();
  };

  transitionOverlay.addEventListener("click", handleClose);
}


/* === stage 1 -> stage 2 flow === */
(function () {
  const backButton = document.getElementById("viewBackButton");
  const backModal = document.getElementById("productBackModal");
  const backClose = document.getElementById("productBackClose");
  const backImage = document.getElementById("productBackImage");

  function getModeFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "normal";
  }

  function setBodyStage(mode) {
    document.body.classList.remove("stage-normal", "stage-anomaly1", "stage-anomaly2", "stage-anomaly3", "stage-truth");
    document.body.classList.add(`stage-${mode}`);
  }

  function resolveBackImageForCurrentMode() {
    // まずはサイト内のローカルダミー画像を優先して表示
    return "images/anomaly1/img_product_shiromimi_eye_800x800.png";
  }

  function openBackModal() {
    if (!backModal || !backImage) return;
    backImage.src = resolveBackImageForCurrentMode();
    backModal.classList.add("is-open");
    backModal.setAttribute("aria-hidden", "false");
  }

  function closeBackModal() {
    if (!backModal) return;
    backModal.classList.remove("is-open");
    backModal.setAttribute("aria-hidden", "true");
  }

  function goToMode(mode) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.location.href = url.toString();
  }

  if (backButton) {
    backButton.addEventListener("click", openBackModal);
  }

  if (backClose) {
    backClose.addEventListener("click", closeBackModal);
  }

  if (backModal) {
    backModal.addEventListener("click", (event) => {
      if (event.target === backModal || event.target.classList.contains("product-back-modal__backdrop")) {
        closeBackModal();
      }
    });
  }

  if (backImage) {
    backImage.addEventListener("click", () => {
      closeBackModal();
      if (typeof runSiteAlteredOverlay === "function") {
        runSiteAlteredOverlay(() => {
          goToMode("anomaly2");
        });
      } else {
        goToMode("anomaly2");
      }
    });
  }

  // 初期モード反映
  setBodyStage(getModeFromQuery());
})();


// この版では「裏面を見る」→メイン商品画像の差し替え で進行します。
// 裏面表示中に商品画像をクリックすると、改変演出のあと違和感②へ進みます。



/* === backside click overlay fix === */
(function () {
  function bindBacksideOverlayTrigger() {
    const detailImage = document.getElementById("detail-image");
    if (!detailImage) return;

    detailImage.addEventListener("click", function () {
      try {
        const isBack =
          (window.state && window.state.showingBack) ||
          document.body.classList.contains("is-showing-back") ||
          /img_product_shiromimi_eye_800x800\.png/.test(detailImage.getAttribute("src") || "");

        const params = new URLSearchParams(window.location.search);
        const mode = params.get("mode") || "normal";

        if (!isBack) return;
        if (!(mode === "normal" || mode === "anomaly1")) return;

        if (typeof runSiteAlteredOverlay === "function") {
          runSiteAlteredOverlay(function () {
            const url = new URL(window.location.href);
            url.searchParams.set("mode", "anomaly2");
            window.location.href = url.toString();
          });
        } else {
          const url = new URL(window.location.href);
          url.searchParams.set("mode", "anomaly2");
          window.location.href = url.toString();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindBacksideOverlayTrigger);
  } else {
    bindBacksideOverlayTrigger();
  }
})();


/* === force overlay + anomaly2 transition fix === */
(function () {
  function ensureOverlayFunctions() {
    const overlay = document.getElementById("noise-overlay");
    if (!overlay) return null;

    if (typeof window.runSiteAlteredOverlay !== "function") {
      let nextAction = null;

      window.runSiteAlteredOverlay = function (callback) {
        nextAction = typeof callback === "function" ? callback : null;
        overlay.classList.add("is-active");
        overlay.setAttribute("aria-hidden", "false");
      };

      function closeOverlayAndContinue() {
        overlay.classList.remove("is-active");
        overlay.setAttribute("aria-hidden", "true");
        const action = nextAction;
        nextAction = null;
        if (typeof action === "function") action();
      }

      overlay.addEventListener("click", closeOverlayAndContinue);
    }

    return overlay;
  }

  function goToAnomaly2() {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "anomaly2");
    window.location.href = url.toString();
  }

  function isBacksideVisible() {
    const img =
      document.getElementById("detail-image") ||
      document.querySelector("#detailImage") ||
      document.querySelector(".product-detail img") ||
      document.querySelector("img");

    if (!img) return false;
    const src = img.getAttribute("src") || "";
    return /img_product_shiromimi_eye_800x800\.png/.test(src);
  }

  function handlePotentialBacksideClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickedImage =
      target.closest("#detail-image") ||
      target.closest("#detailImage") ||
      target.closest(".product-detail img") ||
      (target.tagName === "IMG" ? target : null);

    if (!clickedImage) return;
    if (!isBacksideVisible()) return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "normal";
    if (!(mode === "normal" || mode === "anomaly1")) return;

    const overlay = ensureOverlayFunctions();
    if (overlay && typeof window.runSiteAlteredOverlay === "function") {
      window.runSiteAlteredOverlay(goToAnomaly2);
    } else {
      goToAnomaly2();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      ensureOverlayFunctions();
      document.addEventListener("click", handlePotentialBacksideClick, true);
    });
  } else {
    ensureOverlayFunctions();
    document.addEventListener("click", handlePotentialBacksideClick, true);
  }
})();



/* === direct backside image overlay trigger === */
(function () {
  const detailImage = document.getElementById("detail-image");
  if (!detailImage) return;

  detailImage.addEventListener("click", function () {
    if (!state.showingBack) return;
    if (!(state.mode === "normal" || state.mode === "anomaly1")) return;

    runSiteAlteredOverlay(function () {
      updateUrlMode("anomaly2");
      setMode("anomaly2");
    });
  });
})();



/* === robust backside toggle + overlay flow === */
(function () {
  function getEls() {
    return {
      img: document.getElementById("detail-image"),
      toggleBtn: document.getElementById("toggle-back-btn"),
      overlay: document.getElementById("transition-overlay")
    };
  }

  function currentMode() {
    if (window.state && window.state.mode) return window.state.mode;
    const p = new URLSearchParams(location.search);
    return p.get("mode") || "normal";
  }

  function frontSrc() {
    const els = getEls();
    return els.img ? (els.img.dataset.frontSrc || els.img.getAttribute("src") || "") : "";
  }

  function backSrc() {
    return "images/anomaly1/img_product_shiromimi_eye_800x800.png";
  }

  function setBackShown(isBack) {
    const els = getEls();
    if (!els.img) return;

    if (!els.img.dataset.frontSrc) {
      els.img.dataset.frontSrc = els.img.getAttribute("src") || "";
    }

    if (isBack) {
      els.img.setAttribute("src", backSrc());
      document.body.classList.add("is-showing-back");
      if (window.state) window.state.showingBack = true;
      if (els.toggleBtn) els.toggleBtn.textContent = "表面に戻す";
    } else {
      els.img.setAttribute("src", els.img.dataset.frontSrc || frontSrc());
      document.body.classList.remove("is-showing-back");
      if (window.state) window.state.showingBack = false;
      if (els.toggleBtn) els.toggleBtn.textContent = "裏面を見る";
    }
  }

  function showOverlay(next) {
    const els = getEls();
    if (!els.overlay) {
      if (typeof next === "function") next();
      return;
    }

    els.overlay.classList.add("active");
    els.overlay.setAttribute("aria-hidden", "false");

    const close = () => {
      els.overlay.classList.remove("active");
      els.overlay.setAttribute("aria-hidden", "true");
      els.overlay.removeEventListener("click", close);
      if (typeof next === "function") next();
    };

    els.overlay.addEventListener("click", close);
  }

  function goToAnomaly2() {
    const url = new URL(location.href);
    url.searchParams.set("mode", "anomaly2");
    location.href = url.toString();
  }

  function bind() {
    const els = getEls();
    if (!els.img || !els.toggleBtn) return;

    // Remove old inline behavior by cloning elements
    const newBtn = els.toggleBtn.cloneNode(true);
    els.toggleBtn.parentNode.replaceChild(newBtn, els.toggleBtn);

    const freshImg = document.getElementById("detail-image");
    const freshBtn = document.getElementById("toggle-back-btn");

    if (freshImg && !freshImg.dataset.frontSrc) {
      freshImg.dataset.frontSrc = freshImg.getAttribute("src") || "";
    }

    freshBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const showing = document.body.classList.contains("is-showing-back");
      setBackShown(!showing);
    });

    freshImg.addEventListener("click", function () {
      const showing = document.body.classList.contains("is-showing-back");
      const mode = currentMode();
      if (!showing) return;
      if (!(mode === "normal" || mode === "anomaly1")) return;
      showOverlay(goToAnomaly2);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();



/* === FINAL OVERRIDE: all images R2-first === */
(function () {
  const R2_BASE = (window.SITE_CONFIG && window.SITE_CONFIG.r2PublicBase
    ? window.SITE_CONFIG.r2PublicBase
    : "https://pub-12f05472082049758097370dd8aaab52.r2.dev/images").replace(/\/$/, "");

  function toR2(path) {
    if (!path) return path;
    if (/^https?:\/\//.test(path)) return path;
    return `${R2_BASE}/${String(path).replace(/^\/+/, "")}`;
  }

  function setImgR2First(img, logicalPath) {
    if (!img || !logicalPath) return;
    const r2src = toR2(logicalPath);
    img.onerror = function () {
      this.onerror = null;
      this.src = logicalPath;
    };
    img.src = r2src;
  }

  function replaceStaticImages() {
    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      let logical = null;

      if (img.id === "detail-image") return;
      if (/^https?:\/\//.test(src)) return;

      if (src.includes("img_logo_header")) logical = "shared/ui/img_logo_header_600x160.png";
      else if (src.includes("img_product_shiromimi_front")) logical = "normal/img_product_shiromimi_front_800x800.png";
      else if (src.includes("img_product_morikuma_front")) logical = "normal/img_product_morikuma_front_800x800.png";
      else if (src.includes("img_product_kuroneko_front")) logical = "normal/img_product_kuroneko_front_800x800.png";
      else if (src.includes("img_product_yoruneko_front")) logical = "normal/img_product_yoruneko_front_800x800.png";
      else if (src.includes("img_product_hoshiumi_front")) logical = "normal/img_product_hoshiumi_front_800x800.png";
      else if (src.includes("img_product_shiromimi_eye")) logical = "anomaly1/img_product_shiromimi_eye_800x800.png";
      else if (src.includes("img_product_morikuma_wrongface")) logical = "anomaly2/img_product_morikuma_wrongface_800x800.png";
      else if (src.includes("img_product_yoruneko_red")) logical = "anomaly3/img_product_yoruneko_red_800x800.png";

      if (logical) setImgR2First(img, logical);
    });
  }

  function bindDetailFlow() {
    const img = document.getElementById("detail-image");
    const btn = document.getElementById("toggle-back-btn");
    const overlay = document.getElementById("transition-overlay");
    if (!img || !btn) return;

    if (!img.dataset.frontLogical) {
      img.dataset.frontLogical = "normal/img_product_shiromimi_front_800x800.png";
    }

    const freshBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(freshBtn, btn);

    const freshImg = document.getElementById("detail-image");

    setImgR2First(freshImg, img.dataset.frontLogical);

    freshBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const isBack = document.body.classList.contains("is-showing-back");
      if (isBack) {
        document.body.classList.remove("is-showing-back");
        freshBtn.textContent = "裏面を見る";
        if (window.state) window.state.showingBack = false;
        setImgR2First(freshImg, freshImg.dataset.frontLogical || "normal/img_product_shiromimi_front_800x800.png");
      } else {
        document.body.classList.add("is-showing-back");
        freshBtn.textContent = "表面に戻す";
        if (window.state) window.state.showingBack = true;
        setImgR2First(freshImg, "anomaly1/img_product_shiromimi_eye_800x800.png");
      }
    });

    const newImg = freshImg.cloneNode(true);
    freshImg.parentNode.replaceChild(newImg, freshImg);
    if (!newImg.dataset.frontLogical) newImg.dataset.frontLogical = "normal/img_product_shiromimi_front_800x800.png";
    if (document.body.classList.contains("is-showing-back")) {
      setImgR2First(newImg, "anomaly1/img_product_shiromimi_eye_800x800.png");
    } else {
      setImgR2First(newImg, newImg.dataset.frontLogical);
    }

    newImg.addEventListener("click", function () {
      if (!document.body.classList.contains("is-showing-back")) return;
      const mode = (window.state && window.state.mode) || (new URLSearchParams(location.search).get("mode") || "normal");
      if (!(mode === "normal" || mode === "anomaly1")) return;

      const go = function () {
        const url = new URL(location.href);
        url.searchParams.set("mode", "anomaly2");
        location.href = url.toString();
      };

      if (typeof runSiteAlteredOverlay === "function") {
        runSiteAlteredOverlay(go);
      } else if (overlay) {
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        const close = function () {
          overlay.classList.remove("active");
          overlay.setAttribute("aria-hidden", "true");
          overlay.removeEventListener("click", close);
          go();
        };
        overlay.addEventListener("click", close);
      } else {
        go();
      }
    });
  }

  function bootR2First() {
    replaceStaticImages();
    bindDetailFlow();
    setTimeout(replaceStaticImages, 100);
    setTimeout(bindDetailFlow, 150);
    setTimeout(replaceStaticImages, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootR2First);
  } else {
    bootR2First();
  }
})();



/* === FINAL DETAIL FIX: R2-first backside toggle === */
(function () {
  const R2_BASE = (window.SITE_CONFIG && window.SITE_CONFIG.r2PublicBase
    ? window.SITE_CONFIG.r2PublicBase
    : "https://pub-12f05472082049758097370dd8aaab52.r2.dev/images").replace(/\/$/, "");

  function r2(path) {
    return `${R2_BASE}/${String(path).replace(/^\/+/, "")}`;
  }

  function setR2First(img, logicalPath) {
    if (!img || !logicalPath) return;
    img.onerror = function () {
      this.onerror = null;
      this.src = `images/${logicalPath}`;
    };
    img.src = r2(logicalPath);
  }

  function getDetailImage() {
    return document.getElementById("detail-image");
  }

  function getToggleButton() {
    return document.getElementById("toggle-back-btn");
  }

  function initDetailImage() {
    const img = getDetailImage();
    const btn = getToggleButton();
    if (!img) return;

    if (!img.dataset.frontLogical) {
      img.dataset.frontLogical =
        img.dataset.frontLogical ||
        img.dataset.frontSrc ||
        img.dataset.frontLogical ||
        "normal/img_product_shiromimi_front_800x800.png";
    }

    if (!img.dataset.side) {
      const current = img.getAttribute("src") || "";
      img.dataset.side = /img_product_shiromimi_eye_800x800\.png/.test(current) ? "back" : "front";
    }

    if (img.dataset.side === "back") {
      setR2First(img, "anomaly1/img_product_shiromimi_eye_800x800.png");
      document.body.classList.add("is-showing-back");
      if (btn) btn.textContent = "表面に戻す";
    } else {
      setR2First(img, img.dataset.frontLogical);
      document.body.classList.remove("is-showing-back");
      if (btn) btn.textContent = "裏面を見る";
    }
  }

  function toggleDetailImage() {
    const img = getDetailImage();
    const btn = getToggleButton();
    if (!img) return;

    if (!img.dataset.frontLogical) {
      img.dataset.frontLogical = "normal/img_product_shiromimi_front_800x800.png";
    }

    const nextSide = img.dataset.side === "back" ? "front" : "back";
    img.dataset.side = nextSide;

    if (nextSide === "back") {
      setR2First(img, "anomaly1/img_product_shiromimi_eye_800x800.png");
      document.body.classList.add("is-showing-back");
      if (window.state) window.state.showingBack = true;
      if (btn) btn.textContent = "表面に戻す";
    } else {
      setR2First(img, img.dataset.frontLogical);
      document.body.classList.remove("is-showing-back");
      if (window.state) window.state.showingBack = false;
      if (btn) btn.textContent = "裏面を見る";
    }
  }

  function goToAnomaly2() {
    const url = new URL(location.href);
    url.searchParams.set("mode", "anomaly2");
    location.href = url.toString();
  }

  function showTransition(next) {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay) {
      if (typeof next === "function") next();
      return;
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");

    const close = function () {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      overlay.removeEventListener("click", close);
      if (typeof next === "function") next();
    };

    overlay.addEventListener("click", close);
  }

  document.addEventListener("click", function (e) {
    const toggle = e.target && e.target.closest ? e.target.closest("#toggle-back-btn") : null;
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleDetailImage();
      return;
    }

    const img = e.target && e.target.closest ? e.target.closest("#detail-image") : null;
    if (img) {
      const mode = (window.state && window.state.mode) || (new URLSearchParams(location.search).get("mode") || "normal");
      if (img.dataset.side !== "back") return;
      if (!(mode === "normal" || mode === "anomaly1")) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (typeof runSiteAlteredOverlay === "function") {
        runSiteAlteredOverlay(goToAnomaly2);
      } else {
        showTransition(goToAnomaly2);
      }
    }
  }, true);

  function boot() {
    initDetailImage();
    setTimeout(initDetailImage, 100);
    setTimeout(initDetailImage, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
