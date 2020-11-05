alter table signal_genes add column data jsonb not null default '{}';

-- MIGRATION DOWN SQL
alter table signal_genes drop column data;
