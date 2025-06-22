# Этап 1: собираем фронт
FROM node:18 AS frontend-builder
WORKDIR /frontend/src
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12.1

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

COPY requirements.txt .

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*


COPY . .

CMD ["sh", "./backend/docker/start.sh"]
