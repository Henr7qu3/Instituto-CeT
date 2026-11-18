const header = document.querySelector('.site-header');
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
const mobile = matchMedia('(max-width: 880px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
}

function syncMenu() {
  if (!mobile.matches && document.activeElement === toggle) {
    sectionLinks[0].focus();
  }
  setMenu(false);
  toggle.hidden = !mobile.matches;
}

header.classList.add('menu-ready');
syncMenu();
mobile.addEventListener('change', syncMenu);

toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') === 'false');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});

document.addEventListener('click', event => {
  if (!header.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') {
    if (menu.contains(document.activeElement)) toggle.focus();
    setMenu(false);
  }
});

header.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !mobile.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

  const destination = document.querySelector(link.hash);
  setMenu(false);
  destination.setAttribute('tabindex', '-1');
  destination.focus({ preventScroll: true });
});

let pending = false;

function updateCurrentSection() {
  const marker = header.offsetHeight + 70;
  const current = sections.findLastIndex(section => section.getBoundingClientRect().top <= marker);
  sectionLinks.forEach((link, index) => {
    if (index === Math.max(0, current)) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  pending = false;
}

function requestSectionUpdate() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(updateCurrentSection);
}

updateCurrentSection();
window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', requestSectionUpdate);

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('reveal-in');
      observer.unobserve(target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(item => observer.observe(item));
}
