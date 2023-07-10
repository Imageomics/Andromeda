# Andromeda
Andromeda is a website that allows a user to perform dimensional reduction on an uploaded CSV file.

## Requirements
Deployment requires [docker-compose](https://www.docker.com/).

Development requires [python3](https://www.python.org/) and [nodejs](https://nodejs.org/).

## Deployment
To deploy the website on a machine running docker run the following commands:
```bash
git clone https://github.com/Imageomics/Andromeda.git
cd Andromeda/
cp example.env .env
docker-compose up -d
```
The `-d` flag runs the website in the background. For troubleshooting remove this flag to more easily monitor the deployment.

Once the website finishes launching the website will be available on port 80: [http://localhost](http://localhost).
Part of the deployment builds the docker containers used by the website, so it may take a few minutes to finish deployment.
To stop the app run `docker-compose down`.

Settings for the app can be changed in `.env`.
Options for `.env`:
- BACKEND_WORKERS - number of [workers used by gunicorn](https://docs.gunicorn.org/en/latest/run.html#commonly-used-arguments)
- ANDROMEDA_RGB_SATELLITE_URL - URL pointing to a CSV file for joining RGB data
- ANDROMEDA_LANDCOVER_URL - Optional URL pointing to a CSV file for joining Landcover data


### Certbot Setup on AWS
Certificates can be installed to the EC2 VM using Certbot with Nginx on pip following [EFF instructions](https://certbot.eff.org/instructions?ws=nginx&os=pip).
```bash
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```
And to install Nginx on the Amazon Linux 2023 (following [instructions](https://awswithatiq.com/how-to-install-nginx-in-amazon-linux-2023/)) and run Certbot:
```bash
docker-compose down
sudo dnf update -y
sudo dnf install nginx -y
sudo systemctl start nginx
sudo certbot certonly --nginx
```
Following prompted agreements, registration, and specifying andromeda.imageomics.org, the certificates are installed to:

Certificate: `/etc/letsencrypt/live/andromeda.imageomics.org/fullchain.pem`

Key: `/etc/letsencrypt/live/andromeda.imageomics.org/privkey.pem`

Finally, shut down Nginx on the system to avoid interference with the container:
```bash
sudo systemctl stop nginx
docker-compose up -d
```

## Development
To run the website locally without using docker requires two terminal sessions.
1. Python Flask Backend API Server 
2. Frontend nodejs/react development server

## Python Backend
The python backend consists of a [Flask](https://flask.palletsprojects.com/en/2.3.x/quickstart/#a-minimal-application) REST API server.
See the [Andromeda Python README](andromeda/README.md) for instructions on running locally.

## React Frontend
The frontend is a [typescript](https://www.typescriptlang.org/) [react](https://react.dev/) single page application.
The project was generated using [nextjs](https://nextjs.org/docs) as suggested in the react documentation.
See the [Andromeda React README](andromeda-ui/README.md) for instructions on running locally.

## Notebook
An older version of Andromeda written as a jupyter notebook is at [Andromeda_IMG.ipynb](Andromeda_IMG.ipynb).
