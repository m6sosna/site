# 🟣 Этап 1: Сборка фронтенда
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# 🟣 Этап 2: Сборка бэкенда + копирование build
FROM python:3.12.1

# Переменные окружения для БД
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}

# Установка зависимостей Python
WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Копируем весь бекенд
COPY backend/ ./backend/

# Копируем фронтенд билд из предыдущего этапа
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

CMD ["sh", "./backend/docker/start.sh"]
