FROM python:3.11

COPY ./requirements.txt /tmp/requirements.txt
WORKDIR /tmp
RUN pip3 install gunicorn && pip3 install -r requirements.txt

COPY . /api
WORKDIR /api

CMD ["gunicorn", "-w", "17", "-b", ":5000", "-t", "360", "wsgi:app"]
