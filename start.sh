#!/bin/bash

# Прогоняем миграции с явным указанием конфига
alembic -c alembic.ini upgrade head

# Запускаем gunicorn с правильным модулем
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000
