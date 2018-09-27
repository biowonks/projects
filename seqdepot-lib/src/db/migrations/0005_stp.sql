alter table aseqs add column stp jsonb;

-- MIGRATION DOWN SQL
alter table aseqs drop column stp;
