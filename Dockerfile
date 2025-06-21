FROM python:3.12.1

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

WORKDIR /backend/src

CMD ["sh", "../start.sh"]