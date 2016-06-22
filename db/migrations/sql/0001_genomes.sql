create table workers (
	id serial primary key,
	hostname text,
	pid integer not null,
	public_ip text not null,
	message text,
	normal_exit boolean,
	error_message text,
	job jsonb not null default '{}',
	last_heartbeat_at timestamp with time zone not null default now(),
	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now()
);
comment on table workers is 'Record of all worker processes';
comment on column workers.pid is 'process id';
comment on column workers.normal_exit is 'null indicates unknown; may be alive or dead';

create table genomes_queue (
	id serial primary key,
	worker_id integer,
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

	name text not null,

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(refseq_assembly_accession),
	foreign key(worker_id) references workers on update cascade on delete set null
);
comment on table genomes_queue is 'Genome assemblies yet to be processed';
comment on column genomes_queue.worker_id is 'Currently assigned worker processing this genome';

create index on genomes_queue(worker_id);

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

-- MIGRATION DOWN SQL
drop table genomes;
drop table genomes_queue;
drop table workers;
