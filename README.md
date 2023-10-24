# Andromeda
Andromeda is a website that allows a user to perform dimensional reduction on an uploaded CSV file.

## Requirements
Deployment requires [Docker](https://www.docker.com/).

Development requires [python3](https://www.python.org/) and [nodejs](https://nodejs.org/).

## Deployment
Our primary deployment environment is [Hugging Face Spaces](https://huggingface.co/spaces/imageomics/Andromeda).

To build a Docker image from the source code and deploy the container:

1. Clone this repository and navigate into it.

2. Build the Docker image.
```bash
docker image build -t andromeda .
```

3. Optionally, set your environment variables in `.env`. See the section below for more information.
```bash
cp example.env .env # uses the provided example environment variables
```

4. Run the Docker container.
```bash
docker container run --env-file .env -p 7860:7860 andromeda
```

5. Prepare a simple Dockerfile in a Hugging Face Space. For example:
```Dockerfile
FROM ghcr.io/Imageomics/Andromeda:latest
```

Hugging Face handles SSL encryption automatically. Deploying in another environment may require additional configuration; previous configurations are discussed in [Prior Configurations](https://github.com/Imageomics/Andromeda/wiki/Prior-Configurations).

If you are interested in running your own QUEST-like class with your own satellite data CSV, you could create a few line Dockerfile, add your CSV, and host your own version Andromeda on your HF account.
Settings for the app can be changed in `.env`.
Options for `.env`:
- BACKEND_WORKERS - number of [workers used by gunicorn](https://docs.gunicorn.org/en/latest/run.html#commonly-used-arguments)
- ANDROMEDA_RGB_SATELLITE_URL - URL pointing to a CSV file for joining RGB data

## Development
You may use the Docker image for testing during development as described above, but it is not required.

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
