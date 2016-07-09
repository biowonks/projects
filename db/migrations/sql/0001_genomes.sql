create table workers (
	id serial primary key,
	hostname text,
	process_id integer not null,
	public_ip text not null,
	active boolean not null default true,
	normal_exit boolean,
	message text,
	error_message text,
	job jsonb not null default '{}',		-- e.g. modules: [], genomeIds: []
	created_at timestamp with time zone not null default clock_timestamp(),
	updated_at timestamp with time zone not null default clock_timestamp()
);
comment on table workers is 'record of all worker processes';
comment on column workers.normal_exit is 'null indicates unknown; may be alive or dead';
comment on column workers.job is 'job details such as the pipeline modules and genome ids';

create table genomes (
	id serial primary key,
	worker_id integer,					-- Defined if a current worker is assigned to this genome
	accession text not null,
	version integer not null,
	genbank_assembly_accession text,
	genbank_assembly_version integer,
	taxonomy_id integer,
	species_taxonomy_id integer,
	name text not null,
	refseq_category text,
	bioproject text,
	biosample text,
	wgs_master text,
	isolate text,
	version_status text,
	assembly_level text,
	release_type text,
	release_date date,
	assembly_name text,
	submitter text,
	ftp_path text,

	-- Taxonomy (obtained by querying the NCBI taxonomy browser with the taxid)
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

	created_at timestamp with time zone not null default clock_timestamp(),
	updated_at timestamp with time zone not null default clock_timestamp(),

	unique(accession, version),
	foreign key(worker_id) references workers(id) on update cascade on delete set null
);
comment on column genomes.accession is 'RefSeq # assembly accession in the NCBI assembly report spreadsheet';
comment on column genomes.refseq_category is 'reference, representative, or na';
comment on column genomes.version_status is 'latest: most recent version; replaced: version is superseded by another genome with the same wgs_master or biosample (this is not always the case)';
comment on column genomes.assembly_level is 'complete, scaffold, contig, or chromosome';
comment on column genomes.release_type is 'major or minor';
comment on column genomes.assembly_name is 'not necessarily different between genome versions';
comment on column genomes.taxonomic_group is 'phylum; if proteobacteria, then its class';
comment on column genomes.orderr is 'intentional typo because order is a reserved word';

create table workers_modules (
	id serial primary key,
	genome_id integer,
	worker_id integer not null,
	module text not null,
	state text not null,		-- active, done, error
	redo boolean not null default false,
	started_at timestamp with time zone,
	finished_at timestamp with time zone,
	created_at timestamp with time zone not null default clock_timestamp(),
	updated_at timestamp with time zone not null default clock_timestamp(),

	unique(genome_id, module),
	foreign key(genome_id) references genomes(id) on update cascade on delete cascade,
	foreign key(worker_id) references workers(id) on update cascade on delete restrict
);
create index on workers_modules(genome_id);
create index on workers_modules(worker_id);

comment on table workers_modules is 'catalog of all modules that have been performed on a given genome and by what worker';
comment on column workers_modules.genome_id is 'not all modules have to be associated with a genome (e.g. enqueue-new-genomes)';
comment on column workers_modules.state is 'active, done, or error';
comment on column workers_modules.redo is 'true if this module should be re-run';

-- MIGRATION DOWN SQL
drop table if exists workers_modules;
drop table if exists genomes;
drop table if exists workers;
