# Parsing of the NCBI RefSeq assembly reports
Issue [#118382507](https://www.pivotaltracker.com/story/show/118382507) in the Pivotal Tracker

## What does this do !? 

The NCBI RefSeq genome dataset is the core source of genomic data. Parsing these data files is a foundational step to this pipeline. In particular, the assembly report file (GCF_...assembly_report.txt) lists "components" (replicons, contigs, etc) belonging to each genome. The parser is designed to extract this information into a form that may be readily transformed for insertion into the database (JSON)

## How does it do !?