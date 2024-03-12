# SETUP JS
FROM node:20 AS frontend-builder
WORKDIR /code

COPY package.json package-lock.json /code/
RUN npm install

COPY . /code/
RUN npm run build

# SETUP PYTHON
FROM python:3.11 AS backend-builder
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY --from=frontend-builder /code /code
WORKDIR /code