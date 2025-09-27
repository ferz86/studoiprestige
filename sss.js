require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const API_TOKEN = process.env.TELEGRAM_API_TOKEN;
if (!API_TOKEN) {
  console.error('Ошибка: TELEGRAM_API_TOKEN не найден в переменных окружения');
  process.exit(1);
}

const bot = new TelegramBot(API_TOKEN, { polling: true });

const YCLIENTS_LINK = 'https://n1269590.yclients.com/';
const REVIEWS_LINK = 'https://2gis.ru/surgut/geo/70000001099681508';

const STYLE = {
  GOLD: '✦',
  GEM: '❖',
  DOT: '•',
  NARROW_NBSP: '\u202F',
  NBSP: '\u00A0',
  BRAND_NAME: 'Студия красоты «Престиж»',
  CITY_ADDR: 'Сургут, Александра Усольцева, 13 (1 этаж)',
  PHONE_PLAIN: '+7 909 048-44-64',
  PHONE_PLAIN_2: '+7 982 413-77-75',
  BTN_BOOK: '📝 Запись',
  BTN_PROMO: '🔥 Акции',
  BTN_PRICE: '💰 Прайс-лист',
  BTN_WORKS: '📷 Галерея',
  BTN_INFO: '🧾 О компании',
  BTN_BACK: '⬅ Назад',
  BTN_MALE: '👨 Мужской',
  BTN_FEMALE: '👩 Женский',
  BTN_ROUTE: '🗺 Как до нас добраться',
  BTN_REVIEW: '⭐ Отзывы 2ГИС',
};

function formatRub(amount) {
  let s = amount.toString();
  if (/^\d+$/.test(s) && s.length > 3) s = s.slice(0, -3) + STYLE.NARROW_NBSP + s.slice(-3);
  return `${s}${STYLE.NARROW_NBSP}₽`;
}

function phonePretty(phone) {
  return phone.replace(/ /g, STYLE.NBSP).replace(/-/g, '\u2011');
}

const mainKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: STYLE.BTN_BOOK, url: YCLIENTS_LINK }],
      [{ text: STYLE.BTN_PROMO, callback_data: 'promotions' }],
      [{ text: STYLE.BTN_PRICE, callback_data: 'price' }],
      [{ text: STYLE.BTN_WORKS, callback_data: 'works' }],
      [{ text: STYLE.BTN_INFO, callback_data: 'about' }],
      [{ text: STYLE.BTN_REVIEW, url: REVIEWS_LINK }],
    ],
  },
};

const promoKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🎉 Супер-скидки', callback_data: 'current_discounts' }],
      [{ text: '🎁 Большие розыгрыши', callback_data: 'giveaways' }],
      [{ text: '⬅ Главное меню', callback_data: 'back_main' }],
    ],
  },
};

const priceCategoryKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: STYLE.BTN_MALE, callback_data: 'male_price' }],
      [{ text: STYLE.BTN_FEMALE, callback_data: 'female_price' }],
      [{ text: STYLE.BTN_BACK, callback_data: 'back_main' }],
    ],
  },
};

const priceBackKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '⏪ К категориям', callback_data: 'price' }],
      [{ text: STYLE.BTN_BACK, callback_data: 'back_main' }],
    ],
  },
};

const works = [
  { name: 'Лира — барбер', desc: 'Мужские стрижки и уход за бородой.', photo: 'https://via.placeholder.com/640x360.png?text=Barber%20Lira' },
  { name: 'Сымбат — парикмахер-универсал', desc: 'Стрижки и укладки любой сложности.', photo: 'https://via.placeholder.com/640x360.png?text=Symbat' },
  { name: 'Нурсина — парикмахер-универсал', desc: 'Современные стрижки, окрашивания, укладки.', photo: 'https://via.placeholder.com/640x360.png?text=Nursina' },
];

const photosDir = path.join(__dirname, 'photos');
const logoPath = path.join(photosDir, 'logotip.jpg');

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

function createPriceListStyled(title, sections) {
  let text = `🔥 <b>${title}</b> 🔥\n\n`;
  for (const section of sections) {
    text += `📌 <b>${section.title}</b>\n`;
    for (const item of section.items) {
      text += `  • ${item.name}`;
      if (item.from) text += ' (от)';
      text += ` — <b>${formatRub(item.price)}</b>`;
      if (item.duration) text += ` | ${item.duration}`;
      text += '\n';
    }
    text += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  }
  return text;
}

async function sendMenuWithDelay(chatId, text, keyboard) {
  const loadingMsg = await bot.sendMessage(chatId, '⏳ Пожалуйста, подождите...');
  await new Promise(r => setTimeout(r, 400));
  await bot.deleteMessage(chatId, loadingMsg.message_id);
  await bot.sendMessage(chatId, text, keyboard);
}

async function safeSendMessage(chatId, text, options = {}) {
  try {
    await bot.sendMessage(chatId, text, options);
  } catch (e) {
    console.error('Ошибка отправки сообщения:', e.message);
  }
}

async function safeSendPhoto(chatId, photoPath, options = {}) {
  try {
    if (fs.existsSync(photoPath)) {
      const ext = path.extname(photoPath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      await bot.sendPhoto(chatId, photoPath, { ...options, contentType });
    } else {
      console.warn('Файл не найден:', photoPath);
    }
  } catch (e) {
    console.error('Ошибка отправки фото:', e.message);
  }
}

const handlers = {
  promotions: async (chatId) => {
    await sendMenuWithDelay(chatId, 'Выберите раздел акций:', promoKeyboard);
  },
  current_discounts: async (chatId) => {
    await safeSendMessage(
      chatId,
      `🔥 Акции:\n\n` +
        `• Каждый вторник — специальные предложения и скидки!\n` +
        `• Мужские стрижки — ${formatRub(450)}\n` +
        `• Женские стрижки — ${formatRub(550)}\n\n` +
        `Скидка 15% на окрашивание волос\nПерманентный макияж — скидка 20%`,
      promoKeyboard
    );
  },
  giveaways: async (chatId) => {
    await safeSendMessage(chatId, '🎲 Участвуйте в наших розыгрышах! Оставьте отзыв и подпишитесь на канал.', promoKeyboard);
  },
  price: async (chatId) => {
    await sendMenuWithDelay(chatId, 'Выберите категорию прайса:', priceCategoryKeyboard);
  },
  male_price: async (chatId) => {
    const text = createPriceListStyled('Мужской прайс — «Престиж»', malePriceSections);
    await safeSendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: priceBackKeyboard.reply_markup });
  },
  female_price: async (chatId) => {
    const text = createPriceListStyled('Женский прайс — «Престиж»', femalePriceSections);
    await safeSendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: priceBackKeyboard.reply_markup });
  },
  works: async (chatId) => {
    await safeSendMessage(chatId, '<b>Наши работы</b>', { parse_mode: 'HTML' });
    for (const w of works) {
      await bot.sendPhoto(chatId, w.photo, {
        caption: `${STYLE.GOLD} <b>${w.name}</b>\n${w.desc}`,
        parse_mode: 'HTML',
      });
    }
  },
  about: async (chatId) => {
    const text =
      `<b>О нас</b>\n${STYLE.BRAND_NAME} — премиальный сервис.\n\n<b>Адрес:</b> ${STYLE.CITY_ADDR}\n` +
      `<b>Телефоны:</b> ${phonePretty(STYLE.PHONE_PLAIN)}, ${phonePretty(STYLE.PHONE_PLAIN_2)}\n` +
      `<b>Онлайн-запись:</b> <a href="${YCLIENTS_LINK}">${YCLIENTS_LINK}</a>`;
    await safeSendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: mainKeyboard.reply_markup,
    });
  },
  back_main: async (chatId) => {
    await sendMenuWithDelay(chatId, `✦\nСалон «Престиж»\n✦\nВыберите раздел:`, mainKeyboard);
  },
};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await safeSendPhoto(chatId, logoPath);
  const greeting = `✂️ Добро пожаловать в студию красоты «Престиж»! ✨\n\nОткройте двери к вашему идеальному образу.\nВыберите раздел ниже:`;
  await safeSendMessage(chatId, greeting, mainKeyboard);
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  await bot.answerCallbackQuery(callbackQuery.id);
  if (handlers[data]) {
    await handlers[data](chatId);
  } else {
    await safeSendMessage(chatId, '✦ Команда не распознана. Используйте меню ниже.', mainKeyboard);
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text || msg.text.startsWith('/')) return;
  safeSendMessage(chatId, '✦ Команда не распознана. Используйте меню ниже.', mainKeyboard);
});
