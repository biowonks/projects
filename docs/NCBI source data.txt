[21 Jan 2016]
This document serves to outline in specific detail where we obtain our source genomes and the flow for obtaining that information.

# Fetch assembly summaries from NCBI FTP site for both bacteria and archaea.

ftp://ftp.ncbi.nih.gov/genomes/refseq/archaea/assembly_summary.txt
ftp://ftp.ncbi.nih.gov/genomes/refseq/bacteria/assembly_summary.txt

Each summary contains roughly 20 columns of data which are mapped to the genomes table as follows:

  # assembly_accession >> genomes.refseq_assembly_accession
  bioproject >> genomes.bioproject
  biosample >> genomes.biosample
  wgs_master >> genomes.wgs_master
  refseq_category >> genomes.refseq_category
  taxid >> genomes.taxonomy_id
  species_taxid >> genomes.species_taxonomy_id
  organism_name >> genomes.name
  infraspecific_name >> /strain=(.+)/ >> genomes.strain
  isolate >> genomes.isolate
  version_status >> genomes.version_status
  assembly_level >> genomes.assembly_level
  release_type >> genomes.release_type
  genome_rep >> (since this value is always full, ignore)
  seq_rel_date >> genomes.release_date
  asm_name >> genomes.assembly_name
  submitter >> genomes.submitter
  gbrs_paired_asm >> genomes.genbank_assembly_accession
  paired_asm_comp >> (ignored)
  ftp_path >> genomes.ftp_path

  The taxonomy is only available on the FTP site within the GenBank encoded files. Rather than download them just for this information, the taxonomy will be obtained by querying the NCBI taxonomy server (E-utils link) with the taxonomy_id value.

  GET http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=${taxonomy_id}&retmode=text&rettype=xml

  genomes.taxonomic_group is set to the phylum and the class if the phylum is proteobacteria

## Genome files and their database mappings
Using the FTP path specified for each genome in the assembly_summary.txt files above, download the following files:

* md5checksums.txt
  These are used to verify downloaded file integrity

* GCF..._assembly_report.txt
  Determine the associated components and their general properties.

  Sequence-Name >> components.name
  Sequence-Role >> components.role
  Assigned-Molecule >> components.assigned_molecule
  Assigned-Molecule-Location/Type >> components.type
  GenBank-Accn >> components.genbank_accession
  Relationship >> components.genbank_refseq_relationship
  RefSeq-Accn >> components.refseq_accession

* GCF..._genomic.fna.gz
  Contains the DNA sequence for each component in FASTA format.

  Each DNA sequence begins with: >${RefSeq Accession} and this will be used to associate sequences with the metadata from the assembly report. The following fields are taken from this file:

  components.dna
  components.length

* GCF..._genomic.gff.gz
  Much gene/protein data is duplicated in the feature_table.txt file, and because of its simpler format, it will be primarily sourced for information; however, some useful information is only contained in this file. Specifically,

  The region lines for each sequence indicate whether a component is circular. For example,

	NC_009438.1     RefSeq  region  1       4659220 .       +       .       ID=id0;Dbxref=taxon:319224;Is_circular=true;Name=ANONYMOUS;gbkey=Src;genome=chromosome;mol_type=genomic DNA;strain=CN-32

	RefSeq region Is_circular >> components.is_circular

  Also unique to this file are any notes about the product:

  	NC_012261.1     Protein Homology        CDS     47      325     .       +       0       ID=cds0;Parent=gene0;Dbxref=Genbank:WP_012622030.1;Name=WP_012622030.1;Note=catalyzes the hydrolysis of acylphosphate;gbkey=CDS;product=acylphosphatase;protein_id=WP_012622030.1;transl_table=11

  	Note=(...) >> genes.product_note

* GCF..._feature_table.txt
  # feature
  class >> genes.class
  assembly
  assembly_unit
  seq_type
  chromosome
  genomic_accession (this is the refseq_assembly_accession) >> genes.component_id via looking up the refseq_assembly_accession
  start >> genes.start
  stop >> genes.stop
  strand >> genes.strand
  product_accession >> genes.product_accession
  non-redundant_refseq >> genes.nr_refseq_product_accession
  related_accession
  name >> genes.product
  symbol >> genes.names[]
  GeneID
  locus_tag >> genes.locus
  feature_interval_length
  product_length
  attributes.old_locus_tag >> genes.old_locus

  If feature = tRNA, attributes.anticodon >> genes.anticodon

* GCF..._protein.faa.gz
  Obtain the translated amino acid sequences for this genome.

  Each coding sequence begins with: >${product_accession} and this will be used to associate sequences with the metadata from the feature table. The following fields are taken from this file:

  aseqs.sequence
  aseqs.length
  genes.aseq_id
