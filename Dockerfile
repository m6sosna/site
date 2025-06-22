FROM python:3.12.1
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASS

ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}
RUN mkdir /ksite

WORKDIR /ksite

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

#RUN chmod a+x docker/app.sh


CMD ["sh", "./backend/docker/start.sh"]
