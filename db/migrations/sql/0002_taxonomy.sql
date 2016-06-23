begin;

create table taxonomy (
	id integer not null primary key,
	parent_taxonomy_id integer,
	name text,
	rank text,

	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now(),

	unique(taxonomy)
);

comment on column genomes.taxonomyId is 'Simply # of the taxonomic node';
comment on column genomes.parentTaxonomyId is 'parent taxonomy Id';
comment on column genomes.name is 'name of the node';
comment on column genomes.rank is 'rank of the node (can be null or \'no rank\')';

commit;

-- MIGRATION DOWN SQL
begin;

drop table taxonomy;

commit;