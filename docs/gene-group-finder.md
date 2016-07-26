# gene-group-finder

## What

This method will take an object with information about start, stop and strand of a series of genes from a genome and output a list of object items grouped if they are under 200 bp of distance and same strand. This cutoff is based on the following publications:

Moreno-Hagelsieb, G. & Collado-Vides, J. A powerful non-homology method for the prediction of operons in prokaryotes. Bioinformatics 18, S329–S336 (2002).

## Usage

Expected input:
```JSON
[
{
   strand: '-',
   start: 100,
   stop: 450
}, ...
]
```

expected output:
```JSON
[
  [{strand: '+', start: 100, stop: 300}, {strand: '+', start: 350, stop: 600}, ...], // This is the first gene cluster,
  [{strand: '+', start: 1200, stop: 1400}, {strand: '+', start: 1525, stop: 2234}, ...], // This is the second gene cluster
  ....
]
```

## Example

```javascript
// load your input
let genePositionStrand = require('./test-data/sample-gene-group')

// start an instance of the class
let geneGroupFinder = new GeneGroupFinder()

//parse your input
geneGroupFinder.parse(genePositionStrand)

// your results will be in the **groups** method
let results = geneGroupFinder.groups
```


### Contact: Davi
