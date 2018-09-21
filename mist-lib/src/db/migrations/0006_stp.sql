create table signal_domains (
  id serial primary key,
  name text not null,
  version integer not null,
  kind text,
  function text,
	created_at timestamp with time zone not null default clock_timestamp(),
	updated_at timestamp with time zone not null default clock_timestamp(),

  unique(name, version)
);
comment on table signal_domains is 'composite signal domain identifiers';
comment on column signal_domains.name is 'unique human friendly identifier that is source independent (e.g. may relate to domain models across pfam and agfam)';
comment on column signal_domains.kind is 'e.g. transmitter, receiver, ecf, etc.';

create table signal_domains_members (
  id serial primary key,
  signal_domain_id integer not null,
  accession text,
  name text not null,
  superfamily text,
  description text,
  specific boolean not null,
  source text not null,
  pubmed_ids integer[],
  pdb_ids text[],

  foreign key (signal_domain_id) references signal_domains(id) on update cascade on delete cascade
);
create index on signal_domains_members(signal_domain_id);
comment on table signal_domains_members is 'family specific domain members associated with a given signal domain';
comment on column signal_domains_members.name is 'actual domain name (e.g. HATPase_c)';
comment on column signal_domains_members.specific is 'indicates whether this domain is specific to signal transduction';
comment on column signal_domains_members.source is 'pfam / agfam / etc.';
comment on column signal_domains_members.pubmed_ids is 'array of relevant PubMed identifiers';

create table signal_genes (
  id serial primary key,
  gene_id integer not null,
  component_id integer not null,
  signal_domains_version integer not null,
  ranks text[] not null,
  counts jsonb not null,
  inputs text[],
  outputs text[],

  -- The following constraint limits prediction results to a single version. In
  -- other words, the same gene may not have two separate prediction results.
  unique(gene_id),
  foreign key(gene_id) references genes(id) on update cascade on delete cascade,
  foreign key(component_id) references components(id) on update cascade on delete cascade
);
create index on signal_genes(component_id);
comment on table signal_genes is 'destructured representation of the genes corresponding to those aseqs predicted to be involved in signal transduction';
comment on column signal_genes.component_id is 'not strictly necessary, but duplicated here for performance reasons';
comment on column signal_genes.signal_domains_version is 'version of signal domain names used for this prediction';
comment on column signal_genes.ranks is 'array of assigned signal transduction ranks (e.g. [2cp, rr])';
comment on column signal_genes.counts is 'key-value structure denoting the number of signal domains in this protein';
comment on column signal_genes.inputs is 'array of input signal transduction domains (signal domain names)';
comment on column signal_genes.outputs is 'array of output signal transduction domains (signal domain names)';

-- MIGRATION DOWN SQL
drop table signal_genes;
drop table signal_domains_members;
drop table signal_domains;
