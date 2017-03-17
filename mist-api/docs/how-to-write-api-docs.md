# Introduction
Writing documentation is not a glamorous task. Nonetheless, well-written documentation is vital to producing good software both for end-users and developers.

To remove as much manual effort as possible, a significant portion of the MiST API documentation is automatically generated by inspecting the underlying source code (which ultimately is the single source of truth). For example, the REST endpoints may be inferred because they are derived from the directory structure in the `src/routes` directory (e.g. `src/routes/genomes` corresponds to the `/genomes` URI). If each URI is written manually, it must now be maintained in two places (the file structure and the documentation). Such an approach is not *[DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)* and subject to errors. With scripting, it is possible to automatically scan the directory structure and generate accurate endpoints that directly reflect the source code single source of truth. Of course, there are sections that must be written manually and support for this is also accommodated.

The MiST API documentation leverages a modified [node-slate](https://github.com/sdelements/node-slate) framework to produce beautiful and user-friendly documentation. [Building the docs](#building-the-documentation) produces a static website containing all the documentation  in the `src/docs/build` directory. The API itself has been coded to statically serve up this content when visiting either the api root `/` or `/v{version}/docs`.


<a name="buildling-the-documentation"></a>
# Building the documentation
Run the following commands inside the biowonks-dev container:

```bash
(docker) /app $ cd mist-api
(docker) /app/mist-api $ npm install
(docker) /app/mist-api $ npm run build-docs
```

The above `npm install` command first installs the mist-api node modules and afterwards installs the node packages needed to compile the documentation. It is only necessary to run this the first time or any time the package.json is modified.

To view the generated documentation, first start the api:
```bash
(docker) /app/mist-api $ npm start
```

Open [localhost:5000](http://localhost:5000) in your web browser.

After making any changes to the documentation, re-run `npm run build-docs` and refresh the browser.


# Configuration
Please see the annotated configuration in `mist-api/src/docs/config.js`.


# Manual Content
Manual content consists of HTML or [pug](https://pugjs.org/api/getting-started.html) (previously jade) files which are glued together into a single final HTML file. These files are located in the `mist-api/src/docs/source/includes` directory and must be suffixed with either `.html` or `.pug`.

## Modifying an *existing* section
1. Open the desired file (located within the `mist-api/src/docs/source/includes` directory)
2. Make the desired changes
3. Re-build the documentation (`npm run build`)

> Note: Automatically generated files are also stored within the `includes` directory. Editing these files will have no effect beacuse any changes will be overwritten the next time the documentation is compiled.

## Creating a *new* section
1. Create a new HTML or [pug](https://pugjs.org/api/getting-started.html) file in `mist-api/src/docs/source/includes` with the appropriate extension
2. Add some content and save the file
3. Open `mist-api/src/docs/config.js`
4. Add the filename (do not include any of the path) of this new file to the `includes` array. Take note of the order within this array as it determines the order it exists within the final documentation
5. Re-build the documentation (`npm run build`)


# Auto Generated Content
As discussed in the introduction, documentation for the routes may be partially automated to both save time and improve accuracy. Generating example model structures is another example. Currently, these are the only two parts automatically generated and are discussed in detail below.

## Routes
Just like having unit tests in close virtual proximity to the code they test (they are stored in a similarly named file in the same directory), it is preferred for the route documentation to be close in proximity to the code that handles that route. There are two possible methods for documenting a route:

1. [Using a pug file](#using-a-pug-file-to-document-a-route)
2. [Export a docs function](#exporting-a-docs-function-to-document-a-route)

> If both a pug file exists and docs function is exported, the pug file takes precedence.

<a name="using-a-pug-file-to-document-a-route"></a>
### Using a pug file to document a route
The simplest way to document a route is to create a file in the same directory as the target endpoint, named after the HTTP method. This contents of this file will be compiled using pug and result in the model structure documentation.

For example, if `get.js` exists in the `/routes/genomes` directory, simply create the file, `get.pug` in the same directory. The contents of `get.pug` will then be injected for the get route documentation.

<a name="exporting-a-docs-function-to-document-a-route"></a>
### Exporting a docs function to document a route
An alternative way to provide details about a particular endpoint is to export a function named `docs` from the file that handles the route. For example,

```javascript
// File: mist-api/src/routes/genomes/get.js
'use strict'

// GET /genomes
module.exports = function(app, middlewares, routeMiddlewares) {
    // Code for handling the route
}

// Export a 'docs' method to expose route specific documentation
module.exports.docs = function(modelExamples) {

}
```

When `npm run build` is executed, this process involves walking through all the defined routes (using [path-routify](https://github.com/lukeulrich/path-routify)) and executing the docs function if it is exported. The result returned from this function is minimally processed and then compiled using [pug](https://pugjs.org/api/getting-started.html) with the `mist-api/src/docs/source/templates/route.pug` template. The collective HTML for all routes is then saved to `mist-api/src/docs/source/includes/rest-api.html`, which gets incorporated into the final HTML file.

> Note: the `docs` function is passed a single argument, `modelExamples`, which is an object containing an example object for each model of the MiST-API. These examples correspond to the [model data strutures](#model-structures). This is quite helpful in producing more useful documentation such as providing example responses.

The `docs` function is expected to return an object like the following:

```javascript
{
    // Friendly short name for this endpoint; defaults to `${http method} ${uri}` (e.g. 'GET /genomes')
    name: 'Fetch Many Genomes',
    // HTML or plain text description of what this function does
    description: 'Returns an array of genomes',
    // HTTP method; automatically inferred unless overridden here
    method: null,
    // Endpoint; automatically inferred unless overridden here
    uri: null,
    // Object.<String,Object> description of parameters qualifying this endpoint. Each key is the
    // parameter name and each value is a two element object. For example:
    // {
    //   id: {
    //     type: 'integer',
    //     description: 'A positive number uniquely identifying this record'
    //   }
    // }
    parameters: null,
    // Example response
    example: {
        // If the method is GET, then all aspects of request is automatically inferred
        request: {
            endpoint: null,
            baseUrl: null,
            parameters: {}
        },
        // An example result returned from calling this endpoint. In this case, the body is an
        // array of Genome model records. This shows how the modelExamples argument is useful for
        // producing example responses.
        response: {
            body: [
                modelExamples.Genome
            ]
        }
    },
    // HAR = HTTP Archive Spec format; this is used by the node HTTPSnippet package to produce
    // the relevant snippets. Automatically inferred for GET routes.
    //
    // See http://www.softwareishard.com/blog/har-12-spec/ for details
    har: null
}
```

The code responsible for walking the route directories is in `mist-api/src/docs/lib/rest-api-docs.js` and called from the `rest-api` gulp task.

### Cascading parameters
Frequently, multiple routes have common parameters. For example, all the following share the {id} parameter:

* `GET /taxonomy/{id}`
* `GET /taxonomy/{id}/children`
* `GET /taxonomy/{id}/parents`

If a parameter is documented in a parent route (that is, a route defined in a parent directory), its parameter documentation is automatically cascaded to all child routes. If a child route redefines that parameter, the child route definition takes precedence. Thus, in the above example, the {id} parameter only needs to be documented for the `GET /taxonomy/{id}` route.


<a name="model-structures"></a>
## Model Structures
The introduction to this section in the MiST API docs is simply a static [pug](https://pugjs.org/api/getting-started.html) file: `mist-api/src/docs/source/includes/model-structures-intro.pug`. Make the desired changes, and rebuild the documentation.

The REST API service uses [Sequelize models](http://docs.sequelizejs.com/en/latest/api/model/) as an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) layer. As a general rule, these models correspond 1:1 with data structures returned from the API. By augmenting the model definition with a few additional fields (e.g. example data values and descriptions), helper scripts (`model-structures` gulp task + `mist-api/src/docs/lib/ModelHTMLBuilder.js`) may easily generate model specific documentation and example objects for each model.

A documentation section for each model is generated automatically. By augmenting the Sequelize model definition

A documentation section for each model is automatically generated from an augmented Sequelize model definition. To document a particular model, open the relevant model file (e.g. `mist-lib/src/models/Genome.model.js`), and add `example` and `description` properties to each of the fields to define a sample output for this field of the model. For example:

```javascript
// File: mist-lib/src/models/Genome.model.js
module.exports = function(Sequelize, models, extras) {
	let fields = {
		worker_id: Object.assign(extras.positiveInteger(), {
			description: 'foreign identifier to the current worker operating on this genome',
			example: 3
		}),
		accession: Object.assign(extras.requiredAccessionWithoutVersion(), {
			description: 'NCBI RefSeq accession number',
			example: 'GCF_000302455'
		}),
		version: Object.assign(extras.requiredPositiveInteger(), {
			description: 'NCBI RefSeq version',
			example: 1
		}),
		refseq_category: {
			type: Sequelize.TEXT,
			description: 'RefSeq genome category',
			example: 'representative genome',
			enum: [
				'representative genome',
				'reference genome',
				'na'
			]
		},
    ...
    }
}
```

In the above, accession will have the description: `NCBI RefSeq accession number` with an example value of `GCF_000302455`.

Finally, to provide a general model description, add a `description` property to the top-level object returned from the model file:

```javascript
// File: mist-lib/src/models/Genome.model.js
module.exports = function(Sequelize, models, extras) {
    // ... fields definition, etc
    return {
        description: 'The Genome model contains all top-level information about a genome.'
    }
}
```

The description fields may be a plain string or HTML.