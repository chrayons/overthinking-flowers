// scripts/shuffle.js
(function (global) {
    const recentIds = [];   // simple session buffer to avoid immediate repeats
    let currentPicks = [];  // store current cards to avoid regenerating on resize

    // Track all seen metaphors across sessions using localStorage
    const SEEN_KEY = 'shuffle-seen-metaphors';
    let seenIds = new Set();

    // Load previously seen IDs from localStorage
    try {
        const stored = localStorage.getItem(SEEN_KEY);
        if (stored) {
            seenIds = new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Could not load seen metaphors from storage:', e);
        seenIds = new Set();
    }

    // Cache for text measurements to avoid DOM manipulation on repeated calls
    const measureCache = new Map();

    // getCardCount removed - CSS now handles responsive visibility

    // Save seen IDs to localStorage
    function saveSeenIds() {
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify([...seenIds]));
        } catch (e) {
            console.warn('Could not save seen metaphors to storage:', e);
        }
    }

    // Reset seen metaphors (useful if user wants to start fresh)
    function resetSeenMetaphors() {
        seenIds.clear();
        saveSeenIds();
        console.log('Shuffle history reset - all metaphors will be treated as unseen');
    }

    function sampleUnique(list, cardCount, bannedIds = new Set()) {
        // Separate unseen from seen metaphors
        const unseen = list.filter(x => !bannedIds.has(x.id) && !seenIds.has(x.id));
        const seen = list.filter(x => !bannedIds.has(x.id) && seenIds.has(x.id));

        const picks = [];

        // Strategy: Prioritize unseen, then fall back to seen, then to banned if needed
        let primaryPool = unseen;
        let secondaryPool = seen;
        let tertiaryPool = list; // includes banned as last resort

        // First, try to fill from unseen metaphors
        while (picks.length < cardCount && primaryPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * primaryPool.length);
            const item = primaryPool[randomIndex];

            if (!picks.find(p => p.id === item.id)) {
                picks.push(item);
            }

            // Remove from pool to avoid duplicates
            primaryPool.splice(randomIndex, 1);
        }

        // If we need more, use seen metaphors
        while (picks.length < cardCount && secondaryPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * secondaryPool.length);
            const item = secondaryPool[randomIndex];

            if (!picks.find(p => p.id === item.id)) {
                picks.push(item);
            }

            secondaryPool.splice(randomIndex, 1);
        }

        // Last resort: use any available metaphor (including recently banned)
        while (picks.length < cardCount && tertiaryPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * tertiaryPool.length);
            const item = tertiaryPool[randomIndex];

            if (!picks.find(p => p.id === item.id)) {
                picks.push(item);
            }

            tertiaryPool.splice(randomIndex, 1);
        }

        return picks;
    }
  
    function clampSnippetToFit(text, maxWidth, maxHeight = 52) {
      // Check cache first
      const key = text + '|' + maxWidth + '|' + maxHeight;
      if (measureCache.has(key)) {
        return measureCache.get(key);
      }

      // Create a temporary element that exactly matches the card styling
      const measureEl = document.createElement('span');
      measureEl.style.visibility = 'hidden';
      measureEl.style.position = 'absolute';
      measureEl.style.top = '-9999px';
      measureEl.style.width = maxWidth + 'px';
      measureEl.style.fontFamily = '"Satoshi-Italic", system-ui';
      measureEl.style.fontSize = '16px';
      measureEl.style.fontWeight = '400';
      measureEl.style.fontStyle = 'italic';
      measureEl.style.lineHeight = '1.3';
      measureEl.style.overflow = 'hidden';
      measureEl.style.wordWrap = 'break-word';
      measureEl.style.boxSizing = 'border-box';
      document.body.appendChild(measureEl);

      // First, check if the complete text + quotes + "See the Flower" fits without truncation
      measureEl.textContent = `"${text}" See the Flower`;
      if (measureEl.offsetHeight <= maxHeight) {
        document.body.removeChild(measureEl);
        const result = { text: text, needsTruncation: false };
        measureCache.set(key, result);
        return result;
      }

      // If full text doesn't fit, find the maximum that fits with quotes + "... See the Flower"
      const suffix = `"... See the Flower`;

      // Use a more aggressive approach - test larger chunks
      let bestFit = "";
      let testLength = text.length;

      // Start from full text and work backwards in larger steps
      while (testLength > 0) {
        const testText = text.slice(0, testLength);
        measureEl.textContent = `"${testText}` + suffix;

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
          measureEl.textContent = `"${testText}` + suffix;

          if (measureEl.offsetHeight <= maxHeight) {
            bestFit = testText;
            break;
          }
        }
      }

      document.body.removeChild(measureEl);
      const result = { text: bestFit.trim(), needsTruncation: true };
      measureCache.set(key, result);
      return result;
    }
  
    function generateNewCards(flowers) {
      const maxCards = 3; // Always generate 3 cards regardless of screen size
      const banned = new Set(recentIds);
      const picks = sampleUnique(flowers, maxCards, banned);

      // Mark picked metaphors as seen
      picks.forEach(p => {
          seenIds.add(p.id);
          recentIds.push(p.id);
      });

      // Save to localStorage
      saveSeenIds();

      // Keep recent buffer (last 9 IDs) for immediate repeat prevention
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

        // Create metaphor span with CSS-defined styling
        const metaphorSpan = document.createElement("span");
        metaphorSpan.className = "metaphor-text";

        // Only add "..." if the text was actually truncated
        if (result.needsTruncation) {
          metaphorSpan.textContent = `"${result.text}..." `;
        } else {
          metaphorSpan.textContent = `"${result.text}" `;
        }

        const link = document.createElement("a");
        link.textContent = "See the Flower";
        link.href = `#flower-${f.id}`;
        // Note: No click event needed on link since card handles it

        text.appendChild(metaphorSpan);
        text.appendChild(link);
        card.appendChild(text);
        container.appendChild(card);
      });

      // Content is immediately visible for better mobile performance
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
        let touchResetTimeout = null;

        // Simple touch handling - always turn blue on touchstart, always reset on touchend
        btn.addEventListener("touchstart", (e) => {
          // Clear any pending timeout
          if (touchResetTimeout) {
            clearTimeout(touchResetTimeout);
            touchResetTimeout = null;
          }

          // Always add the class on touch start
          btn.classList.add("touch-active");
        }, { passive: true });

        btn.addEventListener("touchend", (e) => {
          // Clear any existing timeout
          if (touchResetTimeout) {
            clearTimeout(touchResetTimeout);
          }

          // Always schedule removal after delay
          touchResetTimeout = setTimeout(() => {
            btn.classList.remove("touch-active");
            touchResetTimeout = null;
          }, 150);
        }, { passive: true });

        // Handle click (works for both mouse and touch)
        btn.addEventListener("click", () => generateNewCards(flowers));

        // Prevent focus on mouse but keep for keyboard
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
        });

        // Clear touch state on mouse enter (desktop)
        btn.addEventListener("mouseenter", () => {
          if (touchResetTimeout) {
            clearTimeout(touchResetTimeout);
            touchResetTimeout = null;
          }
          btn.classList.remove("touch-active");
        });

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
      refresh(flowers) { generateNewCards(flowers); },
      resetHistory() { resetSeenMetaphors(); }
    };
  
    global.Shuffle = Shuffle;
  })(window);
  
