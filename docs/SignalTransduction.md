# Signal Transduction pipeline

The very first step of the signal transduction pipeline is to gather signal transduction proteins from a genome. For that, a definition of what is each protein family is required.

## Protein domain definition

The basic principle here is that protein family will always (or mostly always) have a signature domain architecture.

For example the Methyl-accepting chemotaxis protein (MCP), a chemoreceptor present in most prokaryotes can be defined as any protein with the Pfam protein domain model `MCPSignal`. Even if there are other domains present, if MCPSignal is present in a protein it is very likely that it will be a MCP.

But life in bioinformatics is not always this simple and next we will show some rules to define protein families with domain architecture

***

### Multi-domain architectures vs. single domain architectures.

CheW is an adaptor chemotaxis protein and is previously defined in MiST by any protein that has the CheW domain and nothing else.

This is in contrast with the histidine kinase in chemotaxis, also known as CheA. CheA can be defined by any protein with the CheW domain and the HTPase domain.

Please, compare with the definition of MCP which requires at least one MCPSignal domain but also accepts others.

Another interesting example is to define CheC, one of the phosphotases of chemotaxis: CheC is defined by presenting CheC domain. However, some proteins with CheC domain might also have SpoA domain and thus requires a rule to exclude proteins with certain domains.

From these examples we define four requirements:

1) allow to be unique or not: CheW vs MCP
2) allow to be multi-domain: CheA
3) allow to include *needed* domain(s) but not care if there are other domains also: CheA, MCPs
4) allow to exclude domains if needed: CheC

***

### Order matters sometimes

CheV is defined as a protein with two domains: RR domain and a CheW domain.

However, order matter as CheV is defined as a RR in the N terminus and a CheW in the C terminus. There are plenty examples of proteins with CheW domain in the N terminus and RR in the C terminus that would be wrongly classified as CheV.

5) allow the domains to be ordered

***

### Multiple copies of the same domain

There example of proteins containing multiple copies of the same domain. A chemotaxis example is CheW. There are proteins with double CheW and even triple CheW.

6) allow to determine the number of copies of a domain.

***

### Multiple definitions for same protein.

CheR, the methytransferase enzyme in chemotaxis systems can be defined by any protein with CheR or CheR_N domains.

7) allow more than one definition for a single protein family.

***

## Requirements to the mini language to define protein families by Domain Architecture

1) allow to be unique or not: CheW vs MCP
2) allow to be multi-domain: CheA
3) allow to include *needed* domain(s) but not care if there are other domains also: CheA, MCPs
4) allow to exclude domains if needed: CheC
5) allow the domains to be ordered: CheV
6) allow to determine the number of copies of a domain: double CheW
7) allow more than one definition for a single protein family: CheR

## PhyPro (by Davi Ortega) as a precursor for the mini language

In PhyPro, protein domain families are defined in a configuration file like this:

```json
"ProtFamDef": {
      "SeqDepot": [
        {
          "group": "Methyltranferase",
          "name": "CheR",
          "pfam29": {
            "in": [
              "CheR"
            ]
          }
        },
        {
          "group": "Methyltranferase",
          "name": "CheR",
          "pfam29": {
            "in": [
              "CheR_N"
            ]
          }
        },
        {
          "group": "PhosphotaseCheCX",
          "name": "CheCX",
          "pfam29": {
            "in": [
              "CheC"
            ],
            "out": [
              "SpoA"
            ]
          }
        },
        {
          "group": "HistidineKinase",
          "name": "CheA",
          "agfam1": {
            "in": [
              "HK_CA:Che"
            ]
          }
        },
        {
          "group": "HistidineKinase",
          "name": "CheA",
          "pfam29": {
            "in": [
              "CheW",
              "HATPase_c"
            ]
          }
        }
      ]
    }
```

Here, three proteins domains are defined: CheR, CheC and CheA. Notice that in CheR two definitions are allowed by attributing both definitons to the same protein family name `CheR`.

CheCX is defined with `in` domain `CheC` but without the `SpoA` in the `out` key.

Finally, CheA is also defined by two different definitions, as CheR, but here one from two different databases: `pfam29` and `agfam1`. In this case, as in CheR, the result is collected for each definition independently and then merged at the end without duplicates.

PhyPro perform this search on seqdepot first and received the `aseq_id` and the *sequence* of all proteins that match the domain architecture definition. Only in a latter time, these datasets will be used to build the required dataset by the used to the specific genomes.

Thus, for generality, this mini-language should allow the user to limit the search by a list of genome accession numbers.

8) allow limit search in specific genomes.

## Aquerium (by Ogun Adebali) as a precursor to the mini language.

[Aquerium](aquerium.utk.edu) is a tool that does exactly what we want and pretty much how we want. It has already a mini language rather than a config file like `PhyPro`.

Ogun's tool already takes care of all the 8 rules, PhyPro takes care of only a few.

[Here](http://aquerium.utk.edu/documentation) is a list of the rules implemented in Aquerium.

## Conclusion

Whoever will do this, should talk to Ogun about it and port his algorithm for the mini language to MiST.
