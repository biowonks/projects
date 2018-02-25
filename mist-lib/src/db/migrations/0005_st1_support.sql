-- The only necessary field below is `id`, which marks that this gene encodes
-- a signal transduction protein per the MiST2 rule system.
--
-- `genome_id` / `component_id` are duplicated here for performance reasons
--
-- The actual signal transduction data will be persisted in the seqdepot.aseqs
-- table in the `st1` column. Thus, users will need to join this table against
-- genes to get the aseq_id and then against the seqdepot.aseqs table.
create table st1_genes (
  id integer not null primary key, -- 1:1 reference to genes.id
  genome_id integer not null,
  component_id integer not null,

	foreign key (id) references genes(id) on update cascade on delete cascade,
	foreign key (genome_id) references genomes(id) on update cascade on delete cascade,
	foreign key (component_id) references components(id) on update cascade on delete cascade
);
create index on st1_genes(genome_id);
create index on st1_genes(component_id);

-- MIGRATION DOWN SQL
drop table st1_genes;
