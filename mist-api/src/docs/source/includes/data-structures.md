# Data Structures

## Component
```json
{
  "genome_id": null,
  "accession": null,
  "version": null,
  "genbank_accession": null,
  "genbank_version": null,
  "name": null,
  "role": null,
  "assigned_molecule": null,
  "type": null,
  "genbank_refseq_relationship": null,
  "definition": null,
  "molecule_type": null,
  "is_circular": null,
  "annotation_date": null,
  "comment": null,
  "dna": null,
  "length": null,
  "stats": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>genome_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>accession</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>version</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>genbank_accession</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>genbank_version</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>name</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>role</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>assigned_molecule</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>type</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>genbank_refseq_relationship</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>definition</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>molecule_type</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>is_circular</td>
<td>boolean</td>
<td></td>
<td></td>
</tr>
<tr>
<td>annotation_date</td>
<td>date</td>
<td></td>
<td></td>
</tr>
<tr>
<td>comment</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>dna</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>length</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>stats</td>
<td>jsonb</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>created_at</td>
<td>date</td>
<td>date/time record was created</td>
<td></td>
</tr>
<tr>
<td>updated_at</td>
<td>date</td>
<td>date/time record was last updated</td>
<td></td>
</tr>
</tbody>
</table>

## ComponentFeature
```json
{
  "component_id": null,
  "gene_id": null,
  "key": null,
  "location": null,
  "strand": null,
  "start": null,
  "stop": null,
  "length": null,
  "qualifiers": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>component_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>gene_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>key</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>location</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>strand</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>start</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>stop</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>length</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>qualifiers</td>
<td>jsonb</td>
<td></td>
<td>not null</td>
</tr>
</tbody>
</table>

## Gene
```json
{
  "component_id": null,
  "dseq_id": null,
  "aseq_id": null,
  "accession": null,
  "version": null,
  "locus": null,
  "old_locus": null,
  "location": null,
  "strand": null,
  "start": null,
  "stop": null,
  "length": null,
  "cognate_key": null,
  "cognate_location": null,
  "names": null,
  "pseudo": null,
  "product": null,
  "codon_start": null,
  "translation_table": null,
  "notes": null,
  "qualifiers": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>component_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>dseq_id</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>aseq_id</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>accession</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>version</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>locus</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>old_locus</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>location</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>strand</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>start</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>stop</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>length</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>cognate_key</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>cognate_location</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>names</td>
<td>array(text)</td>
<td></td>
<td></td>
</tr>
<tr>
<td>pseudo</td>
<td>boolean</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>product</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>codon_start</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>translation_table</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>notes</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>qualifiers</td>
<td>jsonb</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

## GeneCluster
```json
{
  "component_id": null,
  "strand": null,
  "size": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>component_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>strand</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>size</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
</tbody>
</table>

## GeneClusterMember
```json
{
  "genes_cluster_id": null,
  "gene_id": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>genes_cluster_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>gene_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
</tbody>
</table>

## Genome
```json
{
  "worker_id": null,
  "accession": null,
  "version": null,
  "genbank_assembly_accession": null,
  "genbank_assembly_version": null,
  "taxonomy_id": null,
  "name": null,
  "refseq_category": null,
  "bioproject": null,
  "biosample": null,
  "wgs_master": null,
  "isolate": null,
  "version_status": null,
  "assembly_level": null,
  "release_type": null,
  "release_date": null,
  "assembly_name": null,
  "submitter": null,
  "ftp_path": null,
  "superkingdom": null,
  "phylum": null,
  "class": null,
  "order": null,
  "family": null,
  "genus": null,
  "species": null,
  "strain": null,
  "stats": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>worker_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>accession</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>version</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>genbank_assembly_accession</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>genbank_assembly_version</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>taxonomy_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>name</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>refseq_category</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>bioproject</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>biosample</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>wgs_master</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>isolate</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>version_status</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>assembly_level</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>release_type</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>release_date</td>
<td>date</td>
<td></td>
<td></td>
</tr>
<tr>
<td>assembly_name</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>submitter</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>ftp_path</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>superkingdom</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>phylum</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>class</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>order</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>family</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>genus</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>species</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>strain</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>stats</td>
<td>jsonb</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>created_at</td>
<td>date</td>
<td>date/time record was created</td>
<td></td>
</tr>
<tr>
<td>updated_at</td>
<td>date</td>
<td>date/time record was last updated</td>
<td></td>
</tr>
</tbody>
</table>

## GenomeReference
```json
{
  "genome_id": null,
  "pubmed_id": null,
  "medline_id": null,
  "title": null,
  "authors": null,
  "consortium": null,
  "journal": null,
  "remark": null,
  "notes": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>genome_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>pubmed_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>medline_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>title</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>authors</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>consortium</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>journal</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>remark</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>notes</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>created_at</td>
<td>date</td>
<td>date/time record was created</td>
<td></td>
</tr>
<tr>
<td>updated_at</td>
<td>date</td>
<td>date/time record was last updated</td>
<td></td>
</tr>
</tbody>
</table>

## Taxonomy
```json
{
  "parent_taxonomy_id": null,
  "name": null,
  "rank": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>parent_taxonomy_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>name</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>rank</td>
<td>text</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

## Worker
```json
{
  "hostname": null,
  "process_id": null,
  "public_ip": null,
  "active": null,
  "normal_exit": null,
  "message": null,
  "error_message": null,
  "job": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>hostname</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>process_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>public_ip</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>active</td>
<td>boolean</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>normal_exit</td>
<td>boolean</td>
<td></td>
<td></td>
</tr>
<tr>
<td>message</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>error_message</td>
<td>text</td>
<td></td>
<td></td>
</tr>
<tr>
<td>job</td>
<td>jsonb</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>created_at</td>
<td>date</td>
<td>date/time record was created</td>
<td></td>
</tr>
<tr>
<td>updated_at</td>
<td>date</td>
<td>date/time record was last updated</td>
<td></td>
</tr>
</tbody>
</table>

## WorkerModule
```json
{
  "genome_id": null,
  "worker_id": null,
  "module": null,
  "state": null,
  "redo": null,
  "started_at": null,
  "finished_at": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>genome_id</td>
<td>integer</td>
<td></td>
<td></td>
</tr>
<tr>
<td>worker_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>module</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>state</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>redo</td>
<td>boolean</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>started_at</td>
<td>date</td>
<td></td>
<td></td>
</tr>
<tr>
<td>finished_at</td>
<td>date</td>
<td></td>
<td></td>
</tr>
<tr>
<td>created_at</td>
<td>date</td>
<td>date/time record was created</td>
<td></td>
</tr>
<tr>
<td>updated_at</td>
<td>date</td>
<td>date/time record was last updated</td>
<td></td>
</tr>
</tbody>
</table>

## Xref
```json
{
  "gene_id": null,
  "database": null,
  "database_id": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>gene_id</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>database</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>database_id</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
</tbody>
</table>

## Aseq
```json
{
  "length": null,
  "sequence": null,
  "pfam30": null,
  "agfam2": null,
  "segs": null,
  "coils": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>length</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>sequence</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>pfam30</td>
<td>jsonb</td>
<td></td>
<td></td>
</tr>
<tr>
<td>agfam2</td>
<td>jsonb</td>
<td></td>
<td></td>
</tr>
<tr>
<td>segs</td>
<td>jsonb</td>
<td></td>
<td></td>
</tr>
<tr>
<td>coils</td>
<td>jsonb</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

## Dseq
```json
{
  "length": null,
  "gc_percent": null,
  "sequence": null
}
```

<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
<tr>
<td>length</td>
<td>integer</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>gc_percent</td>
<td>real</td>
<td></td>
<td>not null</td>
</tr>
<tr>
<td>sequence</td>
<td>text</td>
<td></td>
<td>not null</td>
</tr>
</tbody>
</table>

