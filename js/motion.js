/* =========================================================
   Анімації: GSAP + ScrollTrigger + Lenis (плавний скрол).
   Якщо бібліотеки не завантажились або користувач вимкнув
   анімації в системі — сторінка працює статично.
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var loader = $('#loader');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.add('reduced');
    if (loader) loader.remove();
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: 'power3.out', duration: 1 });

  /* ---------- плавний скрол ---------- */
  if (window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var inHero = function (el) { return !!el.closest('.hero'); };

  /* ---------- розбивка тексту на слова ---------- */
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  }
  $$('[data-anim="words"]').forEach(splitWords);

  /* ---------- початкові стани (сторінку поки що закриває прелоадер) ---------- */
  var heroLines = $$('.hero .line > span');
  var heroFades = $$('.hero [data-anim="fade"]');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(heroFades, { y: 30, autoAlpha: 0 });
  gsap.set('#heroImg', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('#heroImg img', { scale: 1.35 });
  gsap.set('.seal', { scale: 0, rotate: -90 });
  gsap.set('.hero__media figcaption', { autoAlpha: 0 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });

  /* ---------- прелоадер → вхід у hero ---------- */
  var intro = gsap.timeline({ paused: true });
  intro
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' }, 0)
    .to('#heroImg', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .to('#heroImg img', { scale: 1, duration: 2, ease: 'expo.out' }, 0.2)
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: 1, clearProps: 'transform,opacity,visibility' }, 0.4)
    .to(heroFades, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 1 }, 0.5)
    .to('.seal', { scale: 1, rotate: 0, duration: 1.4, ease: 'elastic.out(1, .6)' }, 0.9)
    .to('.hero__media figcaption', { autoAlpha: 1, duration: .8 }, 1.1);

  if (loader) {
    loader.style.animation = 'none';
    if (window.lenis) window.lenis.stop();
    var letters = $$('.loader__word span', loader);
    gsap.timeline({ onComplete: function () { loader.remove(); if (window.lenis) window.lenis.start(); } })
      .from(letters, { yPercent: 120, duration: 0.9, stagger: 0.05, ease: 'expo.out' })
      .to('.loader__line i', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.2)
      .to(letters, { yPercent: -120, duration: 0.6, stagger: 0.03, ease: 'expo.in' }, '+=0.15')
      .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '-=0.25')
      .add(function () { intro.play(); }, '-=0.75');
  } else intro.play();

  /* ---------- hero: паралакс при скролі ---------- */
  gsap.to('#heroImg img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- заголовки: рядки виїжджають з-під маски ---------- */
  $$('[data-anim="lines"]').forEach(function (el) {
    if (inHero(el)) return;
    gsap.from($$('.line > span', el), { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- плавна поява блоків ---------- */
  var fades = $$('[data-anim="fade"]').filter(function (el) { return !inHero(el); });
  gsap.set(fades, { y: 40, autoAlpha: 0 });
  ST.batch(fades, { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1, overwrite: true }); } });

  /* ---------- фото: «шторка» + зум ---------- */
  $$('[data-anim="reveal"]').forEach(function (el) {
    var img = $('img', el);
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
    tl.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from(img, { scale: 1.4, duration: 2, ease: 'expo.out' }, 0.1);
  });
  $$('[data-parallax]').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -(+img.dataset.parallax) }, { yPercent: +img.dataset.parallax, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- «Про студію»: слова проявляються в такт скролу ---------- */
  var wordTweens = [];
  function animateWords() {
    wordTweens.forEach(function (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); });
    wordTweens = $$('[data-anim="words"]').map(function (el) {
      return gsap.fromTo($$('.w', el), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true } });
    });
  }
  animateWords();
  // після зміни мови: розбити новий текст на слова й перебудувати тригери
  document.addEventListener('langchange', function () {
    $$('[data-anim="words"]').forEach(splitWords);
    animateWords();
    requestAnimationFrame(function () { ST.refresh(); });
  });

  /* ---------- біжучий рядок: швидкість і напрям залежать від скролу ---------- */
  var mq = $('#marquee');
  if (mq) {
    var loop = gsap.to(mq, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    var dir = 1;
    ST.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        dir = self.direction;
        var v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
        gsap.to(loop, { timeScale: dir * (1 + v), duration: 0.3, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3, overwrite: false });
      }
    });
    gsap.from('.marquee span', { yPercent: 100, autoAlpha: 0, stagger: 0.03, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.marquee', start: 'top 92%' } });
  }

  /* ---------- прайс ---------- */
  function rows(list) { gsap.fromTo(list, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.8, overwrite: true }); }
  var prows = $$('#priceList .prow');
  gsap.set(prows, { y: 30, autoAlpha: 0 });
  ST.batch(prows, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9 }); } });

  /* ---------- процес: горизонтальний скрол із закріпленням ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var sec = $('.process'), track = $('#processTrack');
    sec.classList.add('is-pinned');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.fromTo('#processBar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, scrub: true } });
    $$('.pstep', track).forEach(function (st) {
      gsap.from($$('.pstep__n, h3, p', st), { y: 60, autoAlpha: 0, stagger: 0.08, duration: 1, scrollTrigger: { trigger: st, containerAnimation: tween, start: 'left 85%' } });
    });
    gsap.from('.process__head .label, .process__head h2', { y: 50, autoAlpha: 0, stagger: 0.1, scrollTrigger: { trigger: sec, start: 'top 75%' } });
    return function () { sec.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); };
  });
  mm.add('(max-width: 900px)', function () {
    var track = $('#processTrack'), bar = $('#processBar');
    var on = function () { var max = track.scrollWidth - track.clientWidth; gsap.to(bar, { scaleX: max > 0 ? Math.max(0.2, track.scrollLeft / max) : 1, duration: 0.3 }); };
    track.addEventListener('scroll', on, { passive: true }); on();
    gsap.from('.pstep', { x: 60, autoAlpha: 0, stagger: 0.1, scrollTrigger: { trigger: track, start: 'top 85%' } });
    return function () { track.removeEventListener('scroll', on); };
  });

  /* ---------- галерея ---------- */
  function revealItems(items, instant) {
    items.forEach(function (it, i) {
      var img = $('img', it);
      var tl = gsap.timeline(instant ? { delay: i * 0.06 } : { scrollTrigger: { trigger: it, start: 'top 90%' }, delay: (i % 3) * 0.08 });
      tl.fromTo(it, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.45 }, { scale: 1.08, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0.1)
        .from($('.gitem__cap', it), { y: 30, autoAlpha: 0, duration: 0.8 }, 0.7);
    });
  }
  revealItems($$('#galleryGrid .gitem'));
  function swapGallery(grid, render) {
    gsap.to($$('.gitem', grid), {
      y: 20, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in',
      onComplete: function () { render(); revealItems($$('.gitem', grid), true); ST.refresh(); }
    });
  }

  /* ---------- курсор «Дивитись» ---------- */
  var cursor = $('#cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', function (e) { cursor.classList.toggle('is-on', !!e.target.closest('.gitem')); });
  }

  /* ---------- магнітні кнопки ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('mouseleave', function () {
        gsap.to(b, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)', overwrite: true });
      });
    });
  }

  /* ---------- футер: великий підпис виїжджає ---------- */
  gsap.from('.foot__big', { yPercent: 70, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* ---------- API для app.js ---------- */
  var curtainEl = $('#curtain'), curtainBusy = false;
  window.MOTION = {
    // «шторка» на весь екран для зміни мови чи теми
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
    rows: rows,
    swapGallery: swapGallery,
    step: function (fs, dir) { gsap.fromTo(fs.children, { x: 40 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.7, overwrite: true }); },
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

  /* ---------- перерахунок після шрифтів і фото ---------- */
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
