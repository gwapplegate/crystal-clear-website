/* Crystal Clear Window Cleaning — scroll interactions */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('icon-menu-open');
  const menuIconClose = document.getElementById('icon-menu-close');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuIconOpen.classList.toggle('hidden', isOpen);
      menuIconClose.classList.toggle('hidden', !isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav shrink / solidify on scroll ---------- */
  const nav = document.getElementById('site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll reveal animations ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) {
      gsap.set('.reveal, .reveal-scale, .reveal-left, .reveal-right', { opacity: 1, x: 0, y: 0, scale: 1 });
    } else {
      /* Simple fade/rise reveals, grouped so siblings inside the same
         [data-stagger] container animate in sequence. */
      const groups = document.querySelectorAll('[data-stagger]');
      groups.forEach((group) => {
        const items = group.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
        gsap.to(items, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: group,
            start: 'top 82%',
            once: true,
          },
        });
      });

      /* Ungrouped reveal elements (not inside a [data-stagger] wrapper) */
      const ungrouped = document.querySelectorAll(
        '.reveal:not([data-stagger] .reveal), .reveal-scale:not([data-stagger] .reveal-scale), .reveal-left:not([data-stagger] .reveal-left), .reveal-right:not([data-stagger] .reveal-right)'
      );
      ungrouped.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      });

      /* Subtle hero parallax */
      const heroImg = document.querySelector('[data-parallax]');
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroImg,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      /* Numeric count-up for stat figures marked with [data-count-to] */
      document.querySelectorAll('[data-count-to]').forEach((el) => {
        const target = parseFloat(el.getAttribute('data-count-to'));
        const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const counter = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              val: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = counter.val.toFixed(decimals) + suffix;
              },
            });
          },
        });
      });
    }
  } else {
    /* GSAP failed to load (offline, blocked CDN, etc.) — show content anyway */
    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
});
