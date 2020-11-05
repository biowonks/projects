alter table aseqs add column tmhmm2 jsonb;

-- MIGRATION DOWN SQL
alter table aseqs drop column tmhmm2;
