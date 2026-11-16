(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SIZES = window.SIZES, SERVICES = window.SERVICES, CATS = window.CATEGORIES;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n) { return Math.round(n).toLocaleString('uk-UA').replace(/[ ,]/g, ' ') + ' ₴'; };
  var fmtTime = function (m) { var h = Math.floor(m / 60), mm = m % 60; return ((h ? h + ' год' : '') + (h && mm ? ' ' : '') + (mm ? mm + ' хв' : '')) || '0 хв'; };
  var plural = function (n, f) { var a = n % 10, b = n % 100; return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2]; };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('bbpets:' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('bbpets:' + k, JSON.stringify(v)); } catch (e) { /* сховище недоступне */ } }
  };
  var byId = {}; SERVICES.forEach(function (s) { byId[s.id] = s; });

  var state = { size: store.get('size'), cat: 'all', picked: store.get('picked') || [], gTag: 'all', step: 0, day: null, slot: null };
  if (typeof state.size !== 'number' || !(state.size >= 0 && state.size < SIZES.length)) state.size = 1;
  state.picked = state.picked.filter(function (id) { return byId[id]; });

  /* ---------- числа, що «перелічуються» ---------- */
  function tweenText(el, to, format) {
    var from = +el.dataset.v || 0; el.dataset.v = to;
    if (reduce || from === to) { el.textContent = format(to); return; }
    var t0 = performance.now(), d = 600;
    (function tick(t) {
      var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = format(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- тост ---------- */
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2600); }

  /* ---------- перемикачі розміру з «пілюлею», що їздить ---------- */
  var tabEls = [$('#sizeTabs'), $('#formSize')];
  tabEls.forEach(function (el) {
    el.innerHTML = '<span class="tabs__pill" aria-hidden="true"></span>' + SIZES.map(function (s, i) {
      return '<button type="button" role="radio" aria-checked="' + (i === state.size) + '" data-i="' + i + '">' + s.name + '<small>' + s.hint + '</small></button>';
    }).join('');
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
      if (!b || !b.offsetWidth) return;
      pill.style.width = b.offsetWidth + 'px';
      pill.style.transform = 'translate(' + b.offsetLeft + 'px,' + (b.offsetTop - 4) + 'px)';
      pill.style.height = b.offsetHeight + 'px'; pill.style.bottom = 'auto'; pill.style.top = '4px';
    });
  }
  window.addEventListener('resize', movePills);
  function setSize(i) {
    state.size = i; store.set('size', i);
    tabEls.forEach(function (el) { $$('button', el).forEach(function (b) { b.setAttribute('aria-checked', +b.dataset.i === i); }); });
    movePills(); updatePrices(); renderPick();
  }

  /* ---------- прайс ---------- */
  $('#catTabs').innerHTML = CATS.map(function (c) { return '<button type="button" aria-pressed="' + (c.id === 'all') + '" data-c="' + c.id + '">' + c.name + '</button>'; }).join('');
  $('#catTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.cat = b.dataset.c;
    $$('#catTabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderPrice(true);
  });

  function renderPrice(animate) {
    var list = SERVICES.filter(function (s) { return state.cat === 'all' || s.cat === state.cat; });
    $('#priceList').innerHTML = list.map(function (s) {
      var on = state.picked.indexOf(s.id) > -1;
      var same = s.price.every(function (p) { return p === s.price[0]; });
      return '<li class="prow' + (on ? ' is-on' : '') + '" data-id="' + s.id + '">' +
        '<button class="prow__add" type="button" aria-pressed="' + on + '" aria-label="' + (on ? 'Прибрати' : 'Додати') + ': ' + s.name + '">+</button>' +
        '<div><div class="prow__name">' + s.name + (s.hit ? '<sup>Хіт</sup>' : '') + '</div><p class="prow__desc">' + s.desc + '</p></div>' +
        '<span class="prow__time" data-t>≈ ' + fmtTime(s.time[state.size]) + '</span>' +
        '<span class="prow__price">' + (same ? '' : '<small>від</small>') + '<span data-p data-v="' + s.price[state.size] + '">' + fmt(s.price[state.size]) + '</span></span></li>';
    }).join('');
    if (animate && window.MOTION) window.MOTION.rows($$('#priceList .prow'));
  }
  function updatePrices() {
    $$('#priceList .prow').forEach(function (row) {
      var s = byId[row.dataset.id];
      tweenText($('[data-p]', row), s.price[state.size], fmt);
      $('[data-t]', row).textContent = '≈ ' + fmtTime(s.time[state.size]);
    });
    updateTotals();
  }
  function togglePick(id, on) {
    var i = state.picked.indexOf(id);
    if (on == null) on = i < 0;
    if (on && i < 0) state.picked.push(id);
    if (!on && i > -1) state.picked.splice(i, 1);
    store.set('picked', state.picked);
    var row = $('.prow[data-id="' + id + '"]');
    if (row) { row.classList.toggle('is-on', on); var b = $('.prow__add', row); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', (on ? 'Прибрати' : 'Додати') + ': ' + byId[id].name); }
    var c = $('#pick-' + id); if (c) c.checked = on;
    updateTotals();
  }
  $('#priceList').addEventListener('click', function (e) { var row = e.target.closest('.prow'); if (row) togglePick(row.dataset.id); });

  function totals() {
    return state.picked.reduce(function (a, id) { var s = byId[id]; a.sum += s.price[state.size]; a.time += s.time[state.size]; return a; }, { sum: 0, time: 0 });
  }
  function updateTotals() {
    var t = totals(), n = state.picked.length;
    tweenText($('#visitSum'), t.sum, fmt);
    $('#visitText').textContent = n ? n + ' ' + plural(n, ['послуга', 'послуги', 'послуг']) + ' · ≈ ' + fmtTime(t.time) : 'Нічого не обрано';
    tweenText($('#formSum'), t.sum, fmt);
    $('#formTime').textContent = '≈ ' + fmtTime(t.time);
    visitBar();
  }
  // панель «Ваш візит» видно, коли щось обрано і користувач у секції прайсу
  var inServices = false, visit = $('#visitBar');
  function visitBar() { visit.classList.toggle('is-on', inServices && state.picked.length > 0); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inServices = en[0].isIntersecting; visitBar(); }, { rootMargin: '-30% 0px -30% 0px' }).observe($('#services'));
  }
  $('#visitBook').addEventListener('click', function () { if (!$('#done').hidden) $('#newBooking').click(); goStep($('#f-dog').value.trim() ? 1 : 0); scrollToEl('#booking'); });

  /* ---------- галерея ---------- */
  var gList = window.GALLERY.slice();
  $('#galTabs').innerHTML = window.GALLERY_TAGS.map(function (t) { return '<button type="button" aria-pressed="' + (t.id === 'all') + '" data-t="' + t.id + '">' + t.name + '</button>'; }).join('');
  $('#galTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.gTag = b.dataset.t;
    $$('#galTabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var grid = $('#galleryGrid');
    if (window.MOTION) window.MOTION.swapGallery(grid, renderGallery); else renderGallery();
  });
  function renderGallery() {
    gList = window.GALLERY.filter(function (g) { return state.gTag === 'all' || g.tag === state.gTag; });
    $('#galleryGrid').innerHTML = gList.map(function (g, i) {
      return '<button class="gitem" type="button" data-g="' + i + '" aria-label="' + g.name + ', ' + g.breed + ': відкрити фото">' +
        '<img src="' + g.photo + '" alt="' + g.name + ', ' + g.breed + '" loading="lazy">' +
        '<span class="gitem__cap"><b>' + g.name + '</b><span>' + g.breed + ' · ' + g.service + '</span></span></button>';
    }).join('');
  }
  $('#galleryGrid').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (b) openLb(+b.dataset.g, b); });

  /* ---------- лайтбокс ---------- */
  var lb = $('#lightbox'), lbIdx = 0, lbFrom = null;
  function fillLb() {
    var g = gList[lbIdx];
    $('#lbImg').src = g.photo; $('#lbImg').alt = g.name + ', ' + g.breed;
    $('#lbTitle').textContent = g.name; $('#lbText').textContent = g.breed + ' · ' + g.service;
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
    var note = $('#f-note'); if (!note.value) note.value = 'Хочу так само, як у ' + g.name + ' (' + g.service.toLowerCase() + ')';
    setTimeout(function () { scrollToEl('#booking'); }, 350);
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
    if (e.key === 'Tab') {
      var f = $$('button, a[href]', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- FAQ: плавне розкриття ---------- */
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

  /* ---------- запис ---------- */
  var fsets = $$('.fs'), stepLabels = $$('.form__steps span'), err = $('#formErr');
  function renderPick() {
    $('#formServices').innerHTML = SERVICES.map(function (s) {
      var on = state.picked.indexOf(s.id) > -1;
      return '<label><input type="checkbox" id="pick-' + s.id + '" value="' + s.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="n">' + s.name + '</span><span class="p">' + fmt(s.price[state.size]) + '</span><small>≈ ' + fmtTime(s.time[state.size]) + '</small></label>';
    }).join('');
  }
  $('#formServices').addEventListener('change', function (e) { togglePick(e.target.value, e.target.checked); });

  var DOW = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], MON = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
  var days = [];
  (function () { var d = new Date(); d.setHours(0, 0, 0, 0); for (var i = 0; i < 14; i++) { var x = new Date(d); x.setDate(d.getDate() + i); days.push(x); } })();
  // ДЕМО: зайнятість слотів умовна. Підключіть свій календар/CRM, щоб показувати реальні вікна.
  function slotsFor(date) {
    var sun = date.getDay() === 0, from = sun ? 10 : 9, to = sun ? 16 : 18, out = [], now = Date.now();
    for (var h = from; h <= to; h++) [0, 30].forEach(function (m) {
      if (h === to && m === 30) return;
      var t = new Date(date); t.setHours(h, m);
      out.push({ label: h + ':' + (m ? '30' : '00'), busy: t.getTime() < now + 3600000 || (date.getDate() * 31 + h * 7 + m) % 11 < 4 });
    });
    return out;
  }
  function renderDays() {
    $('#days').innerHTML = days.map(function (d, i) {
      var lbl = i === 0 ? 'Сьог.' : i === 1 ? 'Завтра' : DOW[d.getDay()];
      return '<button type="button" data-d="' + i + '" aria-pressed="' + (state.day === i) + '" aria-label="' + d.getDate() + ' ' + MON[d.getMonth()] + '"><small>' + lbl + '</small><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small></button>';
    }).join('');
    renderSlots();
  }
  function renderSlots() {
    if (state.day == null) { $('#slots').innerHTML = '<p class="form__sum">Оберіть день, щоб побачити вільний час.</p>'; return; }
    var list = slotsFor(days[state.day]);
    $('#slots').innerHTML = list.some(function (s) { return !s.busy; }) ? list.map(function (s) {
      return '<button type="button" data-s="' + s.label + '"' + (s.busy ? ' disabled aria-label="' + s.label + ', зайнято"' : '') + ' aria-pressed="' + (state.slot === s.label) + '">' + s.label + '</button>';
    }).join('') : '<p class="form__sum">На цей день вільних вікон немає. Оберіть інший.</p>';
    if (window.MOTION) window.MOTION.pop($$('#slots button'));
  }
  $('#days').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; state.day = +b.dataset.d; state.slot = null; renderDays(); });
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    state.slot = b.dataset.s; $$('#slots button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
  });

  function validate(step) {
    err.textContent = ''; $$('.bad').forEach(function (x) { x.classList.remove('bad'); });
    if (step === 0 && !$('#f-dog').value.trim()) { $('#f-dog').classList.add('bad'); $('#f-dog').focus(); err.textContent = 'Вкажіть кличку пса, щоб майстер знав, кого чекати.'; return false; }
    if (step === 1 && !state.picked.length) { err.textContent = 'Оберіть хоча б одну послугу.'; return false; }
    if (step === 2 && (state.day == null || !state.slot)) { err.textContent = 'Оберіть день і вільний час.'; return false; }
    if (step === 3) {
      if (!$('#f-name').value.trim()) { $('#f-name').classList.add('bad'); $('#f-name').focus(); err.textContent = 'Вкажіть ваше ім\'я.'; return false; }
      if ($('#f-phone').value.replace(/\D/g, '').length < 10) { $('#f-phone').classList.add('bad'); $('#f-phone').focus(); err.textContent = 'Перевірте номер: потрібно щонайменше 10 цифр, наприклад +380 67 123 45 67.'; return false; }
    }
    return true;
  }
  function goStep(n) {
    var prev = state.step; state.step = n;
    fsets.forEach(function (f, i) { f.hidden = i !== n; });
    stepLabels.forEach(function (s, i) { s.classList.toggle('on', i <= n); });
    $('#prevStep').hidden = n === 0; $('#nextStep').hidden = n === fsets.length - 1; $('#submitBtn').hidden = n !== fsets.length - 1;
    err.textContent = '';
    if (n === 0) movePills();
    if (window.MOTION && prev !== n) window.MOTION.step(fsets[n], n > prev ? 1 : -1);
  }
  $('#nextStep').onclick = function () { if (validate(state.step)) goStep(state.step + 1); };
  $('#prevStep').onclick = function () { goStep(state.step - 1); };
  function scrollToEl(sel) { if (window.lenis) window.lenis.scrollTo(sel, { offset: -40, duration: 1.4 }); else $(sel).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  window.scrollToEl = scrollToEl;

  var draftIds = ['f-dog', 'f-breed', 'f-name', 'f-phone', 'f-note'], draft = store.get('draft') || {};
  draftIds.forEach(function (id) { if (draft[id]) $('#' + id).value = draft[id]; });
  $('#bookForm').addEventListener('input', function (e) { if (draftIds.indexOf(e.target.id) > -1) { draft[e.target.id] = e.target.value; store.set('draft', draft); } });

  $('#bookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    for (var k = 0; k < 4; k++) { if (!validate(k)) { if (k !== state.step) { goStep(k); validate(k); } return; } }
    var d = days[state.day], t = totals();
    var names = state.picked.map(function (id) { return byId[id].name.toLowerCase(); });
    var via = ($('input[name="via"]:checked') || {}).value;
    var payload = {
      dog: $('#f-dog').value.trim(), breed: $('#f-breed').value.trim(), size: SIZES[state.size].name, services: names,
      total: t.sum, minutes: t.time, date: d.toISOString().slice(0, 10), time: state.slot,
      name: $('#f-name').value.trim(), phone: $('#f-phone').value.trim(), via: via, note: $('#f-note').value.trim()
    };
    /* ПІДКЛЮЧЕННЯ: window.sendBooking(payload) надсилає заявку (див. README.md) */
    if (typeof window.sendBooking === 'function') { try { window.sendBooking(payload); } catch (x) { /* ignore */ } }
    $('#doneText').textContent = payload.dog + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' о ' + state.slot + '. ' + (function (t) { return t.charAt(0).toUpperCase() + t.slice(1); })(names.join(', ')) + '. Орієнтовно ' + fmt(t.sum) + ', ≈ ' + fmtTime(t.time) + '. Майстер підтвердить запис у ' + (via === 'Дзвінок' ? 'дзвінку' : via) + '.';
    fsets.forEach(function (f) { f.hidden = true; });
    $('.form__steps').hidden = true; $('.form__nav').hidden = true; err.textContent = '';
    $('#done').hidden = false; draft = {}; store.set('draft', {});
  });
  $('#newBooking').onclick = function () {
    ['f-dog', 'f-breed', 'f-note'].forEach(function (id) { $('#' + id).value = ''; });
    state.day = null; state.slot = null; renderDays();
    $('#done').hidden = true; $('.form__steps').hidden = false; $('.form__nav').hidden = false; goStep(0); $('#f-dog').focus();
  };

  /* ---------- навігація ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function setMenu(open) {
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    if (window.lenis) { if (open) window.lenis.stop(); else window.lenis.start(); }
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); setMenu(false); scrollToEl(id);
  });
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !nav.classList.contains('is-open'));
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    var links = {}; $$('#menu a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting && links[x.target.id]) { $$('#menu a').forEach(function (a) { a.classList.remove('is-active'); }); links[x.target.id].classList.add('is-active'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- тема ---------- */
  var root = document.documentElement, saved = store.get('theme');
  if (saved) root.setAttribute('data-theme', saved);
  $('#themeBtn').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store.set('theme', next); toast(next === 'dark' ? 'Темна тема' : 'Світла тема');
  });

  /* ---------- копіювання ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var el = document.getElementById(b.dataset.copy), text = el.textContent.trim();
    var sel = function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Номер виділено'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast('Номер скопійовано'); }, sel); else sel();
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- старт ---------- */
  renderPrice(false); renderGallery(); renderPick(); renderDays(); goStep(0); updateTotals();
  requestAnimationFrame(movePills);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePills);
})();
