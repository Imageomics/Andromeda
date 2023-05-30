# Andromeda
Andromeda is a website that allows a user to perform dimensional reduction on an uploaded CSV file.

## Requirements
Deployment requires [docker-compose](https://www.docker.com/).

Development requires [python3](https://www.python.org/) and [nodejs](https://nodejs.org/).

## Deployment
To deploy the website on a machine running docker run the following commands:
```
git clone https://github.com/Imageomics/Andromeda.git
cd Andromeda/
docker-compose up -d
```
The `-d` flag runs the website in the background. For troubleshooting remove this flag to more easily monitor the deployment.

Once the website finishes launching the website will be available on port 80: [http://localhost](http://localhost).
Part of the deployment builds the docker containers used by the website, so it may take a few minutes to finish deployment.
To stop the app run `docker-compose down`.

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
