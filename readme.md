# Biowonks Projects

## Requirements
* git
* Docker

Clone the repository:
```
git clone https://github.com/biowonks/projects.git
```

In order to work as a developer make sure to checkout the develop branch:
```
git checkout develop
```

### Start Docker
```
docker-compose -up -d biowonks-dev
docker attach biowonks-dev
```

## MIST PIPELINE
```
cd mist-pipeline
npm install
./bin/pipeline.sh SeedNewGenomes
```

## MIST API
Setup:
```
cd mist-api
npm run setup

Start the api with:
```
npm start
```


## FQL (Feature Query Language)

