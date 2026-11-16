/* =========================================================
   Анімації: GSAP + ScrollTrigger + Lenis.
   Без бібліотек або з prefers-reduced-motion сайт працює статично,
   а «стрижка» логотипа просто йде за прокруткою.
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sheet = $('#services');

  // прогрес «стрижки»: від початку сторінки, доки прайс-аркуш не дійде до верху
  function trimProgress() { var h = window.innerHeight; return Math.min(1, Math.max(0, 1 - sheet.getBoundingClientRect().top / h)); }

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.add('reduced');
    var onS = function () { if (window.FUR) window.FUR.set(trimProgress()); };
    window.addEventListener('scroll', onS, { passive: true }); onS();
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: 'power3.out', duration: 1 });

  if (window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var inHero = function (el) { return !!el.closest('.hero'); };

  /* ---------- вхід: шерсть «виростає», текст і шкала з'являються ---------- */
  var intro = gsap.timeline({ delay: 0.1 });
  intro
    .from('.nav', { yPercent: -100, autoAlpha: 0, duration: 1, clearProps: 'transform,opacity,visibility' }, 0)
    .from('.eyebrow', { y: 20, autoAlpha: 0 }, 0.15)
    .from('#furBox', { scale: 0.86, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.1)
    .from('.hero__lead, .hero__cta > *', { y: 30, autoAlpha: 0, stagger: 0.08 }, 0.45)
    .from('.today', { y: 20, autoAlpha: 0 }, 0.7)
    .from('.hero__hint', { autoAlpha: 0, duration: 1.2 }, 1.1);
  gsap.from('.today__open', { scaleX: 0, duration: 1.4, ease: 'expo.out', delay: 0.9 });

  /* ---------- скрол: стрижка логотипа + hero відходить під аркуш ---------- */
  ST.create({
    trigger: sheet, start: 'top bottom', end: 'top top', scrub: true,
    onUpdate: function (self) { if (window.FUR) window.FUR.set(self.progress); }
  });
  gsap.to('.hero__in', { scale: 0.93, yPercent: -6, autoAlpha: 0.35, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top 70%', end: 'top top', scrub: true } });
  gsap.from('.sheet__handle', { scaleX: 0.2, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 40%', scrub: true } });

  /* ---------- текст: розбивка на слова ---------- */
  function splitWords(el) { el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' '); }
  var wordTweens = [];
  function animateWords() {
    wordTweens.forEach(function (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); });
    wordTweens = $$('[data-anim="words"]').map(function (el) {
      splitWords(el);
      return gsap.fromTo($$('.w', el), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: true } });
    });
  }
  animateWords();
  document.addEventListener('langchange', function () { animateWords(); requestAnimationFrame(function () { ST.refresh(); }); });

  /* ---------- заголовки рядками, блоки знизу ---------- */
  $$('[data-anim="lines"]').forEach(function (el) {
    if (inHero(el)) return;
    gsap.from($$('.line > span', el), { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  var fades = $$('[data-anim="fade"]').filter(function (el) { return !inHero(el); });
  gsap.set(fades, { y: 40, autoAlpha: 0 });
  ST.batch(fades, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1, overwrite: true }); } });

  /* ---------- прайс ---------- */
  function rows(list) { gsap.fromTo(list, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.8, overwrite: true }); }
  var prows = $$('#priceList .prow');
  gsap.set(prows, { y: 30, autoAlpha: 0 });
  ST.batch(prows, { start: 'top 94%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9 }); } });

  /* ---------- процес ---------- */
  gsap.from('.steps__card', { y: 60, autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
  $$('.step').forEach(function (s) { gsap.from($$('.step__n, h3, p', s), { y: 40, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: s, start: 'top 88%' } }); });
  gsap.from('.perks li', { y: 30, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: '.perks', start: 'top 90%' } });

  /* ---------- галерея ---------- */
  function revealItems(items, instant) {
    items.forEach(function (it, i) {
      var img = $('img', it);
      var tl = gsap.timeline(instant ? { delay: i * 0.06 } : { scrollTrigger: { trigger: it, start: 'top 92%' }, delay: (i % 3) * 0.08 });
      tl.fromTo(it, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.45 }, { scale: 1.08, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0.1)
        .from($('.gitem__cap', it), { y: 30, autoAlpha: 0, duration: 0.8 }, 0.7);
    });
  }
  revealItems($$('#galleryGrid .gitem'));
  function swapGallery(grid, render) {
    gsap.to($$('.gitem', grid), { y: 20, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in',
      onComplete: function () { render(); revealItems($$('.gitem', grid), true); ST.refresh(); } });
  }

  /* ---------- хайлайти ---------- */
  gsap.from('.hl__list li', { scale: 0.5, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: '.hl', start: 'top 80%' } });

  /* ---------- запис ---------- */
  gsap.from('.grp', { y: 40, autoAlpha: 0, stagger: 0.1, scrollTrigger: { trigger: '.composer', start: 'top 85%' } });
  gsap.from('.chat', { y: 60, rotate: 2, autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: '.composer', start: 'top 80%' } });

  /* ---------- карта: пунктир малюється, шпилька падає ---------- */
  var path = $('#mapPath');
  if (path && path.getTotalLength) {
    var L = path.getTotalLength(), svgNS = 'http://www.w3.org/2000/svg', svg = path.ownerSVGElement;
    var defs = document.createElementNS(svgNS, 'defs'), mask = document.createElementNS(svgNS, 'mask'), mp = document.createElementNS(svgNS, 'path');
    mask.setAttribute('id', 'mapMask'); mp.setAttribute('d', path.getAttribute('d'));
    mp.setAttribute('stroke', '#fff'); mp.setAttribute('stroke-width', '10'); mp.setAttribute('fill', 'none');
    mp.style.strokeDasharray = L; mp.style.strokeDashoffset = L;
    mask.appendChild(mp); defs.appendChild(mask); svg.insertBefore(defs, svg.firstChild);
    path.setAttribute('mask', 'url(#mapMask)');
    var tl = gsap.timeline({ scrollTrigger: { trigger: '#map', start: 'top 75%', end: 'center 45%', scrub: 1 } });
    tl.to(mp, { strokeDashoffset: 0, ease: 'none' });
    gsap.from('#mapPin', { y: -60, autoAlpha: 0, duration: 1, ease: 'bounce.out', scrollTrigger: { trigger: '#map', start: 'center 70%' } });
  }

  /* ---------- футер ---------- */
  gsap.from('.foot__big', { yPercent: 70, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* ---------- курсор і магнітні кнопки ---------- */
  var cursor = $('#cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' }), cy = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', function (e) { cursor.classList.toggle('is-on', !!e.target.closest('.gitem')); });
  }
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
      b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)', overwrite: true }); });
    });
  }

  /* ---------- API для app.js ---------- */
  var curtainEl = $('#curtain'), curtainBusy = false;
  window.MOTION = {
    curtain: function (cb) {
      if (!curtainEl || curtainBusy) { cb(); return; }
      curtainBusy = true;
      gsap.timeline({ onComplete: function () { curtainBusy = false; gsap.set(curtainEl, { visibility: 'hidden' }); } })
        .set(curtainEl, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' })
        .to(curtainEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.inOut' })
        .add(function () { cb(); })
        .to(curtainEl, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.65, ease: 'expo.inOut' }, '+=0.08');
    },
    bump: function (el) { gsap.fromTo(el, { scale: 1.18 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .5)' }); },
    shake: function (el) { gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, .3)' }); },
    swapText: function (el, fill) { gsap.to(el, { y: -8, autoAlpha: 0, duration: 0.2, onComplete: function () { fill(); gsap.fromTo(el, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }); } }); },
    rows: rows,
    swapGallery: swapGallery,
    pop: function (els) { gsap.fromTo(els, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, stagger: 0.012, duration: 0.45, ease: 'back.out(2)' }); },
    lbOpen: function (lb) {
      gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo($('.lightbox__in', lb), { y: 60, clipPath: 'inset(10% 6% 10% 6%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' });
      gsap.fromTo($$('.lightbox__meta > *', lb), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, delay: 0.2, duration: 0.7 });
    },
    lbClose: function (lb, done) { gsap.to(lb, { autoAlpha: 0, duration: 0.35, ease: 'power2.in', onComplete: function () { gsap.set(lb, { clearProps: 'all' }); done(); } }); },
    lbSwap: function (fill) {
      var img = $('#lbImg');
      gsap.to([img, '#lbTitle', '#lbText'], { autoAlpha: 0, duration: 0.2, onComplete: function () {
        fill();
        gsap.fromTo(img, { scale: 1.08, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(['#lbTitle', '#lbText'], { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6 });
      } });
    }
  };
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
