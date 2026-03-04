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
const bkState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  start: null,
  end: null,
  picking: 'start'
};
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

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
    if (isPast) {
      cell.style.color = 'rgba(255,255,255,0.15)';
      cell.style.cursor = 'not-allowed';
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
  const name = document.getElementById('bkName').value.trim();
  const phone = document.getElementById('bkPhone').value.trim();
  if (!name) { document.getElementById('bkName').style.borderColor = '#C17B2F'; return; }
  if (!phone) { document.getElementById('bkPhone').style.borderColor = '#C17B2F'; return; }
  const { start, end } = bkState;
  const n = Math.round((end - start) / 86400000);
  const guests = document.getElementById('bkGuests').value;
  const comment = document.getElementById('bkComment').value;
  const msg = encodeURIComponent(
    `Новая заявка!\n\nИмя: ${name}\nТелефон: ${phone}\nЗаезд: ${bkFmtDate(start)}\nВыезд: ${bkFmtDate(end)}\nНочей: ${n}\nГостей: ${guests}\nСумма: ${bkFmtPrice(n * 7000)} ₽` +
    (comment ? `\nКомментарий: ${comment}` : '')
  );

  const errorEl = document.getElementById('bkError');
  if (errorEl) errorEl.style.display = 'none';

  try {
    // Если в будущем появится fetch-запрос, его можно поместить сюда
    const newWin = window.open(`https://t.me/Maksimenko_Dmitry?text=${msg}`, '_blank');

    // Блокировка всплывающего окна (например, AdBlock'ом) также считается ошибкой
    if (!newWin) throw new Error('Окно Telegram было заблокировано браузером');

    document.getElementById('bkForm').style.display = 'none';
    document.getElementById('bkSuccess').style.display = 'block';
  } catch (error) {
    if (errorEl) {
      errorEl.style.display = 'block';
    }
  }
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