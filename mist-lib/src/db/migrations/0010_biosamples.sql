create table biosamples (
  id text primary key,
  organism text,
  description text,
	qualifiers jsonb not null default '{}'
);


-- MIGRATION DOWN SQL
drop table biosamples;
