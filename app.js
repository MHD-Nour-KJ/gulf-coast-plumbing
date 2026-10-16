/**
 * Gulf Coast Plumbing — Main Interactive Application
 * Includes: Parallax Scroll, Services Switcher, Before/After Slider,
 * FAQ Accordion, Instant Quote Calculator, Modal & Drawer Systems.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initParallax();
  initScrollReveals();
  initServicesTabs();
  initBeforeAfterSlider();
  initFaqAccordion();
  if (window.initHairlinePurifier) window.initHairlinePurifier();
  initModalsAndDrawers();
  initQuoteCalculator();
  initButtonSilkObserver();
  initProjectFilter();
  initAnimeEnhancements();
});

/* --------------------------------------------------------------------------
   1. Dynamic Header Scroll & Entrance Jiggly Pop
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.header-glass');
  if (!header) return;

  // Initial load entrance animation: pops out of nothing with jiggly symbol
  requestAnimationFrame(() => {
    setTimeout(() => {
      header.classList.add('header-visible');
    }, 70);
  });

  let lastScrollY = window.scrollY;
  let isHidden = false;
  let popTimeout = null;
  let ticking = false;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    // Glass backdrop / compact styling when scrolled past hero top
    if (currentScrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // Scroll-direction logic (hides when scrolling down, pops back when scrolling up)
    if (currentScrollY > 100 && delta > 8 && !isHidden) {
      // Scrolling down: hide smoothly
      header.classList.add('header-hidden');
      header.classList.remove('header-popping');
      isHidden = true;
    } else if ((delta < -6 || currentScrollY < 60) && isHidden) {
      // Scrolling up or near top: re-appear with modern jiggly pop
      header.classList.remove('header-hidden');
      header.classList.add('header-popping');
      isHidden = false;

      if (popTimeout) clearTimeout(popTimeout);
      popTimeout = setTimeout(() => {
        header.classList.remove('header-popping');
      }, 600);
    }

    lastScrollY = Math.max(0, currentScrollY);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  handleScroll();
}

/* --------------------------------------------------------------------------
   2. Smooth Parallax Scroll (Hero, Full-Width Banners & Card Image Layers)
   -------------------------------------------------------------------------- */
function initParallax() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const heroBg = document.querySelector('.hero-parallax-bg');
  const parallaxBanners = document.querySelectorAll('[data-parallax]');
  const parallaxImages = document.querySelectorAll('[data-parallax-img]');
  const parallaxFloats = document.querySelectorAll('[data-parallax-float]');

  let ticking = false;

  const updateParallax = () => {
    const scrolled = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    // 1. Hero Parallax Background
    if (heroBg && scrolled < viewportHeight * 1.5) {
      const translateY = scrolled * 0.32;
      const subtleScale = 1 + Math.min(0.04, scrolled * 0.00006);
      heroBg.style.transform = `translate3d(0, ${translateY}px, 0) scale(${subtleScale})`;
    }

    // 2. Full-Width Parallax Banners
    parallaxBanners.forEach(el => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= viewportHeight) {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.22');
        const centerOffset = (rect.top + rect.height / 2) - (viewportHeight / 2);
        const translateY = -centerOffset * speed;
        el.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
    });

    // 3. Card Background Images Parallax
    parallaxImages.forEach(el => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= viewportHeight) {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.07');
        const centerOffset = (rect.top + rect.height / 2) - (viewportHeight / 2);
        const translateY = -centerOffset * speed;
        el.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
    });

    // 4. Floating Multiplane Elements (Counter-parallax for 3D depth)
    parallaxFloats.forEach(el => {
      const parent = el.closest('.project-card-wrap') || el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= viewportHeight) {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.035');
        const centerOffset = (rect.top + rect.height / 2) - (viewportHeight / 2);
        const translateY = centerOffset * speed;
        el.style.setProperty('--float-parallax-y', `${translateY}px`);
      }
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

/* --------------------------------------------------------------------------
   2B. Scroll Trigger & Fluid Entrance Intersection Observer
   -------------------------------------------------------------------------- */
function initScrollReveals() {
  const revealElements = document.querySelectorAll(
    '.reveal-generic, .reveal-jiggle, .reveal-pop, .reveal-slide-left, .reveal-slide-right'
  );
  if (!revealElements.length) return;

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Immediate check: elements already above or intersecting the initial viewport fold
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight * 0.94 && rect.bottom > 0) {
      el.classList.add('is-revealed');
    }
  });

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -5% 0px'
  });

  revealElements.forEach(el => {
    if (!el.classList.contains('is-revealed')) {
      observer.observe(el);
    }
  });
}

/* --------------------------------------------------------------------------
   3. Interactive Services Tabs (Reference Image 3)
   -------------------------------------------------------------------------- */
const servicesData = [
  {
    id: 'drain-clearing',
    name: 'Drain & Blockage Clearing',
    title: 'High-Velocity Drain & Hydro-Jetting Solutions',
    desc: 'Stubborn clogs, slow drains, and recurring line blockages cleared swiftly using precision motorized augers and high-pressure hydro-jetting equipment that restores full pipe diameter.',
    img: 'assets/optimized/work_drain.webp',
    ctaText: 'Schedule Drain Clearing'
  },
  {
    id: 'repipe-plumbing',
    name: 'Residential Plumbing & Repipes',
    title: 'Whole-Home Copper & PEX-A Repiping',
    desc: 'Eliminate corroded pinhole leaks, rusty water, and low water pressure. We replace aging polybutylene and galvanized pipes with durable, NSF-certified Uponor PEX-A and Type L copper manifold systems.',
    img: 'assets/optimized/hero_slide1.webp',
    ctaText: 'Explore Whole-Home Repiping'
  },
  {
    id: 'water-heaters',
    name: 'Water Heater Installation & Repairs',
    title: 'Water Heater Installation & Repairs',
    desc: 'Complete residential and commercial water heating solutions. From high-efficiency tankless units to rapid same-day tank replacements with expansion tanks, solid copper connections, and emergency shutoff pans.',
    img: 'assets/optimized/hero_slide2.webp',
    ctaText: 'Discover Water Heaters'
  },
  {
    id: 'sewer-repair',
    name: 'Sewer Repair & Replacement',
    title: 'Precision Sewer Line Excavation & Replacement',
    desc: 'Expert main line excavation, trench repairs, and root mitigation. We replace deteriorated clay and Orangeburg sewer lines with heavy-duty schedule-40 PVC complete with accessible ground-level cleanouts.',
    img: 'assets/optimized/work_sewer.webp',
    ctaText: 'Book Sewer Inspection'
  },
  {
    id: 'water-filtration',
    name: 'Whole-Home Water Filtration',
    title: 'Dual-Stage Water Filtration & Conditioning',
    desc: 'Protect your family and plumbing appliances from Florida hard water, chloramines, and heavy sediment. We install dual-tank whole-home carbon filters and water softeners with custom copper bypass loops.',
    img: 'assets/optimized/work_filtration.webp',
    ctaText: 'Test Your Water Quality'
  },
  {
    id: 'emergency-leak',
    name: '24/7 Emergency Leak Detection',
    title: '24/7 Emergency Leak Detection & Slab Repair',
    desc: 'Available 24 hours a day, 7 days a week. We utilize non-invasive acoustic leak detection and thermal imaging to pinpoint hidden slab leaks, ruptured supply lines, and emergency valve failures with zero delay.',
    img: 'assets/optimized/hero_slide3.webp',
    ctaText: 'Call Emergency Dispatch'
  }
];

function initServicesTabs() {
  const pills = document.querySelectorAll('.service-pill-btn');
  const previewImg = document.getElementById('service-preview-img');
  const previewTitle = document.getElementById('service-preview-title');
  const previewDesc = document.getElementById('service-preview-desc');
  const previewBtn = document.getElementById('service-preview-btn');

  if (!pills.length || !previewImg) return;

  pills.forEach((pill, index) => {
    pill.addEventListener('click', () => {
      // Deactivate all
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const data = servicesData[index];
      if (!data) return;

      // Animate transition
      previewImg.style.opacity = '0.3';
      previewImg.style.transform = 'scale(0.98)';

      setTimeout(() => {
        previewImg.src = data.img;
        previewImg.alt = data.title;
        previewTitle.textContent = data.title;
        previewDesc.textContent = data.desc;
        if (previewBtn) {
          previewBtn.querySelector('.btn-text').textContent = data.ctaText;
        }
        previewImg.style.opacity = '1';
        previewImg.style.transform = 'scale(1)';
      }, 150);
    });
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Before & After Slider (User Specific Request)
   -------------------------------------------------------------------------- */
const baProjects = [
  {
    title: 'Main Sewer Line Replacement',
    location: 'St. Petersburg, FL',
    beforeImg: 'assets/optimized/work_sewer.webp',
    afterImg: 'assets/optimized/hero_slide1.webp',
    beforeNote: 'Cracked, root-invaded clay pipe line causing recurring backups',
    afterNote: 'Seamless Schedule-40 PVC sewer lateral with dual two-way cleanouts'
  },
  {
    title: 'Underfloor Sanitary Stack Overhaul',
    location: 'Tampa, FL',
    beforeImg: 'assets/optimized/work_plumbing.webp',
    afterImg: 'assets/optimized/work_drain.webp',
    beforeNote: 'Corroded cast-iron sanitary branch leaking beneath subfloor',
    afterNote: 'Code-compliant DWV PVC manifold with heavy-duty shielded couplings'
  },
  {
    title: 'Whole-Home Water Treatment Upgrade',
    location: 'Clearwater, FL',
    beforeImg: 'assets/optimized/hero_slide3.webp',
    afterImg: 'assets/optimized/work_filtration.webp',
    beforeNote: 'Hard Florida scale build-up and degraded plumbing supply line',
    afterNote: 'Dual-tank carbon filtration + softener with custom copper loop'
  },
  {
    title: 'Emergency Water Heater Replacement',
    location: 'Pinellas Park, FL',
    beforeImg: 'assets/optimized/work_plumbing.webp',
    afterImg: 'assets/optimized/hero_slide2.webp',
    beforeNote: 'Sediment-choked 50-gal tank leaking at lower seam and rusted fittings',
    afterNote: 'High-efficiency Bradford White water heater with copper expansion loop'
  },
  {
    title: 'Sub-Slab Repipe & DWV Rough-In',
    location: 'Largo, FL',
    beforeImg: 'assets/optimized/work_sewer.webp',
    afterImg: 'assets/optimized/hero_slide3.webp',
    beforeNote: 'Deteriorated subterranean cast-iron line cracked beneath concrete slab',
    afterNote: 'High-grade Schedule-40 DWV piping with precision grade laser leveling'
  }
];

function initBeforeAfterSlider() {
  const sliderBox = document.querySelector('.ba-slider-box');
  const afterWrap = document.querySelector('.ba-after-wrap');
  const handle = document.querySelector('.ba-handle');
  const tabs = document.querySelectorAll('.ba-tab-btn');
  const beforeImgEl = document.getElementById('ba-before-img');
  const afterImgEl = document.getElementById('ba-after-img');
  const projectTitleEl = document.getElementById('ba-project-title');
  const projectNoteEl = document.getElementById('ba-project-note');

  if (!sliderBox || !afterWrap || !handle) return;

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = sliderBox.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    sliderBox.style.setProperty('--ba-split', `${percentage}%`);
    afterWrap.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
    afterWrap.style.webkitClipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
    handle.style.left = `${percentage}%`;
  };

  // Mouse Events
  handle.addEventListener('mousedown', () => { isDragging = true; });
  sliderBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });

  // Touch Events (passive true on start, passive true on move with touch-action: pan-y)
  handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  sliderBox.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches && e.touches[0]) updatePosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchcancel', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches || !e.touches[0]) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });

  // Tab switcher
  if (tabs.length) {
    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const proj = baProjects[idx];
        if (!proj) return;

        if (beforeImgEl) beforeImgEl.src = proj.beforeImg;
        if (afterImgEl) afterImgEl.src = proj.afterImg;
        if (projectTitleEl) projectTitleEl.textContent = proj.title;
        if (projectNoteEl) projectNoteEl.textContent = `${proj.beforeNote} → ${proj.afterNote}`;
      });
    });
  }
}

/* --------------------------------------------------------------------------
   5. Regular Question (FAQ Accordion - Reference Image 5)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const summary = item.querySelector('.faq-summary');
    if (!summary) return;

    summary.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other items
      items.forEach(i => i.classList.remove('active'));
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Modals, Drawer, & Mobile Navigation
   -------------------------------------------------------------------------- */
function initModalsAndDrawers() {
  const drawer = document.getElementById('quick-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const openQuoteBtns = document.querySelectorAll('[data-open-modal="quote"]');
  const toggleDrawerBtn = document.getElementById('btn-grid-drawer');
  const closeDrawerBtn = document.getElementById('btn-close-drawer');

  // Tabs & Views inside the unified panel
  const tabsTrack = document.getElementById('drawer-tabs-track');
  const tabBtns = document.querySelectorAll('[data-drawer-tab]');
  const tabViews = document.querySelectorAll('.drawer-view');
  const switchBtns = document.querySelectorAll('[data-drawer-switch]');

  // Mobile Nav Drawer
  const mobileMenuToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const closeMobileNav = document.getElementById('btn-close-mobile-nav');

  // Switch tabs inside panel with liquid indicator physics
  function switchDrawerTab(targetTab) {
    if (!tabsTrack) return;
    tabsTrack.setAttribute('data-active-tab', targetTab);

    tabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-drawer-tab') === targetTab;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    tabViews.forEach(view => {
      const isMatch = view.id === `drawer-view-${targetTab}`;
      if (isMatch) {
        view.removeAttribute('hidden');
        view.classList.add('active');
      } else {
        view.classList.remove('active');
        view.setAttribute('hidden', '');
      }
    });
  }

  function openDrawer(initialTab = 'dispatch') {
    if (!drawer) return;
    switchDrawerTab(initialTab);
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first interactive control for keyboard accessibility
    setTimeout(() => {
      const focusTarget = initialTab === 'quote'
        ? drawer.querySelector('#drawer-name')
        : drawer.querySelector('.hotline-card-number') || closeDrawerBtn;
      if (focusTarget) focusTarget.focus();
    }, 120);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Quote Button Triggers (open panel directly into quote view)
  openQuoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer('quote');
    });
  });

  // 9-Dot Matrix Button (opens panel into emergency dispatch view)
  if (toggleDrawerBtn) {
    toggleDrawerBtn.addEventListener('click', () => {
      openDrawer('dispatch');
    });
  }

  // Close drawer button
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
  }

  // Close when clicking frosted backdrop
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeDrawer();
      if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
    });
  }

  // Escape key closes drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
    }
  });

  // Tab click listeners with liquid transition
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-drawer-tab');
      if (targetTab) switchDrawerTab(targetTab);
    });
  });

  // In-drawer cross switch buttons (e.g. "Looking for scheduled service? Request quote")
  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-drawer-switch');
      if (targetTab) switchDrawerTab(targetTab);
    });
  });

  // Mobile Nav Drawer
  function closeMobileNavigation() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.remove('open');
    mobileNavDrawer.setAttribute('aria-hidden', 'true');
    if (backdrop && (!drawer || !drawer.classList.contains('open'))) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.add('open');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  if (closeMobileNav && mobileNavDrawer) {
    closeMobileNav.addEventListener('click', closeMobileNavigation);
  }

  // Handle in-page hash links with smooth scroll; allow standard page navigation without interference
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        mobileLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        closeMobileNavigation();
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Instant Quote Calculator & Form Handling
   -------------------------------------------------------------------------- */
function initQuoteCalculator() {
  const forms = document.querySelectorAll('form[data-quote-form]');
  const drawer = document.getElementById('quick-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value || 'Customer';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const service = form.querySelector('[name="service"]')?.value || 'Plumbing Service';

      // Feedback display
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="btn-text">✓ Request Dispatched!</span>`;
      btn.style.backgroundColor = '#16a34a';

      setTimeout(() => {
        alert(`Thank you, ${name}! Your request for "${service}" has been received. Our on-duty master plumber will call or text you at ${phone} within 15 minutes.`);
        form.reset();
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        if (drawer && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          drawer.setAttribute('aria-hidden', 'true');
          if (backdrop) backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      }, 400);
    });
  });
}

/* --------------------------------------------------------------------------
   8. Button Surrounding Silk Line In-Viewport Trigger (Mobile & Viewport Intersection)
   -------------------------------------------------------------------------- */
function initButtonSilkObserver() {
  const buttons = document.querySelectorAll('.btn-pill-cta, .btn-pill-translucent');
  if (!buttons.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const btn = entry.target;
      if (entry.isIntersecting) {
        btn.classList.add('silk-active');
        // Let it run for 3.5s to trace around button
        setTimeout(() => {
          btn.classList.remove('silk-active');
        }, 3500);
      } else {
        btn.classList.remove('silk-active');
      }
    });
  }, {
    threshold: 0.5
  });

  buttons.forEach(btn => observer.observe(btn));
}

/* --------------------------------------------------------------------------
   9. Category Filter for Projects Page
   -------------------------------------------------------------------------- */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const projectCards = document.querySelectorAll('.project-catalog-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category') || '';
        const match = filterCategory === 'all' || cardCategory.includes(filterCategory);

        if (match) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            if (!btn.classList.contains('active') || btn.getAttribute('data-filter') !== filterCategory) return;
            card.style.display = 'none';
          }, 180);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   10. Anime.js Micro-Animations & Counter Enhancements
   -------------------------------------------------------------------------- */
function initAnimeEnhancements() {
  if (typeof anime === 'undefined') return;

  // Smooth number counter for metric stats when revealed
  const counters = document.querySelectorAll('[data-counter-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetVal = parseFloat(el.getAttribute('data-counter-target') || '0');
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const prefix = el.getAttribute('data-counter-prefix') || '';

          anime({
            targets: { val: 0 },
            val: targetVal,
            round: 1,
            easing: 'easeOutExpo',
            duration: 1600,
            update: function(anim) {
              el.textContent = prefix + Math.round(anim.animations[0].currentValue) + suffix;
            }
          });
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => counterObserver.observe(c));
  }
}

