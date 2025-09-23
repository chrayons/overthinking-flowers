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
  
    function clampSnippetToFit(text, maxWidth, maxHeight = 52) {
      // Create a temporary element that exactly matches the card styling
      const measureEl = document.createElement('span');
      measureEl.style.visibility = 'hidden';
      measureEl.style.position = 'absolute';
      measureEl.style.top = '-9999px';
      measureEl.style.width = maxWidth + 'px';
      measureEl.style.fontFamily = '"Satoshi-Light", system-ui';
      measureEl.style.fontSize = '16px';
      measureEl.style.fontWeight = '400';
      measureEl.style.lineHeight = '1.3';
      measureEl.style.overflow = 'hidden';
      measureEl.style.wordWrap = 'break-word';
      measureEl.style.boxSizing = 'border-box';
      document.body.appendChild(measureEl);

      // First, check if the complete text + "See the Flower" fits without truncation
      measureEl.textContent = text + " See the Flower";
      if (measureEl.offsetHeight <= maxHeight) {
        document.body.removeChild(measureEl);
        return { text: text, needsTruncation: false };
      }

      // If full text doesn't fit, find the maximum that fits with "... See the Flower"
      const suffix = "... See the Flower";

      // Use a more aggressive approach - test larger chunks
      let bestFit = "";
      let testLength = text.length;

      // Start from full text and work backwards in larger steps
      while (testLength > 0) {
        const testText = text.slice(0, testLength);
        measureEl.textContent = testText + " " + suffix;

        if (measureEl.offsetHeight <= maxHeight) {
          bestFit = testText;
          break;
        }

        // Reduce by word boundaries for more natural cuts
        const lastSpace = testText.lastIndexOf(" ");
        if (lastSpace > 0) {
          testLength = lastSpace;
        } else {
          testLength = Math.floor(testLength * 0.8); // Reduce by 20% if no spaces
        }
      }

      // If we still don't have a fit, fall back to character-by-character
      if (!bestFit) {
        for (let i = text.length; i > 0; i--) {
          const testText = text.slice(0, i);
          measureEl.textContent = testText + " " + suffix;

          if (measureEl.offsetHeight <= maxHeight) {
            bestFit = testText;
            break;
          }
        }
      }

      document.body.removeChild(measureEl);
      return { text: bestFit.trim(), needsTruncation: true };
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

        // Make entire card clickable
        card.style.cursor = "pointer";
        card.addEventListener("click", (e) => {
          e.preventDefault();
          if (window.Modal) {
            Modal.openById(f.id);
          }
        });

        // Calculate available width and height: 320px card width, 52px height
        const availableWidth = 296;
        const availableHeight = 52;
        const result = clampSnippetToFit(f.text, availableWidth, availableHeight);

        const text = document.createElement("span");
        text.className = "snippet";
        text.style.overflow = "hidden";
        text.style.lineHeight = "1.3";

        // Only add "..." if the text was actually truncated
        if (result.needsTruncation) {
          text.textContent = result.text + "... ";
        } else {
          text.textContent = result.text + " ";
        }

        const link = document.createElement("a");
        link.textContent = "See the Flower";
        link.href = `#flower-${f.id}`;
        // Note: No click event needed on link since card handles it

        text.appendChild(link);
        card.appendChild(text);
        container.appendChild(card);
      });
    }
  
    function updateButtonText() {
      const btn = document.getElementById("shuffle-btn");
      if (!btn) return;

      // Check if we're on mobile (775px breakpoint matches CSS)
      const isMobile = window.innerWidth <= 775;
      btn.textContent = isMobile ? "Reveal Another" : "Shuffle Thoughts";
    }

    function bindButton(flowers) {
      const btn = document.getElementById("shuffle-btn");
      if (btn) {
        btn.addEventListener("click", () => generateNewCards(flowers));

        // Set initial text
        updateButtonText();

        // Update text on resize
        window.addEventListener("resize", updateButtonText);
      }
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
  
