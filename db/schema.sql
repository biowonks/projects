begin;

-----------------------------------------------------------
-- Track id sequences
create table id_sequences (
	name text not null primary key,
	last_value integer not null default 0
);

-----------------------------------------------------------
-- Manage sequence-specific features in a source-agnostic manner (ala SeqDepot)
create table gseqs (
	id text not null primary key,
	length integer not null,
	sequence text not null,
	-- gc_fraction
	stats jsonb
);

create table aseqs (
	id text not null primary key,
	length integer not null,
	sequence text not null,
	features jsonb
);

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

create table components (
	id integer primary key,
	genome_id integer not null,

	-- The following are acquired from the genome assembly report
	refseq_accession text not null,		-- RefSeq-Accn
	genbank_accession text,				-- GenBank-Accn
	name text,							-- Sequence-Name
	role text,							-- Sequence-Role
	assigned_molecule text,				-- Assigned-Molecule
	type text,							-- Assigned-Molecule-Location/Type
	genbank_refseq_relationship text,	-- Relationship

	-- Sourced from GCF..._genomic.gff
	is_circular boolean,

	-- Source from the GCF..._genomic.fna
	dna text not null,
	length integer not null,

	stats jsonb not null default '{}',

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(refseq_accession),

	foreign key(genome_id) references genomes(id) on update cascade on delete cascade
);
create index on components(genome_id);

create table genes (
	id integer primary key,
	component_id integer not null,
	gseq_id text not null,
	aseq_id text,

	locus text not null,
	old_locus text,
	names text[],

	class text,						-- protein_coding, pseudo_gene, tRNA, rRNA, etc.

	strand char(1) not null,
	start integer not null,
	stop integer not null,
	length integer not null,		-- = stop - start + 1
	position integer not null,		-- Assigned derived from order of genes.start in ascending order; 1-based

	-- Protein fields
	product_accession text,
	nr_refseq_product_accession text,
	product text,
	product_note text,

	-- tRNA field
	anticodon text,

	foreign key(component_id) references components(id) on update cascade on delete cascade,
	foreign key(gseq_id) references gseqs(id) on update cascade on delete cascade,
	foreign key(aseq_id) references aseqs(id) on update cascade on delete cascade
);
create index on genes(component_id);
create index on genes(aseq_id);
create index on genes(locus);

comment on column genes.locus is 'First defined value of locus, old_locus_tag, name; if all undefined, then it is ${genus}[0]${species}[0..2]_${start}-${stop}';
comment on column genes.strand is '+, -, or . (unknown)';
comment on column genes.start is 'Positive, integer, 1-based, inclusive start position regardless of strand';
comment on column genes.start is 'Positive, integer, 1-based, inclusive stop position regardless of strand';
comment on column genes.nr_refseq_product_accession is 'Non-redundant RefSeq accession number for this product';

commit;
