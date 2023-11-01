# Andromeda
Andromeda is a website that allows a user to perform dimensional reduction on an uploaded CSV file.

## Requirements
Deployment requires [Docker](https://www.docker.com/).

Development requires [python3](https://www.python.org/) and [nodejs](https://nodejs.org/).

## Deployment
Our primary deployment environment is [Hugging Face Spaces](https://huggingface.co/spaces/imageomics/Andromeda).
To deploy a new version change the version in the tag in the [Andromeda Space Dockerfile](https://huggingface.co/spaces/imageomics/Andromeda/blob/main/Dockerfile).
Hugging Face handles SSL encryption automatically. 
Deploying in another environment may require additional configuration; previous configurations are discussed in [Prior Configurations](https://github.com/Imageomics/Andromeda/wiki/Prior-Configurations).

## Development
You may use the Docker image for testing during development as described above, but it is not required.

To run the website locally without using Docker requires two terminal sessions.
1. Python Flask Backend API Server 
2. Frontend nodejs/react development server

For instructions on buliding and running the Docker container see [Developing with Docker](https://github.com/Imageomics/Andromeda/wiki/Developing-with-Docker).

## Python Backend
The python backend consists of a [Flask](https://flask.palletsprojects.com/en/2.3.x/quickstart/#a-minimal-application) REST API server.
See the [Andromeda Python README](andromeda/README.md) for instructions on running locally.

## React Frontend
The frontend is a [typescript](https://www.typescriptlang.org/) [react](https://react.dev/) single page application.
The project was generated using [nextjs](https://nextjs.org/docs) as suggested in the react documentation.
See the [Andromeda React README](andromeda-ui/README.md) for instructions on running locally.

## Notebook
An older version of Andromeda written as a jupyter notebook is at [Andromeda_IMG.ipynb](Andromeda_IMG.ipynb).
