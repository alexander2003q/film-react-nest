# FILM!

Приложение для просмотра киноафиши и бронирования билетов. Frontend написан на React, backend — на NestJS, данные хранятся в MongoDB.

## Требования

- Node.js 20+
- npm
- MongoDB или Docker

## MongoDB

Для локальной MongoDB по умолчанию используется адрес `mongodb://localhost:27017/prac`.

Базу можно запустить в Docker:

```bash
docker run --name film-react-nest-mongo -p 27017:27017 -d mongo:latest
```

При повторном запуске достаточно:

```bash
docker start film-react-nest-mongo
```

Загрузите стартовые фильмы в коллекцию `prac.films`:

```bash
docker cp backend/test/mongodb_initial_stub.json film-react-nest-mongo:/tmp/films.json
docker exec film-react-nest-mongo mongoimport --db prac --collection films --file /tmp/films.json --jsonArray --drop
```

Вместо Docker файл `backend/test/mongodb_initial_stub.json` можно импортировать в MongoDB Compass как JSON-массив.

## Backend

```bash
cd backend
npm ci
cp .env.example .env
npm run start:dev
```

Переменные в `backend/.env`:

- `DATABASE_DRIVER` — драйвер базы, для проекта `mongodb`;
- `DATABASE_URL` — адрес MongoDB;
- `PORT` — HTTP-порт backend.

По умолчанию API доступен по адресу `http://localhost:3000/api/afisha`.

## Frontend

Во втором терминале:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Переменные в `frontend/.env`:

- `VITE_API_URL` — базовый URL API;
- `VITE_CDN_URL` — URL статических афиш.

Frontend будет доступен по адресу `http://localhost:5173`.

Если порт backend изменён, укажите тот же порт в `VITE_API_URL` и `VITE_CDN_URL`.

## API

- `GET /api/afisha/films`
- `GET /api/afisha/films/:id/schedule`
- `POST /api/afisha/order`
- `GET /content/afisha/*`

Спецификация находится в `film.yml`, коллекция Postman — в `film.postman.json`.

## Проверка

Backend:

```bash
cd backend
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```
