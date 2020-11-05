alter table genomes add column done_modules text[] not null default array[]::text[];
alter table genomes add column redo_modules text[] not null default array[]::text[];

-- Apply currently done done_modules to genomes
update genomes set
  done_modules = subquery.done_modules,
  redo_modules = subquery.redo_modules
from (
  select
    genome_id,
    coalesce(array_agg(case when redo is false then module else null end) filter(where redo is false), array[]::text[]) as done_modules,
    coalesce(array_agg(case when redo is true then module else null end) filter(where redo is true), array[]::text[]) as redo_modules
  from workers_modules
  where genome_id is not null and state = 'done'
  group by genome_id
) as subquery
where genomes.id = subquery.genome_id;

create index on genomes using gin(done_modules);
create index on genomes using gin(redo_modules);

-- Triggers to keep denormalized genomes.done_modules column in sync with the
-- workers_modules rows state.
-- Case: INSERT workers_modules
create or replace function sync_genome_done_modules_for_insert_fn()
  returns trigger as
$$
begin
  if NEW.state = 'done' then
    update genomes set
      done_modules = array_append(done_modules, NEW.module),
      redo_modules = array_remove(array_append(redo_modules, case when NEW.redo is true then NEW.module else null end), null)
    where id = NEW.genome_id;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger update_genome_done_modules_after_insert
  after insert
  on workers_modules
  for each row
  execute procedure sync_genome_done_modules_for_insert_fn();

-- Case: UPDATE workers_modules
create or replace function sync_genome_done_modules_for_update_fn()
  returns trigger as
$$
begin
  if NEW.genome_id is null then
    return NEW;
  end if;

  if NEW.state = 'done' and OLD.state = 'done' and OLD.redo = false and NEW.redo = true then
    update genomes set
      redo_modules = array_append(redo_modules, NEW.module)
    where id = NEW.genome_id;
  elsif NEW.state = 'done' and OLD.state != 'done' then
    update genomes set
      done_modules = array_append(done_modules, NEW.module),
      redo_modules = case when NEW.redo is false then array_remove(redo_modules, NEW.module) else array_append(redo_modules, NEW.module) end
    where id = NEW.genome_id;
  elsif NEW.state = 'undo' and OLD.state = 'done' then
    update genomes set
      done_modules = array_remove(done_modules, NEW.module),
      redo_modules = array_remove(redo_modules, NEW.module)
    where id = NEW.genome_id;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger update_genome_done_modules_after_update
  after update
  on workers_modules
  for each row
  execute procedure sync_genome_done_modules_for_update_fn();

-- Case: DELETE workers_modules
create or replace function sync_genome_done_modules_for_delete_fn()
  returns trigger as
$$
begin
  if OLD.genome_id is not null then
    update genomes set
      done_modules = array_remove(done_modules, OLD.module),
      redo_modules = array_remove(redo_modules, OLD.module)
    where id = OLD.genome_id;
  end if;

  return OLD;
end;
$$ language plpgsql;

create trigger update_genome_done_modules_after_delete
  after delete
  on workers_modules
  for each row
  execute procedure sync_genome_done_modules_for_delete_fn();


-- MIGRATION DOWN SQL
drop trigger if exists update_genome_done_modules_after_delete on workers_modules;
drop function if exists sync_genome_done_modules_for_delete_fn;

drop trigger if exists update_genome_done_modules_after_update on workers_modules;
drop function if exists sync_genome_done_modules_for_update_fn;

drop trigger if exists update_genome_done_modules_after_insert on workers_modules;
drop function if exists sync_genome_done_modules_for_insert_fn;

alter table genomes drop column redo_modules;
alter table genomes drop column done_modules;
