/* =========================================================
   Переклад UA / EN.
   Українські тексти беруться прямо з index.html (атрибут data-i18n),
   тут лежать англійські відповідники та динамічні фрази для обох мов.
   ========================================================= */
(function () {
  'use strict';

  var EN = {
    title: 'BB Pets — dog grooming studio in Rivne',
    desc: 'BB Pets Groom Studio in Rivne: full grooming, breed haircuts, hand stripping and spa for dogs of every breed. Book via Instagram Direct in a minute.',
    skip: 'Skip to content', cursor: 'View', logo_al: 'BB Pets: back to top', menu_al: 'Main menu',
    concept: 'Prices, address and hours are approximate, please confirm on Direct',
    m_services: 'Prices', m_process: 'How it works', m_gallery: 'Our dogs', m_booking: 'Booking', m_faq: 'FAQ', m_route: 'Directions',
    lang_al: 'Site language', theme_al: 'Switch theme', book: 'Book now', menu_open: 'Menu',
    eyebrow: 'Dog grooming studio · Studentska St., Rivne',
    h1: 'BB Pets, a dog grooming studio in Rivne',
    lead: 'Care worthy of your best friend. Full grooming, breed haircuts, hand stripping and spa: one groomer from start to finish and never a rush.',
    book_online: 'Book now', prices: 'Prices',
    hint_desk: 'Run your cursor over the letters to comb the fur. Scroll down and we’ll give it a trim.',
    hint_touch: 'Swipe across the letters or scroll down',
    svc_l: 'Services & prices', svc_h1: 'A price list that', svc_h2: '<em>does the maths</em>',
    svc_note: 'Choose your dog’s size and the prices update. Tick the services and we show the total and how long the visit takes.',
    size_al: 'Dog size', cat_al: 'Category',
    fine: 'Prices are approximate. Mats, heavy dirt or difficult behaviour may need extra time. The groomer always tells you before starting.',
    visit_l: 'Your visit', clear_al: 'Clear selection',
    pr_l: 'How a visit works',
    intro: 'We believe grooming is more than a nice haircut. It is calm, safety and trust. That is why every dog gets as much time as it needs.',
    tip_l: 'Groomer’s tip',
    p1_t: 'Meet & greet', p1_d: 'Your dog sniffs around the studio while we discuss the haircut, habits and any health notes.',
    p2_t: 'Bath', p2_d: 'Shampoo and conditioner for the coat type, comfortably warm water and a massage while washing.',
    p3_t: 'Drying', p3_d: 'High-velocity and hand dryer on a quiet setting, thorough undercoat brush-out.',
    p4_t: 'Haircut', p4_d: 'Breed standard or from your photo. Nails, ears, paws and hygiene areas.',
    p5_t: 'Photo report', p5_d: 'We send photos and home-care tips, and remind you when the next visit is due.',
    f1_t: 'No sedation', f1_d: 'Just patience, treats and an experienced groomer',
    f2_t: 'One dog, one groomer', f2_d: 'No queues on the table, no cages',
    a1_t: 'Professional products', a1_d: 'Hypoallergenic products matched to the coat',
    a2_t: 'Hygiene first', a2_d: 'Tools are sterilised after every client',
    gal_l: 'Our dogs', gal_h1: 'Happy clients', gal_h2: '<em>after the visit</em>', gal_al: 'Gallery filter',
    gal_note: 'Photos are illustrative. The studio’s real work is on Instagram every day.',
    hl_l: 'Instagram', hl_p: 'Fresh work, reviews and studio news live in the profile highlights.',
    bk_l: 'Online booking', bk_h1: 'Put together a request,', bk_h2: '<em>we reply on Direct</em>',
    bk_p: 'Tick a few options and the message writes itself. The site sends nothing on its own: the text is copied and Instagram opens in your messenger.',
    lg1: 'Who is coming', fl_dog: 'Name', ph_dog: 'e.g. Bella', fl_breed: 'Breed', ph_breed: 'Start typing',
    lg2: 'What are we doing', lg3: 'When suits you', lg4: 'How should we address you',
    fl_name: 'Your name', ph_name: 'Olena', fl_phone: 'Phone',
    fl_note: 'Comment (optional)', ph_note: 'Allergies, haircut wishes, how your dog reacts to the dryer',
    chat_sub: 'Instagram Direct · usually replies quickly', approx: 'Approx.',
    send_dm: 'Copy & open Direct', copy_req: 'Just copy', add_cal: 'To calendar', reset: 'Clear',
    faq_l: 'FAQ', faq_h1: 'Frequently asked', faq_h2: '<em>questions</em>', faq_p: 'Can’t find an answer? Message us on Instagram, we reply quickly.',
    q1: 'From what age can a dog be groomed?', a1: 'We recommend the first visit after the vaccination course, usually at 3–4 months. Puppies get a gentle intro session: a short bath, paws, nails and lots of praise.',
    q2: 'Does my dog need vaccinations?', a2: 'Yes, your dog must be vaccinated against rabies and the core infections. Please bring the pet passport to the first visit.',
    q3: 'How long does it take?', a3: 'From one hour for a small dog’s tidy-up to four hours for full grooming of a large dog with a thick undercoat. The price list above shows the exact time.',
    q4: 'Can I stay during the grooming?', a4: 'Most dogs are calmer without their owner nearby, so we usually ask you to leave your dog with the groomer. For very anxious dogs we agree individually.',
    q5: 'What do you do with mats?', a5: 'Small mats are worked out by hand with detangling products. If the coat is badly matted, a short clip is safer and kinder. We always agree this with you first.',
    q6: 'How often should my dog be groomed?', a6: 'Breeds that need haircuts (poodle, Yorkie, maltipoo) every 4–6 weeks. Double-coated dogs (Spitz, Samoyed, husky) need de-shedding every 6–8 weeks, more often during shedding season.',
    rt_l: 'Directions', ct_hours: 'Hours', hours_note: 'Hours are approximate and may change on holidays', ct_phone: 'Phone', copy: 'Copy',
    route: 'Get directions', dm: 'Message on Direct',
    map_street: 'Studentska St.', map_you: 'You are here', map_cap: 'Schematic only. “Get directions” opens the exact spot.',
    city: 'Rivne', to_top: 'Back to top ↑', to_top_al: 'Back to top', close_al: 'Close', prev_al: 'Previous photo', next_al: 'Next photo', same: 'I want this look',
    dock_al: 'Quick actions', dock_dm: 'Direct', dock_route: 'Route'
  };

  // Динамічні фрази для обох мов
  var DYN = {
    uk: {
      nothing: 'Нічого не обрано', svc: ['послуга', 'послуги', 'послуг'], hr: 'год', min: 'хв', from: 'від',
      add: 'Додати', remove: 'Прибрати', open_photo: 'відкрити фото', hit: 'Хіт',
      pick_day: 'Оберіть день, щоб побачити вільний час.', no_slots: 'На цей день вільних вікон немає. Оберіть інший.', busy: 'зайнято', dayoff: 'вихідний',
      today: 'Сьог.', tomorrow: 'Завтра',
      dow: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      dow_full: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
      mon: ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'],
      mon_full: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
      err_dog: 'Вкажіть кличку пса, щоб майстер знав, кого чекати.', err_svc: 'Оберіть хоча б одну послугу.', err_slot: 'Оберіть день і вільний час.',
      err_name: 'Вкажіть ваше ім\'я.', err_phone: 'Перевірте номер: потрібно щонайменше 10 цифр, наприклад +380 67 123 45 67.',
      dark: 'Темна тема', light: 'Світла тема', copied: 'Текст скопійовано', copy_fail: 'Текст виділено, скопіюйте його вручну',
      phone_copied: 'Номер скопійовано', open_until: 'Зараз відчинено · до {t}', closed_opens: 'Зараз зачинено · відкриємось {d} о {t}',
      tomorrow_l: 'завтра', today_l: 'сьогодні', same_note: 'Хочу так само, як у {n} ({s})',
      msg_hi: 'Вітаю! Хочу записати пса на грумінг.', msg_dog: 'Пес', msg_svc: 'Послуги', msg_date: 'Дата', msg_sum: 'Орієнтовно',
      msg_name: 'Ім\'я', msg_phone: 'Телефон', msg_via: 'Підтвердити через', msg_note: 'Коментар', via: { instagram: 'Instagram', telegram: 'Telegram', viber: 'Viber', call: 'дзвінок' },
      ph_dog: 'кличка', ph_size: 'розмір', ph_svc: 'послуги', ph_date: 'день і час', ph_name: 'ім\'я', ph_phone: 'телефон',
      need: 'Заповніть, будь ласка: {f}.', copied_open: 'Текст скопійовано. Вставте його в Direct',
      need_date: 'Спершу оберіть день і час.', cleared: 'Форму очищено', added: 'Додано: {n}',
      cal_title: 'Грумінг у BB Pets', cal_saved: 'Подію збережено, відкрийте файл, щоб додати в календар',
      breeds: ['Померанський шпіц', 'Той-пудель', 'Йоркширський тер\'єр', 'Мальтіпу', 'Ши-тцу', 'Бішон фрізе', 'Мальтезе', 'Цвергшнауцер', 'Вельш-корґі', 'Самоїд', 'Голден-ретривер', 'Сибірський хаскі', 'Чіхуахуа', 'Джек-рассел-тер\'єр', 'Метис'],
      marquee: ['Шпіц', 'Пудель', 'Йорк', 'Мальтіпу', 'Самоїд', 'Шнауцер', 'Бішон', 'Корґі', 'Ши-тцу', 'Голден']
    },
    en: {
      nothing: 'Nothing selected', svc: ['service', 'services', 'services'], hr: 'h', min: 'min', from: 'from',
      add: 'Add', remove: 'Remove', open_photo: 'open photo', hit: 'Popular',
      pick_day: 'Pick a day to see available times.', no_slots: 'No free slots on this day. Please pick another one.', busy: 'booked', dayoff: 'closed',
      today: 'Today', tomorrow: 'Tmrw',
      dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dow_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      mon: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      mon_full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      err_dog: 'Enter your dog’s name so the groomer knows who is coming.', err_svc: 'Choose at least one service.', err_slot: 'Pick a day and a free time.',
      err_name: 'Enter your name.', err_phone: 'Check the number: it needs at least 10 digits, e.g. +380 67 123 45 67.',
      dark: 'Dark theme', light: 'Light theme', copied: 'Text copied', copy_fail: 'Text selected, copy it manually',
      phone_copied: 'Number copied', open_until: 'Open now · until {t}', closed_opens: 'Closed now · opens {d} at {t}',
      tomorrow_l: 'tomorrow', today_l: 'today', same_note: 'I’d like the same look as {n} ({s})',
      msg_hi: 'Hello! I’d like to book a grooming appointment.', msg_dog: 'Dog', msg_svc: 'Services', msg_date: 'Date', msg_sum: 'Approx.',
      msg_name: 'Name', msg_phone: 'Phone', msg_via: 'Confirm via', msg_note: 'Comment', via: { instagram: 'Instagram', telegram: 'Telegram', viber: 'Viber', call: 'phone call' },
      ph_dog: 'name', ph_size: 'size', ph_svc: 'services', ph_date: 'day and time', ph_name: 'name', ph_phone: 'phone',
      need: 'Please fill in: {f}.', copied_open: 'Text copied. Paste it into Direct',
      need_date: 'Pick a day and time first.', cleared: 'Form cleared', added: 'Added: {n}',
      cal_title: 'Grooming at BB Pets', cal_saved: 'Event saved, open the file to add it to your calendar',
      breeds: ['Pomeranian', 'Toy poodle', 'Yorkshire terrier', 'Maltipoo', 'Shih Tzu', 'Bichon frise', 'Maltese', 'Miniature schnauzer', 'Welsh corgi', 'Samoyed', 'Golden retriever', 'Siberian husky', 'Chihuahua', 'Jack Russell terrier', 'Mixed breed'],
      marquee: ['Spitz', 'Poodle', 'Yorkie', 'Maltipoo', 'Samoyed', 'Schnauzer', 'Bichon', 'Corgi', 'Shih Tzu', 'Golden']
    }
  };

  var UK = {}, UK_ATTR = [];
  var store = {
    get: function () { try { return localStorage.getItem('bbpets:lang'); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem('bbpets:lang', v); } catch (e) { /* немає сховища */ } }
  };

  function collect() {
    UK.title = document.title;
    var md = document.querySelector('meta[name="description"]'); UK.desc = md ? md.content : '';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { UK[el.dataset.i18n] = el.innerHTML; });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(',').forEach(function (pair) {
        var p = pair.split(':'); UK_ATTR.push({ el: el, attr: p[0].trim(), key: p[1].trim(), uk: el.getAttribute(p[0].trim()) });
      });
    });
  }

  function apply(lang) {
    var en = lang === 'en';
    document.documentElement.lang = lang;
    document.title = en ? EN.title : UK.title;
    var md = document.querySelector('meta[name="description"]'); if (md) md.content = en ? EN.desc : UK.desc;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n, v = en ? EN[k] : UK[k];
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    UK_ATTR.forEach(function (a) { var v = en ? EN[a.key] : a.uk; if (v != null) a.el.setAttribute(a.attr, v); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
  }

  function detect() {
    var s = store.get(); if (s === 'uk' || s === 'en') return s;
    return location.hash === '#en' ? 'en' : 'uk';   // за замовчуванням українська
  }

  var I18N = {
    lang: 'uk',
    t: function (k) { var d = DYN[I18N.lang]; return d[k] != null ? d[k] : DYN.uk[k]; },
    f: function (obj, field) { return (I18N.lang === 'en' && obj[field + '_en']) || obj[field]; },
    fill: function (str, map) { return str.replace(/\{(\w+)\}/g, function (_, k) { return map[k]; }); },
    set: function (lang) {
      if (lang !== 'uk' && lang !== 'en') return;
      I18N.lang = lang; store.set(lang); apply(lang);
      document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }
  };
  window.I18N = I18N;

  collect();
  I18N.lang = detect();
  apply(I18N.lang);
})();
