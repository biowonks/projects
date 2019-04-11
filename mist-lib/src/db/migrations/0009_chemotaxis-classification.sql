create table chemotaxis_classifications (
  signal_gene_id integer not null primary key,
  primary_type text not null,
  specific_type text not null,
  data jsonb not null,

  foreign key(signal_gene_id) references signal_genes(id) on update cascade on delete cascade
);
comment on table chemotaxis_classifications is 'chemotaxis protein classification per Kristens HMM classification schemes';
comment on column chemotaxis_classifications.primary_type is 'chemotaxis protein gene name (e.g. chea, chec); lower-case';
comment on column chemotaxis_classifications.specific_type is 'specific subclass of the primary chemotaxis gene (e.g. f1, f2, 24h); lower-case';
comment on column chemotaxis_classifications.data is 'data corresponding to the top 5 HMMER3 domain hits against the primary classification models; structured as an array similar to that of aseqs.pfam31';

-- MIGRATION DOWN SQL
drop table chemotaxis_classifications;
