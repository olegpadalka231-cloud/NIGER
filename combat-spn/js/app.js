(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I = window.I18N, t = I.t;
  var P = window.PRODUCTS || [];
  var byId = {}; P.forEach(function (p, i) { p.rank = i; byId[p.id] = p; });
  var CATS = ['all', 'suits', 'jackets', 'pants', 'shirts', 'headwear', 'camo', 'backpacks', 'bags', 'carriers', 'belts', 'pouches', 'other'];
  var PHONE = '380951019911', EMAIL = 'spncombat@gmail.com';
  var HOURS = { 0: null, 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: null }; // Сб–Нд вихідні
  var SIZES = [44, 46, 48, 50, 52, 54, 56, 58, 60, 62], HEIGHTS = [1, 2, 3, 4, 5, 6];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return Math.round(n).toLocaleString('uk-UA').replace(/[  ,]/g, ' ') + ' ' + t('uah'); };
  var plural = function (n, f) { if (I.lang === 'en') return n === 1 ? f[0] : f[1]; var a = n % 10, b = n % 100; return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2]; };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('spn:' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('spn:' + k, JSON.stringify(v)); } catch (e) { /* сховище недоступне */ } }
  };
  var maxPrice = Math.ceil(Math.max.apply(null, P.map(function (p) { return p.price; })) / 100) * 100;
  var state = { cat: 'all', q: '', max: maxPrice, sort: 'pop', shown: 12, mySize: store.get('mysize') };
  var cart = (store.get('cart') || []).filter(function (c) { return byId[c.id]; });

  /* ---------- тост і копіювання ---------- */
  var toastT;
  function toast(msg) { var el = $('#toast'); el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('is-on'); }, 2800); }
  function copy(text, ok) {
    var fb = function () { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { /* ignore */ } ta.remove(); if (ok) toast(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { if (ok) toast(ok); }, fb);
    fb(); return Promise.resolve();
  }

  /* ---------- модальні вікна ---------- */
  var openModal = null, lastFocus = null;
  function showModal(el) {
    if (openModal && openModal !== el) hideModal(openModal, true);
    lastFocus = document.activeElement; el.hidden = false; openModal = el;
    document.body.style.overflow = 'hidden'; if (window.lenis) window.lenis.stop();
    if (window.FX) window.FX.modalIn(el);
    var c = $('[data-close]', el); if (c) c.focus({ preventScroll: true });
  }
  function hideModal(el, quick) {
    var done = function () { el.hidden = true; if (openModal === el) openModal = null; if (!openModal) { document.body.style.overflow = ''; if (window.lenis) window.lenis.start(); } if (!quick && lastFocus) lastFocus.focus({ preventScroll: true }); };
    if (!quick && window.FX) window.FX.modalOut(el, done); else done();
    if (el.id === 'pmodal' && /^#p-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  $$('.modal, .drawer').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) { var a = e.target.closest('a[href^="#"]'); hideModal(m, !!a); } });
  });
  document.addEventListener('keydown', function (e) {
    if (!openModal) return;
    if (e.key === 'Escape') hideModal(openModal);
    if (e.key === 'Tab') {
      var f = $$('button:not([disabled]), a[href], input, select, textarea', openModal).filter(function (x) { return x.offsetParent; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (openModal.id === 'pmodal' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) pmGo(e.key === 'ArrowRight' ? 1 : -1);
  });

  /* ---------- каталог ---------- */
  function catName(c) { return t('cats')[c]; }
  function filtered() {
    var q = state.q.toLowerCase().trim();
    var list = P.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (p.price > state.max) return false;
      if (q) { var hay = (p.ua + ' ' + p.en + ' ' + catName(p.cat) + ' ' + t('cats')[p.cat] + ' ' + p.desc).toLowerCase(); return q.split(/\s+/).every(function (w) { return hay.indexOf(w.replace(/[«»"]/g, '')) > -1; }); }
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) { return s === 'asc' ? a.price - b.price : s === 'desc' ? b.price - a.price : s === 'name' ? a.ua.localeCompare(b.ua, 'uk') : a.rank - b.rank; });
    return list;
  }
  function renderChips() {
    var counts = {}; P.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $('#catChips').innerHTML = CATS.map(function (c) {
      return '<button type="button" data-cat="' + c + '" aria-pressed="' + (state.cat === c) + '">' + catName(c) + '<small>' + (c === 'all' ? P.length : counts[c]) + '</small></button>';
    }).join('');
  }
  $('#catChips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.cat = b.dataset.cat; state.shown = 12;
    $$('#catChips button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderGrid(true);
  });
  function cardHTML(p) {
    var img2 = p.img[1] ? '<img src="' + p.img[1] + '" alt="" loading="lazy">' : '';
    return '<li class="card" data-id="' + p.id + '">' +
      '<button class="card__media" type="button" data-open="' + p.id + '" aria-label="' + esc(p.ua) + '"><span class="card__tag">' + catName(p.cat) + '</span>' +
      '<img src="' + (p.img[0] || '') + '" alt="' + esc(p.ua) + '" loading="lazy">' + img2 + '</button>' +
      '<div class="card__body"><span class="card__en">' + esc(p.en) + '</span>' +
      '<p class="card__name"><button type="button" data-open="' + p.id + '">' + esc(p.ua) + '</button></p>' +
      '<div class="card__foot"><span class="card__price">' + money(p.price) + '</span>' +
      '<button class="card__add" type="button" data-add="' + p.id + '" aria-label="' + esc(t('add_short') + ': ' + p.ua) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div></div></li>';
  }
  function renderGrid(animate) {
    var list = filtered(), shown = list.slice(0, state.shown);
    $('#grid').innerHTML = shown.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#moreBtn').parentNode.hidden = list.length <= state.shown;
    $('#catCount').textContent = list.length + ' ' + plural(list.length, t('found'));
    $('#priceOut').textContent = state.max >= maxPrice ? t('any') : money(state.max);
    if (window.FX) window.FX.cards($$('#grid .card'), animate);
  }
  $('#moreBtn').addEventListener('click', function () {
    var before = $$('#grid .card').length; state.shown += 12; renderGrid(false);
    if (window.FX) window.FX.cards($$('#grid .card').slice(before), true);
  });
  var qt;
  $('#q').addEventListener('input', function (e) { clearTimeout(qt); qt = setTimeout(function () { state.q = e.target.value; state.shown = 12; renderGrid(true); }, 160); });
  $('#priceMax').max = maxPrice; $('#priceMax').value = maxPrice;
  $('#priceMax').addEventListener('input', function (e) { state.max = +e.target.value; state.shown = 12; renderGrid(false); });
  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(true); });
  $('#grid').addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { openProduct(o.dataset.open); return; }
    var a = e.target.closest('[data-add]'); if (a) { var p = byId[a.dataset.add]; if (p.sized) openProduct(p.id); else { addToCart(p.id, null, null, 1); if (window.FX) window.FX.fly(a, $('#cartBtn')); } }
  });
  $('#searchBtn').addEventListener('click', function () { scrollToEl('#catalog'); setTimeout(function () { $('#q').focus({ preventScroll: true }); }, 900); });

  /* ---------- картка товару ---------- */
  var pm = { p: null, i: 0, qty: 1 };
  function descHTML(text) {
    var lines = text.split('\n'), html = '', inList = false;
    lines.forEach(function (raw) {
      var l = raw.trim();
      if (!l) { if (inList) { html += '</ul>'; inList = false; } return; }
      if (/^[•\-–]\s*/.test(l)) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + esc(l.replace(/^[•\-–]\s*/, '')) + '</li>'; return; }
      if (inList) { html += '</ul>'; inList = false; }
      html += /:$/.test(l) && l.length < 40 ? '<p><strong>' + esc(l.replace(/:$/, '')) + '</strong></p>' : '<p>' + esc(l) + '</p>';
    });
    if (inList) html += '</ul>';
    return html;
  }
  function pmImage(i) {
    var p = pm.p; pm.i = (i + p.img.length) % p.img.length;
    var main = $('#pmMain'), src = p.img[pm.i];
    if (window.FX) window.FX.swapImg(main, src, p.ua); else main.innerHTML = '<img src="' + src + '" alt="' + esc(p.ua) + '">';
    $$('#pmThumbs button').forEach(function (b, k) { b.setAttribute('aria-current', k === pm.i); });
  }
  function pmGo(d) { if (pm.p && pm.p.img.length > 1) pmImage(pm.i + d); }
  function openProduct(id) {
    var p = byId[id]; if (!p) return;
    pm.p = p; pm.qty = 1;
    $('#pmCat').textContent = catName(p.cat); $('#pmEn').textContent = p.en; $('#pmTitle').textContent = p.ua;
    $('#pmPrice').textContent = money(p.price); $('#pmQty').textContent = 1;
    $('#pmMain').innerHTML = '<img src="' + p.img[0] + '" alt="' + esc(p.ua) + '">'; pm.i = 0;
    $('#pmThumbs').innerHTML = p.img.map(function (src, k) { return '<button type="button" data-i="' + k + '" aria-current="' + (k === 0) + '" aria-label="' + (k + 1) + '"><img src="' + src + '" alt=""></button>'; }).join('');
    $('#pmOpts').hidden = !p.sized;
    if (p.sized) {
      var ms = state.mySize || {};
      $('#pmSize').innerHTML = '<option value="">—</option>' + SIZES.map(function (s) { return '<option' + (ms.s === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
      $('#pmHeight').innerHTML = '<option value="">—</option>' + HEIGHTS.map(function (h) { return '<option' + (ms.h === h ? ' selected' : '') + '>' + h + '</option>'; }).join('');
    }
    $('#pmDesc').innerHTML = (I.lang === 'en' && t('only_ua') ? '<p class="note">' + t('only_ua') + '</p>' : '') + descHTML(p.desc || '');
    if (location.hash !== '#p-' + p.id) history.replaceState(null, '', '#p-' + p.id);
    showModal($('#pmodal'));
    $('#pmodal .modal__box').scrollTop = 0;
  }
  $('#pmThumbs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pmImage(+b.dataset.i); });
  var sx = null;
  $('#pmMain').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $('#pmMain').addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) pmGo(dx < 0 ? 1 : -1); sx = null; });
  $('#pmMinus').onclick = function () { pm.qty = Math.max(1, pm.qty - 1); $('#pmQty').textContent = pm.qty; };
  $('#pmPlus').onclick = function () { pm.qty = Math.min(99, pm.qty + 1); $('#pmQty').textContent = pm.qty; };
  $('#pmAdd').addEventListener('click', function () {
    var p = pm.p, s = null, h = null;
    if (p.sized) {
      s = +$('#pmSize').value || null; h = +$('#pmHeight').value || null;
      if (!s || !h) { toast(t('pick_size')); [$('#pmSize'), $('#pmHeight')].forEach(function (el) { el.classList.toggle('bad', !el.value); }); return; }
      state.mySize = { s: s, h: h }; store.set('mysize', state.mySize);
    }
    addToCart(p.id, s, h, pm.qty);
    if (window.FX) window.FX.fly($('#pmMain img'), $('#cartBtn'));
    hideModal($('#pmodal'));
  });
  ['#pmSize', '#pmHeight'].forEach(function (s) { $(s).addEventListener('change', function (e) { e.target.classList.remove('bad'); }); });
  $('#pmShare').addEventListener('click', function () { copy(location.href.split('#')[0] + '#p-' + pm.p.id, t('link_copied')); });
  function fromHash() { var m = /^#p-(.+)$/.exec(location.hash); if (m && byId[m[1]] && (!openModal || pm.p !== byId[m[1]])) openProduct(m[1]); }
  window.addEventListener('hashchange', fromHash);

  /* ---------- кошик ---------- */
  function key(id, s, h) { return id + '|' + (s || '') + '|' + (h || ''); }
  function saveCart() { store.set('cart', cart); renderCart(); }
  function addToCart(id, s, h, qty) {
    var k = key(id, s, h), it = cart.find(function (c) { return c.k === k; });
    if (it) it.qty += qty; else cart.push({ k: k, id: id, s: s, h: h, qty: qty });
    saveCart(); toast(t('added') + ': ' + byId[id].ua);
    if (window.FX) window.FX.bump($('#cartCount'));
  }
  function cartTotal() { return cart.reduce(function (a, c) { return a + byId[c.id].price * c.qty; }, 0); }
  function cartCount() { return cart.reduce(function (a, c) { return a + c.qty; }, 0); }
  function itemLabel(c) { var p = byId[c.id]; return p.ua + (c.s ? ', ' + t('size_word') + ' ' + c.s + '/' + c.h : ''); }
  function renderCart() {
    var n = cartCount();
    $('#cartCount').textContent = n; $('#cartCount').classList.toggle('is-zero', !n); $('#dockCount').textContent = n;
    $('#citems').innerHTML = cart.map(function (c, i) {
      var p = byId[c.id];
      return '<li class="citem"><img src="' + p.img[0] + '" alt=""><div><p class="citem__name">' + esc(p.ua) + '</p><p class="citem__meta">' + esc(p.en) + (c.s ? ' · ' + t('size_word') + ' ' + c.s + ' · ' + t('height_word') + ' ' + c.h : '') + '</p><button class="citem__rm" type="button" data-rm="' + i + '">✕</button></div>' +
        '<div class="citem__right"><span class="citem__price">' + money(p.price * c.qty) + '</span><div class="qty"><button type="button" data-dq="' + i + '" data-d="-1" aria-label="−">−</button><output>' + c.qty + '</output><button type="button" data-dq="' + i + '" data-d="1" aria-label="+">+</button></div></div></li>';
    }).join('');
    $('#cempty').hidden = cart.length > 0; $('#checkout').hidden = !cart.length; $('#cartFoot').hidden = !cart.length;
    $('#cartSum').textContent = money(cartTotal());
  }
  $('#citems').addEventListener('click', function (e) {
    var q = e.target.closest('[data-dq]'), r = e.target.closest('[data-rm]');
    if (q) { var c = cart[+q.dataset.dq]; c.qty += +q.dataset.d; if (c.qty < 1) cart.splice(+q.dataset.dq, 1); saveCart(); }
    if (r) { cart.splice(+r.dataset.rm, 1); saveCart(); }
  });
  function openCart() { renderCart(); showModal($('#cart')); }
  $('#cartBtn').addEventListener('click', openCart);
  $('#dockCart').addEventListener('click', openCart);

  /* ---------- надсилання замовлень ---------- */
  var val = function (id) { return $(id).value.trim(); };
  function orderNo() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return 'SPN-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000); }
  function require_(fields, errEl) {
    var miss = [];
    fields.forEach(function (f) { var el = $(f[0]), bad = f[2] ? !f[2](el.value) : !el.value.trim(); el.classList.toggle('bad', bad); if (bad) miss.push(t(f[1])); });
    errEl.textContent = miss.length ? I.fill(t('err_need'), { f: miss.join(', ') }) : '';
    if (miss.length && window.FX) window.FX.shake(errEl);
    return !miss.length;
  }
  var phoneOk = function (v) { return v.replace(/\D/g, '').length >= 10; };
  function send(via, text, subject) {
    var enc = encodeURIComponent(text), url;
    copy(text);
    if (via === 'whatsapp') url = 'https://wa.me/' + PHONE + '?text=' + enc;
    else if (via === 'viber') url = 'viber://forward?text=' + enc;
    else if (via === 'telegram') url = 'https://t.me/+' + PHONE;
    else url = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + enc;
    if (via === 'email' || via === 'viber') location.href = url; else window.open(url, '_blank', 'noopener');
    toast(via === 'telegram' ? t('sent_tg') : I.fill(t('sent'), { via: via === 'email' ? 'Email' : ({ whatsapp: 'WhatsApp', viber: 'Viber', telegram: 'Telegram' })[via] }));
  }
  function cartText() {
    var no = orderNo();
    var lines = [t('order_h') + ' · ' + t('order_n') + no, '', t('o_items') + ':'];
    cart.forEach(function (c, i) { lines.push((i + 1) + '. ' + itemLabel(c) + ' × ' + c.qty + ' ' + t('pcs') + ' = ' + money(byId[c.id].price * c.qty)); });
    lines.push('', t('o_total') + ': ' + money(cartTotal()), '', t('o_name') + ': ' + val('#co-name'), t('o_phone') + ': ' + val('#co-phone'), t('o_city') + ': ' + val('#co-city'), t('o_np') + ': ' + val('#co-np'));
    if (val('#co-note')) lines.push(t('o_note') + ': ' + val('#co-note'));
    return { text: lines.join('\n'), no: no };
  }
  $$('.send-btns').forEach(function (box) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-via]'); if (!b) return;
      if (box.dataset.form === 'cart') {
        if (!cart.length) { toast(t('err_cart_empty')); return; }
        if (!require_([['#co-name', 'f_name'], ['#co-phone', 'f_phone', phoneOk], ['#co-city', 'f_city'], ['#co-np', 'f_np']], $('#coErr'))) return;
        var o = cartText(); send(b.dataset.via, o.text, t('order_h') + ' ' + o.no);
      } else {
        if (!require_([['#u-org', 'f_org'], ['#u-phone', 'f_phone', phoneOk], ['#u-need', 'f_need']], $('#unitErr'))) return;
        var txt = [t('unit_h'), '', t('u_org') + ': ' + val('#u-org'), t('u_name') + ': ' + val('#u-name'), t('u_phone') + ': ' + val('#u-phone'), t('u_qty') + ': ' + (val('#u-qty') || '—'), '', t('u_need') + ':', val('#u-need')].join('\n');
        send(b.dataset.via, txt, t('unit_h') + ': ' + val('#u-org'));
      }
    });
  });
  $('#fromCart').addEventListener('click', function () {
    if (!cart.length) { toast(t('cart_empty_fill')); return; }
    $('#u-need').value = cart.map(function (c) { return itemLabel(c) + ' × ' + c.qty; }).join('\n');
    saveDrafts();
  });
  var draftIds = ['co-name', 'co-phone', 'co-city', 'co-np', 'u-org', 'u-name', 'u-phone', 'u-qty', 'u-need'], drafts = store.get('drafts') || {};
  draftIds.forEach(function (id) { if (drafts[id]) $('#' + id).value = drafts[id]; $('#' + id).addEventListener('input', function (e) { e.target.classList.remove('bad'); saveDrafts(); }); });
  function saveDrafts() { draftIds.forEach(function (id) { drafts[id] = $('#' + id).value; }); store.set('drafts', drafts); }

  /* ---------- калькулятор розміру ---------- */
  function calcSize(save) {
    var c = +$('#chest').value, h = +$('#height').value, out = $('#sizeOut'), note = $('#sizeNote');
    $$('.sizetab td').forEach(function (td) { td.classList.remove('is-on'); });
    if (!(c >= 84 && c <= 128) || !(h >= 150 && h <= 200)) { out.textContent = '—'; note.textContent = t('sz_out'); return; }
    var s = Math.min(62, Math.max(44, Math.round(c / 4) * 2));
    var hi = Math.min(6, Math.max(1, Math.ceil((h - 158) / 6) || 1));
    out.textContent = s + '/' + hi;
    note.textContent = I.fill(t('sz_note'), { s: s, h: hi });
    var td = $$('.sizetab td')[hi - 1]; if (td) td.classList.add('is-on');
    if (save) { state.mySize = { s: s, h: hi }; store.set('mysize', state.mySize); }
  }
  ['#chest', '#height'].forEach(function (s) { $(s).addEventListener('input', function () { calcSize(true); }); });
  $('#sizeCalc').addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- сертифікати ---------- */
  $('#certs').addEventListener('click', function (e) { var b = e.target.closest('[data-cert]'); if (!b) return; $('#certImg').src = 'img/brand/cert' + b.dataset.cert + '.jpg'; $('#certImg').alt = b.querySelector('img').alt; showModal($('#cmodal')); });

  /* ---------- контакти: графік і статус ---------- */
  function kyivNow() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var g = function (k) { return (p.find(function (x) { return x.type === k; }) || {}).value; };
      return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), m: (+g('hour') % 24) * 60 + +g('minute') };
    } catch (e) { var d = new Date(); return { dow: d.getDay(), m: d.getHours() * 60 + d.getMinutes() }; }
  }
  var hh = function (h) { return (h < 10 ? '0' : '') + h + ':00'; };
  function renderHours() {
    var n = kyivNow(), td = HOURS[n.dow], open = td && n.m >= td[0] * 60 && n.m < td[1] * 60;
    $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) { var h = HOURS[d]; return '<li' + (d === n.dow ? ' class="is-today"' : '') + '><span>' + t('dow_full')[d] + '</span><span>' + (h ? hh(h[0]) + '–' + hh(h[1]) : t('dayoff')) + '</span></li>'; }).join('');
    $('#statusDot').classList.toggle('is-open', !!open);
    if (open) { $('#statusText').textContent = I.fill(t('open_until'), { t: hh(td[1]) }); return; }
    for (var i = 0; i < 8; i++) {
      var d = (n.dow + i) % 7, hrs = HOURS[d];
      if (!hrs || (i === 0 && n.m >= hrs[0] * 60)) continue;
      $('#statusText').textContent = I.fill(t('closed_opens'), { d: i === 0 ? t('today_l') : i === 1 ? t('tomorrow_l') : t('dow_full')[d].toLowerCase(), t: hh(hrs[0]) });
      return;
    }
  }

  /* ---------- навігація ---------- */
  function scrollToEl(sel) { if (window.lenis) window.lenis.scrollTo(sel, { offset: -10, duration: 1.3 }); else $(sel).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  window.scrollToEl = scrollToEl;
  var nav = $('#nav'), burger = $('#burger');
  function setMenu(open) { nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); if (window.lenis) { if (open) window.lenis.stop(); else if (!openModal) window.lenis.start(); } }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); setMenu(false); if (openModal) hideModal(openModal, true); scrollToEl(id);
  });
  var lastY = 0, bar = $('#progressBar'), dock = $('#dock'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY, max = root.scrollHeight - innerHeight;
    root.classList.toggle('is-scrolled', y > 30);
    if (y > 500 && y > lastY + 4 && !nav.classList.contains('is-open')) nav.classList.add('is-hidden');
    if (y < lastY - 4 || y < 500) nav.classList.remove('is-hidden');
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    dock.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if ('IntersectionObserver' in window) {
    var links = {}; $$('#menu a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting && links[x.target.id]) { $$('#menu a').forEach(function (a) { a.classList.remove('is-active'); }); links[x.target.id].classList.add('is-active'); } }); }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- мова ---------- */
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { var l = b.dataset.lang; if (l === I.lang) return; if (window.FX) window.FX.curtain(function () { I.set(l); }); else I.set(l); });
  });
  document.addEventListener('langchange', function () {
    renderChips(); renderGrid(false); renderCart(); renderHours(); calcSize();
    if (openModal && openModal.id === 'pmodal' && pm.p) { $('#pmCat').textContent = catName(pm.p.cat); $('#pmPrice').textContent = money(pm.p.price); }
  });

  $('#year').textContent = new Date().getFullYear();
  window.APP = { toast: toast };

  /* ---------- старт ---------- */
  renderChips(); renderGrid(false); renderCart(); renderHours(); calcSize(); onScroll();
  setInterval(renderHours, 60000);
  fromHash();
})();
