FROM python:3.12.1

# Рабочая директория — корень проекта, где лежит start.sh и requirements.txt
WORKDIR /ksite

# Копируем зависимости и ставим их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Делаем start.sh исполняемым
RUN chmod +x start.sh

# Запускаем start.sh
CMD ["./start.sh"]
