create index on genomes(accession);
create index on genomes(refseq_category);

create index on components(accession);

create index trgm_idx_genomes_name on genomes using gin (name gin_trgm_ops);
create index trgm_idx_genomes_superkingdom on genomes using gin (superkingdom gin_trgm_ops);
create index trgm_idx_genomes_phylum on genomes using gin (phylum gin_trgm_ops);
create index trgm_idx_genomes_class on genomes using gin (class gin_trgm_ops);
create index trgm_idx_genomes_orderr on genomes using gin (orderr gin_trgm_ops);
create index trgm_idx_genomes_family on genomes using gin (family gin_trgm_ops);
create index trgm_idx_genomes_genus on genomes using gin (genus gin_trgm_ops);
create index trgm_idx_genomes_assembly_level on genomes using gin (assembly_level gin_trgm_ops);
create index trgm_idx_genes_product on genes using gin (product gin_trgm_ops);

create index on genes(old_locus);


-- MIGRATION DOWN SQL
drop index genes_old_locus_idx;

drop index trgm_idx_genes_product;
drop index trgm_idx_genomes_assembly_level;
drop index trgm_idx_genomes_genus;
drop index trgm_idx_genomes_family;
drop index trgm_idx_genomes_orderr;
drop index trgm_idx_genomes_class;
drop index trgm_idx_genomes_phylum;
drop index trgm_idx_genomes_superkingdom;
drop index trgm_idx_genomes_name;

drop index components_accession_idx;

drop index genomes_refseq_category_idx;
drop index genomes_accession_idx;
