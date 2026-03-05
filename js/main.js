// === ЕДИНЫЙ SCROLL-ОБРАБОТЧИК ===
const progressBar = document.getElementById('progressBar');
const navbar = document.getElementById('navbar');
const heroBg = document.getElementById('heroBg');
const mestoBg = document.getElementById('mestoBg');
const mestoSection = document.getElementById('mesto');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;

  // Прогресс-бар
  const total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total) * 100 + '%';

  // Навигация — compact при скролле
  if (scrolled > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Параллакс на главной
  if (heroBg) heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
  if (mestoBg && mestoSection) {
    const mestoTop = mestoSection.offsetTop;
    const relScroll = scrolled - mestoTop;
    if (relScroll > -window.innerHeight && relScroll < window.innerHeight) {
      mestoBg.style.transform = `translateY(${relScroll * 0.2}px)`;
    }
  }
});

// Активная ссылка в навигации
const sections = document.querySelectorAll('section.page');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => observer.observe(s));

// ===== БРОНИРОВАНИЕ =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbybP9jAOEc-Bl2WiC6Zalo7ZWV8utYptw43AdEA5yrQT22_rHKNq3KUGDs9yXt_jZF9dg/exec';

const bkState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  start: null,
  end: null,
  picking: 'start',
  bookedDates: [] // Храним загруженные занятые даты
};
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

// Получение занятых дат из таблицы
async function bkFetchBookedDates() {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    if (res.ok) {
      const data = await res.json();
      if (data.dates && data.dates.length > 0) {
        bkState.bookedDates = data.dates;
        bkRender(); // Перерисовываем календарь с учетом занятых дат
      }
    }
  } catch (e) {
    console.error('Ошибка загрузки дат:', e);
  }
}

// Проверка: является ли дата занятой
function isDateBooked(dateObj) {
  if (bkState.bookedDates.length === 0) return false;

  const dFormat = bkFmtDate(dateObj); // формат DD.MM.YYYY
  const time = dateObj.getTime();

  for (const item of bkState.bookedDates) {
    if (item.includes('-')) {
      // Это диапазон
      const parts = item.split('-');
      const startStr = parts[0].trim();
      const endStr = parts[1].trim();

      const pStart = startStr.split('.');
      const pEnd = endStr.split('.');
      if (pStart.length === 3 && pEnd.length === 3) {
        const dStart = new Date(pStart[2], pStart[1] - 1, pStart[0]).getTime();
        const dEnd = new Date(pEnd[2], pEnd[1] - 1, pEnd[0]).getTime();
        // Включаем границы
        if (time >= dStart && time <= dEnd) return true;
      }
    } else {
      // Это одиночная дата
      if (item.trim() === dFormat) return true;
    }
  }
  return false;
}

function bkRender() {
  const { year, month, start, end } = bkState;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  document.getElementById('bkMonth').textContent = `${MONTHS[month]} ${year}`;
  const grid = document.getElementById('bkGrid');
  grid.innerHTML = '';
  let firstDay = new Date(year, month, 1).getDay() - 1;
  if (firstDay < 0) firstDay = 6;
  const days = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.style.cssText = 'aspect-ratio:1;';
    grid.appendChild(e);
  }
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d); date.setHours(0, 0, 0, 0);
    const cell = document.createElement('div');
    cell.textContent = d;
    cell.style.cssText = 'aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer; position:relative; user-select:none; transition:background 0.2s, color 0.2s;';
    const isPast = date < today;
    const isBooked = isDateBooked(date);

    if (isPast || isBooked) {
      cell.style.color = 'rgba(255,255,255,0.15)';
      cell.style.cursor = 'not-allowed';
      if (isBooked) {
        // Можно заштриховать или визуально выделить занятые даты
        cell.style.background = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 10px)';
      }
    } else {
      if (start && date.getTime() === start.getTime()) {
        cell.style.background = '#C17B2F'; cell.style.color = 'white'; cell.style.fontWeight = '700';
      } else if (end && date.getTime() === end.getTime()) {
        cell.style.background = '#C17B2F'; cell.style.color = 'white'; cell.style.fontWeight = '700';
      } else if (start && end && date > start && date < end) {
        cell.style.background = 'rgba(193,123,47,0.15)';
      } else if (date.getTime() === today.getTime()) {
        cell.style.color = '#C17B2F'; cell.style.fontWeight = '700';
      }
      cell.addEventListener('mouseover', function () {
        if (!this.style.background || this.style.background === 'rgba(193, 123, 47, 0.15)') {
          this.style.background = 'rgba(193,123,47,0.2)'; this.style.color = '#C17B2F';
        }
      });
      cell.addEventListener('mouseout', function () {
        bkRender();
      });
      cell.addEventListener('click', () => bkSelectDate(date));
    }
    grid.appendChild(cell);
  }
}

function bkSelectDate(date) {
  if (bkState.picking === 'start') {
    bkState.start = date; bkState.end = null; bkState.picking = 'end';
  } else {
    if (date <= bkState.start) {
      bkState.start = date; bkState.end = null; bkState.picking = 'end';
    } else {
      const n = Math.round((date - bkState.start) / 86400000);

      // Проверяем, нет ли занятых дат внутри выбранного диапазона
      let hasBookedInside = false;
      for (let i = 1; i <= n; i++) {
        let checkDate = new Date(bkState.start.getTime() + i * 86400000);
        if (isDateBooked(checkDate)) {
          hasBookedInside = true;
          break;
        }
      }

      if (hasBookedInside) {
        const note = document.getElementById('bkMinNote');
        const oldText = note.textContent;
        note.textContent = 'В этом диапазоне есть занятые даты';
        note.style.color = '#C17B2F';
        setTimeout(() => {
          note.textContent = oldText;
          note.style.color = 'rgba(255,255,255,0.25)';
        }, 2000);
        return;
      }

      if (n < 2) {
        const note = document.getElementById('bkMinNote');
        note.style.color = '#C17B2F';
        setTimeout(() => { note.style.color = 'rgba(255,255,255,0.25)'; }, 1500);
        return;
      }
      bkState.end = date; bkState.picking = 'start';
    }
  }
  bkRender(); bkUpdateUI();
}

function bkUpdateUI() {
  const { start, end } = bkState;
  const datesBlock = document.getElementById('bkDatesBlock');
  const priceBlock = document.getElementById('bkPrice');
  const submitBtn = document.getElementById('bkSubmit');
  if (start && !end) {
    datesBlock.style.display = 'block';
    document.getElementById('bkDatesValue').textContent = bkFmtDate(start) + ' → ...';
    document.getElementById('bkNightsValue').textContent = 'Выберите дату выезда';
    priceBlock.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.style.background = 'rgba(255,255,255,0.05)';
    submitBtn.style.color = 'rgba(255,255,255,0.2)';
    submitBtn.style.cursor = 'not-allowed';
  } else if (start && end) {
    const n = Math.round((end - start) / 86400000);
    const total = n * 7000;
    datesBlock.style.display = 'block';
    document.getElementById('bkDatesValue').textContent = `${bkFmtDate(start)} → ${bkFmtDate(end)}`;
    document.getElementById('bkNightsValue').textContent = `${n} ${bkNightWord(n)}`;
    priceBlock.style.display = 'block';
    document.getElementById('bkNightsLbl').textContent = `${n} ${bkNightWord(n)}`;
    document.getElementById('bkNightsVal').textContent = bkFmtPrice(n * 7000) + ' ₽';
    document.getElementById('bkTotal').textContent = bkFmtPrice(total) + ' ₽';
    submitBtn.disabled = false;
    submitBtn.style.background = '#C17B2F';
    submitBtn.style.color = 'white';
    submitBtn.style.cursor = 'pointer';
  }
}

document.getElementById('bkPrev').addEventListener('click', () => {
  const today = new Date();
  if (bkState.month === today.getMonth() && bkState.year === today.getFullYear()) return;
  bkState.month--; if (bkState.month < 0) { bkState.month = 11; bkState.year--; }
  bkRender();
});
document.getElementById('bkNext').addEventListener('click', () => {
  bkState.month++; if (bkState.month > 11) { bkState.month = 0; bkState.year++; }
  bkRender();
});

function bkSubmitBooking() {
  if (!GOOGLE_SCRIPT_URL) {
    alert("К сожалению, бронирование временно недоступно (не настроен URL интеграции). Напишите нам в Telegram.");
    return;
  }

  const name = document.getElementById('bkName').value.trim();
  const phone = document.getElementById('bkPhone').value.trim();
  if (!name) { document.getElementById('bkName').style.borderColor = '#C17B2F'; return; }
  if (!phone) { document.getElementById('bkPhone').style.borderColor = '#C17B2F'; return; }
  const { start, end } = bkState;
  const n = Math.round((end - start) / 86400000);
  const guests = document.getElementById('bkGuests').value;
  const comment = document.getElementById('bkComment').value;

  const submitBtn = document.getElementById('bkSubmit');
  const errorEl = document.getElementById('bkError');
  if (errorEl) errorEl.style.display = 'none';

  // Меняем состояние кнопки
  submitBtn.disabled = true;
  submitBtn.textContent = 'ОТПРАВКА...';
  submitBtn.style.background = 'rgba(193, 123, 47, 0.5)';
  submitBtn.style.cursor = 'wait';

  const formData = new FormData();
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('start', bkFmtDate(start));
  formData.append('end', bkFmtDate(end));
  formData.append('nights', n);
  formData.append('guests', guests);
  formData.append('price', bkFmtPrice(n * 7000) + ' ₽');
  formData.append('comment', comment);

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Сетевая ошибка');
      return res.json();
    })
    .then(data => {
      if (data.result === 'success') {
        document.getElementById('bkForm').style.display = 'none';
        document.getElementById('bkSuccess').style.display = 'block';
      } else {
        throw new Error(data.error || 'Ошибка на сервере');
      }
    })
    .catch(error => {
      console.error('Ошибка отправки:', error);
      if (errorEl) errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
      submitBtn.style.background = '#C17B2F';
      submitBtn.style.cursor = 'pointer';
    });
}

function bkFmtDate(d) {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
function bkFmtPrice(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function bkNightWord(n) {
  if (n >= 11 && n <= 14) return 'ночей';
  const l = n % 10;
  if (l === 1) return 'ночь';
  if (l >= 2 && l <= 4) return 'ночи';
  return 'ночей';
}

bkRender();

// При загрузке страницы пробуем загрузить занятые даты
window.addEventListener('DOMContentLoaded', () => {
  if (GOOGLE_SCRIPT_URL) {
    bkFetchBookedDates();
  }
});
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
fadeElements.forEach(el => fadeObserver.observe(el));

// === HAMBURGER MENU ===
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
burgerBtn.addEventListener('click', () => {
  burgerBtn.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
window.closeMobile = function () {
  burgerBtn.classList.remove('active');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
};

// === PHONE MASK ===
const phoneInput = document.getElementById('bkPhone');
phoneInput.addEventListener('input', function (e) {
  let val = this.value.replace(/\D/g, '');
  if (val.length === 0) { this.value = ''; return; }
  if (val[0] === '8') val = '7' + val.slice(1);
  if (val[0] !== '7') val = '7' + val;
  let formatted = '+7';
  if (val.length > 1) formatted += ' (' + val.slice(1, 4);
  if (val.length > 4) formatted += ') ' + val.slice(4, 7);
  if (val.length > 7) formatted += '-' + val.slice(7, 9);
  if (val.length > 9) formatted += '-' + val.slice(9, 11);
  this.value = formatted;
});

// === LOADING SCREEN ===
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 800);
});

// === COPY COORDINATES ===
window.copyCoords = function (el) {
  const text = '61.4818, 30.2179';
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1500);
  });
};

// === YANDEX MAP API ===
if (typeof ymaps !== 'undefined') {
  ymaps.ready(initMap);
}

function initMap() {
  const mapElement = document.getElementById('yandexMap');
  if (!mapElement) return;

  const myMap = new ymaps.Map("yandexMap", {
    center: [61.481800, 30.217900],
    zoom: 14,
    controls: ['zoomControl']
  });

  myMap.behaviors.disable('scrollZoom');

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    myMap.behaviors.disable('drag');
  }

  const customMarkerLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="map-marker-layout">' +
    '<div class="map-custom-ping"></div>' +
    '<div class="map-custom-dot"></div>' +
    '</div>'
  );

  const customPlacemark = new ymaps.Placemark([61.481800, 30.217900], {
    hintContent: 'САМ. Змеиная гора',
    balloonContent: `
        <div style="color: #000; padding: 15px; font-family: 'Space Grotesk', sans-serif; min-width: 280px; box-sizing: border-box;">
            <strong style="font-size: 16px; margin-bottom: 16px; display: block; font-weight: 700;">САМ. Змеиная гора</strong>
            <a href="https://yandex.ru/maps/?rtext=~61.481800,30.217900" target="_blank"
               style="display: block; background: #C17B2F; color: #fff; padding: 12px 10px; text-decoration: none; border-radius: 6px; font-size: 14px; text-align: left; font-weight: 600; text-transform: uppercase; margin: 0; width: 100%; box-sizing: border-box;">
               Приехать
            </a>
        </div>
    `
  }, {
    iconLayout: customMarkerLayout,
    iconShape: {
      type: 'Circle',
      coordinates: [0, 0],
      radius: 20
    },
    hideIconOnBalloonOpen: false, /* чтобы красивый маркер не исчезал при клике */
    balloonOffset: [0, -20]
  });

  myMap.geoObjects.add(customPlacemark);
}