/* =========================================================
   «Пухнастий» логотип: напис BB Pets, вкритий шерстинками.
   - курсор / палець розчісує шерсть за напрямком руху, швидкий рух підстригає;
   - window.FUR.set(0..1) (з прокрутки) поступово стриже, обрізки падають,
     і проступають чисті золоті літери.
   ========================================================= */
(function () {
  'use strict';
  var box = document.getElementById('furBox'), cv = document.getElementById('fur');
  if (!box || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEXT = 'BB Pets';
  var PAL = ['#F7EBD3', '#EBD6AF', '#DCC197', '#C9A26A', '#B08550'];
  var W = 0, H = 0, dpr = 1, font = '', fsz = 100, tx = 0, ty = 0;
  var strands = [], byColor = [], bits = [];
  var trim = 0, visible = true, running = false, ready = false;
  var ptr = { x: -9999, y: -9999, px: 0, py: 0, t: 0 };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var lerpA = function (a, b, k) { var d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + d * k; };

  function build() {
    var r = box.getBoundingClientRect();
    W = Math.max(10, Math.round(r.width)); H = Math.max(10, Math.round(r.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // маска з текстом
    var m = document.createElement('canvas'); m.width = W; m.height = H;
    var mc = m.getContext('2d');
    fsz = H * 0.86;
    var setFont = function () { font = 'italic 700 ' + fsz + 'px "Cormorant Garamond", Georgia, serif'; mc.font = font; };
    setFont();
    var tw = mc.measureText(TEXT).width;
    if (tw > W * 0.94) { fsz *= (W * 0.94) / tw; setFont(); tw = mc.measureText(TEXT).width; }
    var mt = mc.measureText(TEXT);
    var asc = mt.actualBoundingBoxAscent || fsz * 0.7, desc = mt.actualBoundingBoxDescent || 0;
    tx = (W - tw) / 2; ty = (H + asc - desc) / 2;
    mc.fillStyle = '#000'; mc.fillText(TEXT, tx, ty);
    var data = mc.getImageData(0, 0, W, H).data;

    var step = Math.max(2, Math.round(fsz / 46));
    strands = [];
    for (var y = 0; y < H; y += step) {
      for (var x = 0; x < W; x += step) {
        var jx = Math.round(x + rnd(-step / 2, step / 2)), jy = Math.round(y + rnd(-step / 2, step / 2));
        if (jx < 0 || jy < 0 || jx >= W || jy >= H) continue;
        if (data[(jy * W + jx) * 4 + 3] < 140) continue;
        // напрям шерсті: загальний «потік» + випадковість, у середньому вгору й убік
        var flow = Math.sin(jx * 0.018) * 0.7 + Math.cos(jy * 0.024) * 0.5;
        strands.push({
          x: jx, y: jy,
          a: -Math.PI / 2 + flow * 0.8 + rnd(-0.55, 0.55),
          L: fsz * rnd(0.045, 0.11),
          curl: rnd(-0.45, 0.45),
          c: Math.min(PAL.length - 1, Math.floor(Math.pow(Math.random(), 0.8) * PAL.length)),
          k: 0, ca: 0, cut: 0, ph: Math.random() * 6.28
        });
      }
    }
    byColor = PAL.map(function (_, i) { return strands.filter(function (s) { return s.c === i; }); });
    ready = true;
    box.classList.add('is-ready');
    kick();
  }

  function spawnBit(s, strength) {
    if (bits.length > 500) return;
    var L = s.L * rnd(0.2, 0.45);
    bits.push({ x: s.x + Math.cos(s.a) * s.L * 0.7, y: s.y + Math.sin(s.a) * s.L * 0.7, vx: rnd(-1.2, 1.2) * strength, vy: rnd(-2.2, -0.4) * strength,
      a: rnd(0, 6.28), va: rnd(-0.15, 0.15), L: L, c: s.c, life: 1 });
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    if (!ready) return;
    var tt = trim, sway = reduce ? 0 : 1;

    // тіло літер під шерстю (темніше) і чистий золотий напис, що проявляється
    ctx.font = font;
    ctx.globalAlpha = Math.max(0, 1 - tt * 1.3) * 0.95;
    ctx.fillStyle = '#A07A47'; ctx.fillText(TEXT, tx, ty);
    var g = ctx.createLinearGradient(tx, ty - fsz * 0.7, tx + fsz * 3, ty);
    g.addColorStop(0, '#F6E6C6'); g.addColorStop(0.5, '#DCC197'); g.addColorStop(1, '#B98A4E');
    ctx.globalAlpha = Math.min(1, Math.max(0, (tt - 0.25) * 1.6));
    ctx.fillStyle = g; ctx.fillText(TEXT, tx, ty);
    ctx.globalAlpha = 1;

    // шерстинки, згруповані за кольором (5 обведень на кадр)
    var lenK = 1 - tt * 0.94, w = Math.max(0.7, fsz / 170);
    ctx.lineCap = 'round'; ctx.lineWidth = w;
    for (var ci = 0; ci < byColor.length; ci++) {
      var list = byColor[ci]; ctx.beginPath();
      for (var i = 0; i < list.length; i++) {
        var s = list[i], L = s.L * lenK * (1 - s.cut);
        if (L < 1.2) continue;
        var ang = s.a + sway * Math.sin(time * 0.0011 + s.ph + s.x * 0.01) * 0.14 * (1 - tt);
        if (s.k > 0) ang = lerpA(ang, s.ca, s.k);
        if (tt > 0) ang = lerpA(ang, Math.PI * 0.42, tt * 0.7);
        var ex = s.x + Math.cos(ang) * L, ey = s.y + Math.sin(ang) * L;
        var mx = s.x + Math.cos(ang + s.curl * (1 - s.k)) * L * 0.55, my = s.y + Math.sin(ang + s.curl * (1 - s.k)) * L * 0.55;
        ctx.moveTo(s.x, s.y); ctx.quadraticCurveTo(mx, my, ex, ey);
      }
      ctx.strokeStyle = PAL[ci]; ctx.stroke();
    }

    // обрізки, що падають
    if (bits.length) {
      ctx.lineWidth = w;
      for (var b = bits.length - 1; b >= 0; b--) {
        var p = bits[b];
        p.vy += 0.16; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.012;
        if (p.life <= 0 || p.y > H + 40) { bits.splice(b, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.strokeStyle = PAL[p.c]; ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(p.a) * p.L, p.y + Math.sin(p.a) * p.L); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  function loop(time) {
    if (!visible) { running = false; return; }
    draw(time || performance.now());
    if (reduce && !bits.length) { running = false; return; }
    requestAnimationFrame(loop);
  }
  function kick() { if (!running && visible) { running = true; requestAnimationFrame(loop); } }

  /* ---------- розчісування курсором / пальцем ---------- */
  function comb(cx, cy) {
    if (!ready) return;
    var now = performance.now(), dt = Math.max(8, now - ptr.t);
    var vx = cx - ptr.px, vy = cy - ptr.py, speed = Math.sqrt(vx * vx + vy * vy) / dt * 16;
    ptr.px = cx; ptr.py = cy; ptr.t = now;
    if (speed < 0.6 || speed > 400) return;
    var dir = Math.atan2(vy, vx), R = fsz * 0.2, R2 = R * R, cutting = speed > 26;
    for (var i = 0; i < strands.length; i++) {
      var s = strands[i], dx = s.x - cx, dy = s.y - cy, d2 = dx * dx + dy * dy;
      if (d2 > R2) continue;
      var f = 1 - Math.sqrt(d2) / R;
      s.ca = s.k > 0.05 ? lerpA(s.ca, dir, 0.5) : dir;
      s.k = Math.min(1, s.k + f * 0.5);
      if (cutting && s.cut < 0.6 && Math.random() < f * 0.5) { s.cut = Math.min(0.6, s.cut + 0.2); spawnBit(s, 0.8); }
    }
    kick();
  }
  function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  box.addEventListener('pointerenter', function (e) { var p = local(e); ptr.px = p.x; ptr.py = p.y; ptr.t = performance.now(); });
  box.addEventListener('pointermove', function (e) { var p = local(e); comb(p.x, p.y); });

  /* ---------- API для прокрутки ---------- */
  window.FUR = {
    set: function (v) {
      v = Math.max(0, Math.min(1, v));
      if (ready && v > trim + 0.004) {
        var n = Math.min(60, Math.round((v - trim) * 900));
        for (var i = 0; i < n; i++) { var s = strands[(Math.random() * strands.length) | 0]; if (s) spawnBit(s, 1); }
      }
      trim = v; kick();
    },
    reset: function () { strands.forEach(function (s) { s.k = 0; s.cut = 0; }); kick(); }
  };

  /* ---------- старт, зміна розміру, видимість ---------- */
  var started = false;
  function start() { if (started) return; started = true; build(); }
  if (document.fonts && document.fonts.load) {
    document.fonts.load('italic 700 100px "Cormorant Garamond"').then(start, start);
    setTimeout(start, 2500);
  } else start();
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { var r = box.getBoundingClientRect(); if (Math.abs(r.width - W) > 2 || Math.abs(r.height - H) > 2) build(); }, 200);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(box);
  }
})();
