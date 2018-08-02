CREATE index ON genes(old_locus);
CREATE INDEX trgm_idx_genes_product ON genes USING gin (product gin_trgm_ops);

-- -- MIGRATION DOWN SQL
-- DROP INDEX genes_old_locus_idx;
-- DROP INDEX trgm_idx_genes_product;