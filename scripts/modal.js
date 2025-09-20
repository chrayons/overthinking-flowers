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
  
    function close() {
      overlay.classList.remove("open");
      overlay.style.display = "none";            // hide no matter what
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      // optional: clear the left panel
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
        if (window.FlowerRenderer && typeof window.FlowerRenderer.createFlower === "function") {
          // Create a much larger flower for the modal (480x480 instead of default 80x80)
          const el = window.FlowerRenderer.createFlower(flower, {
            width: 480,
            height: 480,
            maxRadius: 180
          });
          el.style.position = "static";
          el.style.left = "";
          el.style.top = "";
          host.appendChild(el);
        } else {
          host.innerHTML = "<p style='opacity:.7'>Flower renderer not loaded.</p>";
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
  
