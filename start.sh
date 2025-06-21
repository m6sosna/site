#!/bin/bash
set -e

# Запускаем миграции с правильным путем к ini (в src)
alembic -c ./alembic.ini upgrade head

# Запускаем приложение (main.py в src)
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
