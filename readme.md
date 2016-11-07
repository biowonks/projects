# BioWonks Projects

> Heavy development underway! Please be advised this repository and its sub-projects are currently under active development. This documentation here will be updated as time and resources permit.

This repository houses several of the BioWonks projects as a **[monorepo](http://danluu.com/monorepo/)** (thus the vague moniker, "projects"). With the exception of directories beginning with an underscore or period (.) and the bin/ directory, each top-level folder represents a main project. Currently this repository contains the following projects:

* [core-lib](core-lib/readme.md): core library containing generic functionality intended to be shared across multiple projects
* [fql](fql/readme.md): Feature Query Language specification and reference implementation for querying biological sequences and their associated features (e.g. domains)
* [seqdepot-lib](seqdepot-lib/readme.md): set of modules powering SeqDepot
* [mist-lib](mist-lib/readme.md): set of modules powering the next generation of MiST
* [mist-api](mist-api/readme.md): RESTful API for interacting with the MiST database
* [mist-pg-db](mist-pg-db/readme.md): Docker setup for running PostgreSQL database
* [mist-pipeline](mist-pipeline/readme.md): distributed, computational pipeline for analyzing microbial genomes for signal transduction
* *mist-web*: React.js powered front end web application for easily exploring the MiST database (not yet started)

Each of the above projects is independent from the others apart from explicit linking. For example, the *mist-pipeline* has symlinks to *core-lib*, *seqdepot-lib*, and *mist-lib*.

This structuring of our projects has made development signficantly easier without having to tediously deal with versioning issues and other build issues. The major pain point with this approach is having to write custom scripts for performing tasks that would be otherwise simple and straightforward with a repo per project. For example, if making a change to *mist-pipeline*, there is no need to re-run all the tests in parent or unrelated projects like *core-lib*.

## General Requirements
To effectively leverage and use the BioWonks projects, it is necessary to have the following tools:

* [git](https://git-scm.com/)
* [Node.js](https://nodejs.org) - we recommend using [NVM](https://github.com/creationix/nvm) to install version 6.x
* [Docker](https://www.docker.com/)

Node is used for various scripting tasks as well as other tooling helpers (e.g. [eslint](http://eslint.org/) javascript linting). The Docker software provides a reproducible and consistent environment for each project to cleanly express its own infrastructure. Thus, given the above tools, each project simply provides a Docker image or Dockerfile to configure the environment needed to run that project.


## Setup
Clone the repository:
```bash
$ mkdir ~/biowonks
$ cd ~/biowonks
$ git clone https://github.com/biowonks/projects.git
$ cd projects
```

Checkout the develop branch:
```bash
$ git checkout develop
```

Setup and attach to the docker development environment:
```
$ bin/setup-docker-dev.sh
$ docker attach biowonks-dev
```

This builds a base docker image including various dependencies and tools (e.g. Node.js, postgresql client libraries, etc.).


## Setting up and running specific projects
Most projects are written in Node.js and in general may be setup by navigating to the relevant top-level project folder (inside the docker container) and executing `npm install`. For details about each project, see each project's readme.

### MiST Pipeline
```bash
(biowonks @ docker) /app $ cd mist-pipeline
(biowonks @ docker) /app/mist-pipeline $ npm install
```

Run `pipeline.sh` without any arguments for help on how to use this command. For example, to seed new genomes, download each genomes taxonomy, and load this data from NCBI RefSeq:

```bash
(biowonks @ docker) /app/mist-pipeline $ bin/pipeline.sh SeedNewGenomes Taxonomy NCBICoreData
```

## MiST API
```bash
(biowonks @ docker) /app $ cd mist-api
(biowonks @ docker) /app/mist-api $ npm install
```

To start the API service:
```
(biowonks @ docker) /app/mist-api $ npm start
```

Open `http://localhost:5000` to view the API documentation and ensure the API is running as expected.

To stop the API service:
```
(biowonks @ docker) /app/mist-api $ npm stop
```
