// scripts/shuffle.js
(function (global) {
    const recentIds = [];   // simple session buffer to avoid immediate repeats
    let currentPicks = [];  // store current cards to avoid regenerating on resize

    // getCardCount removed - CSS now handles responsive visibility
  
    function sampleUnique(list, cardCount, bannedIds = new Set()) {
      const pool = list.filter(x => !bannedIds.has(x.id));
      if (pool.length < cardCount) bannedIds = new Set(); // fallback if pool too small
      const picks = [];
      while (picks.length < cardCount) {
        const item = (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length ? pool.length : list.length))];
        if (!picks.find(p => p.id === item.id)) picks.push(item);
      }
      return picks;
    }
  
    function clampSnippetToFit(text, maxWidth) {
      const suffix = "... See the Flower";
      const availableWidth = maxWidth;

      // Create a temporary element to measure text width
      const measureEl = document.createElement('span');
      measureEl.style.visibility = 'hidden';
      measureEl.style.position = 'absolute';
      measureEl.style.whiteSpace = 'nowrap';
      measureEl.style.font = window.getComputedStyle(document.body).font;
      document.body.appendChild(measureEl);

      // Measure suffix width
      measureEl.textContent = suffix;
      const suffixWidth = measureEl.offsetWidth;

      // Available width for the main text
      const textMaxWidth = availableWidth - suffixWidth;

      // Binary search to find the maximum text that fits
      let left = 0;
      let right = text.length;
      let bestFit = "";

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const testText = text.slice(0, mid);

        measureEl.textContent = testText;
        const testWidth = measureEl.offsetWidth;

        if (testWidth <= textMaxWidth) {
          bestFit = testText;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Cut on word boundary if possible
      const lastSpace = bestFit.lastIndexOf(" ");
      if (lastSpace > bestFit.length * 0.7) { // Only cut on space if it's not too far back
        bestFit = bestFit.slice(0, lastSpace);
      }

      document.body.removeChild(measureEl);
      return bestFit.trim();
    }
  
    function generateNewCards(flowers) {
      const maxCards = 3; // Always generate 3 cards regardless of screen size
      const banned = new Set(recentIds);
      const picks = sampleUnique(flowers, maxCards, banned);

      // update recent buffer (keep last 9 IDs so immediate reshuffles feel fresh)
      picks.forEach(p => recentIds.push(p.id));
      while (recentIds.length > 9) recentIds.shift();

      currentPicks = picks;
      displayCards();
    }

    function displayCards() {
      const container = document.getElementById("shuffle-cards");
      if (!container) return;
      container.innerHTML = "";

      // Always show all 3 cards - CSS will hide/show them responsively
      currentPicks.forEach((f, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.cardIndex = index; // Add index for CSS targeting

        // Calculate available width: 320px card - 24px padding = 296px
        const availableWidth = 296;
        const clampedText = clampSnippetToFit(f.text, availableWidth);

        const text = document.createElement("span");
        text.className = "snippet";
        text.style.whiteSpace = "nowrap";
        text.style.overflow = "hidden";

        text.textContent = clampedText + "... ";

        const link = document.createElement("a");
        link.textContent = "See the Flower";
        link.href = `#flower-${f.id}`;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.Modal) {
              Modal.openById(f.id);
            }
          });

        text.appendChild(link);
        card.appendChild(text);
        container.appendChild(card);
      });
    }
  
    function bindButton(flowers) {
      const btn = document.getElementById("shuffle-btn");
      if (btn) btn.addEventListener("click", () => generateNewCards(flowers));
    }
  
    const Shuffle = {
      init(flowers) {
        bindButton(flowers);
        generateNewCards(flowers); // initial draw - CSS handles responsive behavior
      },
      refresh(flowers) { generateNewCards(flowers); }
    };
  
    global.Shuffle = Shuffle;
  })(window);
  
