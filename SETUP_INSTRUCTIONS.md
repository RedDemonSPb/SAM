# Инструкция: Настройка Google Таблиц и Telegram для бронирования

Для того чтобы заявки с сайта попадали в вашу Google Таблицу и дублировались в Telegram, а сайт мог проверять занятые даты, нужно добавить скрипт в вашу таблицу.

---

## Шаг 1: Подготовьте Google Таблицу

1. Создайте новую (или откройте существующую) Google Таблицу, где вы хотите вести учет бронирований.
2. Эта таблица **обязательно** должна иметь в первой строке (шапке) колонку с названием **Даты** (с заглавной буквы). В эту колонку будут записываться даты при новых бронированиях. Из неё же календарь будет брать информацию о занятости.
3. Пример остальных колонок шапки (для вашего удобства): *Дата заявки, Имя, Телефон, Заезд, Выезд, Даты, Ночей, Гостей, Сумма, Комментарий*.
   > Важно: Скрипт просто добавляет новую строку со всеми данными подряд. Но колонка **Даты** должна существовать для блокировки календаря.

---

## Шаг 2: Добавьте скрипт в Таблицу

1. В верхнем меню таблицы нажмите: **Расширения** ➔ **Apps Script**.
2. Откроется новая вкладка. Удалите оттуда весь стандартный код.
3. Скопируйте и вставьте туда **весь код**, приведенный ниже.

```javascript
// ==========================================
// НАСТРОЙКИ (ЗАПОЛНИТЕ ВАШИМИ ДАННЫМИ)
// ==========================================
const TELEGRAM_BOT_TOKEN = "ВАШ_ТОКЕН_БОТА"; // Например: "1234567890:AAH_..."
const TELEGRAM_CHAT_ID = "ВАШ_ID_ЧАТА";      // Например: "12345678" или "-100123456789"

// ==========================================
// ФУНКЦИЯ ПРИЕМА ДАННЫХ ОТ САЙТА (БРОНИРОВАНИЕ)
// ==========================================
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. Получаем данные из формы сайта
    const name = e.parameter.name || "Не указано";
    const phone = e.parameter.phone || "Не указано";
    const start = e.parameter.start || "Не указано";
    const end = e.parameter.end || "Не указано";
    const nights = e.parameter.nights || "0";
    const guests = e.parameter.guests || "1";
    const price = e.parameter.price || "0 ₽";
    const comment = e.parameter.comment || "";
    
    // ВАЖНО ДЛЯ БЛОКИРОВКИ ДАТ: Формируем диапазон как строку
    const dateRange = (start !== "Не указано" && end !== "Не указано") ? (start + " - " + end) : "Не указано";
    
    // 2. Записываем данные в новую строку таблицы
    // Порядок здесь: Дата создания, Имя, Телефон, Заезд, Выезд, Даты, Ночи, Гости, Сумма, Комментарий
    const timestamp = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm:ss");
    sheet.appendRow([
      timestamp, name, "'" + phone, start, end, dateRange, nights, guests, price, comment
    ]);
    
    // 3. Отправляем уведомление в Telegram (если указан токен)
    if (TELEGRAM_BOT_TOKEN !== "ВАШ_ТОКЕН_БОТА") {
      const message = "🔥 <b>НОВОЕ БРОНИРОВАНИЕ (САМ)</b>\n\n" +
                      "👤 <b>Имя:</b> " + name + "\n" +
                      "📞 <b>Телефон:</b> " + phone + "\n" +
                      "📅 <b>Заезд:</b> " + start + "\n" +
                      "📅 <b>Выезд:</b> " + end + "\n" +
                      "🌙 <b>Ночей:</b> " + nights + "\n" +
                      "👥 <b>Гостей:</b> " + guests + "\n" +
                      "💰 <b>Сумма:</b> " + price + "\n" +
                      (comment ? "💬 <b>Комментарий:</b> " + comment : "");
                      
      const tgUrl = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
      const options = {
        "method": "post",
        "payload": {
          "chat_id": TELEGRAM_CHAT_ID,
          "text": message,
          "parse_mode": "HTML"
        }
      };
      UrlFetchApp.fetch(tgUrl, options);
    }
    
    // 4. Обязательный ответ для CORS и работы fetch
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// ФУНКЦИЯ ОТДАЧИ ЗАНЯТЫХ ДАТ САЙТУ
// ==========================================
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) { 
       return ContentService.createTextOutput(JSON.stringify({"dates": []}))
         .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ищем колонку "Даты"
    const headers = data[0];
    const datesColIndex = headers.findIndex(h => h.toString().trim() === "Даты");
    
    let bookedDates = [];
    
    if (datesColIndex !== -1) {
      for (let i = 1; i < data.length; i++) {
        let val = data[i][datesColIndex];
        if (val) {
           bookedDates.push(val.toString().trim());
        }
      }
    }
    
    const result = { "dates": bookedDates };
    const output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"error": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// ФУНКЦИЯ ДЛЯ ПРОВЕРКИ CORS И ПРЕДЗАПРОСОВ
// ==========================================
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

---

## Шаг 3: Впишите данные Telegram

В самом начале кода (строки 5 и 6) замените `"ВАШ_ТОКЕН_БОТА"` и `"ВАШ_ID_ЧАТА"` на реальные данные:
- **Token** берется в Telegram у `@BotFather`.
- **Chat ID** берется при пересылке сообщения от бота в `@getmyid_bot` (с минусом, если это группа).

---

## Шаг 4: Опубликуйте скрипт (Развертывание)

1. В правом верхнем углу (синяя кнопка) нажмите **Начать развертывание** (Deploy) ➔ **Новое развертывание** (New deployment).
2. Нажмите на значок шестеренки (⚙️) рядом с "Выберите тип" и выберите **Веб-приложение** (Web app).
3. **Настройки развертывания:**
   - Запуск от имени: **От моего имени (Me)**
   - У кого есть доступ: **У всех (Anyone)** -> *ОБЯЗАТЕЛЬНО.*
4. Нажмите **Начать развертывание**.
5. Google запросит доступ: **Предоставить доступ** ➔ Выберите свой аккаунт ➔ **Advanced (Дополнительно)** ➔ **Перейти к... (небезопасно)** ➔ **Allow (Разрешить)**.
6. В самом конце вы увидите **URL-адрес веб-приложения** (начинается с `https://script.google.com/.../exec`).

## 🎉 Шаг 5: Передайте ссылку 

**Скопированную ссылку из шага 4 отправьте мне в чат.** 
Я вставлю её в код сайта и интеграция заработает!
