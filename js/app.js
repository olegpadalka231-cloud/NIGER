(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I = window.I18N, t = I.t, f = I.f;
  var SALON = window.SALON, SIZES = window.SIZES, SERVICES = window.SERVICES, CATS = window.CATEGORIES;
  var IG = 'https://ig.me/m/' + SALON.instagram;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var fmt = function (n) { return Math.round(n).toLocaleString('uk-UA').replace(/[\u00a0\u202f,]/g, ' ') + ' ₴'; };
  var fmtTime = function (m) { var h = Math.floor(m / 60), mm = m % 60; return ((h ? h + ' ' + t('hr') : '') + (h && mm ? ' ' : '') + (mm ? mm + ' ' + t('min') : '')) || '0 ' + t('min'); };
  var plural = function (n) {
    var fm = t('svc');
    if (I.lang === 'en') return n === 1 ? fm[0] : fm[1];
    var a = n % 10, b = n % 100; return fm[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2];
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('bbpets:' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('bbpets:' + k, JSON.stringify(v)); } catch (e) { /* сховище недоступне */ } }
  };
  var byId = {}; SERVICES.forEach(function (s) { byId[s.id] = s; });

  var state = { size: store.get('size'), cat: 'all', picked: store.get('picked') || [], gTag: 'all', day: null, slot: null, slotMin: 0 };
  if (typeof state.size !== 'number' || !(state.size >= 0 && state.size < SIZES.length)) state.size = 1;
  state.picked = (Array.isArray(state.picked) ? state.picked : []).filter(function (id) { return byId[id]; });

  /* ---------- допоміжне ---------- */
  function tweenText(el, to, format) {
    var from = +el.dataset.v || 0; el.dataset.v = to;
    if (reduce || from === to) { el.textContent = format(to); return; }
    var t0 = performance.now(), d = 650;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = format(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var toastT;
  function toast(msg) { var el = $('#toast'); el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('is-on'); }, 2800); }
  function copyText(text, okMsg) {
    var fallback = function () {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove(); toast(ok ? okMsg : t('copy_fail'));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    else fallback();
  }
  function salonNow() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: SALON.timezone, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var g = function (k) { return (p.find(function (x) { return x.type === k; }) || {}).value; };
      return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), h: +g('hour') % 24, m: +g('minute') };
    } catch (e) { var d = new Date(); return { dow: d.getDay(), h: d.getHours(), m: d.getMinutes() }; }
  }
  var hh = function (h) { return (h < 10 ? '0' : '') + h + ':00'; };

  /* ---------- шкала «сьогодні» і статус ---------- */
  function renderToday() {
    var n = salonNow(), today = SALON.hours[n.dow], mins = n.h * 60 + n.m;
    var open = today && mins >= today[0] * 60 && mins < today[1] * 60;
    var A = 7, B = 22, pct = function (m) { return Math.max(0, Math.min(100, (m / 60 - A) / (B - A) * 100)); };
    var html = '<span class="today__track"></span>';
    if (today) html += '<span class="today__open" style="left:' + pct(today[0] * 60) + '%;width:' + (pct(today[1] * 60) - pct(today[0] * 60)) + '%"></span>';
    for (var h = 8; h <= 21; h += 2) html += '<span class="today__tick" style="left:' + pct(h * 60) + '%">' + h + ':00</span>';
    if (mins >= A * 60 && mins <= B * 60) html += '<span class="today__now" style="left:' + pct(mins) + '%"></span>';
    $('#todayScale').innerHTML = html;
    $('#statusDot').classList.toggle('is-open', !!open);
    if (open) { $('#statusText').textContent = I.fill(t('open_until'), { t: hh(today[1]) }); return; }
    for (var i = 0; i < 8; i++) {
      var d = (n.dow + i) % 7, hrs = SALON.hours[d];
      if (!hrs || (i === 0 && mins >= hrs[0] * 60)) continue;
      var label = i === 0 ? t('today_l') : i === 1 ? t('tomorrow_l') : t('dow_full')[d].toLowerCase();
      $('#statusText').textContent = I.fill(t('closed_opens'), { d: label, t: hh(hrs[0]) });
      return;
    }
  }

  /* ---------- контакти, хайлайти, довідники ---------- */
  function renderStatic() {
    $('#addrBig').textContent = f(SALON, 'address');
    $('#addrNote').textContent = f(SALON, 'addressNote');
    $('#routeBtn').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(SALON.mapsQuery);
    if (SALON.phone) { $('#phoneRow').hidden = false; $('#phoneText').textContent = SALON.phone; }
    var now = salonNow();
    $('#hoursList').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = SALON.hours[d];
      return '<li' + (d === now.dow ? ' class="is-today"' : '') + '><span>' + t('dow_full')[d] + '</span><span>' + (h ? hh(h[0]) + '–' + hh(h[1]) : t('dayoff')) + '</span></li>';
    }).join('');
    $('#breeds').innerHTML = t('breeds').map(function (b) { return '<option value="' + esc(b) + '">'; }).join('');
    $('#hlList').innerHTML = (window.HIGHLIGHTS || []).map(function (h) {
      return '<li><a href="https://www.instagram.com/' + SALON.instagram + '/" target="_blank" rel="noopener"><span class="hl__ring"><span aria-hidden="true">' + h.icon + '</span></span>' + (I.lang === 'en' ? h.en : h.uk) + '</a></li>';
    }).join('');
    stepTip(curStep);
  }

  /* ---------- перемикачі розміру ---------- */
  var tabEls = [$('#sizeTabs'), $('#formSize')];
  function renderTabs() {
    tabEls.forEach(function (el) {
      el.innerHTML = '<span class="tabs__pill" aria-hidden="true"></span>' + SIZES.map(function (s, i) {
        return '<button type="button" role="radio" aria-checked="' + (i === state.size) + '" data-i="' + i + '">' + f(s, 'name') + '<small>' + f(s, 'hint') + '</small></button>';
      }).join('');
    });
    requestAnimationFrame(movePills);
  }
  tabEls.forEach(function (el) {
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setSize(+b.dataset.i); });
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); var n = (state.size + (e.key === 'ArrowRight' ? 1 : -1) + SIZES.length) % SIZES.length;
      setSize(n); $('[data-i="' + n + '"]', el).focus();
    });
  });
  function movePills() {
    tabEls.forEach(function (el) {
      var b = $('[data-i="' + state.size + '"]', el), pill = $('.tabs__pill', el);
      if (!b || !pill || !b.offsetWidth) return;
      pill.style.width = b.offsetWidth + 'px'; pill.style.height = b.offsetHeight + 'px';
      pill.style.transform = 'translate(' + b.offsetLeft + 'px,' + (b.offsetTop - 4) + 'px)';
    });
  }
  window.addEventListener('resize', movePills);
  function setSize(i) {
    state.size = i; store.set('size', i);
    tabEls.forEach(function (el) { $$('button', el).forEach(function (b) { b.setAttribute('aria-checked', +b.dataset.i === i); }); });
    movePills(); updatePrices(); renderChips(); update();
  }

  /* ---------- прайс ---------- */
  function renderCats() {
    $('#catTabs').innerHTML = CATS.map(function (c) { return '<button type="button" aria-pressed="' + (c.id === state.cat) + '" data-c="' + c.id + '">' + f(c, 'name') + '</button>'; }).join('');
  }
  $('#catTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.cat = b.dataset.c;
    $$('#catTabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderPrice(true);
  });
  function renderPrice(animate) {
    var list = SERVICES.filter(function (s) { return state.cat === 'all' || s.cat === state.cat; });
    $('#priceList').innerHTML = list.map(function (s) {
      var on = state.picked.indexOf(s.id) > -1, same = s.price.every(function (p) { return p === s.price[0]; }), name = f(s, 'name');
      return '<li class="prow' + (on ? ' is-on' : '') + '" data-id="' + s.id + '">' +
        '<button class="prow__add" type="button" aria-pressed="' + on + '" aria-label="' + esc((on ? t('remove') : t('add')) + ': ' + name) + '">+</button>' +
        '<div><div class="prow__name">' + name + (s.hit ? '<sup>' + t('hit') + '</sup>' : '') + '</div><p class="prow__desc">' + f(s, 'desc') + '</p></div>' +
        '<span class="prow__time" data-t>≈ ' + fmtTime(s.time[state.size]) + '</span>' +
        '<span class="prow__price">' + (same ? '' : '<small>' + t('from') + '</small>') + '<span data-p data-v="' + s.price[state.size] + '">' + fmt(s.price[state.size]) + '</span></span></li>';
    }).join('');
    if (animate && window.MOTION) window.MOTION.rows($$('#priceList .prow'));
  }
  function updatePrices() {
    $$('#priceList .prow').forEach(function (row) {
      var s = byId[row.dataset.id];
      tweenText($('[data-p]', row), s.price[state.size], fmt);
      $('[data-t]', row).textContent = '≈ ' + fmtTime(s.time[state.size]);
    });
  }
  function togglePick(id, on) {
    var i = state.picked.indexOf(id);
    if (on == null) on = i < 0;
    if (on && i < 0) state.picked.push(id);
    if (!on && i > -1) state.picked.splice(i, 1);
    store.set('picked', state.picked);
    var row = $('.prow[data-id="' + id + '"]');
    if (row) {
      row.classList.toggle('is-on', on);
      var b = $('.prow__add', row); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', (on ? t('remove') : t('add')) + ': ' + f(byId[id], 'name'));
    }
    if (on && window.MOTION) window.MOTION.bump($('#visitSum'));
    var c = $('#pick-' + id); if (c) c.checked = on;
    update();
  }
  $('#priceList').addEventListener('click', function (e) { var row = e.target.closest('.prow'); if (row) togglePick(row.dataset.id); });
  $('#visitClear').addEventListener('click', function () { state.picked.slice().forEach(function (id) { togglePick(id, false); }); });
  function totals() { return state.picked.reduce(function (a, id) { var s = byId[id]; a.sum += s.price[state.size]; a.time += s.time[state.size]; return a; }, { sum: 0, time: 0 }); }
  var inServices = false, visit = $('#visitBar');
  function visitBar() { visit.classList.toggle('is-on', inServices && state.picked.length > 0); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inServices = en[0].isIntersecting; visitBar(); }, { rootMargin: '-30% 0px -30% 0px' }).observe($('#services'));
  $('#visitBook').addEventListener('click', function () { scrollToEl('#booking'); });

  /* ---------- процес: активний крок ---------- */
  var steps = $$('#stepList .step'), stepImgs = $$('#stepMedia img'), curStep = 0;
  function stepTip(i) { var tip = (window.STEP_TIPS || [])[i]; if (tip) $('#stepTip').textContent = I.lang === 'en' ? tip.en : tip.uk; }
  function setStep(i) {
    curStep = i;
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    stepImgs.forEach(function (im) { im.classList.toggle('is-on', +im.dataset.step === i); });
    $('#stepMeter').style.transform = 'scaleX(' + (i + 1) / steps.length + ')';
    var tipEl = $('#stepTip');
    if (window.MOTION) window.MOTION.swapText(tipEl, function () { stepTip(i); }); else stepTip(i);
  }
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { var i = steps.indexOf(x.target); if (i !== curStep) setStep(i); } });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- галерея і лайтбокс ---------- */
  var gList = window.GALLERY.slice();
  function renderGalTabs() {
    $('#galTabs').innerHTML = window.GALLERY_TAGS.map(function (g) { return '<button type="button" aria-pressed="' + (g.id === state.gTag) + '" data-t="' + g.id + '">' + f(g, 'name') + '</button>'; }).join('');
  }
  $('#galTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.gTag = b.dataset.t;
    $$('#galTabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    if (window.MOTION) window.MOTION.swapGallery($('#galleryGrid'), renderGallery); else renderGallery();
  });
  function renderGallery() {
    gList = window.GALLERY.filter(function (g) { return state.gTag === 'all' || g.tag === state.gTag; });
    $('#galleryGrid').innerHTML = gList.map(function (g, i) {
      var nm = f(g, 'name'), br = f(g, 'breed');
      return '<button class="gitem" type="button" data-g="' + i + '" aria-label="' + esc(nm + ', ' + br + ': ' + t('open_photo')) + '">' +
        '<img src="' + g.photo + '" alt="' + esc(nm + ', ' + br) + '" loading="lazy">' +
        '<span class="gitem__cap"><b>' + nm + '</b><span>' + br + ' · ' + f(g, 'service') + '</span></span></button>';
    }).join('');
  }
  function relabelGallery() {
    $$('#galleryGrid .gitem').forEach(function (it) {
      var g = gList[+it.dataset.g], nm = f(g, 'name'), br = f(g, 'breed');
      it.setAttribute('aria-label', nm + ', ' + br + ': ' + t('open_photo'));
      $('img', it).alt = nm + ', ' + br; $('b', it).textContent = nm; $('.gitem__cap span', it).textContent = br + ' · ' + f(g, 'service');
    });
  }
  $('#galleryGrid').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (b) openLb(+b.dataset.g, b); });
  var lb = $('#lightbox'), lbIdx = 0, lbFrom = null;
  function fillLb() {
    var g = gList[lbIdx];
    $('#lbImg').src = g.photo; $('#lbImg').alt = f(g, 'name') + ', ' + f(g, 'breed');
    $('#lbTitle').textContent = f(g, 'name'); $('#lbText').textContent = f(g, 'breed') + ' · ' + f(g, 'service');
    $('#lbCount').textContent = String(lbIdx + 1).padStart(2, '0') + ' / ' + String(gList.length).padStart(2, '0');
  }
  function openLb(i, from) {
    lbIdx = i; lbFrom = from; fillLb(); lb.hidden = false;
    if (window.MOTION) window.MOTION.lbOpen(lb); if (window.lenis) window.lenis.stop();
    document.body.style.overflow = 'hidden'; $('#lbClose').focus();
  }
  function closeLb() {
    var done = function () { lb.hidden = true; document.body.style.overflow = ''; if (window.lenis) window.lenis.start(); if (lbFrom) lbFrom.focus({ preventScroll: true }); };
    if (window.MOTION) window.MOTION.lbClose(lb, done); else done();
  }
  function stepLb(d) { lbIdx = (lbIdx + d + gList.length) % gList.length; if (window.MOTION) window.MOTION.lbSwap(fillLb); else fillLb(); }
  $('#lbClose').onclick = closeLb;
  $('#lbPrev').onclick = function () { stepLb(-1); };
  $('#lbNext').onclick = function () { stepLb(1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  $('#lbBook').addEventListener('click', function (e) {
    e.preventDefault(); var g = gList[lbIdx]; closeLb();
    var note = $('#f-note'); if (!note.value) { note.value = I.fill(t('same_note'), { n: f(g, 'name'), s: f(g, 'service').toLowerCase() }); update(); }
    setTimeout(function () { scrollToEl('#booking'); }, 350);
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
    if (e.key === 'Tab') {
      var fo = $$('button, a[href]', lb), first = fo[0], last = fo[fo.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1); sx = null; });

  /* ---------- FAQ ---------- */
  $$('#faqList details').forEach(function (d) {
    var sum = $('summary', d), body = $('.faq__a', d);
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.22,.8,.2,1)' });
        a.onfinish = function () { d.open = false; };
      } else {
        d.open = true; var h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 550, easing: 'cubic-bezier(.22,.8,.2,1)' });
      }
    });
  });

  /* ---------- конструктор заявки з живим повідомленням ---------- */
  function renderChips() {
    $('#formServices').innerHTML = SERVICES.map(function (s) {
      var on = state.picked.indexOf(s.id) > -1;
      return '<label class="chip"><input type="checkbox" id="pick-' + s.id + '" value="' + s.id + '"' + (on ? ' checked' : '') + '>' + f(s, 'name') + ' <small>' + fmt(s.price[state.size]) + '</small></label>';
    }).join('');
  }
  $('#formServices').addEventListener('change', function (e) { togglePick(e.target.value, e.target.checked); });

  var days = [];
  (function () { var d = new Date(); d.setHours(0, 0, 0, 0); for (var i = 0; i < 14; i++) { var x = new Date(d); x.setDate(d.getDate() + i); days.push(x); } })();
  // Слоти з графіка SALON.hours. Зайнятість умовна (демо): підключіть календар, щоб показувати реальну.
  function slotsFor(date) {
    var hrs = SALON.hours[date.getDay()], out = [], now = Date.now(), need = Math.max(30, totals().time);
    if (!hrs) return out;
    for (var m = hrs[0] * 60; m + 30 <= hrs[1] * 60; m += 30) {
      var tt = new Date(date); tt.setHours(Math.floor(m / 60), m % 60);
      out.push({ label: Math.floor(m / 60) + ':' + (m % 60 ? '30' : '00'), min: m, busy: tt.getTime() < now + 3600000 || m + Math.min(need, 120) > hrs[1] * 60 || (date.getDate() * 31 + m) % 11 < 4 });
    }
    return out;
  }
  function renderDays() {
    $('#days').innerHTML = days.map(function (d, i) {
      var off = !SALON.hours[d.getDay()], lbl = i === 0 ? t('today') : i === 1 ? t('tomorrow') : t('dow')[d.getDay()];
      return '<button type="button" data-d="' + i + '" aria-pressed="' + (state.day === i) + '"' + (off ? ' disabled' : '') + ' aria-label="' + d.getDate() + ' ' + t('mon_full')[d.getMonth()] + (off ? ', ' + t('dayoff') : '') + '"><small>' + lbl + '</small><b>' + d.getDate() + '</b><small>' + t('mon')[d.getMonth()] + '</small></button>';
    }).join('');
    renderSlots(false);
  }
  function renderSlots(animate) {
    if (state.day == null) { $('#slots').innerHTML = '<p class="hintline">' + t('pick_day') + '</p>'; return; }
    var list = slotsFor(days[state.day]);
    if (state.slot && !list.some(function (s) { return s.label === state.slot && !s.busy; })) state.slot = null;
    $('#slots').innerHTML = list.some(function (s) { return !s.busy; }) ? list.map(function (s) {
      return '<button type="button" data-s="' + s.label + '" data-m="' + s.min + '"' + (s.busy ? ' disabled aria-label="' + s.label + ', ' + t('busy') + '"' : '') + ' aria-pressed="' + (state.slot === s.label) + '">' + s.label + '</button>';
    }).join('') : '<p class="hintline">' + t('no_slots') + '</p>';
    if (animate !== false && window.MOTION) window.MOTION.pop($$('#slots button'));
  }
  $('#days').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    state.day = +b.dataset.d; state.slot = null;
    $$('#days button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderSlots(); update();
  });
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    state.slot = b.dataset.s; state.slotMin = +b.dataset.m;
    $$('#slots button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    update();
  });

  var val = function (id) { return $(id).value.trim(); };
  function parts() {
    var d = state.day != null ? days[state.day] : null, tt = totals(), breed = val('#f-breed');
    return {
      dog: val('#f-dog'), breed: breed, size: f(SIZES[state.size], 'name').toLowerCase(),
      svc: state.picked.map(function (id) { return f(byId[id], 'name').toLowerCase(); }).join(', '),
      date: d && state.slot ? d.getDate() + ' ' + t('mon_full')[d.getMonth()] + ', ' + state.slot : '',
      sum: tt.sum ? fmt(tt.sum) + ', ≈ ' + fmtTime(tt.time) : '',
      name: val('#f-name'), phone: val('#f-phone'), note: val('#f-note')
    };
  }
  // html=true: для бульбашки (порожні поля показуємо підказками), інакше чистий текст для копіювання
  function message(html) {
    var p = parts(), ph = function (v, k) { return v ? (html ? esc(v) : v) : (html ? '<span class="ph">' + t(k) + '</span>' : '—'); };
    var lines = [
      html ? esc(t('msg_hi')) : t('msg_hi'),
      t('msg_dog') + ': ' + ph(p.dog, 'ph_dog') + ' (' + (p.breed ? (html ? esc(p.breed) : p.breed) + ', ' : '') + p.size + ')',
      t('msg_svc') + ': ' + ph(p.svc, 'ph_svc'),
      t('msg_date') + ': ' + ph(p.date, 'ph_date')
    ];
    if (p.sum) lines.push(t('msg_sum') + ': ' + p.sum);
    lines.push(t('msg_name') + ': ' + ph(p.name, 'ph_name'));
    lines.push(t('msg_phone') + ': ' + ph(p.phone, 'ph_phone'));
    if (p.note) lines.push(t('msg_note') + ': ' + (html ? esc(p.note) : p.note));
    return lines.join('\n');
  }
  function update() {
    var tt = totals(), n = state.picked.length, p = parts();
    tweenText($('#visitSum'), tt.sum, fmt);
    $('#visitText').textContent = n ? n + ' ' + plural(n) + ' · ≈ ' + fmtTime(tt.time) : t('nothing');
    tweenText($('#formSum'), tt.sum, fmt);
    $('#formTime').textContent = '≈ ' + fmtTime(tt.time);
    $('#bubble').innerHTML = message(true);
    var grps = $$('.grp');
    grps[0].classList.toggle('is-done', !!p.dog);
    grps[1].classList.toggle('is-done', n > 0);
    grps[2].classList.toggle('is-done', !!p.date);
    grps[3].classList.toggle('is-done', !!p.name && p.phone.replace(/\D/g, '').length >= 10);
    visitBar();
  }
  function missing() {
    var p = parts(), miss = [], grps = $$('.grp');
    grps.forEach(function (g) { g.classList.remove('bad'); });
    $$('.field input').forEach(function (x) { x.classList.remove('bad'); });
    if (!p.dog) { miss.push(t('ph_dog')); grps[0].classList.add('bad'); $('#f-dog').classList.add('bad'); }
    if (!p.svc) { miss.push(t('ph_svc')); grps[1].classList.add('bad'); }
    if (!p.date) { miss.push(t('ph_date')); grps[2].classList.add('bad'); }
    if (!p.name) { miss.push(t('ph_name')); grps[3].classList.add('bad'); $('#f-name').classList.add('bad'); }
    if (p.phone.replace(/\D/g, '').length < 10) { miss.push(t('ph_phone')); grps[3].classList.add('bad'); $('#f-phone').classList.add('bad'); }
    return miss;
  }
  function checkOrSay() {
    var miss = missing(), err = $('#formErr');
    if (!miss.length) { err.textContent = ''; return true; }
    err.textContent = I.fill(t('need'), { f: miss.join(', ') });
    if (window.MOTION) window.MOTION.shake(err);
    var firstBad = $('.grp.bad'); if (firstBad) firstBad.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    return false;
  }
  $('#bookForm').addEventListener('input', function () { $('#formErr').textContent = ''; update(); saveDraft(); });
  $('#bookForm').addEventListener('submit', function (e) { e.preventDefault(); });
  $('#sendDirect').addEventListener('click', function () {
    if (!checkOrSay()) return;
    var text = message(false);
    if (typeof window.sendBooking === 'function') { try { window.sendBooking({ text: text, lang: I.lang }); } catch (x) { /* ignore */ } }
    copyText(text, t('copied_open'));
    window.open(IG, '_blank', 'noopener');
  });
  $('#copyMsg').addEventListener('click', function () { if (checkOrSay()) copyText(message(false), t('copied')); });
  $('#addCal').addEventListener('click', function () {
    if (state.day == null || !state.slot) { $('#formErr').textContent = t('need_date'); return; }
    var start = new Date(days[state.day]); start.setHours(Math.floor(state.slotMin / 60), state.slotMin % 60);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var stamp = function (dt) { return dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + 'T' + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + '00Z'; };
    var end = new Date(start.getTime() + Math.max(30, totals().time) * 60000);
    var escI = function (s) { return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&'); };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BB Pets//Booking//UK', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@bbpets', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
      'SUMMARY:' + escI(t('cal_title')), 'LOCATION:' + escI(f(SALON, 'address')), 'DESCRIPTION:' + escI(message(false)),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + escI(t('cal_title')), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'bbpets-grooming.ics';
    document.body.appendChild(a); a.click(); a.remove(); toast(t('cal_saved'));
  });
  $('#resetForm').addEventListener('click', function () {
    ['#f-dog', '#f-breed', '#f-name', '#f-phone', '#f-note'].forEach(function (id) { $(id).value = ''; });
    state.picked.slice().forEach(function (id) { togglePick(id, false); });
    state.day = null; state.slot = null; renderDays(); saveDraft(); update(); toast(t('cleared'));
  });
  var draftIds = ['f-dog', 'f-breed', 'f-name', 'f-phone', 'f-note'], draft = store.get('draft') || {};
  draftIds.forEach(function (id) { if (draft[id]) $('#' + id).value = draft[id]; });
  function saveDraft() { draftIds.forEach(function (id) { draft[id] = $('#' + id).value; }); store.set('draft', draft); }

  function scrollToEl(sel) { if (window.lenis) window.lenis.scrollTo(sel, { offset: -40, duration: 1.4 }); else $(sel).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  window.scrollToEl = scrollToEl;

  /* ---------- навігація, прогрес, нижня панель ---------- */
  var nav = $('#nav'), burger = $('#burger'), sheet = $('#services'), dock = $('#dock'), booking = $('#booking');
  function setMenu(open) {
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open);
    if (window.lenis) { if (open) window.lenis.stop(); else window.lenis.start(); }
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); setMenu(false); scrollToEl(id);
  });
  var lastY = 0, bar = $('#progressBar'), toTop = $('#toTop'), ring = $('#toTopRing'), C = 2 * Math.PI * 22;
  ring.style.strokeDasharray = C;
  function onScroll() {
    var y = window.scrollY, max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, y / max) : 0;
    root.classList.toggle('is-scrolled', y > 30);
    var onDark = sheet.getBoundingClientRect().top > nav.offsetHeight;
    nav.classList.toggle('is-dark', onDark); nav.classList.toggle('is-light', !onDark);
    nav.classList.toggle('is-solid', y > 40);
    if (y > 500 && y > lastY + 4 && !nav.classList.contains('is-open')) nav.classList.add('is-hidden');
    if (y < lastY - 4 || y < 500) nav.classList.remove('is-hidden');
    bar.style.transform = 'scaleX(' + p + ')';
    ring.style.strokeDashoffset = C * (1 - p);
    toTop.classList.toggle('is-on', y > innerHeight * 1.2 && !visit.classList.contains('is-on'));
    var b = booking.getBoundingClientRect();
    dock.classList.toggle('is-on', y > innerHeight * 0.6 && !(b.top < innerHeight && b.bottom > 0) && !visit.classList.contains('is-on'));
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', function () { if (window.lenis) window.lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  if ('IntersectionObserver' in window) {
    var links = {}; $$('#menu a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting && links[x.target.id]) { $$('#menu a').forEach(function (a) { a.classList.remove('is-active'); }); links[x.target.id].classList.add('is-active'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- тема і мова ---------- */
  var saved = store.get('theme');
  if (saved) root.setAttribute('data-theme', saved);
  $('#themeBtn').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    var go = function () { root.setAttribute('data-theme', next); store.set('theme', next); toast(t(next)); };
    if (window.MOTION) window.MOTION.curtain(go); else go();
  });
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.dataset.lang; if (lang === I.lang) return;
      if (window.MOTION) window.MOTION.curtain(function () { I.set(lang); }); else I.set(lang);
    });
  });
  document.addEventListener('langchange', function () { renderAll(true); });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    copyText(document.getElementById(b.dataset.copy).textContent.trim(), t('phone_copied'));
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- старт ---------- */
  function renderAll(relang) {
    renderTabs(); renderCats(); renderPrice(false); renderChips(); renderDays(); renderToday(); renderStatic(); update();
    if (relang) { relabelGallery(); renderGalTabs(); } else { renderGalTabs(); renderGallery(); }
  }
  renderAll(false); setStep(0); onScroll();
  setInterval(renderToday, 60000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePills);
})();
