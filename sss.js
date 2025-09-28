require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const API_TOKEN = process.env.TELEGRAM_API_TOKEN;
if (!API_TOKEN) {
  console.error('Ошибка: TELEGRAM_API_TOKEN не найден');
  process.exit(1);
}

const bot = new TelegramBot(API_TOKEN, { polling: true });

const STYLE = {
  GOLD: '✦',
  GEM: '❖',
  DOT: '•',
  NBSP: '\u00A0',
  NARROW_NBSP: '\u202F',
  BRAND_NAME: 'Студия красоты «Престиж»',
  CITY_ADDR: 'Сургут, Александра Усольцева, 13 (1 этаж)',
  PHONE1: '+7 909 048-44-64',
  PHONE2: '+7 982 413-77-75',
  ADMIN_LINK: 'https://t.me/prestige7788',
  YCLIENTS_LINK: 'https://n1269590.yclients.com/',
  REVIEWS_LINK: 'https://2gis.ru/surgut/geo/70000001099681508',
};

function formatRub(amount) {
  const s = amount.toString();
  return s.length > 3
    ? s.slice(0, -3) + STYLE.NARROW_NBSP + s.slice(-3) + STYLE.NARROW_NBSP + '₽'
    : s + STYLE.NARROW_NBSP + '₽';
}

const malePriceSections = [
  {
    title: 'Мужские стрижки',
    items: [
      { name: 'Модельная', price: 650, duration: '35 мин' },
      { name: 'Андеркат', price: 650, duration: '35 мин' },
      { name: 'Площадка', price: 750, duration: '40 мин' },
      { name: 'Полубокс', price: 550, duration: '30 мин' },
      { name: 'Наголо', price: 400, duration: '30 мин' },
      { name: 'Под одну насадку', price: 500, duration: '25 мин' },
      { name: 'Обновление', price: 550, duration: '25 мин' },
    ],
  },
  {
    title: 'Уход и стиль',
    items: [
      { name: 'Камуфляж седины', price: 700, duration: '45 мин' },
      { name: 'Борода и усы', price: 650, duration: '35 мин' },
      { name: 'Тонирование бороды', price: 700, duration: '45 мин' },
      { name: 'Удаление бороды', price: 400, duration: '20 мин' },
    ],
  },
];

const femalePriceSections = [
  {
    title: 'Стрижки',
    items: [
      { name: 'Короткая', price: 800, duration: '40 мин' },
      { name: 'Каре', price: 1200, duration: '1 ч', from: true },
      { name: 'Боб-каре', price: 1200, duration: '1 ч', from: true },
      { name: 'Асимметрия', price: 1200, duration: '1 ч', from: true },
      { name: 'Каскад', price: 1200, duration: '1 ч', from: true },
      { name: 'Чёлка', price: 250, duration: '20 мин' },
    ],
  },
  {
    title: 'Прически',
    items: [
      { name: 'Выпрямление утюжком', price: 1300, duration: '40 мин', from: true },
      { name: 'Вечерние', price: 3000, duration: '1 ч 30 мин', from: true },
      { name: 'Свадебные', price: 6000, duration: '1 ч 30 мин', from: true },
      { name: 'Укладка', price: 1500, duration: '30 мин', from: true },
    ],
  },
  {
    title: 'Окрашивание',
    items: [
      { name: 'Со своей краской', price: 1500, duration: '1 ч 30 мин' },
      { name: 'Корни', price: 1700, duration: '1 ч 20 мин', from: true },
      { name: 'В один тон (короткие)', price: 3200, duration: '1 ч 20 мин' },
      { name: 'В один тон (средние)', price: 3800, duration: '2 ч' },
      { name: 'В один тон (длинные)', price: 6500, duration: '2 ч 35 мин' },
      { name: 'AirTouch (до плеч)', price: 11000, duration: '5 ч 10 мин' },
      { name: 'AirTouch (длинные)', price: 16000, duration: '5 ч 20 мин' },
      { name: 'Сложное окрашивание', price: 4200, duration: 'до 5 ч', from: true },
      { name: 'Блондирование', price: 4400, duration: '3 ч 30 мин' },
      { name: 'Тонирование', price: 1500, duration: '1 ч 30 мин', from: true },
    ],
  },
  {
    title: 'Мелирование',
    items: [
      { name: 'Короткие', price: 3500, duration: '2 ч 30 мин' },
      { name: 'До плеч', price: 5500, duration: '3 ч 30 мин' },
      { name: 'Длинные', price: 7500, duration: '5 ч 5 мин' },
      { name: 'Пряди ниже плеч', price: 4200, duration: '2 ч' },
      { name: 'Осветление корней (до 5 см)', price: 4500, duration: '2 ч' },
    ],
  },
  {
    title: 'Брови',
    items: [
      { name: 'Оформление / окрашивание', price: 650, duration: '20 мин' },
      { name: 'Ламинирование', price: 1800, duration: '30 мин' },
      { name: 'Коррекция + окрашивание', price: 1290, duration: '35 мин' },
      { name: 'Перманентный макияж', price: 7000, duration: '2 ч 30 мин' },
    ],
  },
  {
    title: 'Ламинирование / объём',
    items: [
      { name: 'Ресницы', price: 1800, duration: '1 ч' },
      { name: 'Прикорневой объём (макушка)', price: 3200, duration: '1 ч 30 мин' },
      { name: 'Прикорневой объём (полностью)', price: 5600, duration: '2 ч' },
    ],
  },
  {
    title: 'Био завивка',
    items: [
      { name: 'Короткие', price: 3000, duration: '2 ч' },
      { name: 'Средняя длина', price: 4400, duration: '2 ч' },
      { name: 'Длинные', price: 5500, duration: '2 ч' },
    ],
  },
  {
    title: 'Макияж',
    items: [
      { name: 'Дневной', price: 2500, duration: '2 ч', from: true },
      { name: 'Вечерний', price: 2500, duration: '2 ч', from: true },
    ],
  },
  {
    title: 'Чистка лица',
    items: [
      { name: 'Нить', price: 1000, duration: '20 мин' },
      { name: 'Усики', price: 200, duration: '10 мин' },
    ],
  },
];

const faq = {
  цена: 'Для получения прайс-листа используйте команду /price',
  график: 'Мы работаем ежедневно с 10:00 до 20:00',
  адрес: `Наш адрес: ${STYLE.CITY_ADDR}`,
  запись: `Для онлайн-записи используйте команду /booking или ссылку ${STYLE.YCLIENTS_LINK}`,
};

const customKeyboard = {
  reply_markup: {
    keyboard: [
      ['/price', '/promotions'],
      ['/contacts', '/reviews'],
      ['/booking', '/schedule'],
    ],
    resize_keyboard: true,
  },
};

async function sendPriceList(chatId, sections) {
  for (const section of sections) {
    let text = `<b>${section.title}</b>\n\n`;
    for (const item of section.items) {
      text += `• ${item.name} — <b>${formatRub(item.price)}</b>`;
      if (item.duration) text += ` | ${item.duration}`;
      text += '\n';
    }
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeText =
    `Добро пожаловать в ${STYLE.BRAND_NAME}!\n\n` +
    `Доступные команды:\n` +
    `/price - Просмотреть прайс\n` +
    `/promotions - Акции\n` +
    `/contacts - Контакты\n` +
    `/reviews - Отзывы\n` +
    `/booking - Онлайн запись\n` +
    `/schedule - График работы\n`;
  await bot.sendMessage(chatId, welcomeText, customKeyboard);
});

bot.onText(/\/price$/, async (msg) => {
  await bot.sendMessage(msg.chat.id, `Выберите прайс:\n/price_male - Мужской\n/price_female - Женский`);
});

bot.onText(/\/price_male/, async (msg) => sendPriceList(msg.chat.id, malePriceSections));
bot.onText(/\/price_female/, async (msg) => sendPriceList(msg.chat.id, femalePriceSections));

bot.onText(/\/promotions/, async (msg) => {
  const promoText = `🔥 Акция "Каждый вторник":\n` +
    `• Мужские стрижки — 450₽\n` +
    `• Женские стрижки — 550₽\n` +
    `• Окрашивание волос — скидка 20%\n` +
    `• Перманентный макияж — скидка 20%`;
  await bot.sendMessage(msg.chat.id, promoText);
});

bot.onText(/\/contacts/, async (msg) => {
  const contactText =
    `📞 Контакты:\n` +
    `${STYLE.CITY_ADDR}\n` +
    `${STYLE.PHONE1}\n` +
    `${STYLE.PHONE2}\n` +
    `Консультант: ${STYLE.ADMIN_LINK}\n` +
    `Онлайн-запись: ${STYLE.YCLIENTS_LINK}`;
  await bot.sendMessage(msg.chat.id, contactText);
});

bot.onText(/\/reviews/, async (msg) => {
  await bot.sendMessage(msg.chat.id, `Отзывы в 2ГИС:\n${STYLE.REVIEWS_LINK}`);
});

bot.onText(/\/booking/, async (msg) => {
  await bot.sendMessage(msg.chat.id, `Для онлайн записи используйте:\n${STYLE.YCLIENTS_LINK}`);
});

bot.onText(/\/schedule/, async (msg) => {
  await bot.sendMessage(msg.chat.id, `График работы:\n10:00 — 20:00 ежедневно`);
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.toLowerCase();
  let answered = false;
  for (const key in faq) {
    if (text.includes(key)) {
      await bot.sendMessage(msg.chat.id, faq[key]);
      answered = true;
      break;
    }
  }

  if (!answered) {
    await bot.sendMessage(msg.chat.id, `Не понял ваш запрос. Свяжитесь с администратором:\n${STYLE.ADMIN_LINK}`);
  }
});

console.log('Бот студии «Престиж» запущен!');
