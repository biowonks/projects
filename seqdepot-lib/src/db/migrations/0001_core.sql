-----------------------------------------------------------
-- Manage sequence-specific features in a source-agnostic manner (ala SeqDepot)
create table dseqs (
	id text not null primary key,
	length integer not null,
	gc_percent real not null,
	sequence text not null
);
comment on column dseqs.gc_percent is 'Percentage of bases that consist of G or C';

create table aseqs (
	id text not null primary key,
	length integer not null,
	sequence text not null,

	-- tool results
	pfam31 jsonb,
	segs jsonb,
	coils jsonb
);

create table compute_requests (
	id serial primary key,
	status text not null, -- created, pending, active, done, error
	message text,
	started_at timestamp with time zone,
	ended_at timestamp with time zone,

	aseq_ids integer[],
	tool_ids text[]
);

-- MIGRATION DOWN SQL
drop table compute_requests;
drop table aseqs;
drop table dseqs;
