FROM python:3.12.1

# Создаем рабочую директорию
RUN mkdir /backend
WORKDIR /backend

# Копируем зависимости и устанавливаем
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Даем права на скрипт запуска
RUN chmod +x start.sh

# Запускаем приложение
CMD ["sh", "./start.sh"]
