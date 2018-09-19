CREATE INDEX trgm_idx_genomes_name ON genomes USING gin (name gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_superkingdom ON genomes USING gin (superkingdom gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_phylum ON genomes USING gin (phylum gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_class ON genomes USING gin (class gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_orderr ON genomes USING gin (orderr gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_family ON genomes USING gin (family gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_genus ON genomes USING gin (genus gin_trgm_ops);
CREATE INDEX trgm_idx_genomes_assembly_level ON genomes USING gin (assembly_level gin_trgm_ops);
CREATE INDEX trgm_idx_genes_product ON genes USING gin (product gin_trgm_ops);
CREATE index ON genes(old_locus);


-- -- MIGRATION DOWN SQL
-- DROP INDEX trgm_idx_genomes_name;
-- DROP INDEX trgm_idx_genomes_superkingdom;
-- DROP INDEX trgm_idx_genomes_phylum;
-- DROP INDEX trgm_idx_genomes_class;
-- DROP INDEX trgm_idx_genomes_orderr;
-- DROP INDEX trgm_idx_genomes_family;
-- DROP INDEX trgm_idx_genomes_genus;
-- DROP INDEX trgm_idx_genomes_assemblylevel;
-- DROP INDEX genes_old_locus_idx;
-- DROP INDEX trgm_idx_genes_product;