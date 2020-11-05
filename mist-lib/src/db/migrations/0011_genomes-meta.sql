alter table genomes add column meta jsonb not null default '{}';

-- MIGRATION DOWN SQL
alter table genomes drop column meta;
