alter table aseqs add column st1 jsonb;

-- MIGRATION DOWN SQL
alter table aseqs drop column st1;
