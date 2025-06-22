#!/bin/bash
set -e

cd backend/src

echo "Waiting for database $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  echo "Waiting for database $DB_HOST:$DB_PORT..."
  sleep 1
done
echo "Database is up, running migrations..."
alembic upgrade head

echo "Starting app..."
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

