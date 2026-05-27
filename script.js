const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const modal = document.getElementById("authModal");
const closeBtn = document.querySelector(".close");

const registerBtn = document.getElementById("register");
const loginUserBtn = document.getElementById("login");

const catalogBtn = document.getElementById("catalogBtn");

const carCards = document.querySelectorAll(".car-card");
const carContainer = document.querySelector('.car-container');

const carModal = document.getElementById("carModal");
const closeCar = document.querySelector(".close-car");

const carTitle = document.getElementById("carTitle");
const carDescription = document.getElementById("carDescription");
const carPrice = document.getElementById("carPrice");
const carYear = document.getElementById('carYear');
const carAdvantages = document.getElementById('carAdvantages');
const carFullDescription = document.getElementById('carFullDescription');
const carMainImage = document.getElementById('carMainImage');
const carWishlistBtn = document.getElementById('carWishlistBtn');
const financeTypeInputs = document.querySelectorAll('input[name="financeType"]');
const financeYears = document.getElementById('financeYears');
const financeYearsValue = document.getElementById('financeYearsValue');
const financeRate = document.getElementById('financeRate');
const financeMonthly = document.getElementById('financeMonthly');

const filterButtons = document.querySelectorAll(".filter-btn");
const themeBtn = document.getElementById("themeBtn");
const languageBtn = document.getElementById("languageBtn");
const currencySelect = document.getElementById('currencySelect');
const priceMinInput = document.getElementById('priceMin');
const priceMaxInput = document.getElementById('priceMax');
const translatableElements = document.querySelectorAll("[data-i18n]");
const translatablePlaceholders = document.querySelectorAll("[data-i18n-placeholder]");
const paginationControls = document.querySelector('.pagination-controls');

// Apply enter animation on page load (used with navigateWithFade)
try {
    document.body.classList.add('page-enter');
    window.setTimeout(() => {
        document.body.classList.remove('page-enter');
    }, 450);
} catch (e) {}
const pageButtons = document.querySelectorAll('.pagination-controls .page-number');
const prevPageButton = document.querySelector('.pagination-controls .page-prev');
const nextPageButton = document.querySelector('.pagination-controls .page-next');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
let searchTerm = '';
let sortBy = 'default';

const API_BASE = '/api';
const defaultChatEndpoint = '/api/chat';
let backendToken = localStorage.getItem('authToken');
let backendAvailable = false;

async function apiRequest(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (backendToken) {
        headers.Authorization = `Bearer ${backendToken}`;
    }

    const response = await fetch(API_BASE + path, {
        credentials: 'include',
        ...options,
        headers
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const error = data?.message || response.statusText || 'Request failed';
        throw new Error(error);
    }
    return data;
}

async function tryBackendRequest(path, options = {}) {
    try {
        const result = await apiRequest(path, options);
        backendAvailable = true;
        return result;
    } catch (error) {
        backendAvailable = false;
        throw error;
    }
}

async function checkBackendAvailability() {
    try {
        await tryBackendRequest('/status', { method: 'GET' });
        return true;
    } catch (e) {
        return false;
    }
}

async function loadBackendUser() {
    if (!backendToken) return;
    try {
        const user = await apiRequest('/user', { method: 'GET' });
        if (user && user.success && user.loggedIn) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedUser', user.username);
            updateUI();
        }
        const wishlistData = await apiRequest('/wishlist', { method: 'GET' });
        if (wishlistData && wishlistData.success && Array.isArray(wishlistData.wishlist)) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistData.wishlist));
            updateAllCardWishUI();
        }
    } catch (e) {
        console.warn('Backend user load failed', e);
    }
}

async function saveWishlistServerSide() {
    if (!backendToken) return;
    try {
        const list = getWishlist();
        await apiRequest('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ wishlist: list })
        });
    } catch (e) {
        console.warn('Wishlist API save failed', e);
    }
}

async function initBackend() {
    await checkBackendAvailability();
    if (backendAvailable) {
        await loadBackendUser();
    }
}

const userAvatar = document.getElementById('userAvatar');
const usernameDisplay = document.getElementById('usernameDisplay');
const authMessage = document.getElementById('authMessage');
const chatToggle = document.querySelector('.chat-toggle');
const chatBox = document.querySelector('.chat-box');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.querySelector('.chat-messages');

const carDetails = {
    "Ferrari SF90": {
        year: "2023",
        fullDescription: "Ferrari SF90 Stradale сочетает 986 л.с. гибридной силовой установкой с передовыми аэродинамическими решениями и острым шасси.",
        fullDescriptionEn: "The Ferrari SF90 Stradale blends 986 hp hybrid power with advanced aerodynamics and razor-sharp handling.",
        advantages: "Мгновенный отклик, активная аэродинамика, эксклюзивный дизайн",
        advantagesEn: "Instant response, active aerodynamics, exclusive design"
    },
    "McLaren Artura": {
        year: "2024",
        fullDescription: "McLaren Artura предлагает легкий карбоновый кузов, гибридную установку и драйвовую балансировку для торсионного управления.",
        fullDescriptionEn: "The McLaren Artura delivers a lightweight carbon body, hybrid powertrain, and agile handling for dynamic driving.",
        advantages: "Легкая конструкция, электроника F1, плавность хода",
        advantagesEn: "Lightweight build, F1-derived electronics, smooth ride"
    },
    "Aston Martin DB11": {
        year: "2022",
        fullDescription: "Aston Martin DB11 — это элегантный GT с мощным двигателем V8 и премиальным салоном из натуральной кожи.",
        fullDescriptionEn: "The Aston Martin DB11 is an elegant GT with a powerful V8 engine and a premium leather interior.",
        advantages: "Комфорт на дальние расстояния, британская отделка, спортивный дух",
        advantagesEn: "Long-distance comfort, British craftsmanship, sporting character"
    },
    "Porsche Taycan Turbo": {
        year: "2024",
        fullDescription: "Porsche Taycan Turbo сочетает молниеносное ускорение, точные тормоза и технологический заряд для полностью электрического драйва.",
        fullDescriptionEn: "The Porsche Taycan Turbo combines lightning acceleration, precise brakes, and tech-forward dynamics in an electric package.",
        advantages: "Мгновенный крутящий момент, инновационные батареи, спортивное шасси",
        advantagesEn: "Instant torque, innovative batteries, sporty chassis"
    },
    "Nissan GT-R": {
        year: "2023",
        fullDescription: "Nissan GT-R — легендарный японский суперкары с полным приводом, турбированным V6 и мастерской балансировки.",
        fullDescriptionEn: "The Nissan GT-R is a legendary Japanese supercar with all-wheel drive, a twin-turbo V6, and precise balance.",
        advantages: "Точность управления, высокая устойчивость, надежность",
        advantagesEn: "Handling precision, strong stability, reliability"
    },
    "Jaguar F-Type": {
        year: "2023",
        fullDescription: "Jaguar F-Type дарит британский характер, агрессивный звук V8 и острое рулевое управление.",
        fullDescriptionEn: "The Jaguar F-Type delivers British flair, an aggressive V8 soundtrack, and sharp steering.",
        advantages: "Яркий стиль, мощный звук, спорт-купе",
        advantagesEn: "Bold style, powerful sound, sport coupe"
    },
    "Lexus LC500": {
        year: "2024",
        fullDescription: "Lexus LC500 предлагает роскошь японской сборки, мощный атмосферный двигатель и комфортабельный салон.",
        fullDescriptionEn: "The Lexus LC500 offers Japanese craftsmanship, a powerful naturally aspirated engine, and a luxurious cabin.",
        advantages: "Изысканный интерьер, надежность, комфорт",
        advantagesEn: "Refined interior, reliability, comfort"
    },
    "BMW i8": {
        year: "2022",
        fullDescription: "BMW i8 объединяет спортивную гибридную платформу с футуристическим дизайном и эффективной электроникой.",
        fullDescriptionEn: "The BMW i8 blends a sporty hybrid platform with futuristic design and efficient electronics.",
        advantages: "Экономичность, инновации, динамика",
        advantagesEn: "Efficiency, innovation, dynamic performance"
    },
    "Audi RS7": {
        year: "2024",
        fullDescription: "Audi RS7 — роскошное спорт-купе с мощным битурбированным мотором и продвинутыми ассистентами водителя.",
        fullDescriptionEn: "The Audi RS7 is a luxurious sportback with a powerful twin-turbo engine and advanced driver aids.",
        advantages: "Комфорт, разгон, интеллектуальные системы",
        advantagesEn: "Comfort, acceleration, intelligent systems"
    },
    "Mercedes EQS": {
        year: "2024",
        fullDescription: "Mercedes EQS сочетает бесшумную электрическую езду, роскошный салон и дальность пробега премиум-класса.",
        fullDescriptionEn: "The Mercedes EQS delivers silent electric driving, a luxury cabin, and premium range.",
        advantages: "Тихий ход, качество материалов, передовые технологии",
        advantagesEn: "Quiet ride, premium materials, advanced technology"
    },
    "Cadillac CT5-V": {
        year: "2023",
        fullDescription: "Cadillac CT5-V — американский спортивный седан с мощным V8, адаптивной подвеской и высокотехнологичным интерьером.",
        fullDescriptionEn: "The Cadillac CT5-V is an American sport sedan with a strong V8, adaptive suspension, and tech-rich interior.",
        advantages: "Сильный мотор, комфорт, дерзкий характер",
        advantagesEn: "Strong engine, comfort, bold character"
    },
    "Chevrolet Corvette": {
        year: "2023",
        fullDescription: "Chevrolet Corvette предлагает легендарные характеристики V8, отличную развесовку и скорость суперкара по привлекательной цене.",
        fullDescriptionEn: "The Chevrolet Corvette delivers legendary V8 performance, excellent balance, and supercar speed at an attractive price.",
        advantages: "Американская мощь, точное шасси, спортивный дизайн",
        advantagesEn: "American power, precise chassis, sporty design"
    },
    "Ford Mustang Shelby": {
        year: "2024",
        fullDescription: "Ford Mustang Shelby — классический мускул-кар с агрессивной внешностью, мощным двигателем и ведущими тормозами.",
        fullDescriptionEn: "The Ford Mustang Shelby is a classic muscle car with aggressive looks, a powerful engine, and performance brakes.",
        advantages: "V8, культовый стиль, драйв",
        advantagesEn: "V8 power, iconic style, driving excitement"
    },
    "Porsche Panamera": {
        year: "2024",
        fullDescription: "Porsche Panamera — спортивный лифтбек с комфортом на дальние дистанции и точной управляемостью.",
        fullDescriptionEn: "The Porsche Panamera is a sporty liftback offering long-distance comfort and precise handling.",
        advantages: "Быстрый салон, комфорт, спортивная динамика",
        advantagesEn: "Spacious cabin, comfort, sporty dynamics"
    },
    "Rimac Nevera": {
        year: "2025",
        fullDescription: "Rimac Nevera — электрический гиперкар с 1914 л.с., сверхбыстрым разгоном и уникальными технологиями батарей.",
        fullDescriptionEn: "The Rimac Nevera is an electric hypercar with 1914 hp, blistering acceleration, and cutting-edge battery technology.",
        advantages: "Экстремальная мощность, электроника, эксклюзивность",
        advantagesEn: "Extreme power, advanced electronics, exclusivity"
    },
    "Lucid Air": {
        year: "2024",
        fullDescription: "Lucid Air сочетает роскошный интерьер, большой запас хода и тихую электрическую езду премиум-уровня.",
        fullDescriptionEn: "The Lucid Air combines a luxury interior, long-range capability, and quiet premium electric driving.",
        advantages: "Дальность, комфорт, современный интерьер",
        advantagesEn: "Range, comfort, modern interior"
    },
    "Bentley Bentayga": {
        year: "2024",
        fullDescription: "Bentley Bentayga предлагает высший уровень роскоши, плавный ход и полный привод для превосходного комфорта.",
        fullDescriptionEn: "The Bentley Bentayga offers supreme luxury, a smooth ride, and all-wheel drive for exceptional comfort.",
        advantages: "Роскошный салон, мощность, внедорожные возможности",
        advantagesEn: "Luxury cabin, power, off-road capability"
    },
    "Tesla Model X": {
        year: "2024",
        fullDescription: "Tesla Model X — электрический SUV с уникальными дверями, быстрым разгоном и высокотехнологичной системой автопилота.",
        fullDescriptionEn: "The Tesla Model X is an electric SUV with unique doors, rapid acceleration, and advanced autopilot tech.",
        advantages: "Автопилот, электрическая динамика, просторный салон",
        advantagesEn: "Autopilot, electric performance, spacious cabin"
    },
    "Bugatti Chiron": {
        year: "2024",
        fullDescription: "Bugatti Chiron — гиперкар для рекордной скорости, сочетающий ультралюксовую отделку и невероятную аэродинамику.",
        fullDescriptionEn: "The Bugatti Chiron is a hypercar built for record speed, combining ultra-luxury finishes and incredible aerodynamics.",
        advantages: "Скорость, эксклюзивность, инженерия",
        advantagesEn: "Speed, exclusivity, engineering"
    },
    "Maserati MC20": {
        year: "2023",
        fullDescription: "Maserati MC20 — итальянский суперкар с точной развесовкой, спортивной подвеской и характерным звуком двигателя.",
        fullDescriptionEn: "The Maserati MC20 is an Italian supercar with precise balance, sporty suspension, and a distinctive engine sound.",
        advantages: "Итальянский стиль, скоростные характеристики, острое управление",
        advantagesEn: "Italian style, speed performance, sharp handling"
    }
};

function parsePrice(price) {
    return Number((price || '').replace(/[^\d]/g, '')) || 0;
}

const currencyRates = {
    USD: 1,
    RUB: 105,
    KZT: 470
};

let selectedCurrency = localStorage.getItem('currency') || 'USD';
let priceFilterMin = null;
let priceFilterMax = null;

function getCurrencyLocale() {
    return currentLang === 'ru' ? 'ru-RU' : 'en-US';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat(getCurrencyLocale(), {
        style: 'currency',
        currency: selectedCurrency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function convertFromUSD(amountUSD) {
    return Math.round(amountUSD * currencyRates[selectedCurrency]);
}

function convertToUSD(amountLocal) {
    return amountLocal / currencyRates[selectedCurrency];
}

function getFinancingRate(type, years) {
    if (type === 'credit') {
        return +(5 + (years - 1) * 1.5).toFixed(1);
    }
    return 0;
}

function calculateMonthlyPayment(principal, years, rate) {
    const total = principal * (1 + rate / 100);
    return total / (years * 12);
}

function setFinanceYearsRange(type) {
    if (!financeYears) return;
    if (type === 'credit') {
        financeYears.min = 3;
        financeYears.max = 10;
        if (Number(financeYears.value) < 3) financeYears.value = 3;
        if (Number(financeYears.value) > 10) financeYears.value = 10;
    } else {
        financeYears.min = 1;
        financeYears.max = 3;
        if (Number(financeYears.value) < 1) financeYears.value = 1;
        if (Number(financeYears.value) > 3) financeYears.value = 3;
    }
    financeYearsValue.textContent = financeYears.value;
}

function updateFinanceSummary(principalUSD) {
    const type = document.querySelector('input[name="financeType"]:checked')?.value || 'credit';
    setFinanceYearsRange(type);
    const years = Number(financeYears.value);
    const rate = getFinancingRate(type, years);
    const principalLocal = convertFromUSD(principalUSD);
    const monthly = calculateMonthlyPayment(principalLocal, years, rate);
    const translation = translations[currentLang] || translations.ru;
    financeYearsValue.textContent = years;
    financeRate.textContent = type === 'credit'
        ? translation.financeRateCredit.replace('{rate}', rate)
        : translation.financeRateInstallment;
    financeMonthly.textContent = translation.financeMonthly
        .replace('{years}', years)
        .replace('{amount}', formatCurrency(monthly))
        .replace('{yearsWord}', currentLang === 'ru' ? (years === 1 ? 'году' : years < 5 ? 'годах' : 'годах') : 'years');
}

function fillCarDetails(card) {
    const title = card.dataset.title;
    const details = carDetails[title] || {};
    const translation = translations[currentLang] || translations.ru;
    const yearLabel = translation.yearLabel || 'Год выпуска:';
    const advantagesLabel = translation.advantagesLabel || 'Преимущества:';
    const fullDesc = currentLang === 'en'
        ? details.fullDescriptionEn || card.dataset.descriptionEn || details.fullDescription || card.dataset.description || ''
        : details.fullDescription || card.dataset.description || '';
    const advantages = currentLang === 'en'
        ? details.advantagesEn || details.advantages || ''
        : details.advantages || '';
    const extraInfo = currentLang === 'en'
        ? details.extraInfoEn || details.extraInfo || 'This model includes a detailed service history, precision tuning, and a luxury ownership package.'
        : details.extraInfo || details.extraInfoEn || 'Этот автомобиль включает подробную сервисную историю, точную настройку и роскошный пакет обслуживания владельца.';
    const performanceNote = currentLang === 'en'
        ? details.performanceNoteEn || details.performanceNote || 'Expect engineered performance, advanced driver support, and a technology suite designed for high-speed touring.'
        : details.performanceNote || details.performanceNoteEn || 'Ожидайте инженерную производительность, продвинутую помощь водителю и технологический набор для высокоскоростного вождения.';
    carYear.textContent = details.year ? `${yearLabel} ${details.year}` : '';
    carAdvantages.textContent = advantages ? `${advantagesLabel} ${advantages}` : '';
    const descriptionParagraphs = [fullDesc, extraInfo, performanceNote].filter(Boolean);
    carFullDescription.innerHTML = descriptionParagraphs.map(text => `<p>${text}</p>`).join('');
}

function getCardPriceUSD(card) {
    return parsePrice(card.dataset.price);
}

function getCardPriceCurrent(card) {
    return convertFromUSD(getCardPriceUSD(card));
}

function updateAllCardPrices() {
    carCards.forEach(card => {
        const priceElement = card.querySelector('.car-price');
        if (priceElement) {
            priceElement.textContent = formatCurrency(getCardPriceCurrent(card));
        }
    });
}

function parseFilterValue(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

function getPriceFilterUSD() {
    const minLocal = parseFilterValue(priceMinInput?.value);
    const maxLocal = parseFilterValue(priceMaxInput?.value);
    const minUSD = minLocal !== null ? convertToUSD(minLocal) : null;
    const maxUSD = maxLocal !== null ? convertToUSD(maxLocal) : null;
    return { minUSD, maxUSD };
}

let currentFilter = 'all';
let currentPage = 1;
const carsPerPage = 10;
const totalPages = 2;

function getCardYear(card) {
    const details = carDetails[card.dataset.title];
    return details && details.year ? Number(details.year) : 0;
}

function sortCardList(cards) {
    return cards.slice().sort((a, b) => {
        const aPrice = getCardPriceUSD(a);
        const bPrice = getCardPriceUSD(b);
        const aYear = getCardYear(a);
        const bYear = getCardYear(b);

        switch (sortBy) {
            case 'priceAsc':
                return aPrice - bPrice;
            case 'priceDesc':
                return bPrice - aPrice;
            case 'yearAsc':
                return aYear - bYear;
            case 'yearDesc':
                return bYear - aYear;
            default:
                return 0;
        }
    });
}

function renderPage() {
    const { minUSD, maxUSD } = getPriceFilterUSD();
    const query = (searchTerm || '').trim().toLowerCase();
    const visibleCards = Array.from(carCards).filter(card => {
        const isCategoryMatch = currentFilter === 'all' || card.dataset.category === currentFilter;
        const priceUSD = getCardPriceUSD(card);
        const isPriceMatch = (minUSD === null || priceUSD >= minUSD) && (maxUSD === null || priceUSD <= maxUSD);
        const title = (card.dataset.title || '').toLowerCase();
        const description = ((card.dataset.description || '') + ' ' + (card.dataset.descriptionEn || '')).toLowerCase();
        const matchesSearch = !query || title.includes(query) || description.includes(query);
        return isCategoryMatch && isPriceMatch && matchesSearch;
    });

    const sortedCards = sortCardList(visibleCards);
    let visibleIndex = 0;

    sortedCards.forEach(card => {
        const pageIndex = Math.floor(visibleIndex / carsPerPage) + 1;
        card.style.display = pageIndex === currentPage ? 'block' : 'none';
        if (carContainer) {
            carContainer.appendChild(card);
        }
        visibleIndex += 1;
    });

    Array.from(carCards).forEach(card => {
        if (!sortedCards.includes(card)) {
            card.style.display = 'none';
        }
    });

    const activePages = Math.max(1, Math.min(totalPages, Math.ceil(visibleIndex / carsPerPage) || 1));
    if (currentPage > activePages) currentPage = activePages;

    pageButtons.forEach(btn => {
        const page = Number(btn.dataset.page);
        btn.classList.toggle('active', page === currentPage);
    });
    if (prevPageButton) prevPageButton.disabled = currentPage === 1;
    if (nextPageButton) nextPageButton.disabled = currentPage === activePages;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
}

if (prevPageButton) {
    prevPageButton.addEventListener('click', () => changePage(currentPage - 1));
}
if (nextPageButton) {
    nextPageButton.addEventListener('click', () => changePage(currentPage + 1));
}
if (paginationControls) {
    paginationControls.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.classList.contains('page-number')) {
            const page = Number(button.dataset.page);
            changePage(page);
        } else if (button.classList.contains('page-prev')) {
            changePage(currentPage - 1);
        } else if (button.classList.contains('page-next')) {
            changePage(currentPage + 1);
        }
    });
} else {
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = Number(btn.dataset.page);
            changePage(page);
        });
    });
}

const translations = {
    ru: {
        navHome: "Главная",
        navCars: "Автомобили",
        navAbout: "О нас",
        navContacts: "Контакты",
        heroTitle: "Премиальные автомобили будущего",
        heroText: "Скорость. Стиль. Совершенство.",
        exploreBtn: "Смотреть каталог",
        carsHeading: "Популярные автомобили",
        filterAll: "Все",
        filterSport: "Спорткары",
        filterElectric: "Электро",
        filterLuxury: "Люкс",
        sortLabel: "Сортировать:",
        sortDefault: "По умолчанию",
        sortPriceAsc: "Цена ↑",
        sortPriceDesc: "Цена ↓",
        sortYearDesc: "Год ↓",
        sortYearAsc: "Год ↑",
        searchPlaceholder: "Поиск по моделям",
        aboutHeading: "О нас",
        aboutCard1Title: "Премиум качество",
        aboutCard1Text: "Мы предоставляем только лучшие автомобили мирового уровня с гарантией качества и современными технологиями.",
        aboutCard2Title: "Современные технологии",
        aboutCard2Text: "LuxDrive использует инновационные решения для удобного поиска и покупки автомобилей онлайн.",
        aboutCard3Title: "Быстрая поддержка",
        aboutCard3Text: "Наша команда работает 24/7 и всегда готова помочь с выбором автомобиля.",
        contactsHeading: "Контакты",
        authTitle: "Авторизация",
        usernamePlaceholder: "Имя пользователя",
        passwordPlaceholder: "Пароль",
        registerBtn: "Регистрация",
        loginUserBtn: "Войти",
        loginBtn: "Войти",
        logoutBtn: "Выйти",
        accountCreated: "Аккаунт создан",
        fillFields: "Заполните поля",
        loginSuccess: "Вход выполнен",
        loginFailed: "Неверный логин или пароль",
        userExists: "Пользователь уже существует",
        profileTitle: "Профиль",
        addToWishlist: "Добавить в Wishlist",
        removeFromWishlist: "Убрать из Wishlist",
        themeBtnDark: "Тема: Тёмная",
        themeBtnLight: "Тема: Светлая",
        languageBtn: "EN",
        financingHeading: "Финансирование",
        financeCredit: "Кредит",
        financeInstallment: "Рассрочка",
        financeTerm: "Срок:",
        financeYearsLabel: "лет",
        financeRateCredit: "Ставка кредита: {rate}% годовых",
        financeRateInstallment: "Рассрочка без процентов",
        financeMonthly: "При {years} {yearsWord} вы будете платить {amount} в месяц.",
        yearLabel: "Год выпуска:",
        advantagesLabel: "Преимущества:"
    },
    en: {
        navHome: "Home",
        navCars: "Cars",
        navAbout: "About",
        navContacts: "Contacts",
        heroTitle: "Premium cars of the future",
        heroText: "Speed. Style. Perfection.",
        exploreBtn: "View catalog",
        carsHeading: "Popular cars",
        filterAll: "All",
        filterSport: "Sports",
        filterElectric: "Electric",
        filterLuxury: "Luxury",
        sortLabel: "Sort by:",
        sortDefault: "Default",
        sortPriceAsc: "Price ↑",
        sortPriceDesc: "Price ↓",
        sortYearDesc: "Year ↓",
        sortYearAsc: "Year ↑",
        searchPlaceholder: "Search models",
        aboutHeading: "About Us",
        aboutCard1Title: "Premium Quality",
        aboutCard1Text: "We offer only the best world-class cars with guaranteed quality and modern technology.",
        aboutCard2Title: "Modern Technology",
        aboutCard2Text: "LuxDrive uses innovative solutions for easy online car search and purchase.",
        aboutCard3Title: "Fast Support",
        aboutCard3Text: "Our team works 24/7 and is always ready to help you choose a car.",
        contactsHeading: "Contacts",
        authTitle: "Sign In",
        usernamePlaceholder: "Username",
        passwordPlaceholder: "Password",
        registerBtn: "Register",
        loginUserBtn: "Login",
        loginBtn: "Login",
        logoutBtn: "Logout",
        accountCreated: "Account created",
        fillFields: "Fill the fields",
        loginSuccess: "Logged in",
        loginFailed: "Invalid username or password",
        userExists: "User already exists",
        profileTitle: "Profile",
        addToWishlist: "Add to Wishlist",
        removeFromWishlist: "Remove from Wishlist",
        themeBtnDark: "Theme: Dark",
        themeBtnLight: "Theme: Light",
        languageBtn: "RU",
        financingHeading: "Financing",
        financeCredit: "Credit",
        financeInstallment: "Installment",
        financeTerm: "Term:",
        financeYearsLabel: "years",
        financeRateCredit: "Credit rate: {rate}% per year",
        financeRateInstallment: "Installment without interest",
        financeMonthly: "For {years} years you will pay {amount} per month.",
        yearLabel: "Year:",
        advantagesLabel: "Advantages:"
    }
};

// Chat translations
translations.ru.chatGreeting = "Здравствуйте! Чем могу помочь?";
translations.en.chatGreeting = "Hello! How can I help you?";
translations.ru.chatPlaceholder = "Ваш вопрос...";
translations.en.chatPlaceholder = "Your question...";
translations.ru.chatSend = "Отправить";
translations.en.chatSend = "Send";

let currentLang = localStorage.getItem("lang") || "ru";
// communication channel for instant sync between pages/tabs
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('luxdrive') : null;

function updateThemeButton() {
    const themeKey = document.body.classList.contains("light-theme") ? "themeBtnLight" : "themeBtnDark";
    themeBtn.textContent = translations[currentLang][themeKey];
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    translatableElements.forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders for inputs with data-i18n-placeholder
    translatablePlaceholders.forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    updateThemeButton();
    document.documentElement.lang = lang;

    // Update chat greeting and input placeholder when language changes
    try {
        if (chatMessages) {
            const firstAgent = chatMessages.querySelector('.chat-message.agent');
            if (firstAgent) firstAgent.textContent = translations[currentLang].chatGreeting || translations.ru.chatGreeting;
        }
        if (chatInput) {
            chatInput.placeholder = translations[currentLang].chatPlaceholder || translations.ru.chatPlaceholder;
        }
    } catch (e) {
        console.warn('Chat language update failed', e);
    }
}

if (priceMaxInput) {
    priceMaxInput.addEventListener('input', () => {
        currentPage = 1;
        renderPage();
    });
}

function navigateWithFade(url) {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = url;
    }, 350);
}

function handleWishlistFocus() {
    const focusCar = localStorage.getItem('wishlistFocus');
    if (!focusCar) return;
    localStorage.removeItem('wishlistFocus');
    const card = Array.from(carCards).find(c => c.dataset.title === focusCar);
    if (card) {
        currentPage = Math.floor(Array.from(carCards).indexOf(card) / carsPerPage) + 1;
        renderPage();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            card.click();
        }, 600);
    }
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    selectedCurrency = localStorage.getItem('currency') || 'USD';
    if (currencySelect) {
        currencySelect.value = selectedCurrency;
        currencySelect.addEventListener('change', () => {
            selectedCurrency = currencySelect.value;
            localStorage.setItem('currency', selectedCurrency);
            updateAllCardPrices();
            renderPage();
        });
    }

    const savedLang = localStorage.getItem('lang') || currentLang;
    if (savedLang) {
        currentLang = savedLang;
        applyLanguage(currentLang);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeButton();
        });
    }

    if (languageBtn) {
        languageBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'ru' ? 'en' : 'ru';
            applyLanguage(nextLang);
            localStorage.setItem('lang', nextLang);
        });
    }

    if (priceMinInput) {
        priceMinInput.addEventListener('input', () => {
            currentPage = 1;
            renderPage();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchTerm = searchInput.value;
            currentPage = 1;
            renderPage();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortBy = sortSelect.value;
            currentPage = 1;
            renderPage();
        });
    }
}

loadPreferences();
renderPage();
initBackend();

window.addEventListener('load', handleWishlistFocus);

window.addEventListener('load', () => {
    // if URL contains #open=Model%20Name then open that model's modal
    const m = window.location.hash.match(/open=([^&]+)/);
    if (m && m[1]) {
        try {
            const title = decodeURIComponent(m[1]);
            const card = Array.from(document.querySelectorAll('.car-card')).find(c => c.dataset.title === title);
            if (card) {
                openCarModalFromCard(card);
            }
        } catch (e) {
            console.warn('Failed to open model from hash', e);
        }
    }
});

// listen for cross-window messages to update UI instantly
if (bc) {
    bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg) return;
        if (msg.type === 'avatar-updated' || msg.type === 'user-updated' || msg.type === 'wishlist-updated') {
            updateUI();
            // If backend is available and user is logged in, reload wishlist from server
            if (msg.type === 'wishlist-updated' && backendAvailable) {
                loadBackendUser().catch(e => console.warn('Failed to reload wishlist', e));
            } else {
                updateAllCardWishUI();
            }
        }
    };
}

if (catalogBtn) {
    catalogBtn.addEventListener("click", () => {
        const carsSection = document.getElementById("cars");
        if (carsSection) {
            carsSection.scrollIntoView({
                behavior:"smooth"
            });
        } else {
            navigateWithFade('catalog.html');
        }
    });
}

const logoLink = document.getElementById('logoLink');
if (logoLink) {
    logoLink.addEventListener('click', (event) => {
        const pageName = window.location.pathname.split('/').pop().toLowerCase();
        const isHomePage = pageName === '' || pageName === 'index.html' || pageName === 'index.htm';
        if (isHomePage) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.replaceState(null, '', '#top');
        } else {
            event.preventDefault();
            navigateWithFade('index.html');
        }
    });
}

// Intercept header/nav links for same-origin page navigation to use fade
document.querySelectorAll('header nav a').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || a.target === '_blank') return;
        // allow external links
        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return;
        } catch (err) {
            // if invalid URL, skip
            return;
        }
        e.preventDefault();
        navigateWithFade(href);
    });
});

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        if (modal) modal.style.display = "flex";
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        if (modal) modal.style.display = "none";
    });
}

if (closeCar) {
    closeCar.addEventListener("click", () => {
        if (carModal) carModal.style.display = "none";
        if (carMainImage) carMainImage.classList.remove('enlarged');
    });
}

window.addEventListener("click", (e) => {
    if(e.target === modal){
        modal.style.display = "none";
    }

    if(e.target === carModal){
        carModal.style.display = "none";
        carMainImage.classList.remove('enlarged');
    }
});

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        authMessage.textContent = translations[currentLang].fillFields || 'Заполните поля';
        return;
    }

    try {
        const response = await tryBackendRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (response.success) {
            backendToken = response.token;
            localStorage.setItem('authToken', backendToken);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedUser', username);
            localStorage.setItem('username', username);
            authMessage.textContent = translations[currentLang].accountCreated || 'Аккаунт создан';
            if (bc) bc.postMessage({ type: 'user-updated', user: username });
            updateUI();
            return;
        }
        authMessage.textContent = response.message || translations[currentLang].userExists || 'Пользователь уже существует';
    } catch (e) {
        console.warn('Backend register failed, using local fallback', e);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            authMessage.textContent = translations[currentLang].userExists || 'Пользователь уже существует';
            return;
        }

        users[username] = { password: password };
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('loggedUser', username);
        localStorage.setItem('username', username);

        authMessage.textContent = translations[currentLang].accountCreated || 'Аккаунт создан';
        if (bc) bc.postMessage({ type: 'user-updated', user: username });
        updateUI();
    }

    });
}

if (loginUserBtn) {
    loginUserBtn.addEventListener("click", async () => {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        authMessage.textContent = translations[currentLang].fillFields || 'Заполните поля';
        return;
    }

    try {
        const response = await tryBackendRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (response.success) {
            backendToken = response.token;
            localStorage.setItem('authToken', backendToken);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedUser', username);
            localStorage.setItem('username', username);
            authMessage.textContent = translations[currentLang].loginSuccess || 'Вход выполнен';
            modal.style.display = 'none';
            if (bc) bc.postMessage({ type: 'user-updated', user: username });
            updateUI();
            await loadBackendUser();
            return;
        }
        authMessage.textContent = response.message || translations[currentLang].loginFailed || 'Неверный логин или пароль';
    } catch (e) {
        console.warn('Backend login failed, using local fallback', e);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username] && users[username].password === password) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedUser', username);
            localStorage.setItem('username', username);
            authMessage.textContent = translations[currentLang].loginSuccess || 'Вход выполнен';
            modal.style.display = 'none';
            if (bc) bc.postMessage({ type: 'user-updated', user: username });
            updateUI();
        } else {
            authMessage.textContent = translations[currentLang].loginFailed || 'Неверный логин или пароль';
        }
    }

    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (backendToken) {
            try {
                await apiRequest('/logout', { method: 'POST' });
            } catch (e) {
                console.warn('Logout API failed', e);
            }
        }
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('authToken');
        backendToken = null;
        if (bc) bc.postMessage({ type: 'user-updated' });
        updateUI();
    });
}

function updateUI(){


    const loggedIn = localStorage.getItem('loggedIn');
    const loggedUser = localStorage.getItem('loggedUser') || localStorage.getItem('username');

    if (loggedIn && loggedUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        const name = loggedUser || '';
        if (usernameDisplay) usernameDisplay.textContent = name;
        if (userAvatar) {
            userAvatar.style.display = 'block';
            const avatarData = localStorage.getItem('avatar_' + name) || localStorage.getItem('avatar') || null;
            userAvatar.src = avatarData || 'https://www.gravatar.com/avatar/?d=mp&s=120';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (usernameDisplay) usernameDisplay.textContent = '';
        if (userAvatar) userAvatar.style.display = 'none';
    }

}

function openCarModalFromCard(card) {
    if (!card) return;
    const title = card.dataset.title || (card.querySelector && card.querySelector('h3') ? card.querySelector('h3').textContent : '');
    carTitle.textContent = title;
    carDescription.textContent = currentLang === "en" && (card.dataset.descriptionEn || card.dataset.descriptionEn) ? (card.dataset.descriptionEn || card.dataset.description) : (card.dataset.description || '');
    // set price and formatted price
    if (card.dataset && card.dataset.price) {
        carPrice.textContent = formatCurrency(convertFromUSD(parsePrice(card.dataset.price)));
    } else {
        // fallback: try to compute from USD if dataset.price present as USD
        try {
            const usd = parsePrice(card.dataset.price || '') || 0;
            carPrice.textContent = formatCurrency(convertFromUSD(usd));
        } catch (e) {
            carPrice.textContent = '';
        }
    }

    fillCarDetails(card);

    // images
    const mainSrc = card.querySelector && card.querySelector('img') ? card.querySelector('img').src : '';
    if (mainSrc) {
        carMainImage.src = mainSrc;
        carMainImage.classList.remove('enlarged');
    }

    financeTypeInputs.forEach(input => input.checked = input.value === 'credit');
    setFinanceYearsRange('credit');
    financeYearsValue.textContent = financeYears.value;
    try {
        updateFinanceSummary(parsePrice(card.dataset.price || '0'));
    } catch (e) {
        // ignore
    }
    carModal.style.display = "flex";
}

carCards.forEach(card => {
    card.addEventListener("click", () => openCarModalFromCard(card));
});

// Top-deals buttons: always navigate to catalog with hash to open that model there
document.querySelectorAll('.deal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const title = btn.dataset.title || (btn.closest('.deal-card') && btn.closest('.deal-card').querySelector('h3') ? btn.closest('.deal-card').querySelector('h3').textContent : '');
        if (!title) return;
        const encoded = encodeURIComponent(title);
        btn.href = `catalog.html#open=${encoded}`;
        // allow default navigation to proceed
    });
});

// Wishlist helpers
function getWishlist(){
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function saveWishlist(list){
    localStorage.setItem('wishlist', JSON.stringify(list));
}

function isInWishlist(title){
    const list = getWishlist();
    return list.indexOf(title) !== -1;
}

function toggleWishlist(title){
    const list = getWishlist();
    const idx = list.indexOf(title);
    if(idx === -1){
        list.push(title);
    } else {
        list.splice(idx,1);
    }
    saveWishlist(list);
    updateAllCardWishUI();
    saveWishlistServerSide();
}

function updateCarWishlistButton(title){
    if(!carWishlistBtn) return;
    if(isInWishlist(title)){
        carWishlistBtn.textContent = translations[currentLang].removeFromWishlist || 'Убрано';
        carWishlistBtn.dataset.in = '1';
    } else {
        carWishlistBtn.textContent = translations[currentLang].addToWishlist || 'Добавить в Wishlist';
        carWishlistBtn.dataset.in = '0';
    }
}

function updateAllCardWishUI(){
    document.querySelectorAll('.card-wish-btn').forEach(btn=>{
        const card = btn.closest('.car-card');
        if(!card) return;
        const title = card.dataset.title;
        btn.textContent = isInWishlist(title) ? '♥' : '♡';
    });
}

// Open profile in same tab with fade
if (userAvatar) {
    userAvatar.addEventListener('click', () => {
        navigateWithFade('profile.html');
    });
}

// Wishlist button on cards: toggle without opening modal
document.querySelectorAll('.card-wish-btn').forEach(btn=>{
    const card = btn.closest('.car-card');
    if(!card) return;
    const title = card.dataset.title;
    btn.textContent = isInWishlist(title) ? '♥' : '♡';
    btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        toggleWishlist(title);
        btn.textContent = isInWishlist(title) ? '♥' : '♡';
    });
});

// Car modal wishlist button
if (carWishlistBtn) {
    carWishlistBtn.addEventListener('click', ()=>{
        const title = carTitle.textContent;
        toggleWishlist(title);
        updateCarWishlistButton(title);
    });
}

// Make car gallery image clickable for zoom
if (carMainImage) {
    carMainImage.addEventListener('click', () => {
        carMainImage.classList.toggle('enlarged');
    });
}

if (financeTypeInputs.length) {
    financeTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            const type = input.value;
            setFinanceYearsRange(type);
            const activeCar = Array.from(carCards).find(card => card.dataset.title === carTitle.textContent);
            if (activeCar) {
                updateFinanceSummary(parsePrice(activeCar.dataset.price));
            }
        });
    });
}

if (financeYears) {
    financeYears.addEventListener('input', () => {
        const activeCar = Array.from(carCards).find(card => card.dataset.title === carTitle.textContent);
        if (activeCar) {
            updateFinanceSummary(parsePrice(activeCar.dataset.price));
        }
    });
}

// Update card heart icons initially
updateAllCardWishUI();

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const filter = button.dataset.filter;
        currentFilter = filter;
        currentPage = 1;
        renderPage();

    });

});

function appendChatMessage(text, type = 'agent') {
    if (!chatMessages) return;
    const message = document.createElement('div');
    message.className = `chat-message ${type}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIReply(message) {
    const endpoint = localStorage.getItem('chatAIEndpoint') || (backendAvailable ? defaultChatEndpoint : null);
    if (endpoint) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, lang: currentLang })
            });
            if (res.ok) {
                const data = await res.json();
                return data.reply || data.answer || String(data);
            }
        } catch (e) {
            console.warn('AI endpoint error', e);
        }
    }
    return simpleBotReply(message);
}

function simpleBotReply(message) {
    const m = (message || '').toLowerCase();
    if (!m) return currentLang === 'en' ? 'Please ask a question.' : 'Пожалуйста, задайте вопрос.';
    if (currentLang === 'en') {
        if (m.includes('price') || m.includes('cost') || m.includes('how much')) {
            return 'Prices are listed on each car card. Would you like help calculating financing for a selected model?';
        }
        if (m.includes('loan') || m.includes('credit') || m.includes('installment')) {
            return 'Credit: 3–10 years; Installment: 1–3 years. Open a car card to calculate.';
        }
        if (m.includes('hello') || m.includes('hi')) return 'Hi! I am the support bot. How can I help?';
        if (m.includes('contact') || m.includes('phone')) return 'Phone numbers: +7 (777) 456-98-12 and +7 (701) 123-45-67.';
        if (m.includes('address') || m.includes('where')) return 'Our office: Abay St. 125, Almaty. I can open the map.';
        if (m.length < 6) return 'Please provide more details.';
        return 'Thanks! Our representative will contact you shortly.';
    } else {
        if (m.includes('продаж') || m.includes('цена') || m.includes('сколько')) {
            return 'Цены указаны в карточке автомобиля. Хотите, я помогу рассчитать кредит для выбранной модели?';
        }
        if (m.includes('кредит') || m.includes('рассроч')) {
            return 'Кредит: 3–10 лет; Рассрочка: 1–3 года. Откройте карточку модели для расчёта.';
        }
        if (m.includes('привет') || m.includes('здравств')) return 'Привет! Я бот поддержки. Чем помогу?';
        if (m.includes('контакт') || m.includes('телефон')) return 'Номера: +7 (777) 456-98-12 и +7 (701) 123-45-67.';
        if (m.includes('адрес') || m.includes('где')) return 'Наш офис: ул. Абая, 125, Алматы. Могу открыть карту.';
        if (m.length < 6) return 'Опишите, пожалуйста, подробнее.';
        return 'Спасибо! Наш сотрудник свяжется с вами в ближайшее время.';
    }
}

if (chatToggle && chatBox) {
    chatToggle.addEventListener('click', () => {
        chatBox.classList.toggle('active');
        if (chatBox.classList.contains('active')) {
            chatInput?.focus();
        }
    });
}

if (chatClose && chatBox) {
    chatClose.addEventListener('click', () => {
        chatBox.classList.remove('active');
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const value = chatInput?.value.trim();
        if (!value) return;
        appendChatMessage(value, 'user');
        if (chatInput) chatInput.value = '';
        appendChatMessage('...', 'agent');
        const agentPlaceholder = chatMessages.querySelector('.chat-message.agent:last-child');
        try {
            const reply = await getAIReply(value);
            if (agentPlaceholder) agentPlaceholder.textContent = reply;
            else appendChatMessage(reply, 'agent');
        } catch (e) {
            if (agentPlaceholder) agentPlaceholder.textContent = 'Ошибка. Попробуйте позже.';
        }
    });
}

updateUI();