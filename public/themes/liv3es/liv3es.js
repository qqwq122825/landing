(() => {
  'use strict';

  // The shared renderer sets a theme <base>; keep these links on this project or preview.
  for (const link of document.querySelectorAll('a[href^="#"]:not(.download-link)')) {
    const page = new URL(location.href);
    page.hash = link.getAttribute('href');
    link.href = page.href;
  }

  const header = document.getElementById('site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.documentElement.classList.add('reveal-enabled');
  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
    observer.observe(element);
  });
})();
