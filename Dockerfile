FROM python:3.12.1

RUN mkdir /fastapi_app
WORKDIR /fastapi_app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

WORKDIR /fastapi_app/src

CMD ["../start.sh"]
