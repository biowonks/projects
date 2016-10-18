alter table aseqs add column agfam2 jsonb;

-- MIGRATION DOWN SQL
alter table aseqs drop column agfam2;
