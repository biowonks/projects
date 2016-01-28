begin;

-----------------------------------------------------------
-- Track id sequences
create table id_sequences (
	name text not null primary key,
	last_value integer not null default 0
);

insert into id_sequences (name) values ('genomes');

commit;
