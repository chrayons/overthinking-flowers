// scripts/shuffle.js
(function (global) {
    const CARD_COUNT = 3;
    const SNIPPET_LEN = 70; // PRD ≈ 70 chars
    const recentIds = [];   // simple session buffer to avoid immediate repeats
  
    function sampleThreeUnique(list, bannedIds = new Set()) {
      const pool = list.filter(x => !bannedIds.has(x.id));
      if (pool.length < CARD_COUNT) bannedIds = new Set(); // fallback if pool too small
      const picks = [];
      while (picks.length < CARD_COUNT) {
        const item = (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length ? pool.length : list.length))];
        if (!picks.find(p => p.id === item.id)) picks.push(item);
      }
      return picks;
    }
  
    function clampSnippet(text) {
      const t = text.trim();
      if (t.length <= SNIPPET_LEN) return t;
      // cut on word boundary if possible
      const slice = t.slice(0, SNIPPET_LEN);
      const lastSpace = slice.lastIndexOf(" ");
      return (lastSpace > 28 ? slice.slice(0, lastSpace) : slice) + " …";
    }
  
    function renderCards(flowers) {
      const container = document.getElementById("shuffle-cards");
      if (!container) return;
      container.innerHTML = "";
  
      const banned = new Set(recentIds);
      const picks = sampleThreeUnique(flowers, banned);
  
      // update recent buffer (keep last 9 IDs so immediate reshuffles feel fresh)
      picks.forEach(p => recentIds.push(p.id));
      while (recentIds.length > 9) recentIds.shift();
  
      picks.forEach(f => {
        const card = document.createElement("div");
        card.className = "card";
  
        const text = document.createElement("div");
        text.className = "snippet";
  
        const snippetText = clampSnippet(f.text) + " ";
        const link = document.createElement("a");
        link.textContent = "See the Flower";
        link.href = `#flower-${f.id}`; // scroll to the flower if present
        // shuffle.js – replace the click handler body
        link.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.Modal) {
              Modal.openById(f.id);     // <-- open the modal for THIS metaphor
            }
          });  
  
        text.append(document.createTextNode(snippetText), link);
        card.appendChild(text);
        container.appendChild(card);
      });
    }
  
    function bindButton(flowers) {
      const btn = document.getElementById("shuffle-btn");
      if (btn) btn.addEventListener("click", () => renderCards(flowers));
    }
  
    const Shuffle = {
      init(flowers) {
        bindButton(flowers);
        renderCards(flowers); // initial draw
      },
      refresh(flowers) { renderCards(flowers); }
    };
  
    global.Shuffle = Shuffle;
  })(window);
  
