// scripts/modal.js
console.log('Modal.js script is loading...');
try {
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
              <!-- Container 1: Category and Metaphor -->
              <div class="mg-text-container">
                <div class="mg-text-left">
                  <div class="mg-category" id="mg-category"></div>
                  <blockquote class="mg-quote" id="mg-quote"></blockquote>
                </div>
                <div class="mg-text-right">
                  <!-- Stats for mobile only -->
                  <ul class="mg-stats mg-stats-mobile">
                    <li><span class="label">Emotional Intensity</span><span class="value" id="mg-intensity-mobile"></span></li>
                    <li><span class="label">Dominant Valence</span><span class="value" id="mg-valence-mobile"></span></li>
                    <li><span class="label">Dominant Emotion</span><span class="value" id="mg-dominant-mobile"></span></li>
                  </ul>
                </div>
              </div>

              <!-- Container 2: Stats for desktop -->
              <ul class="mg-stats mg-stats-desktop">
                <li><span class="label">Emotional Intensity</span><span class="value" id="mg-intensity"></span></li>
                <li><span class="label">Dominant Valence</span><span class="value" id="mg-valence"></span></li>
                <li><span class="label">Dominant Emotion</span><span class="value" id="mg-dominant"></span></li>
              </ul>

              <!-- Container 3: Back Button -->
              <button id="mg-back" class="btn-back">Back</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wait for DOM to be ready before appending to body
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(overlay);
      });
    }
  
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
    let _modalResizeListener = null;

    // Valence UI helpers
    function getModalFlowerHost() {
      // Order matters: list your actual element IDs/classes here
      return (
        document.querySelector('#mg-flower-host') ||
        document.querySelector('.modal-flower') ||
        document.querySelector('.modal-visual') ||
        document.querySelector('.modal-left .flower-wrap') ||
        document.querySelector('.modal-left') ||
        document.querySelector('.modal-top') ||
        document.querySelector('.modal-body') // last-resort fallback
      );
    }

    // 1) Map emotions → valence buckets (adjust keys to match your data)
    const VALENCE_BUCKET = {
      fear:'neg', disgust:'neg', anger:'neg', sadness:'neg', pessimism:'neg',
      anticipation:'neu', surprise:'neu',
      optimism:'pos', joy:'pos', love:'pos', trust:'pos'
    };

    // 2) Compute per-flower % totals by valence (integer percent)
    function computeValenceSummaryForFlower(flower) {
      const src = flower.emotions || flower.metrics || flower.scores || {};
      const totals = { pos: 0, neu: 0, neg: 0, sum: 0 };
      for (const [k, v] of Object.entries(src)) {
        const val = Number(v) || 0;
        if (!val) continue;
        const b = VALENCE_BUCKET[k];
        if (b) { totals[b] += val; totals.sum += val; }
      }
      const pct = z => totals.sum ? Math.round((totals[z] / totals.sum) * 100) : 0;
      return { pos: pct('pos'), neu: pct('neu'), neg: pct('neg') };
    }

    // 3) Build the valence UI (chips + centered tooltip)
    function buildValenceDom() {
      const wrap = document.createElement('div');
      wrap.className = 'modal-valence';
      wrap.innerHTML = `
        <div class="modal-valence__row" role="group" aria-label="Valence">
          <button type="button" class="valence-chip" data-zone="pos" aria-label="Positive">Positive</button>
          <button type="button" class="valence-chip" data-zone="neu" aria-label="Neutral">Neutral</button>
          <button type="button" class="valence-chip" data-zone="neg" aria-label="Negative">Negative</button>
        </div>
        <div class="valence-center-tip" hidden></div>
      `;
      return wrap;
    }

    function zoneLabel(z){ return z==='pos' ? 'Positive' : z==='neu' ? 'Neutral' : 'Negative'; }

    // 4) Wire hover to show "{Zone}: {X}% of Emotional Intensity" in the center
    function wireValenceHandlers(container, summary, stage) {
      const tip = container.querySelector('.valence-center-tip');
      const chips = container.querySelectorAll('.valence-chip');

      // Move tooltip to stage for proper centering over the flower
      if (stage && tip) {
        stage.appendChild(tip);
      }

      chips.forEach(chip => {
        chip.addEventListener('mouseenter', () => {
          const z = chip.dataset.zone;            // 'pos' | 'neu' | 'neg'
          const pct = summary[z] ?? 0;
          tip.innerHTML = `${zoneLabel(z)}: ${pct}%<br>of Emotional Intensity`;
          tip.hidden = false;
        });
        chip.addEventListener('mouseleave', () => {
          tip.hidden = true;
        });
        // keyboard focus parity
        chip.addEventListener('focus', () => chip.dispatchEvent(new Event('mouseenter')));
        chip.addEventListener('blur',  () => chip.dispatchEvent(new Event('mouseleave')));
      });
    }

    function attachValenceToFlowerArea(flower) {
      const host = getModalFlowerHost();
      if (!host) return;

      // remove any prior valence block (navigating between flowers)
      host.querySelectorAll('.modal-valence').forEach(n => n.remove());

      const block = buildValenceDom();
      host.appendChild(block);

      // Find the stage element to position tooltip relative to it
      const stage = host.querySelector('.mg-stage');
      const summary = computeValenceSummaryForFlower(flower);
      wireValenceHandlers(block, summary, stage);
    }

    function teardownValenceInModal() {
      document.querySelectorAll('.modal-valence').forEach(n => n.remove());
    }

    function close() {
      overlay.classList.remove("open");
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");

      // Clean up valence UI
      teardownValenceInModal();

      // Set cooldown to prevent immediate flower interactions after modal close
      // Delay slightly to avoid blocking the closing tap itself
      setTimeout(() => {
        if (window.FlowerInteractions && window.FlowerInteractions.setModalCloseTime) {
          window.FlowerInteractions.setModalCloseTime();
        }
      }, 50); // 50ms delay

      // cleanup observers/listeners
      if (_observer) { _observer.disconnect(); _observer = null; }
      if (_removeResizeListener) { _removeResizeListener(); _removeResizeListener = null; }
      if (_modalResizeListener) {
        window.removeEventListener("resize", _modalResizeListener);
        _modalResizeListener = null;
      }

      const host = overlay.querySelector("#mg-flower-host");
      if (host) host.innerHTML = "";
    }    
  
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector("#mg-modal-close").addEventListener("click", close);
    overlay.querySelector("#mg-back").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  
    function adjustMetaphorFontSize(quoteElement) {
      // Use mobile-style modal for both 1-2-1-2-1 layout (≤1160px) and mobile (≤775px)
      const useMobileModal = window.innerWidth <= 1160;

      if (useMobileModal) {
        // Mobile-style modal: left container max 200px width, font sizes: 16pt, 12pt, 8pt
        quoteElement.style.width = "200px";
        quoteElement.style.height = "120px"; // Keep height for measurement
        quoteElement.style.overflow = "hidden";
        quoteElement.style.display = "flex";
        quoteElement.style.alignItems = "flex-start"; // Top-aligned
        quoteElement.style.justifyContent = "flex-start";
        quoteElement.style.textAlign = "left";

        const mobileFontSizes = [16, 12, 8];

        // Removed setTimeout - do synchronously
        let bestSize = 8; // fallback

        for (const size of mobileFontSizes) {
          quoteElement.style.font = `italic ${size}pt/1.2 'Satoshi-Italic', system-ui`;

          // Force layout recalculation
          quoteElement.offsetHeight;

          // Check if text fits within mobile container
          if (quoteElement.scrollHeight <= 120 && quoteElement.scrollWidth <= 200) {
            bestSize = size;
            break;
          }
        }

        // Apply the best fitting size
        quoteElement.style.font = `italic ${bestSize}pt/1.2 'Satoshi-Italic', system-ui`;

        // Now set height to hug content
        quoteElement.style.height = "auto";

        console.log('Mobile font sizing result:', {
          text: quoteElement.textContent.substring(0, 50) + '...',
          finalSize: bestSize + 'pt',
          containerSize: '200px × auto'
        });

      } else {
        // Desktop: 296px × 144px container, font sizes: 32pt, 24pt, 16pt, 12pt
        quoteElement.style.width = "296px";
        quoteElement.style.height = "144px"; // Keep height for measurement
        quoteElement.style.overflow = "hidden";
        quoteElement.style.display = "flex";
        quoteElement.style.alignItems = "flex-start"; // Top-aligned
        quoteElement.style.justifyContent = "flex-start";
        quoteElement.style.textAlign = "left";

        const desktopFontSizes = [32, 24, 16, 12];

        // Removed setTimeout - do synchronously
        let bestSize = 12; // fallback

        for (const size of desktopFontSizes) {
          quoteElement.style.font = `italic ${size}pt/1.2 'Satoshi-Italic', system-ui`;

          // Force layout recalculation
          quoteElement.offsetHeight;

          // Check if text fits within desktop container
          if (quoteElement.scrollHeight <= 144 && quoteElement.scrollWidth <= 296) {
            bestSize = size;
            break;
          }
        }

        // Apply the best fitting size
        quoteElement.style.font = `italic ${bestSize}pt/1.2 'Satoshi-Italic', system-ui`;

        // Now set height to hug content
        quoteElement.style.height = "auto";

        console.log('Desktop font sizing result:', {
          text: quoteElement.textContent.substring(0, 50) + '...',
          finalSize: bestSize + 'pt',
          containerSize: '296px × auto'
        });
      }
    }

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

      const quoteElement = overlay.querySelector("#mg-quote");
      quoteElement.textContent = `"${flower.text}"`;

      // Populate desktop stats
      overlay.querySelector("#mg-intensity").textContent =
        Number.isFinite(flower.emotionalIntensity) ? `${Math.round(flower.emotionalIntensity)}%` : "—";
      overlay.querySelector("#mg-valence").textContent = flower.dominantValence || "—";
      overlay.querySelector("#mg-dominant").textContent = flower.dominantEmotionName || "—";

      // Populate mobile stats (same data)
      overlay.querySelector("#mg-intensity-mobile").textContent =
        Number.isFinite(flower.emotionalIntensity) ? `${Math.round(flower.emotionalIntensity)}%` : "—";
      overlay.querySelector("#mg-valence-mobile").textContent = flower.dominantValence || "—";
      overlay.querySelector("#mg-dominant-mobile").textContent = flower.dominantEmotionName || "—";
  
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

  // 2) prepare overlay for measurement (hidden initially)
  overlay.style.display = "flex";
  overlay.style.visibility = "hidden"; // Hidden but in layout for measurements

  // Prepare font sizing function (will be called later with flower positioning)
  const setupFontSizing = () => {
    const quoteElement = overlay.querySelector("#mg-quote");
    if (quoteElement) {
      adjustMetaphorFontSize(quoteElement);

      // Track current breakpoint state to only update when it actually changes
      let currentlyMobile = window.innerWidth <= 1160;

      // Add resize listener that only triggers when crossing the 1160px breakpoint
      _modalResizeListener = () => {
        const nowMobile = window.innerWidth <= 1160;
        if (nowMobile !== currentlyMobile) {
          currentlyMobile = nowMobile;
          adjustMetaphorFontSize(quoteElement);
        }
        // Prevent any other resize-triggered font adjustments within the same mode
        // Desktop has fixed 296px width so no recalculation needed during desktop resize
      };
      window.addEventListener("resize", _modalResizeListener);
    }
  };

  // 3) use fixed size instead of measuring stage
  const fixedSize = 247;
  const maxRadius = fixedSize / 2;

  // 4) create the flower at fixed size
  if (window.FlowerRenderer && typeof window.FlowerRenderer.createFlower === "function") {
    const el = window.FlowerRenderer.createFlower(flower, {
      width: fixedSize,
      height: fixedSize,
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

      // Create an SVG with fixed dimensions
      const overlaySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      overlaySvg.setAttribute("width", 247);
      overlaySvg.setAttribute("height", 247);
      overlaySvg.style.display = "block";

      const centerX = 247 / 2;
      const centerY = 247 / 2;
      const maxRadius = 247 / 2;

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

    // Create fade overlay layer on top of everything
    const createFadeOverlay = () => {
      const svgEl = wrap.querySelector("svg");
      if (!svgEl) return null;

      const fadeWrap = document.createElement("div");
      fadeWrap.className = "mg-fade-wrap";
      fadeWrap.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 10;
        pointer-events: none;
        display: grid;
        place-items: center;
        opacity: 0;
        transition: opacity 0.2s ease;
      `;

      // Create an SVG with fixed dimensions
      const fadeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      fadeSvg.setAttribute("width", 247);
      fadeSvg.setAttribute("height", 247);
      fadeSvg.style.display = "block";

      const centerX = 247 / 2;
      const centerY = 247 / 2;
      const maxRadius = 247 / 2;

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

      // Create fade sectors for each emotion (everything except active one will be white)
      // Reduce radius to keep outer circle border visible
      const fadeRadius = maxRadius - 2; // Subtract stroke width (2px)

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
        sector.setAttribute("d", describeArc(centerX, centerY, fadeRadius, start, end));
        sector.setAttribute("fill", "#F8F8FF"); // Primary background fade color
        sector.setAttribute("opacity", "0.75"); // 75% opacity
        sector.dataset.emotion = emotion;
        sector.classList.add("mg-fade-sector");

        fadeSvg.appendChild(sector);
      });

      fadeWrap.appendChild(fadeSvg);
      stage.appendChild(fadeWrap); // On top of everything
      return fadeWrap;
    };

    const bindTooltip = () => {
      const svgEl = wrap.querySelector("svg");
      if (!svgEl) return;

      const overlayWrap = createOverlayLayer();
      const fadeWrap = createFadeOverlay();
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
            tip.textContent = `${label}: ${Math.round(parseFloat(value) || 0)}%`;
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

            // Show fade overlay and hide the active sector
            if (fadeWrap) {
              fadeWrap.style.opacity = "1"; // Show the fade overlay

              // First, restore all fade sectors to visible
              fadeWrap.querySelectorAll(".mg-fade-sector").forEach(sector => {
                sector.style.opacity = "0.75";
              });

              // Then hide only the active sector so it doesn't get faded
              const activeFadeSector = fadeWrap.querySelector(`.mg-fade-sector[data-emotion="${emotion}"]`);
              if (activeFadeSector) {
                activeFadeSector.style.opacity = "0";
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

        // Hide fade overlay and restore all sectors
        if (fadeWrap) {
          fadeWrap.style.opacity = "0"; // Hide the fade overlay

          // Restore all fade sectors
          fadeWrap.querySelectorAll(".mg-fade-sector").forEach(sector => {
            sector.style.opacity = "0.75";
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
      // Do ALL positioning and sizing in one frame
      setupFontSizing(); // Font sizing first
      alignFlowerToBase(); // Then flower positioning
      bindTooltip(); // Then tooltip setup

      _observer = new MutationObserver(alignFlowerToBase);
      _observer.observe(wrap, { attributes: true, childList: true, subtree: true });

      // No resize handler needed - flower is fixed size
      _removeResizeListener = () => {}; // Empty function for compatibility

      // 🔓 Show overlay AFTER everything is positioned AND sized
      overlay.style.visibility = "visible"; // Make visible
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");

      // Add valence UI after flower is fully rendered and positioned
      attachValenceToFlowerArea(flower);
    });

  } else {
    wrap.innerHTML = "<p style='opacity:.7'>Flower renderer not loaded.</p>";

    // Show overlay even if flower fails (but still do font sizing)
    requestAnimationFrame(() => {
      setupFontSizing(); // Do font sizing even without flower
      overlay.style.visibility = "visible";
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");

      // Add valence UI even if flower failed to render
      attachValenceToFlowerArea(flower);
    });
  }
} catch (e) {
  console.error("[Modal] Flower render failed:", e);
  host.innerHTML = "<p style='opacity:.7'>Could not render flower.</p>";

  // Show overlay even if flower fails (but still do font sizing)
  requestAnimationFrame(() => {
    setupFontSizing(); // Do font sizing even without flower
    overlay.style.visibility = "visible";
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");

    // Add valence UI even in catch block
    attachValenceToFlowerArea(flower);
  });
}
    }
  
    const Modal = {
      init(flowers) { _flowers = flowers || []; },
      open, openById, close
    };
    global.Modal = Modal;
    console.log('Modal.js script loaded successfully. Modal object created:', Modal);
  })(window);
} catch (error) {
  console.error('Error in modal.js:', error);
  console.error('Error stack:', error.stack);
}
  
