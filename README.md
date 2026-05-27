# LuxDrive — локальный сайт + сервер

Коротко: проект — статический фронтенд с небольшим Node/Express сервером (`server.js`) и SQLite (`database.sqlite`).

Что я сделал:
- Добавил файлы конфигурации для деплоя: `.gitignore`, `Dockerfile`, `Procfile`, `.dockerignore`.
- Оставил все исходники в корне: `index.html`, `catalog.html`, `profile.html`, `style.css`, `script.js`, `server.js`.

Как запустить локально

1) Установить зависимости и запустить сервер:

```bash
npm install
npm start
```

Сервер по умолчанию слушает порт `3000`. Откройте: `http://localhost:3000`.

Ngrok — быстрый публичный доступ (для демонстрации)

Установите `ngrok` (https://ngrok.com/) и в отдельном терминале выполните:

```bash
# если сервер запущен на 3000
ngrok http 3000
```

Скопируйте `Forwarding` URL (https://...) — это публичная ссылка для просмотра вашего сайта.

Если `ngrok` недоступен или требует аккаунта, можно использовать `localtunnel` без регистрации:

```bash
npx localtunnel --port 3000
```

Скопируйте `your url is: https://...` из вывода.

Локальные автоматические скрипты

- `npm run check` — проверяет синтаксис `server.js` и `script.js`.
- `npm run tunnel` — запускает `localtunnel` на порту `3000`.
- `.\scripts\verify.ps1` — выполняет `npm ci`, проверяет синтаксис и прогоняет smoke-тесты.
- `.\scripts\deploy.ps1 -remoteUrl https://github.com/YOUR_USER/YOUR_REPO.git` — инициализирует git, коммитит, пушит репозиторий и, если доступен Docker, собирает образ.
- `.\scripts\run-tunnel.ps1` — запускает `localtunnel` для публичного доступа.

Деплой (варианты)

- Статический (Netlify / GitHub Pages): если вы хотите деплоить только фронтенд (без API), можно направить репозиторий в Netlify и указать корень как `publish directory`.
- Серверный (Railway / Render / Heroku): подходит для `server.js` + SQLite. Пушьте репозиторий в GitHub и подключите сервис, укажите `web: node server.js` (Procfile) или прямо команду запуска.
- Docker: можно собрать образ и запустить контейнер (подходит для большинства облаков):

```bash
docker build -t luxdrive .
docker run -p 3000:3000 luxdrive
```

Как запушить на GitHub (если хотите, дайте URL репозитория и я подготовлю команды):

```bash
git init
git add .
git commit -m "Initial: prepare for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Если хотите, могу:
- автоматически подготовить репозиторий (коммиты) локально,
- сгенерировать Docker image и проверить запуск,
- подготовить инструкции по развертыванию на Railway и Netlify.

Что делать сейчас, чтобы сайт был доступен везде:

1) Создайте репозиторий на GitHub.
2) В корне проекта выполните один из вариантов:

```powershell
# PowerShell
.\scripts\deploy.ps1 -remoteUrl https://github.com/YOUR_USER/YOUR_REPO.git
```

```bash
# Git Bash или bash
./scripts/deploy.sh https://github.com/YOUR_USER/YOUR_REPO.git
```

3) После успешного `git push` подключите репозиторий к Railway, Render или Heroku.
   - Команда запуска: `npm start`
   - Для Railway/Render достаточно указать root-папку и `npm start`.
   - Для Heroku используется `Procfile`.

4) Если хотите сразу запустить публичную ссылку без регистрации, продолжайте использовать localtunnel:

```powershell
npm start
npx localtunnel --port 3000
```

После этих шагов сайт будет доступен по ссылке хоста и открываться с любого устройства.
