# 📊 ВИЗУАЛЬНАЯ СХЕМА ПРАВИЛЬНОЙ СТРУКТУРЫ

## ❌ НЕПРАВИЛЬНО (как у вас сейчас)

```
onclik.ru/
│
├── public/                      ← Папка public в корне
│   ├── index.html               ← ❌ Файлы внутри public/
│   ├── .htaccess
│   ├── install.php
│   ├── assets/
│   │   ├── index-BAHadLUP.css
│   │   └── index-BapUzI4H.js
│   └── api/
│       └── index.php
│
└── Результат: http://onclik.ru/public/index.html ❌
```

**Проблемы:**
- ❌ URL содержит `/public/`
- ❌ Пути к файлам не работают
- ❌ Белый экран

---

## ✅ ПРАВИЛЬНО (как должно быть)

```
onclik.ru/                       ← Корень домена (public_html/ или www/)
│
├── index.html                   ← ✅ Файл в корне!
├── .htaccess                    ← ✅ Файл в корне!
├── install.php                  ← ✅ Файл в корне!
│
├── assets/                      ← ✅ Папка в корне!
│   ├── index-BAHadLUP.css       ← ✅ CSS файл
│   └── index-BapUzI4H.js        ← ✅ JS файл
│
└── api/                         ← ✅ Папка в корне!
    └── index.php                ← ✅ API файл
```

**Результат:**
- ✅ URL: `http://onclik.ru/`
- ✅ Пути работают: `/assets/...`
- ✅ Сайт отображается корректно

---

## 🎯 СРАВНЕНИЕ

### Неправильно:
```
http://onclik.ru/public/index.html     ❌
http://onclik.ru/public/assets/...     ❌
```

### Правильно:
```
http://onclik.ru/                      ✅
http://onclik.ru/assets/...            ✅
```

---

## 📁 ОТКУДА БРАТЬ ФАЙЛЫ

### В вашем проекте есть две важные папки:

```
ваш-проект/
│
├── dist/                          ← 📦 Фронтенд (HTML, CSS, JS)
│   ├── index.html                 ← Загрузить в корень
│   ├── .htaccess                  ← Загрузить в корень
│   └── assets/                    ← Загрузить в корень
│       ├── index-BAHadLUP.css
│       └── index-BapUzI4H.js
│
└── public/                        ← 🔧 Backend и установка
    ├── install.php                ← Загрузить в корень
    └── api/                       ← Загрузить в корень
        └── index.php
```

---

## 🚀 ПОШАГОВАЯ СХЕМА ЗАГРУЗКИ

### Шаг 1: Очистить хостинг
```
onclik.ru/
│
└── (удалить все файлы)           ← 🗑️ Очистить!
```

### Шаг 2: Загрузить из dist/
```
onclik.ru/
│
├── index.html                    ← ✅ Из dist/index.html
├── .htaccess                     ← ✅ Из dist/.htaccess
└── assets/                       ← ✅ Из dist/assets/
    ├── index-BAHadLUP.css
    └── index-BapUzI4H.js
```

### Шаг 3: Загрузить из public/
```
onclik.ru/
│
├── index.html                    ← ✅ Уже есть
├── .htaccess                     ← ✅ Уже есть
├── assets/                       ← ✅ Уже есть
│   ├── index-BAHadLUP.css
│   └── index-BapUzI4H.js
├── install.php                   ← ✅ Из public/install.php
└── api/                          ← ✅ Из public/api/
    └── index.php
```

### Шаг 4: Готово!
```
onclik.ru/
│
├── index.html                    ✅
├── .htaccess                     ✅
├── install.php                   ✅ (удалить после установки!)
├── assets/                       ✅
│   ├── index-BAHadLUP.css
│   └── index-BapUzI4H.js
└── api/                          ✅
    └── index.php
```

**Результат:** `http://onclik.ru/` ✅

---

## 🔍 КАК ПРОВЕРИТЬ ПРАВИЛЬНОСТЬ

### Проверка 1: URL
```
✅ Правильно: http://onclik.ru/
❌ Неправильно: http://onclik.ru/public/index.html
❌ Неправильно: http://onclik.ru/dist/index.html
```

### Проверка 2: Структура файлов
Зайдите в файловый менеджер хостинга и убедитесь, что:
- ✅ `index.html` находится в корне (не в папке)
- ✅ Папка `assets/` находится в корне
- ✅ Файлы CSS и JS находятся внутри `assets/`

### Проверка 3: Прямой доступ к файлам
Откройте в браузере:
```
http://onclik.ru/assets/index-BAHadLUP.css
```
- ✅ Должен открыться CSS код
- ❌ Если 404 - файлы не загружены правильно

---

## 💡 ЧАСТЫЕ ОШИБКИ

### Ошибка 1: Загрузка в подпапку
```
❌ onclik.ru/public/index.html
❌ onclik.ru/dist/index.html
❌ onclik.ru/site/index.html
```

**Решение:** Загружайте файлы в корень домена!

### Ошибка 2: Загрузка всей папки dist/
```
❌ onclik.ru/dist/index.html
❌ onclik.ru/dist/assets/...
```

**Решение:** Загружайте СОДЕРЖИМОЕ папки `dist/`, а не саму папку!

### Ошибка 3: Неправильные права
```
❌ Файлы: 777 (слишком открыто)
❌ Файлы: 600 (слишком закрыто)
```

**Решение:** Установите права 644 для файлов, 755 для папок!

---

## 🎯 ИТОГ

**Правильная структура:**
```
onclik.ru/
├── index.html
├── .htaccess
├── install.php
├── assets/
│   ├── index-BAHadLUP.css
│   └── index-BapUzI4H.js
└── api/
    └── index.php
```

**Правильный URL:**
```
http://onclik.ru/
```

**Результат:**
```
✅ Лендинг отображается
✅ Стили применяются
✅ JavaScript работает
✅ Админка доступна
```

---

**Удачи с установкой!** 🚀
