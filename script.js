/* ============================================================
   Ejay Aguirre — Site Scripts
   Theme toggle (with crossfade), nav, mobile menu,
   scroll animations, scroll progress, cursor spotlight
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const html    = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────────
  // Logo src-swap (light ↔ dark via data attributes)
  // ─────────────────────────────────────────────
  const updateLogos = (theme) => {
    document.querySelectorAll('[data-dark][data-light]').forEach(img => {
      img.src = theme === 'dark' ? img.dataset.dark : img.dataset.light;
    });
  };

  // ─────────────────────────────────────────────
  // Theme Toggle (with smooth crossfade)
  // ─────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle');
  const stored   = localStorage.getItem('theme');

  const applyTheme = (theme, animate) => {
    if (animate && !prefersReducedMotion) {
      document.body.classList.add('theme-transitioning');
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 250);
    }
    html.setAttribute('data-theme', theme);
    updateLogos(theme);
  };

  if (stored) {
    applyTheme(stored, false);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark', false);
  }

  themeBtn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    localStorage.setItem('theme', next);
  });

  // ─────────────────────────────────────────────
  // Cursor Spotlight (dark mode hero, rAF throttled)
  // ─────────────────────────────────────────────
  const spotlight = document.getElementById('cursor-spotlight');
  const hero      = document.getElementById('hero');

  if (spotlight && hero && !prefersReducedMotion) {
    let rafId = null;
    let pendingX = null;
    let pendingY = null;

    const updateSpotlight = () => {
      if (pendingX !== null) {
        spotlight.style.setProperty('--spotlight-x', pendingX + 'px');
        spotlight.style.setProperty('--spotlight-y', pendingY + 'px');
        pendingX = null;
      }
      rafId = null;
    };

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      if (!rafId) rafId = requestAnimationFrame(updateSpotlight);
    });

    hero.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
  }

  // ─────────────────────────────────────────────
  // Scroll Progress Bar
  // ─────────────────────────────────────────────
  const progressBar = document.getElementById('scroll-progress');
  const updateProgress = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };

  // ─────────────────────────────────────────────
  // Navbar scroll effect
  // ─────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateProgress();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─────────────────────────────────────────────
  // Mobile menu toggle
  // ─────────────────────────────────────────────
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  const closeMobileMenu = () => {
    mobileBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  mobileBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active', isOpen);
    mobileBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

  // ─────────────────────────────────────────────
  // Scroll-triggered animations (IntersectionObserver)
  // ─────────────────────────────────────────────
  if (!prefersReducedMotion) {
    // Only animate cards/items — NOT section headings (they should always be visible)
    const targets = document.querySelectorAll(
      '.highlight-card, .about-text, .contact-card, .timeline-item, .edu-card, .achievement-item'
    );
    targets.forEach(el => el.classList.add('animate-on-scroll'));

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 35, 200)}ms`;
      observer.observe(el);
    });
  }

  // ─────────────────────────────────────────────
  // Smooth scroll for anchor links
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ─────────────────────────────────────────────
  // Active nav link highlight on scroll
  // ─────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 130) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.style.color = isActive ? 'var(--accent)' : '';
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();
});
