function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.05
  });

  const elements = document.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => {
    // Check if already in viewport (for anchor navigation)
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      el.classList.add('is-visible');
    } else {
      observer.observe(el);
    }
  });

  // Fallback: reveal all after 2s in case observer fails
  setTimeout(() => {
    document.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(el => {
      el.classList.add('is-visible');
    });
  }, 2000);
}

function initParallax() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const parallaxElements = document.querySelectorAll('.parallax-element[data-parallax]');
  if (parallaxElements.length === 0) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const offset = scrollY * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

function initHeroImageParallax() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const heroSection = document.getElementById('top');
  const heroImage = heroSection?.querySelector('img[alt="Haimiya Mio"]');
  if (!heroImage) return;

  let ticking = false;

  function updateHeroParallax() {
    const rect = heroSection.getBoundingClientRect();
    const scrollProgress = -rect.top / (rect.height + window.innerHeight);
    
    if (scrollProgress >= 0 && scrollProgress <= 1) {
      const translateY = scrollProgress * 100;
      const scale = 1 + scrollProgress * 0.1;
      heroImage.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeroParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

document.addEventListener('astro:after-swap', () => {
  initScrollAnimations();
  initParallax();
  initHeroImageParallax();
});

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initParallax();
  initHeroImageParallax();
});

// Re-check animations on hash change (anchor navigation)
window.addEventListener('hashchange', () => {
  initScrollAnimations();
});