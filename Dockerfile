FROM node:18.16.0 as builder
WORKDIR /src
COPY ./andromeda-ui/package.json ./
RUN npm install
COPY ./andromeda-ui/. .
RUN npm run build

FROM python:3.11

COPY ./andromeda/requirements.txt /tmp/requirements.txt
WORKDIR /tmp
RUN pip3 install gunicorn && pip3 install -r requirements.txt

COPY ./andromeda/. /api
COPY ./app.py /api/app.py
COPY --from=builder /src/out /api/static
WORKDIR /api

# fix since root home directory is read only in HF
RUN mkdir /tmp/home
RUN chmod a+w /tmp/home
ENV XDG_DATA_HOME=/tmp/home

CMD python app.py