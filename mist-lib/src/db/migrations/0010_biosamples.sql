create table biosamples (
  id integer primary key,
  organism text,
  description text,
	qualifiers jsonb not null default '{}'
);
comment on table biosamples is 'NCBI BioSample source data';
comment on column biosamples.id is 'NCBI assigned integer identifier';
comment on column biosamples.organism is 'BioSample source if available';
comment on column biosamples.qualifiers is 'dictionary of properties describing this sample';

alter table genomes add column biosample_id integer;
alter table genomes add foreign key(biosample_id) references biosamples(id) on update cascade on delete cascade;
create index on genomes(biosample);
create index on genomes(biosample_id);

-- MIGRATION DOWN SQL
alter table genomes drop column biosample_id;
drop table biosamples;
