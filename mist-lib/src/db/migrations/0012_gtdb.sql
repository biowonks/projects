create table gtdb (
  release text not null,
  accession text not null,
  representative_accession text not null,
  is_representative boolean not null,
  ncbi_assembly_name text,
  ncbi_genbank_accession text,

  superkingdom text,
  phylum text,
  class text,
  orderr text,
  family text,
  genus text,
  species text,

  -- The following 6 fields are taken from the sp_clusters file and are
  -- only defined for representative genomes
  ani_circumscription_radius float,
  mean_intra_species_ani float,
  min_intra_species_ani float,
  mean_intra_species_af float,
  min_intra_species_af float,
  num_clustered_genomes integer,

  checkm_completeness float,
  checkm_contamination float,
  checkm_marker_count integer,
  checkm_marker_taxa_field text,
  checkm_marker_taxa_value text,
  checkm_marker_uid integer,
  checkm_marker_set_count integer,
  checkm_strain_heterogeneity float,

  primary key (release, accession)
) partition by list (release);
comment on table gtdb is 'Genome Taxonomy Database (GTDB) phylogeny records';
comment on column gtdb.release is 'text-encoded release version; e.g. "95.0"';
comment on column gtdb.accession is 'Genbank or RefSeq prefixed accession version; e.g. GB_GCA_000007345.1';
comment on column gtdb.representative_accession is 'accession of representative genome for this accession';


-- MIGRATION DOWN SQL
drop table gtdb;
