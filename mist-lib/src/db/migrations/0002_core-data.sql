create table id_sequences (
	id serial primary key,
	name text not null,
	last_value integer not null default 0,

	unique(name)
);

-- Unless otherwise specified, all unqualified external database identifers are assumed to be from
-- RefSeq. For example, components.accession refers to the RefSeq accession.

create table genomes_references (
	id serial primary key,
	genome_id integer not null,
	pubmed_id integer,
	medline_id integer,
	title text not null,
	authors text,
	consortium text,
	journal text,
	remark text,
	notes text,

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(genome_id, pubmed_id),

	foreign key(genome_id) references genomes(id) on update cascade on delete cascade
);
create index on genomes_references(genome_id);

create table components (
	id serial primary key,
	genome_id integer not null,

	-- The following are acquired from the genome assembly report
	accession text not null,			-- RefSeq-Accn; without the version; e.g. NZ_AMPO01000001
	version text not null,				-- accession and version; e.g. NZ_AMPO01000001.1
	version_number integer not null,	-- e.g. 1
	genbank_accession text,				-- GenBank-Accn
	genbank_version text,
	name text,							-- Sequence-Name (e.g. ANONYMOUS or Contig01)
	role text,							-- Sequence-Role (e.g. assembled-molecule or unplaced-scaffold)
	assigned_molecule text,				-- Assigned-Molecule (e.g. na)
	type text,							-- Assigned-Molecule-Location/Type (e.g. Chromosome or na)
	genbank_refseq_relationship text,	-- Relationship (e.g. '=')

	-- Sourced from the GenBank-formatted RefSeq record
	definition text,					-- DEFINITION
	molecule_type text,					-- LOCUS.moleculeType
	is_circular boolean,				-- LOCUS.topology
	annotation_date date,				-- LOCUS.date
	comment text,						-- COMMENT
	dna text not null,					-- ORIGIN
	length integer not null,			-- Calculated

	stats jsonb not null default '{}',

	created_at timestamp with time zone not null default clock_timestamp(),
	updated_at timestamp with time zone not null default clock_timestamp(),

	unique(version),

	foreign key(genome_id) references genomes(id) on update cascade on delete cascade
);
create index on components(genome_id);

-- Genes contains the data for not only gene features, but also any associated CDS or RNA features.
-- All other features are stored in the components_features table further below.
--
-- Or really, any gene that is linked to another feature that has the exact same location. If CDS,
-- then handle the corresponding amino acid sequence if it has a translation.
create table genes (
	id serial primary key,
	stable_id text not null,		-- permanent, universal identifier comprised of ${genome.version}-{gene.locus}
	component_id integer not null,
	dseq_id text not null,
	aseq_id text,

	accession text,					-- No version suffix; RefSeq GenBank.protein_id prefix
	version text,					-- RefSeq GenBank.protein_id; accession plus version number
	locus text not null,			-- Typically the RefSeq assigned locus
	old_locus text,					-- Previously reported locus_tag when this gene was re-annotated (see https://www.ncbi.nlm.nih.gov/refseq/about/prokaryotes/reannotation/)

	location text not null,
	strand char(1) not null,		-- +, -, or null (unknown)
	-- Note: start may be > stop if the component is circular and the gene spans the origin
	start integer not null,			-- 1-based 5' position
	stop integer not null,			-- 1-based 3' position
	length integer not null,		-- typically this equals stop - start + 1 except in the cases
									--   where the gene spans the origin

	names text[],					-- names[0] = /gene, [1..] = remaining /gene and /gene_synonym
	-- Denotes if the gene is marked as a pseudo gene
	pseudo boolean not null default false,
	notes text,						-- sourced from /note

	product text,					-- sourced from /product
	codon_start integer,			-- 1, 2, or 3
	translation_table integer,
	-- associated qualifiers from CDS, etc. take precedence over any gene qualifiers that have the
	-- same name
	qualifiers jsonb not null default '{}',
	cds_location text,			-- For those cases where the CDS feature has a non-identical location, but is linked via its locus_tag
	cds_qualifiers jsonb not null default '{}',

	unique(stable_id),

	foreign key(component_id) references components(id) on update cascade on delete cascade
);
create index on genes(component_id);
create index on genes(aseq_id);
create index on genes(version);
create index on genes(locus);	-- Not necessarily unique across genomes / components!!

comment on column genes.strand is '+, -, or null (unknown)';
comment on column genes.start is 'Positive, integer, 1-based, inclusive start position regardless of strand';
comment on column genes.start is 'Positive, integer, 1-based, inclusive stop position regardless of strand';

-- Helpful view for easily accessing genes
create view genomes_genes as
	select a.id as genome_id, a.version as genome_version, c.*
	from genomes a join components b on (a.id = b.genome_id)
		join genes c on (b.id = c.component_id);

create table xrefs (
	id serial primary key,
	gene_id integer not null,
	database text not null,
	database_id text not null,

	unique(gene_id, database_id, database),

	foreign key(gene_id) references genes(id) on update cascade on delete cascade
);

-- Catch all for the other features. Do not necessarily capture the DNA sequence because these will
-- rarely be utilized. If necessary, these may be computed on demand.
create table components_features (
	id serial primary key,
	component_id integer not null,
	gene_id integer,				-- If more than two features have the same location as a gene
	locus text,
	key text not null,
	location text not null,
	strand char(1) not null,		-- +, -, or null (unknown)
	-- Note: start may be > stop if the component is circular and the gene spans the origin
	start integer not null,			-- 1-based 5' position if strand is + or ., 3' otherwise
	stop integer not null,			-- 1-based 3' position if strand is + or ., 3' otherwise
	length integer not null,		-- typically this equals stop - start + 1 except in the cases
									--   where the gene spans the origin
	qualifiers jsonb not null default '{}',

	foreign key(component_id) references components(id) on update cascade on delete cascade,
	foreign key(gene_id) references genes(id) on update cascade on delete set null
);

create index on components_features(component_id);
create index on components_features(gene_id);
create index on components_features(locus);

-- MIGRATION DOWN SQL
drop table components_features;
drop table xrefs;
drop view genomes_genes;
drop table genes;
drop table components;
drop table genomes_references;
drop table id_sequences;
