# 🟣 Этап 1: собираем фронтенд
FROM node:18 AS frontend-builder

WORKDIR /ksite/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# 🟣 Этап 2: собираем бэкенд + копируем build
FROM python:3.12.1

# Параметры БД
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASS

ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}

RUN mkdir /ksite
WORKDIR /ksite

COPY requirements.txt ./
RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Копируем бэкенд код
COPY backend/ ./backend/

# Копируем фронтенд билд из этапа frontend-builder
COPY --from=frontend-builder /ksite/frontend/build /ksite/frontend/build

# Копируем скрипты и всё необходимое
COPY ./backend/docker/start.sh ./backend/docker/start.sh
RUN chmod +x ./backend/docker/start.sh

CMD ["sh", "./backend/docker/start.sh"]
