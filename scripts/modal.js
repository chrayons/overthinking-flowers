// scripts/modal.js
(function (global) {
    let _flowers = [];
  
    // Create overlay once
    const overlay = document.createElement("div");
    overlay.id = "mg-modal-overlay";
    overlay.innerHTML = `
      <div id="mg-modal">
        <button id="mg-modal-close" aria-label="Close">×</button>
        <div class="mg-modal-inner">
          <div class="mg-left">
            <div id="mg-flower-host" aria-label="Flower visualization"></div>
          </div>
          <div class="mg-right">
            <div class="mg-meta">
              <div class="mg-category" id="mg-category"></div>
              <blockquote class="mg-quote" id="mg-quote"></blockquote>
              <ul class="mg-stats">
                <li><span class="label">Emotional Intensity</span><span class="value" id="mg-intensity"></span></li>
                <li><span class="label">Dominant Valence</span><span class="value" id="mg-valence"></span></li>
                <li><span class="label">Dominant Emotion</span><span class="value" id="mg-dominant"></span></li>
              </ul>
              <button id="mg-back" class="mg-back">Back</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  
    // 🔒 Hide by default even without CSS
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
  
    // Base rings SVG (inline so we can scale & center it)
    const BASE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 925.22 925.22" aria-hidden="true">
      <g fill="none" stroke="#d1d3d4" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <polyline points="811.95 158.79 463.19 462.83 652.83 42.73" />
        <polyline points="920.28 523.56 463.19 462.83 904.49 323.87" />
        <polyline points="862.53 693.55 463.19 462.83 463.18 923.83" />
        <polyline points="234.5 62.7 462.97 462.08 462.97 462.08 1.96 464.16" />
        <polyline points="462.89 1 463.19 462.83 64.42 694.25 461.81 463.4 463.19 462.83 66.53 227.56" />
        <circle cx="463.19" cy="462.97" r="114.62" stroke-dasharray="1 5"/>
        <circle cx="464.15" cy="461.42" r="230.86" stroke-dasharray="1 5"/>
        <circle cx="464.15" cy="462.57" r="346.61" stroke-dasharray="1 5"/>
        <circle cx="462.61" cy="462.61" r="461.61"/>
      </g>
    </svg>
    `;

    // keep handles so we can clean up on close()
    let _observer = null;
    let _removeResizeListener = null;

    function close() {
      overlay.classList.remove("open");
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    
      // cleanup observers/listeners
      if (_observer) { _observer.disconnect(); _observer = null; }
      if (_removeResizeListener) { _removeResizeListener(); _removeResizeListener = null; }
    
      const host = overlay.querySelector("#mg-flower-host");
      if (host) host.innerHTML = "";
    }    
  
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector("#mg-modal-close").addEventListener("click", close);
    overlay.querySelector("#mg-back").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  
    function openById(id) {
      const key = String(id);
      const f = _flowers.find(x => String(x.id) === key);
      if (!f) {
        console.warn("[Modal] No flower found for id:", id);
      } else {
        open(f);
      }
    }
  
    function open(flower) {
      // fill right panel
      overlay.querySelector("#mg-category").textContent = flower.category || "";
      overlay.querySelector("#mg-quote").textContent = `“${flower.text}”`;
      overlay.querySelector("#mg-intensity").textContent =
        Number.isFinite(flower.emotionalIntensity) ? `${flower.emotionalIntensity}%` : "—";
      overlay.querySelector("#mg-valence").textContent = flower.dominantValence || "—";
      overlay.querySelector("#mg-dominant").textContent = flower.dominantEmotionName || "—";
  
      // render left panel (robust to your current renderer)
const host = overlay.querySelector("#mg-flower-host");
host.innerHTML = "";

try {
  // stage holds both base and flower, perfectly centered
  const stage = document.createElement("div");
  stage.className = "mg-stage";

  // base (behind flower)
  const base = document.createElement("div");
  base.className = "mg-base";
  base.innerHTML = BASE_SVG;

  // where the actual flower goes
  const wrap = document.createElement("div");
  wrap.className = "mg-flower-wrap";

  if (window.FlowerRenderer && typeof window.FlowerRenderer.createFlower === "function") {
    // larger flower in modal
    const el = window.FlowerRenderer.createFlower(flower, {
      width: 480,
      height: 480,
      maxRadius: 180
    });
    // let our wrapper handle positioning
    el.style.position = "static";
    el.style.left = "";
    el.style.top = "";
    wrap.appendChild(el);
  } else {
    wrap.innerHTML = "<p style='opacity:.7'>Flower renderer not loaded.</p>";
  }

  stage.appendChild(base);
stage.appendChild(wrap);
host.appendChild(stage);

// ---- show overlay FIRST so layout is real ----
document.body.style.overflow = "hidden";
overlay.classList.add("open");
overlay.style.display = "flex";
overlay.setAttribute("aria-hidden", "false");

// --- keep base fixed; translate the FLOWER so its origin sits on base center ---
const alignFlowerToBase = () => {
  const svg = wrap.querySelector("svg");
  if (!svg) return;

  // FlowerRenderer origin = width/2, height/2 (no viewBox)
  const w =
    parseFloat(svg.getAttribute("width")) ||
    svg.clientWidth ||
    svg.getBoundingClientRect().width;
  const h =
    parseFloat(svg.getAttribute("height")) ||
    svg.clientHeight ||
    svg.getBoundingClientRect().height;

  const origin = { x: w / 2, y: h / 2 };

  // SVG -> screen
  const pt = svg.createSVGPoint();
  pt.x = origin.x; pt.y = origin.y;
  const originScreen = pt.matrixTransform(svg.getScreenCTM());

  // stage center (== base center)
  const rect = stage.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // move the FLOWER so its true origin lands on the base center
  const dx = cx - originScreen.x;
  const dy = cy - originScreen.y;
  wrap.style.setProperty("--flower-tx", `${dx}px`);
  wrap.style.setProperty("--flower-ty", `${dy}px`);
};

// Run AFTER the modal is visible so sizes are non-zero
requestAnimationFrame(() => {
  alignFlowerToBase();
  _observer = new MutationObserver(alignFlowerToBase);
  _observer.observe(wrap, { attributes: true, childList: true, subtree: true });
  const onResize = () => alignFlowerToBase();
  window.addEventListener("resize", onResize);
  _removeResizeListener = () => window.removeEventListener("resize", onResize);
});



} catch (e) {
  console.error("[Modal] Flower render failed:", e);
  host.innerHTML = "<p style='opacity:.7'>Could not render flower.</p>";
}

  
      // 🔓 Show overlay
      document.body.style.overflow = "hidden";
      overlay.classList.add("open");
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
    }
  
    const Modal = {
      init(flowers) { _flowers = flowers || []; },
      open, openById, close
    };
    global.Modal = Modal;
  })(window);
  
