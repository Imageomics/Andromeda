# Andromeda
Andromeda is a website that allows a user to perform dimensional reduction on an uploaded CSV file.

## Requirements
Deployment requires [Docker](https://www.docker.com/).

Development requires [python3](https://www.python.org/) and [nodejs](https://nodejs.org/).

## Deployment
Our primary deployment environment is [Hugging Face Spaces](https://huggingface.co/spaces/imageomics/Andromeda).
To deploy the website on a machine running Docker run the following commands:
1. Clone our Hugging Face Andromeda repository, which uses this GitHub repository as a submodule.
```bash
git clone --recurse-submodules git@hf.co/spaces/imageomics/Andromeda # or use https://huggingface.co/spaces/imageomics/Andromeda
```
(optional) If you want to use or test a different branch of the Andromeda repository, checkout the desired branch.
```bash
cd Andromeda/Andromeda
git checkout <branch>
cd ..
```
2. Build the Docker image.
```bash
docker image build -t andromeda .
```
3. Run the Docker image.
```bash
docker container run -p 7860:7860 andromeda
```

While Hugging Face handles SSL encryption automatically, other deployment environments require SSL to be set up manually. One common approach is using a reverse proxy like Nginx. Below are some resources and tutorials that provide guidance on setting up SSL with Nginx in a Docker environment:

- [Configure HTTPS for an Nginx Docker Container (Stackify)](https://stackify.com/how-to-configure-https-for-an-nginx-docker-container/)​
- [Setup SSL with Docker, NGINX and Lets Encrypt (Programonaut)​](https://www.programonaut.com/setup-ssl-with-docker-nginx-and-lets-encrypt/)
- [Set up SSL on Docker, Nginx Container and Let's Encrypt (SSLWiki)](https://sslwiki.org/set-up-ssl-on-docker-nginx-and-lets-encrypt/)
- [Install TLS/SSL on Docker Nginx Container With Let’s Encrypt (Dev.to)](https://dev.to/macelux/how-to-install-tlsssl-on-docker-nginx-container-with-lets-encrypt-34c5)
- [NGINX Docker with SSL Encryption (Self-signed) by Mike Polinowski​](https://mpolinowski.github.io/docs/DevOps/NGINX/2020-08-27--nginx-docker-ssl-certs-self-signed/2020-08-27/)

These tutorials cover a range of setups including self-signed certificates, Let's Encrypt, and Certbot. Choose the one (or more) that aligns well with your deployment scenario.

Settings for the app can be changed in `.env`.
Options for `.env`:
- BACKEND_WORKERS - number of [workers used by gunicorn](https://docs.gunicorn.org/en/latest/run.html#commonly-used-arguments)
- ANDROMEDA_RGB_SATELLITE_URL - URL pointing to a CSV file for joining RGB data

## Development
You may use the Docker image for development as described above, but it is not required.

To run the website locally without using Docker requires two terminal sessions.
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
