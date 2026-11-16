/* =========================================================
   Ефекти: «приціл дрона» в hero, піксельний камуфляж, лічильники,
   анімації прокрутки (GSAP + ScrollTrigger + Lenis).
   Без бібліотек або з prefers-reduced-motion сайт працює статично.
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I = window.I18N;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasG = !!(window.gsap && window.ScrollTrigger) && !reduce;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* ---------- приціл дрона ---------- */
  (function lens() {
    var scene = $('#scene'), img = $('#heroImg'), lensEl = $('#lens'), view = $('#lensView');
    if (!scene || !img || !lensEl) return;
    var Z = 2.4, W, H, L, iw, ih, rw, rh, ox, oy;
    var pos = { x: 0, y: 0 }, target = { x: 0, y: 0 }, user = false, lastMove = 0, stillT = 0, statusIdx = -1, visible = true;
    function measure() {
      var r = scene.getBoundingClientRect(); W = r.width; H = r.height; L = lensEl.offsetWidth;
      iw = img.naturalWidth || 1800; ih = img.naturalHeight || 600;
      var s = Math.max(W / iw, H / ih); rw = iw * s; rh = ih * s; ox = (W - rw) * 0.5; oy = (H - rh) * 0.4;
      view.style.backgroundImage = 'url("' + img.currentSrc + '")';
      view.style.backgroundSize = (rw * Z) + 'px ' + (rh * Z) + 'px';
      if (!pos.x) { pos.x = target.x = W * 0.68; pos.y = target.y = H * (W < 700 ? 0.24 : 0.48); }
    }
    function setStatus(i) {
      if (i === statusIdx) return; statusIdx = i;
      var st = $('#lensStatus'); st.textContent = I.t('lens')[i]; st.classList.toggle('is-ok', i === 2);
    }
    function render() {
      lensEl.style.transform = 'translate(' + (pos.x - L / 2) + 'px,' + (pos.y - L / 2) + 'px)';
      var px = pos.x - ox, py = pos.y - oy;
      view.style.backgroundPosition = (-(px * Z - L / 2)) + 'px ' + (-(py * Z - L / 2)) + 'px';
      $('#lensCoord').textContent = 'X ' + String(Math.round(px / rw * 9999)).padStart(4, '0') + ' · Y ' + String(Math.round(py / rh * 9999)).padStart(4, '0');
    }
    function tick(now) {
      if (!visible) { requestAnimationFrame(tick); return; }
      if (!user || now - lastMove > 2600) {
        // автопатруль по кривій Ліссажу
        var tt = now * 0.00018;
        if (W < 700) { target.x = W * (0.5 + 0.32 * Math.sin(tt * 2.1)); target.y = H * (0.24 + 0.08 * Math.sin(tt * 3.3 + 1)); }
        else { target.x = W * (0.6 + 0.28 * Math.sin(tt * 2.1)); target.y = H * (0.45 + 0.22 * Math.sin(tt * 3.3 + 1)); }
        if (user && now - lastMove > 2600) user = false;
      }
      var k = reduce ? 1 : 0.12;
      var dx = target.x - pos.x, dy = target.y - pos.y;
      pos.x += dx * k; pos.y += dy * k;
      var speed = Math.abs(dx) + Math.abs(dy);
      if (speed > 6) { stillT = now; setStatus(0); }
      else if (now - stillT > 1700) setStatus(2);
      else if (now - stillT > 700) setStatus(1);
      render();
      requestAnimationFrame(tick);
    }
    scene.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = scene.getBoundingClientRect(); target.x = e.clientX - r.left; target.y = e.clientY - r.top; user = true; lastMove = performance.now();
    });
    var start = function () { measure(); render(); requestAnimationFrame(tick); };
    if (img.complete) start(); else img.addEventListener('load', start);
    window.addEventListener('resize', measure);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(scene);
    document.addEventListener('langchange', function () { var i = statusIdx; statusIdx = -1; setStatus(Math.max(0, i)); });
    // висота дрона на HUD
    setInterval(function () { var a = 118 + Math.round(Math.random() * 6); $('#hudAlt').textContent = I.fill(I.t('hud_alt'), { a: a }); }, 1400);
  })();

  /* ---------- піксельний камуфляж (стилізація) ---------- */
  var camo = (function () {
    var cv = $('#camo'); if (!cv) return { set: function () {} };
    var ctx = cv.getContext('2d'), cells = [], order = [], drawn = 0, cell = 12, cols, rows;
    var PAL = ['#3E4A2C', '#5E6B3A', '#7A6A45', '#4B3A28', '#A08E64', '#2C3324'];
    function hash(x, y, s) { var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
    function noise(x, y, s) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function build() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = r.width < 700 ? 9 : 12; cols = Math.ceil(r.width / cell); rows = Math.ceil(r.height / cell);
      cells = [];
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var n = noise(x / 9, y / 7, 1) * 0.6 + noise(x / 3.5, y / 3, 2) * 0.3 + hash(x, y, 3) * 0.1;
        var m = noise(x / 14, y / 11, 4);
        var ci = n < 0.32 ? 5 : n < 0.45 ? 0 : n < 0.58 ? 1 : n < 0.68 ? (m > 0.5 ? 2 : 1) : n < 0.8 ? 3 : 4;
        cells.push(ci);
      }
      order = cells.map(function (_, i) { return i; });
      // перемішування блоками 3×3, щоб «пікселі» складались групами
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      ctx.clearRect(0, 0, r.width, r.height); drawn = 0;
    }
    function upTo(n) {
      for (; drawn < n && drawn < order.length; drawn++) {
        var i = order[drawn], x = i % cols, y = Math.floor(i / cols);
        ctx.fillStyle = PAL[cells[i]]; ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    build();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var p = drawn / (order.length || 1); build(); upTo(Math.round(p * order.length)); }, 200); });
    return { set: function (p) { upTo(Math.round(Math.max(0, Math.min(1, p)) * order.length)); } };
  })();

  /* ---------- лічильники ---------- */
  function counters() {
    $$('[data-count]').forEach(function (el) {
      var to = +el.dataset.count, plain = !!el.dataset.plain, suf = el.dataset.suffix || '';
      var fmt = function (v) { v = Math.round(v); return (plain ? String(v) : v.toLocaleString('uk-UA').replace(/[  ]/g, ' ')) + suf; };
      if (!hasG) { el.textContent = fmt(to); return; }
      var o = { v: plain && to > 1900 && to < 2100 ? 1990 : 0 };
      gsap.to(o, { v: to, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: function () { el.textContent = fmt(o.v); } });
    });
  }

  if (!hasG) {
    document.documentElement.classList.add('reduced');
    camo.set(1); counters();
    window.FX = null;
    return;
  }

  /* ---------- GSAP ---------- */
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: 'power3.out', duration: 1 });
  if (window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis; lenis.on('scroll', ST.update);
    gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); }); gsap.ticker.lagSmoothing(0);
  }

  // вхід
  gsap.timeline({ delay: 0.1 })
    .from('.hero__img', { scale: 1.15, duration: 2.2, ease: 'expo.out' }, 0)
    .from('.nav', { yPercent: -100, autoAlpha: 0, duration: 0.9, clearProps: 'transform,opacity,visibility' }, 0.2)
    .from('.hero .kicker', { y: 20, autoAlpha: 0 }, 0.3)
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out' }, 0.35)
    .from('.hero__lead, .hero__cta > *, .hero__hint', { y: 24, autoAlpha: 0, stagger: 0.07 }, 0.7)
    .from('#lens', { scale: 0, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)' }, 0.9)
    .from('.hud', { autoAlpha: 0, x: 20 }, 1);
  gsap.to('.hero__img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__in', { yPercent: -20, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true } });

  counters();
  gsap.from('.fact', { y: 30, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: '.facts', start: 'top 92%' } });

  // заголовки та блоки
  $$('[data-anim="lines"]').forEach(function (el) { gsap.from($$('.line > span', el), { yPercent: 110, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
  var fades = $$('[data-anim="fade"]'); gsap.set(fades, { y: 36, autoAlpha: 0 });
  ST.batch(fades, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.08, overwrite: true }); } });
  $$('[data-anim="reveal"]').forEach(function (el) {
    var im = $('img', el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
      .from(el, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from(im, { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1);
  });

  // камуфляж «складається» під час прокрутки секції
  ST.create({ trigger: '#hyzhak', start: 'top 85%', end: 'center center', scrub: true, onUpdate: function (s) { camo.set(s.progress); } });
  $$('#timeline li').forEach(function (li) {
    gsap.from(li, { x: 40, autoAlpha: 0, scrollTrigger: { trigger: li, start: 'top 88%' } });
    ST.create({ trigger: li, start: 'top 60%', onEnter: function () { li.classList.add('is-on'); }, onLeaveBack: function () { li.classList.remove('is-on'); } });
  });
  gsap.from('.filters', { y: 30, autoAlpha: 0, scrollTrigger: { trigger: '.filters', start: 'top 92%' } });
  gsap.from('.ccard', { y: 30, autoAlpha: 0, stagger: 0.06, scrollTrigger: { trigger: '.ccards', start: 'top 90%' } });
  gsap.from('.certs li', { y: 30, rotate: -4, autoAlpha: 0, stagger: 0.06, scrollTrigger: { trigger: '.certs', start: 'top 92%' } });
  gsap.from('.foot__big', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // магнітні кнопки на ПК
  if (fine) $$('.hero__cta .btn').forEach(function (b) {
    var xTo = gsap.quickTo(b, 'x', { duration: 0.5 }), yTo = gsap.quickTo(b, 'y', { duration: 0.5 });
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }); });
  });

  /* ---------- API для app.js ---------- */
  var curtainEl = $('#curtain'), busy = false;
  window.FX = {
    cards: function (list, animate) {
      if (!list.length) return;
      if (animate) gsap.fromTo(list, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.7, overwrite: true });
      else { gsap.set(list, { y: 40, autoAlpha: 0 }); ST.batch(list, { start: 'top 95%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.7 }); } }); ST.refresh(); }
    },
    curtain: function (cb) {
      if (busy) { cb(); return; } busy = true;
      gsap.timeline({ onComplete: function () { busy = false; gsap.set(curtainEl, { visibility: 'hidden' }); } })
        .set(curtainEl, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' })
        .to(curtainEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.inOut' })
        .add(cb).to(curtainEl, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut' }, '+=0.08');
    },
    modalIn: function (m) {
      gsap.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      var box = $('.modal__box, .drawer__box', m);
      if (m.classList.contains('drawer')) gsap.fromTo(box, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: 'expo.out' });
      else gsap.fromTo(box, { y: 50, clipPath: 'inset(8% 4% 8% 4%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' });
    },
    modalOut: function (m, done) {
      var box = $('.modal__box, .drawer__box', m);
      gsap.to(box, m.classList.contains('drawer') ? { xPercent: 100, duration: 0.4, ease: 'power3.in' } : { y: 30, duration: 0.3, ease: 'power2.in' });
      gsap.to(m, { autoAlpha: 0, duration: 0.35, onComplete: function () { gsap.set([m, box], { clearProps: 'all' }); done(); } });
    },
    swapImg: function (main, src, alt) {
      var im = document.createElement('img'); im.src = src; im.alt = alt; main.appendChild(im);
      gsap.fromTo(im, { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', onComplete: function () { $$('img', main).slice(0, -1).forEach(function (x) { x.remove(); }); } });
    },
    fly: function (from, to) {
      if (!from || !to) return;
      var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;z-index:400;left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;background:var(--sand);pointer-events:none;';
      document.body.appendChild(d);
      gsap.to(d, { left: b.left + b.width / 2 - 6, top: b.top + b.height / 2 - 6, width: 12, height: 12, borderRadius: 6, duration: 0.7, ease: 'power3.in', onComplete: function () { d.remove(); window.FX.bump(to); } });
    },
    bump: function (el) { gsap.fromTo(el, { scale: 1.35 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' }); },
    shake: function (el) { gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, .3)' }); }
  };
  // app.js завантажився раніше: перебудувати анімацію карток, які вже на сторінці
  window.FX.cards($$('#grid .card'), false);
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
