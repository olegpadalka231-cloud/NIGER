/* =========================================================
   ДАНІ САЙТУ. Тут редагуються контакти, графік, ціни й галерея.
   Поля *_en містять англійський переклад.
   ========================================================= */

// Контакти та графік. ПРИБЛИЗНІ: уточніть номер будинку, телефон і години.
window.SALON = {
  instagram: 'bbpetsgroom',
  phone: '',                                   // напр. '+380 67 000 00 00'; порожньо, тоді рядок не показується
  address:    'м. Рівне, вул. Студентська',
  address_en: 'Studentska St., Rivne, Ukraine',
  addressNote:    'Точну адресу уточнюйте в Direct',
  addressNote_en: 'Message us on Instagram for the exact address',
  mapsQuery: 'BB Pets Groom вул. Студентська Рівне',
  timezone: 'Europe/Kyiv',
  // години роботи: [відкриття, закриття] за днем тижня (0 = неділя); null означає вихідний
  hours: { 0: [10, 17], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 19] }
};

window.SIZES = [
  { id: 'xs', name: 'Міні',     name_en: 'Toy',    hint: 'до 5 кг',  hint_en: 'up to 5 kg' },
  { id: 's',  name: 'Малий',    name_en: 'Small',  hint: '5–10 кг',  hint_en: '5–10 kg' },
  { id: 'm',  name: 'Середній', name_en: 'Medium', hint: '10–25 кг', hint_en: '10–25 kg' },
  { id: 'l',  name: 'Великий',  name_en: 'Large',  hint: '25+ кг',   hint_en: '25+ kg' }
];

window.CATEGORIES = [
  { id: 'all',     name: 'Усі',              name_en: 'All' },
  { id: 'complex', name: 'Комплекс',         name_en: 'Full groom' },
  { id: 'cut',     name: 'Стрижки',          name_en: 'Haircuts' },
  { id: 'care',    name: 'Догляд і SPA',     name_en: 'Care & spa' },
  { id: 'extra',   name: 'Окремі процедури', name_en: 'Add-ons' }
];

// price: [міні, малий, середній, великий] у гривнях; time: хвилини
window.SERVICES = [
  { id: 'complex', cat: 'complex', hit: true,
    name: 'Комплексний грумінг', name_en: 'Full grooming',
    desc: 'Купання, сушка, вичісування, стрижка, кігті, вушка, гігієнічна зона.',
    desc_en: 'Bath, blow-dry, brush-out, haircut, nails, ears and hygiene trim.',
    price: [900, 1200, 1600, 2200], time: [120, 150, 180, 240] },
  { id: 'model', cat: 'cut',
    name: 'Модельна стрижка', name_en: 'Styled haircut',
    desc: 'За стандартом породи або креативна: «ведмежатко», «лисичка», азійський стиль.',
    desc_en: 'Breed standard or creative: teddy bear, fox style, Asian fusion.',
    price: [1300, 1600, 2100, 2800], time: [150, 180, 210, 270] },
  { id: 'trim', cat: 'cut',
    name: 'Тримінг', name_en: 'Hand stripping',
    desc: 'Вищипування жорсткої шерсті для тер\'єрів і шнауцерів. Зберігає текстуру й колір.',
    desc_en: 'Hand stripping for wire-coated terriers and schnauzers. Keeps coat texture and colour.',
    price: [1100, 1400, 1900, 2500], time: [120, 150, 180, 240] },
  { id: 'hygiene', cat: 'care',
    name: 'Гігієнічний догляд', name_en: 'Tidy-up & hygiene',
    desc: 'Купання, сушка, лапи, кігті, вушка, підстригання гігієнічних зон.',
    desc_en: 'Bath, blow-dry, paw pads, nails, ears and sanitary trim.',
    price: [500, 650, 850, 1100], time: [60, 75, 90, 120] },
  { id: 'deshed', cat: 'care',
    name: 'Експрес-линька', name_en: 'De-shedding',
    desc: 'Інтенсивне вичісування підшерстя з маскою й компресором. Менше шерсті вдома.',
    desc_en: 'Deep undercoat removal with a mask and high-velocity dryer. Less hair at home.',
    price: [700, 900, 1300, 1800], time: [90, 120, 150, 210] },
  { id: 'spa', cat: 'care',
    name: 'SPA-купання', name_en: 'Spa bath',
    desc: 'Відновлювальна маска, масаж, ароматерапія та кондиціонер для блиску.',
    desc_en: 'Restoring mask, massage, aromatherapy and a shine conditioner.',
    price: [600, 750, 1000, 1400], time: [60, 75, 90, 120] },
  { id: 'puppy', cat: 'complex',
    name: 'Перший грумінг цуценяти', name_en: 'Puppy\'s first groom',
    desc: 'М\'яке знайомство з феном і столом: купання, лапки, кігтики, багато похвали.',
    desc_en: 'A gentle introduction to the dryer and table: bath, paws, nails and lots of praise.',
    price: [450, 500, 600, 700], time: [45, 60, 60, 75] },
  { id: 'teeth', cat: 'extra',
    name: 'Чистка зубів ультразвуком', name_en: 'Ultrasonic teeth cleaning',
    desc: 'Без наркозу. Прибирає наліт і запах із пащі.',
    desc_en: 'No anaesthesia. Removes plaque and bad breath.',
    price: [800, 800, 950, 1100], time: [40, 40, 50, 60] },
  { id: 'nails', cat: 'extra',
    name: 'Кігті', name_en: 'Nail trim',
    desc: 'Підстригання та шліфування.',
    desc_en: 'Clipping and filing.',
    price: [200, 200, 250, 300], time: [15, 15, 20, 20] },
  { id: 'ears', cat: 'extra',
    name: 'Чистка вушок', name_en: 'Ear cleaning',
    desc: 'Делікатне очищення, видалення зайвої шерсті з вушного каналу.',
    desc_en: 'Gentle cleaning and removal of excess hair from the ear canal.',
    price: [150, 150, 200, 200], time: [10, 10, 15, 15] },
  { id: 'mats', cat: 'extra',
    name: 'Розбір колтунів', name_en: 'Dematting',
    desc: 'Вручну, зі спеціальними засобами. Ціна за 15 хвилин роботи.',
    desc_en: 'By hand with detangling products. Price per 15 minutes.',
    price: [200, 200, 200, 200], time: [15, 15, 15, 15] }
];

// Галерея. Замініть фото на роботи з вашого Instagram (поле photo).
window.GALLERY = [
  { name: 'Сніжа',    name_en: 'Snizha',   breed: 'Самоїд', breed_en: 'Samoyed', tag: 'deshed', service: 'Експрес-линька та SPA', service_en: 'De-shedding & spa', photo: 'img/g-samoyed.jpg' },
  { name: 'Лорд',     name_en: 'Lord',     breed: 'Цвергшнауцер', breed_en: 'Miniature schnauzer', tag: 'trim', service: 'Тримінг за стандартом породи', service_en: 'Breed-standard hand stripping', photo: 'img/g-schnauzer.jpg' },
  { name: 'Джек',     name_en: 'Jack',     breed: 'Джек-рассел-тер\'єр', breed_en: 'Jack Russell terrier', tag: 'complex', service: 'Гігієна та SPA-купання', service_en: 'Tidy-up & spa bath', photo: 'img/g-jack.jpg' },
  { name: 'Хмаринка', name_en: 'Cloudy',   breed: 'Бішон фрізе', breed_en: 'Bichon frise', tag: 'cut', service: 'Азійська стрижка', service_en: 'Asian fusion cut', photo: 'img/g-bichon.jpg' },
  { name: 'Мілка',    name_en: 'Milka',    breed: 'Кавалер-кінг-чарльз', breed_en: 'Cavalier King Charles', tag: 'complex', service: 'Комплексний грумінг', service_en: 'Full grooming', photo: 'img/g-cavalier.jpg' },
  { name: 'Бусинка',  name_en: 'Bead',     breed: 'Йоркширський тер\'єр', breed_en: 'Yorkshire terrier', tag: 'cut', service: 'Перша стрижка цуценяти', service_en: 'Puppy\'s first haircut', photo: 'img/g-yorkie.jpg' },
  { name: 'Бублик',   name_en: 'Bagel',    breed: 'Вельш-корґі', breed_en: 'Welsh corgi', tag: 'deshed', service: 'Експрес-линька', service_en: 'De-shedding', photo: 'img/g-corgi.jpg' },
  { name: 'Граф',     name_en: 'Count',    breed: 'Лабрадор', breed_en: 'Labrador', tag: 'complex', service: 'SPA-купання', service_en: 'Spa bath', photo: 'img/g-lab.jpg' },
  { name: 'Сонечко',  name_en: 'Sunny',    breed: 'Голден-ретривер', breed_en: 'Golden retriever', tag: 'complex', service: 'Перший грумінг цуценяти', service_en: 'Puppy\'s first groom', photo: 'img/g-golden.jpg' }
];

window.GALLERY_TAGS = [
  { id: 'all',     name: 'Усі',      name_en: 'All' },
  { id: 'cut',     name: 'Стрижки',  name_en: 'Haircuts' },
  { id: 'trim',    name: 'Тримінг',  name_en: 'Stripping' },
  { id: 'deshed',  name: 'Линька',   name_en: 'De-shedding' },
  { id: 'complex', name: 'Комплекс', name_en: 'Full groom' }
];

// Порада майстра до кожного кроку блоку «Як проходить візит»
window.STEP_TIPS = [
  { uk: 'Візьміть улюблену іграшку пса: знайомий запах заспокоює.', en: 'Bring your dog’s favourite toy: a familiar smell is calming.' },
  { uk: 'Не купайте пса вдома за день до грумінгу, ми все зробимо самі.', en: 'Skip the home bath the day before, we will take care of it.' },
  { uk: 'Подвійну шерсть сушимо до кінця, інакше під нею заводиться волога.', en: 'Double coats are dried fully, otherwise moisture stays underneath.' },
  { uk: 'Покажіть фото бажаної стрижки, так майстрові простіше влучити.', en: 'Show us a photo of the look you want, it helps the groomer nail it.' },
  { uk: 'Розчісуйте пса 2–3 рази на тиждень, і колтунів не буде.', en: 'Brush 2–3 times a week and mats will not form.' }
];

// Хайлайти Instagram (кружечки). Посилання ведуть у профіль.
window.HIGHLIGHTS = [
  { uk: 'Роботи', en: 'Work', icon: '✂' },
  { uk: 'Прайс', en: 'Prices', icon: '₴' },
  { uk: 'Відгуки', en: 'Reviews', icon: '★' },
  { uk: 'Догляд', en: 'Care tips', icon: '♡' },
  { uk: 'Локація', en: 'Location', icon: '⌖' }
];
