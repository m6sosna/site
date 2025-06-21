#!/bin/bash

# Выход при ошибке любой команды
set -e

# Прогоняем миграции
alembic -c /alembic.ini upgrade head

# Запускаем сервер
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
