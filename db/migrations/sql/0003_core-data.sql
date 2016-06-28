create table components (
	id serial primary key,
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
	id serial primary key,
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
