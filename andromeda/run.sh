#!/bin/bash
gunicorn -w ${BACKEND_WORKERS:=4} -b :7860 -t 360 wsgi:app
