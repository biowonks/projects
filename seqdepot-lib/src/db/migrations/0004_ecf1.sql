alter table aseqs add column ecf1 jsonb;

-- MIGRATION DOWN SQL
alter table aseqs drop column ecf1;
