import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ————————————————— Lenis smooth scroll ————————————————— */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.8 });
      }
    });
  });
}

/* ————————————————— Custom cursor ————————————————— */
if (!isTouch && !reduced) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  });

  document.querySelectorAll('[data-cursor], a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

/* ————————————————— Hero intro + parallax ————————————————— */
if (!reduced) {
  const heroTitles = document.querySelectorAll('[data-hero-title]');
  const heroLines = document.querySelectorAll('[data-hero-line]');
  const heroMedia = document.querySelector('[data-hero-media]');

  gsap.set(heroTitles, { yPercent: 112 });
  gsap.set(heroLines, { opacity: 0, y: 24 });

  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .fromTo(heroMedia, { scale: 1.18, filter: 'brightness(0.2)' }, { scale: 1, filter: 'brightness(1)', duration: 2.2, ease: 'power2.out' })
    .to(heroTitles, { yPercent: 0, duration: 1.6, stagger: 0.16 }, '-=1.5')
    .to(heroLines, { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 }, '-=0.9');

  gsap.to(heroMedia, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('[data-hero-content]', {
    yPercent: -12,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ————————————————— Marquee ————————————————— */
if (!reduced) {
  const inner = document.querySelector('[data-marquee]');
  if (inner) {
    const tween = gsap.to(inner, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
    // Nudge speed with scroll velocity for a lively feel
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 900, 3);
        gsap.to(tween, { timeScale: 1 + v, duration: 0.4, overwrite: true });
      },
    });
  }
}

/* ————————————————— Manifesto word reveal ————————————————— */
document.querySelectorAll('[data-words]').forEach((el) => {
  const wrapWords = (node, accent) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((piece) => {
      if (/^\s+$/.test(piece) || piece === '') {
        frag.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.className = accent ? 'word accent' : 'word';
        span.textContent = piece;
        frag.appendChild(span);
      }
    });
    return frag;
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      el.replaceChild(wrapWords(node, false), node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const frag = wrapWords(node, node.classList.contains('accent'));
      el.replaceChild(frag, node);
    }
  });

  if (!reduced) {
    gsap.to(el.querySelectorAll('.word'), {
      opacity: 1,
      stagger: 0.06,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
    });
  }
});

/* ————————————————— Generic fades ————————————————— */
if (!reduced) {
  gsap.utils.toArray('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });
}

/* ————————————————— Image reveals (clip) ————————————————— */
if (!reduced) {
  gsap.utils.toArray('[data-reveal-img]').forEach((el) => {
    const inner = el.querySelector('img');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 82%' },
      defaults: { ease: 'power4.out', duration: 1.7 },
    });
    tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)' })
      .to(inner, { scale: 1 }, 0);
  });
}

/* ————————————————— Parallax layers ————————————————— */
if (!reduced) {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0');
    gsap.to(el, {
      yPercent: speed,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const visitBg = document.querySelector('[data-visit-bg]');
  if (visitBg) {
    gsap.fromTo(visitBg, { yPercent: -10 }, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}

/* ————————————————— Image expansion ————————————————— */
if (!reduced) {
  const stage = document.querySelector('[data-expand-stage]');
  const frame = document.querySelector('[data-expand-frame]');
  const word = document.querySelector('[data-expand-word]');
  if (stage && frame) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=160%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });
    tl.fromTo(frame,
      { width: '34vw', height: '42vh' },
      { width: '100vw', height: '100vh', ease: 'power1.inOut' }
    )
      .fromTo(frame.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'power1.inOut' }, 0)
      .fromTo(word, { opacity: 0.9, letterSpacing: '0em' }, { opacity: 1, letterSpacing: '0.06em', ease: 'none' }, 0);
  }
}

/* ————————————————— Services hover preview ————————————————— */
if (!isTouch && !reduced) {
  const menu = document.querySelector('[data-menu]');
  const preview = document.querySelector('[data-menu-preview]');
  if (menu && preview) {
    const imgs = preview.querySelectorAll('[data-preview-img]');
    const px = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' });

    menu.addEventListener('mousemove', (e) => {
      const r = menu.getBoundingClientRect();
      px(e.clientX - r.left + 36);
      py(e.clientY - r.top - 160);
    });
    menu.querySelectorAll('[data-menu-row]').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        imgs.forEach((im, i) => im.classList.toggle('is-active', i === +row.dataset.index));
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      });
    });
    menu.addEventListener('mouseleave', () => {
      gsap.to(preview, { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power3.out' });
    });
  }
}

/* ————————————————— Voices horizontal scrub ————————————————— */
if (!reduced) {
  const track = document.querySelector('[data-voices-track]');
  if (track) {
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.voices',
        start: 'top top',
        end: () => `+=${getDistance()}`,
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}

/* ————————————————— Refresh after assets load ————————————————— */
window.addEventListener('load', () => ScrollTrigger.refresh());
