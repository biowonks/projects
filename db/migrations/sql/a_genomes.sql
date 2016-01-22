begin;

-----------------------------------------------------------
-- Core MiST database tables
create table genomes_queue (
	refseq_assembly_accession text not null primary key,
	genbank_assembly_accession text,
	bioproject text,
	biosample text,
	wgs_master text,
	refseq_category text,
	taxonomy_id integer,
	species_taxonomy_id integer,
	isolate text,
	version_status text,
	assembly_level text,
	release_type text,
	release_date date,
	assembly_name text,
	submitter text,
	ftp_path text,

	name text not null,

	locked boolean not null default false,

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(refseq_assembly_accession)
);
comment on table genomes_queue is 'Assembly reports yet to be processed';

create view unassigned_genomes_queue as select * from genomes_queue where locked is false or now() - updated_at > interval '30 minutes';

create table genomes (
	id integer primary key,
	refseq_assembly_accession text not null,
	genbank_assembly_accession text,
	bioproject text,
	biosample text,
	wgs_master text,
	refseq_category text,
	taxonomy_id integer,
	species_taxonomy_id integer,
	isolate text,
	version_status text,
	assembly_level text,
	release_type text,
	release_date date,
	assembly_name text,
	submitter text,
	ftp_path text,

	-- Taxonomy (obtained by querying the NCBI taxonomy browser with the taxid)
	name text not null,
	superkingdom text,
	phylum text,
	class text,
	orderr text,
	family text,
	genus text,
	species text,
	strain text,

	-- Determined programmatically after fetching the NCBI taxonomy fields
	taxonomic_group text,

	-- ** Genome stats (derived programmatically later) **
	-- bp
	-- gc_fraction
	-- num_components
	-- num_genes
	-- avg_gene_length
	-- stddev_gene_length
	-- num_proteins
	-- avg_protein_length
	-- stddev_protein_length
	stats jsonb not null default '{}',

	-- For tracking progress
	status jsonb not null default '{}',

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(refseq_assembly_accession)
);
comment on column genomes.refseq_assembly_accession is 'Simply # assembly accession in the NCBI assembly report spreadsheet';
comment on column genomes.refseq_category is 'reference, representative, or na';
comment on column genomes.version_status is 'latest: most recent version; replaced: version is superseded by another genome with the same wgs_master or biosample (this is not always the case)';
comment on column genomes.assembly_level is 'complete, scaffold, contig, or chromosome';
comment on column genomes.release_type is 'major or minor';
comment on column genomes.assembly_name is 'Not necessarily different between genome versions';
comment on column genomes.taxonomic_group is 'Phylum; if proteobacteria, then its class';
comment on column genomes.orderr is 'Intentional typo because order is a reserved word';

commit;
