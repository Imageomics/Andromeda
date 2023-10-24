# Adds logic to serve static html for running within huggingface
from flask import send_from_directory, request
from main import app

@app.errorhandler(404)
def page_not_found(e):
    path = request.path.lstrip('/')
    if path == '':
       path = 'index.html'
    return send_from_directory('static', path)

if __name__ == '__main__':
   app.run(host="0.0.0.0", port=7860)
