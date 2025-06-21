FROM python:3.12.1

# Создаем рабочую папку
RUN mkdir /fastapi_app
WORKDIR /fastapi_app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY . .

# Даем права на выполнение скрипта запуска
RUN chmod +x start.sh

# Переключаем рабочую папку в src
WORKDIR /fastapi_app/src

# Запускаем через скрипт
CMD ["../start.sh"]
