# Core concepts

* Bulk load data via the \copy command
  Loading massive amounts of data with standard SQL is slow; however, batch loading with the \copy is very fast! Thus, when possible produce csv data that may piped to the \copy command.

  For this to work properly, we must externally generate ids for each of the target tables. My initial plan is to use a dedicated table for managing id sequences. When the pipeline is ready for assigning ids, it first reserves a block of ids from the database for each of the target tables. This is accomplished by acquiring a row-level lock on the id_sequences table:

  sql> begin;
  sql> select last_value from id_sequences where name = 'genomes' for update;
  sql> update id_sequences set last_value = X where name = 'genomes';
  sql> commit;

  The above approach allows for concurrent processes to work without producing overlapping identifiers. And given that each process will know the number of entries when assigning identifiers it can easily calculate the new last_value for its corresponding sequence.

  Because of this, only tables that should use the in-built postgresql sequences should have their id field defined as serial.

* Serial processing pipeline
  Each genome should function completely as a unit of work and independent of other concurrent units of work. The only potential overlap might be overlap between aseqs / gseqs which are shared; however, this case should not present a problem (although it might result in duplicate processing time).

  A useful side-effect is that data analysis may now be performed in parallel.

* Minimal / no dependence on SeqDepot
  While this may not make sense, depending on this external resource makes updates difficult and more prone to failure. Moreover, most computational tools now perform at a reasonable rate on local hardware.

* Updated genomes are first-class entities
  Managing the update process for given genomes is quite prone to errors and difficult to ensure data integrity. Thus, if a genome record needs to be updated, the old should remain and a new record with the latest data should be created. Alternatively, the deprecated genome could be removed so that only the newest genome is available.

* Stable identifiers
  Each new version of MiST has effectively disregarded the identifiers of the previous version leaving users with orphan identifiers. To circumvent this going forward, each record will have its own internal identifier; however, as much as is possible public identifiers will be predominantly external identifiers (such as locus tags).


# Pipeline

## Stages of a genome processing

### Kick off

* Download assembly summaries
* Find new genomes
* Insert new genomes

### Stage 1
* Download raw data files from the NCBI FTP site
* Build core table data
  * aseqs
  * gseqs
* Predict derived data
  * aseqs
	* pfam domains
	* agfam domains
	* ecf domains
	* das
	* seg
	* coils
	* signal peptides?
  * genome
	* gene clusters
  * signal transduction
	* tcp sets
* Statistical data
  * average gene length, stddev
  * average protein length, stddev
  * ...

## Configuration

All configuration will be stored in config.js under the pipeline section:

``` javascript
{
	pipeline: {
		hearbeat: {
			maxChildDelay
		},
		paths: {
			root: '.',
			tmp: 'tmp',
			data: 'data',
			genomes: 'data/genomes',
			scripts: 'scripts',
			logs: 'logs'
		}
	}
}
```

## Downloading assembly summaries and loading new genomes into the database

scripts/enqueueNewGenomes.js

* downloads new assembly reports into tmp directory
* parse into rows
* insert into genomes_queue where refseq_assembly_accession if not exists
* Does not update existing genome records

## Stage 1

### Bootstrapping
Each stage 1 script instance begins by looking for previous script instances that failed. If one is found, it attempts to resume that analysis. If none is found, the first genome that where status is null in the genomes_queue table is analyzed next.

Each script may be executed independently and in parallel with others. Database row locking is used to prevent multiple instances from analyzing the same genome. If an instance crashes, an attempt will be made to update its status and reason for the crash in the database. Moreover, the empty file, CRASHED, will be attempted to be written to the root work folder. Scripts that resume this project should reset the status to a fresh state by updating the database and removing the CRASHED file if present.

In the event of a power failure, ...

### A) Download core data files
* 


To manage and track the processing status ...

status = {
	active
	last_heartbeat: timestamp
	stage1: {
		download,
		parse,

		done: false
	}
}

Download -> add into genomes table where assembly accession is not found with stage1.done = false

