/**
 * Nour KJ - Signature Floating Orb to Thick Pill Component
 * Design Direction: Variation 3 (Pro Architect)
 * Portfolio: https://nourkj-portfolio.vercel.app
 */
(function() {
  if (document.getElementById('nkj-watermark-root')) return;

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'nkj-watermark-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

    #nkj-watermark-root {
      position: fixed;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      transition: bottom 0.3s ease;
    }

    .nkj-pill-badge {
      pointer-events: auto;
      cursor: pointer;
      user-select: none;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      background: #000000;
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85),
                  inset 0 1px 0 rgba(255, 255, 255, 0.28);
      border-radius: 9999px;
      height: 52px;
      width: 52px;
      padding: 0;
      overflow: hidden;
      box-sizing: border-box;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  padding 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nkj-pill-badge:hover,
    .nkj-pill-badge.is-expanded {
      width: 374px;
      max-width: calc(100vw - 28px);
      height: 62px;
      padding: 6px 10px;
      border-color: rgba(255, 255, 255, 0.38);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.95),
                  0 0 25px rgba(255, 255, 255, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }

    /* Inverted White Circular Badge */
    .nkj-badge-disc {
      width: 50px;
      height: 50px;
      min-width: 50px;
      background: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.45);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }

    .nkj-pill-badge:hover .nkj-badge-disc,
    .nkj-pill-badge.is-expanded .nkj-badge-disc {
      width: 46px;
      height: 46px;
      min-width: 46px;
      transform: scale(0.96);
    }

    .nkj-badge-disc svg {
      width: 24px;
      height: 24px;
      display: block;
    }

    /* Expanded Content */
    .nkj-pill-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.96) translateX(4px);
      transition: opacity 0.35s 0.1s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.4s 0.1s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 0 4px 0 10px;
      white-space: nowrap;
      overflow: hidden;
    }

    .nkj-pill-badge:hover .nkj-pill-content,
    .nkj-pill-badge.is-expanded .nkj-pill-content {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1) translateX(0);
    }

    .nkj-text-col {
      display: flex;
      flex-direction: column;
      text-align: left;
      overflow: hidden;
      padding-right: 8px;
    }

    .nkj-sub-kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1.2;
      margin-bottom: 2px;
    }

    .nkj-headline {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .nkj-cta-btn {
      background: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.24);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 9999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }

    .nkj-cta-btn:hover {
      background: #ffffff;
      color: #000000;
      border-color: #ffffff;
      transform: scale(1.04);
    }

    @media (max-width: 400px) {
      .nkj-sub-kicker {
        display: none;
      }
      .nkj-headline {
        font-size: 12px;
      }
      .nkj-cta-btn {
        padding: 6px 10px;
        font-size: 9px;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Inject DOM Element
  const root = document.createElement('div');
  root.id = 'nkj-watermark-root';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Creator Watermark');

  root.innerHTML = `
    <div class="nkj-pill-badge" id="nkj-pill-element" tabindex="0">
      <div class="nkj-badge-disc" title="Nour KJ">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0H7.071L14.829 7.757L7.757 14.829L5 12.071V24H0Z M19 0H24V24H16.929L9.171 16.243L16.243 9.171L19 11.929Z"/>
        </svg>
      </div>
      <div class="nkj-pill-content">
        <div class="nkj-text-col">
          <span class="nkj-sub-kicker">Web Experience</span>
          <span class="nkj-headline">Crafted by Nour KJ</span>
        </div>
        <a href="https://nourkj-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" class="nkj-cta-btn" id="nkj-portfolio-link">
          Portfolio <span>&nearr;</span>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // 3. Setup Interaction Logic
  const pill = document.getElementById('nkj-pill-element');
  const link = document.getElementById('nkj-portfolio-link');

  let isHovered = false;
  let isAtBottom = false;

  function updateExpandedState() {
    if (isHovered || isAtBottom) {
      pill.classList.add('is-expanded');
    } else {
      pill.classList.remove('is-expanded');
    }
  }

  // Adjust bottom clearance if client website has a mobile call dock
  function adjustMobileClearance() {
    const callDock = document.querySelector('.call-dock, .mobile-dock, .fixed-bottom-bar');
    if (callDock && window.innerWidth <= 768) {
      root.style.bottom = '76px';
    } else {
      root.style.bottom = '22px';
    }
  }
  adjustMobileClearance();
  window.addEventListener('resize', adjustMobileClearance, { passive: true });

  // Hover triggers (PC / Laptop / Tablet cursor)
  pill.addEventListener('mouseenter', function() {
    isHovered = true;
    updateExpandedState();
  });

  pill.addEventListener('mouseleave', function() {
    isHovered = false;
    updateExpandedState();
  });

  // Touch / Click toggle on mobile or collapsed state
  pill.addEventListener('click', function(e) {
    if (e.target.closest('#nkj-portfolio-link')) return;

    if (!pill.classList.contains('is-expanded')) {
      e.preventDefault();
      pill.classList.add('is-expanded');
    } else {
      window.open('https://nourkj-portfolio.vercel.app', '_blank', 'noopener,noreferrer');
    }
  });

  // Click outside collapses if not at bottom of page
  document.addEventListener('click', function(e) {
    if (!root.contains(e.target) && !isAtBottom) {
      pill.classList.remove('is-expanded');
    }
  });

  // Scroll detection: checks when the user reaches the end of the website
  function checkScrollEnd() {
    const scrollPos = window.innerHeight + window.scrollY;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );

    // Trigger within 70px of the page bottom
    if (documentHeight - scrollPos <= 70) {
      if (!isAtBottom) {
        isAtBottom = true;
        updateExpandedState();
      }
    } else {
      if (isAtBottom) {
        isAtBottom = false;
        updateExpandedState();
      }
    }
  }

  window.addEventListener('scroll', checkScrollEnd, { passive: true });
  window.addEventListener('resize', checkScrollEnd, { passive: true });

  // Initial check in case page is short
  setTimeout(checkScrollEnd, 600);
})();
