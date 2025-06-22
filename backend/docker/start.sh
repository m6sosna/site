#!/bin/bash
set -e

cd backend/src

while ! nc -z db 5432; do
  sleep 1
done
alembic upgrade head

gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000
