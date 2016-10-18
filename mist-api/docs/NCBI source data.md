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

* GCF..._genomic.gbff.gz
  This file contains the complete GenBank formatted RefSeq genome data. More accurately, it consists of one or more records (delimited by //\n) that correspond to one or more "components". Loosely speaking, a component is any stretch of DNA with its annotation. These are typically replicons in the context of complete genomes, and contigs / scaffolds for draft genomes. The following sections describe where MiST sources its data from this core data file and how it maps to the database tables.

  REFERENCE >> genome_references (taken from the first component's REFERENCE section)

  components.molecule_type = LOCUS.moleculeType
  components.is_circular = LOCUS.topology
  components.annotation_date = LOCUS.date
  components.dna = ORIGIN
  components.length is calculated from the dna

  The remaining core tables are all sourced from the feature table section (FEATURES).

  The main table is genes which aggregates information for coding sequences, RNAs, and pseudo genes. A gene feature is linked to another cognate feature if they both have an identical location. If unexpectedly multiple non-gene features share the same location with a gene feature, then only the first one is linked to the gene. The remainder will be stored in the components_features table (see below).

  Each gene will be assigned a database generated identifier; however this is not intended to be consumed by the public. Rather, genes are meant to be identified using either the RefSeq accession (with or without the version), locus tags, or cross-references. To support annotated genes that lack an accession (e.g. RNA sequences), the accession field is not required.

  genes.dseq_id = generated from the Seq returned by LocationStringParser
  genes.aseq_id = generated from the Seq constructed with the CDS transalation
  genes.accession = CDS/protein_id
  genes.version = CDS/protein_id
  genes.locus = /locus_tag this is usually the RefSeq assigned locus
  genes.old_locus = /old_locus_tag this is usually the GenBank assigned locus
  genes.strand, start, stop = determined by the LocationStringParser
  genes.length = genes.dseq.length()
  genes.type = if this gene is linked with another feature, this value is the feature key it is associated with (e.g. CDS, tRNA, etc)
  genes.names (array) = names.0 = /gene, other /gene and /gene_synonym are appended
  genes.pseudo = /pseudo
  genes.product = CDS/product
  genes.codon_start = CDS/codon_start
  genes.translation_table = CDS/transl_table
  genes.notes = /note
  genes.qualifiers = all other unprocessed qualifiers. Only the first qualifier of each name is included (e.g. if multiple 'inference' fields exist, the first one takes precedence)

  /db_xrefs are stored in the xrefs table with some additional processing rules:
  - All GI numbers are ignored

  All features other than gene and its linked features are stored in components_features.

* GCF..._assembly_report.txt
  Determine the associated components and their general properties.

  RefSeq-Accn >> components.accession
  GenBank-Accn >> components.genbank_accession
  Sequence-Name >> components.name
  Sequence-Role >> components.role
  Assigned-Molecule >> components.assigned_molecule
  Assigned-Molecule-Location/Type >> components.type
  Relationship >> components.genbank_refseq_relationship
