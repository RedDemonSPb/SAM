# Design System — САМ CAMP

**Сайт:** `https://samcamp.ru/`  
**Дата:** 2026-04-25  
**Технология:** Vanilla HTML/CSS/JS, без фреймворка

---

## Философия дизайна

Минимализм дикой природы. Тёмная, почти чёрная основа — как ночное небо Карелии. Янтарный акцент — как свет костра. Типографика крупная и смелая. Фото с фильтром — намеренно сдержанные, чтобы не превращать сайт в туристический каталог.

**Тон:** Серьёзный, немногословный. «Дальше сами.»

---

## Цвета

| Токен | Значение | Применение |
|---|---|---|
| Background | `#080808` | Основной фон всего сайта |
| Foreground | `#f8f7f5` | Основной цвет текста |
| Amber | `#C17B2F` | Акцент: CTA-кнопки, лейблы секций, hover-состояния, подчёркивания |
| Amber dark | `#8B5A1F` | Hover-состояние кнопок |
| Muted | `#A1A1AA` | Вторичный текст, описания карточек |
| Micro | `rgba(255,255,255,0.4)` | Мельчайший вспомогательный текст |
| Nav border | `rgba(255,255,255,0.05)` | Нижняя граница навбара |
| Nav bg | `rgba(8,8,8,0.95)` | Фон навбара с backdrop-filter |

---

## Шрифт

**Unbounded** — заголовки (Google Fonts CDN)  
Начертания: 300, 700, 900

**Onest** — основной текст (Google Fonts CDN)  
Начертания: 300, 400, 500, 600, 700

| Класс | Размер | Вес | Буквы | Применение |
|---|---|---|---|---|
| `.section-heading` | `clamp(40px, 8vw, 96px)` | 900 | — | Главные заголовки секций |
| `.section-title` | `clamp(32px, 5vw, 64px)` | 700 | uppercase | Альтернативные заголовки |
| `.section-label` | 11px | 700 | uppercase, ls 6px | Лейбл над заголовком, amber |
| `.nav-link` | 11px | 300 | uppercase, ls 2px | Ссылки навигации |
| `.text-muted` | 16px | 400 | — | Основной текст контента |
| `.text-micro` | 12px | — | ls 0.02em | Вспомогательный текст |
| `hero-title` | `clamp(36px, 7vw, 88px)` | 900 | — | Заголовок героя |

---

## Компоненты

### Навигация `.nav-fixed`

- Fixed, top: 0, z-index: 100
- Padding: 12px 80px (уменьшается до 8px при `.scrolled`)
- Backdrop-filter: blur(10px) — только на desktop (min-width: 769px)
- Логотип: SVG, 60px высота (48px при `.scrolled`)
- CTA-кнопка `.btn-amber--nav`: amber-фон, 11px, padding 12px 24px

### Кнопки

**`.btn-amber`** — навбар CTA  
Background: `#C17B2F` → hover `#8B5A1F`  
Font: uppercase, ls 2px

**`.btn-main`** — первичный CTA в секциях  
Shimmer-эффект при hover (псевдоэлемент ::before со sweep-градиентом)  
Hover: translateY(-2px), darkened bg  
Active: scale(0.98)

Модификаторы:
- `.btn-main--hero` — 18px, padding 20px 48px
- `.btn-main--tg` — 14px, padding 24px 56px, display: inline-block

### Карточки `.card`

Тёмный фон чуть светлее `#080808` (на практике полупрозрачные или с border).  
Структура: иконка (40×40, SVG Material Icons) → разделитель `.card-line` → заголовок `.card-heading` → описание `.text-small`

### Прогресс-бар `.progress-bar`

Фиксированный, top: 0, z-index: 200. Amber-цвет. Ширина управляется из JS.

### Loader `.page-loader`

Полноэкранный оверлей `#080808` с текстом «САМ» по центру. Скрывается после загрузки.

---

## Фото и фоны

**Обработка фотографий:**
```css
filter: grayscale(0.3) sepia(0.25) brightness(0.75)
```
Намеренное обесцвечивание — создаёт документальную серьёзность.

**Параллакс:** Фон героя смещается через `transform: translateY()` по скроллу из JS.

**Формат изображений:** `.webp` для всего контента.

| Файл | Секция |
|---|---|
| `img/hero.webp` | Фон героя (`#glavnaya`) |
| `img/ladoga.webp` | Фон секции места (`#mesto`) |
| `img/banya.webp` | Баня |
| `img/tent1/2/3.webp` | Галерея шатров |
| `img/Fishing.webp` | Рыбалка |
| `img/Rock.webp` | Скала |
| `img/SUP.webp` | САП |
| `img/forest.webp` | Лес |

---

## Структура секций

Каждая секция — `section.page`, `min-height: 100vh`.

| ID | Заголовок | Контент |
|---|---|---|
| `#glavnaya` | — | Герой: крупный H1, цена, CTA |
| `#mesto` | МЕСТО | Фото + карта + координаты |
| `#ustrojstvo` | КАК УСТРОЕНО | 4 карточки (Сон, Огонь, Быт, Горы) + note-block |
| `#domik` | СПАТЬ | Описание + галерея шатров |
| `#chto-delat` | ЧТО ЗДЕСЬ | Активности с фото |
| `#priehat` | ПРИЕХАТЬ | Маршрут + условия |
| `#bronirovat` | БРОНИРОВАТЬ | Календарь + форма |

---

## Анимации

**`.fade-in` + `.delay-N`** — IntersectionObserver запускает при попадании в viewport.

**Логотип:** Двухэтапная анимация:
1. `logoEntrance` — 1s, cubic-bezier(0.34, 1.56, 0.64, 1): scale + rotate + glow
2. `logoGlow` — 3s, infinite, ease-in-out: пульсирующий amber drop-shadow

**Nav-link underline:** `::after` с `width: 0 → 100%`, transition 0.3s — amber подчёркивание при hover/active.

**Shimmer на кнопках:** `::before` с gradient sweep, `left: -100% → 100%` при hover.

---

## Навигация

Якорные ссылки с `scroll-behavior: smooth`. Активная ссылка подсвечивается amber через IntersectionObserver (пороговое значение 0.5).

**Mobile menu** — оверлей поверх всего, открывается по `.burger`. Закрывается кликом на ссылку.

Брейкпоинт мобильного меню: **≤ 768px**.

---

## Адаптивность

| Точка | Поведение |
|---|---|
| > 768px | Горизонтальная навигация, padding 80px |
| ≤ 768px | Бургер-меню, оверлей навигация |
| ≤ 480px | Карточки в 1 колонку, уменьшенные padding |

---

## Версионирование CSS

CSS-файл версионируется query-строкой в `index.html`:
```html
<link rel="stylesheet" href="css/style.css?v=1.8" />
```
При каждом изменении CSS инкрементировать minor-версию.

---

## Аналитика

Яндекс Метрика, ID `107136989` — счётчик в `<head>` + `<noscript>`-пиксель в `<body>`.

---

## SEO

- Canonical: `https://samcamp.ru/`
- OG-теги + Twitter Card
- JSON-LD: тип `LodgingBusiness` (Schema.org)
- Координаты: `61.4818° N, 30.2179° E`
- Цена: `от 12000 RUB за ночь`
