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

Start Docker:
```
docker-compose -up -d biowonks-dev
```

Attach the bash session:
```
docker attach biowonks-dev
```

## MiST pipeline

```
cd mist-pipeline
npm install
./bin/pipeline.sh SeedNewGenomes
```

## MiST api
Setup:
```
cd mist-api
npm run setup
```

Start the api with:
```
npm start
```


## FQL (Feature Query Language)

