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
  
    // Base rings SVG (inline so we can scale & center it) - boundary lines for emotion sections
    const BASE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 925.22 925.22" aria-hidden="true">
      <g fill="none" stroke="#d1d3d4" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Boundary lines that define emotion section edges -->
        <polyline points="463.19 462.83 463.19 1.22" /> <!-- 0°/360° boundary -->
        <polyline points="463.19 462.83 650.94 41.13" /> <!-- 24° boundary (fear/anger) -->
        <polyline points="463.19 462.83 806.23 153.95" /> <!-- 48° boundary (anger/disgust) -->
        <polyline points="463.19 462.83 902.21 320.18" /> <!-- 72° boundary (disgust/pessimism) -->
        <polyline points="463.19 462.83 922.27 511.08" /> <!-- 96° boundary (pessimism/sadness) -->
        <polyline points="463.19 462.83 862.96 693.63" /> <!-- 120° boundary (sadness/anticipation) -->
        <polyline points="463.19 462.83 463.19 924.44" /> <!-- 180° boundary (anticipation/surprise) -->
        <polyline points="463.19 462.83 63.42 693.63" /> <!-- 240° boundary (surprise/optimism) -->
        <polyline points="463.19 462.83 1.58 462.83" /> <!-- 270° boundary (optimism/joy) -->
        <polyline points="463.19 462.83 63.42 232.02" /> <!-- 300° boundary (joy/love) -->
        <polyline points="463.19 462.83 232.38 63.06" /> <!-- 330° boundary (love/trust) -->
        <!-- Concentric circles -->
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

  // 1) put stage in the DOM first, so it has layout
  stage.appendChild(base);
  stage.appendChild(wrap);
  host.appendChild(stage);

  // 2) show overlay NOW so sizes are non-zero
  document.body.style.overflow = "hidden";
  overlay.classList.add("open");
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");

  // 3) measure stage and compute the correct max radius
  const rect = stage.getBoundingClientRect();
  const stageSize = Math.min(rect.width, rect.height);
  // Outer solid ring should be 100% → radius = stageSize / 2
  const maxRadius = stageSize / 2;

  // 4) create the flower to match the stage
  if (window.FlowerRenderer && typeof window.FlowerRenderer.createFlower === "function") {
    const el = window.FlowerRenderer.createFlower(flower, {
      width: stageSize,
      height: stageSize,
      maxRadius: maxRadius
    });
    el.style.position = "static";
    el.style.left = "";
    el.style.top = "";
    wrap.appendChild(el);

    // --- tooltip pill for hover feedback ---
    const tip = document.createElement("div");
    tip.className = "mg-tooltip";
    tip.style.display = "none";
    stage.appendChild(tip);

    const labelize = (k) => (k ? k.charAt(0).toUpperCase() + k.slice(1) : "");

    // Create overlay layer with matching sector shapes
    const createOverlayLayer = () => {
      const svgEl = wrap.querySelector("svg");
      if (!svgEl) return null;

      const overlayWrap = document.createElement("div");
      overlayWrap.className = "mg-overlay-wrap";
      overlayWrap.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        mix-blend-mode: multiply;
        display: grid;
        place-items: center;
      `;

      // Create an SVG that matches the flower dimensions
      const svgRect = svgEl.getBoundingClientRect();
      const overlaySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      overlaySvg.setAttribute("width", svgRect.width);
      overlaySvg.setAttribute("height", svgRect.height);
      overlaySvg.style.display = "block";

      const centerX = svgRect.width / 2;
      const centerY = svgRect.height / 2;
      const maxRadius = Math.min(centerX, centerY);

      // Helper function to create sector path (same as in flower renderer)
      const describeArc = (cx, cy, r, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        const x1 = cx + r * Math.cos((startAngle - 90) * rad);
        const y1 = cy + r * Math.sin((startAngle - 90) * rad);
        const x2 = cx + r * Math.cos((endAngle - 90) * rad);
        const y2 = cy + r * Math.sin((endAngle - 90) * rad);
        const largeArc = (endAngle - startAngle) <= 180 ? 0 : 1;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      };

      // Create overlay sectors for each emotion
      const emotionAngles = {
        fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
        anticipation: 150, surprise: 210,
        optimism: 255, joy: 285, love: 315, trust: 345
      };

      const neutralEmotions = ['anticipation', 'surprise'];
      const positiveEmotions = ['trust', 'optimism', 'joy', 'love'];
      const negativeEmotions = ['fear', 'disgust', 'anger', 'sadness', 'pessimism'];

      Object.entries(emotionAngles).forEach(([emotion, angle]) => {
        const step =
          neutralEmotions.includes(emotion) ? 60 :
          positiveEmotions.includes(emotion) ? 30 :
          negativeEmotions.includes(emotion) ? 24 : 30;

        const start = angle - step / 2;
        const end = angle + step / 2;

        const sector = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sector.setAttribute("d", describeArc(centerX, centerY, maxRadius, start, end));
        sector.setAttribute("fill", "transparent");
        sector.setAttribute("opacity", "0");
        sector.dataset.emotion = emotion;
        sector.classList.add("mg-overlay-sector");

        overlaySvg.appendChild(sector);
      });

      overlayWrap.appendChild(overlaySvg);
      stage.insertBefore(overlayWrap, wrap);
      return overlayWrap;
    };

    const bindTooltip = () => {
      const svgEl = wrap.querySelector("svg");
      if (!svgEl) return;

      const overlayWrap = createOverlayLayer();
      let currentHover = null;

      svgEl.addEventListener("mouseenter", (e) => {
        if (e.target.classList.contains("mg-sector") || e.target.classList.contains("mg-petal")) {
          const emotion = e.target.dataset.emotion;
          const value = e.target.dataset.value || "0";

          if (emotion && emotion !== currentHover) {
            // Clear all previous overlays first
            if (overlayWrap) {
              overlayWrap.querySelectorAll(".mg-overlay-sector").forEach(sector => {
                sector.setAttribute("fill", "transparent");
                sector.setAttribute("opacity", "0");
              });
            }

            currentHover = emotion;
            const label = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            tip.textContent = `${label}: ${value}%`;
            tip.style.display = "block";

            // Center the tooltip
            tip.style.left = "50%";
            tip.style.top = "50%";
            tip.style.transform = "translate(-50%, -50%)";

            // Show colored overlay for this emotion
            const zones = {
              neg: ["fear", "disgust", "anger", "sadness", "pessimism"],
              pos: ["optimism", "joy", "love", "trust"],
              neu: ["anticipation", "surprise"]
            };

            const colors = {
              neg: "#005BA6", // blue
              pos: "#5EA748", // green
              neu: "#EEDE73"  // yellow
            };

            let zone = "other";
            for (const [zoneName, emotions] of Object.entries(zones)) {
              if (emotions.includes(emotion)) {
                zone = zoneName;
                break;
              }
            }

            if (colors[zone]) {
              // Find the matching overlay sector and color it
              const overlaySector = overlayWrap.querySelector(`.mg-overlay-sector[data-emotion="${emotion}"]`);
              if (overlaySector) {
                overlaySector.setAttribute("fill", colors[zone]);
                overlaySector.setAttribute("opacity", "0.1");
              }
            }
          }
        }
      }, true);

      svgEl.addEventListener("mouseleave", () => {
        currentHover = null;
        tip.style.display = "none";

        // Clear all overlay sectors
        if (overlayWrap) {
          overlayWrap.querySelectorAll(".mg-overlay-sector").forEach(sector => {
            sector.setAttribute("fill", "transparent");
            sector.setAttribute("opacity", "0");
          });
        }
      });
    };
    
    
    

    // --- keep base fixed; translate the FLOWER so its origin sits on base center ---
    const alignFlowerToBase = () => {
      const svg = wrap.querySelector("svg");
      if (!svg) return;

      const w =
        parseFloat(svg.getAttribute("width")) ||
        svg.clientWidth ||
        svg.getBoundingClientRect().width;
      const h =
        parseFloat(svg.getAttribute("height")) ||
        svg.clientHeight ||
        svg.getBoundingClientRect().height;

      const origin = { x: w / 2, y: h / 2 };
      const pt = svg.createSVGPoint();
      pt.x = origin.x; pt.y = origin.y;
      const originScreen = pt.matrixTransform(svg.getScreenCTM());

      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const dx = cx - originScreen.x;
      const dy = cy - originScreen.y;
      wrap.style.setProperty("--flower-tx", `${dx}px`);
      wrap.style.setProperty("--flower-ty", `${dy}px`);
    };

    requestAnimationFrame(() => {
      alignFlowerToBase();
      bindTooltip();
      _observer = new MutationObserver(alignFlowerToBase);
      _observer.observe(wrap, { attributes: true, childList: true, subtree: true });
      const onResize = () => {
        // if the modal can resize, recompute size & re-render once
        const r2 = stage.getBoundingClientRect();
        const size2 = Math.min(r2.width, r2.height);
        if (size2 !== stageSize) {
          wrap.innerHTML = "";
          const el2 = window.FlowerRenderer.createFlower(flower, {
            width: size2,
            height: size2,
            maxRadius: size2 / 2
          });
          el2.style.position = "static";
          wrap.appendChild(el2);
          bindTooltip();
        }
        alignFlowerToBase();
      };
      window.addEventListener("resize", onResize);
      _removeResizeListener = () => window.removeEventListener("resize", onResize);
    });

  } else {
    wrap.innerHTML = "<p style='opacity:.7'>Flower renderer not loaded.</p>";
  }
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
  
