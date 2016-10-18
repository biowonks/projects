create table genes_clusters (
	id serial primary key,
	component_id integer not null,
	strand char(1) not null,		-- +, -, or null (unknown)
	size integer not null,

	foreign key (component_id) references components(id) on update cascade on delete cascade
);
create index on genes_clusters(component_id);

create table genes_clusters_members (
	genes_cluster_id integer not null,
	gene_id integer not null,

	unique(genes_cluster_id, gene_id),

	foreign key (genes_cluster_id) references genes_clusters(id) on update cascade on delete cascade,
	foreign key (gene_id) references genes(id) on update cascade on delete cascade
);

-- MIGRATION DOWN SQL
drop table genes_clusters_members;
drop table genes_clusters;
