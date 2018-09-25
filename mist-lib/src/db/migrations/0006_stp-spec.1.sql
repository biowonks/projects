insert into signal_domains (name, version, kind, function) values (E'PAS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), E'PF00989', E'PAS', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_2', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_3', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_4', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_5', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_6', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_7', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_8', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_9', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_10', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PAS_11', E'PAS_Fold', E'PAS small molecule binding domain', true, E'pfam', array[9301332, 9382818], NULL);

insert into signal_domains (name, version, kind, function) values (E'PocR', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PocR', E'No clan, related to PAS, GAF and sCache', E'hydrocarbon derivatives binding domain', true, E'pfam', array[15814558, 27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'GAF', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GAF', E'GAF', E'GAF small molecule binding domain', true, E'pfam', array[9433123], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GAF_2', E'GAF', E'GAF small molecule binding domain', true, E'pfam', array[9433123], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GAF_3', E'GAF', E'GAF small molecule binding domain', true, E'pfam', array[9433123], NULL);

insert into signal_domains (name, version, kind, function) values (E'IclR', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'IclR', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[16472303], NULL);

insert into signal_domains (name, version, kind, function) values (E'PHY', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PHY', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[19720999], NULL);

insert into signal_domains (name, version, kind, function) values (E'SpoVT_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SpoVT_C', E'GAF', E'GAF-like small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF3369', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF3369', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF484', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF484', E'GAF', E'GAF-like small molecule binding domain', false, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'HrcA', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HrcA', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[15979091], NULL);

insert into signal_domains (name, version, kind, function) values (E'Autoind_bind', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Autoind_bind', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[17921255], NULL);

insert into signal_domains (name, version, kind, function) values (E'CodY', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CodY', E'GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[16488888], NULL);

insert into signal_domains (name, version, kind, function) values (E'H_kinase_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'H_kinase_N', E'No clan, related to GAF', E'GAF-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[11590000, 11590001, 27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'dCache_1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'dCache_1', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[11084361, 27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'dCache_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'dCache_2', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'dCache_3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'dCache_3', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'Cache_3-Cache_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cache_3-Cache_2', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'LuxQ-periplasm', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LuxQ-periplasm', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE7', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE7', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'GAPES1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GAPES1', E'Cache', E'double Cache-like small molecule binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'sCache2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'sCache2', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'sCache3_1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'sCache3_1', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'sCache3_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'sCache3_2', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'sCache3_3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'sCache3_3', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'sCache-like', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'sCache-like', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Ykul_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Ykul_C', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE4', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE4', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[12486065, 27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE8', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE8', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Stimulus_sens_1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Stimulus_sens_1', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2222', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2222', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'SMP_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SMP_2', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'2CSK_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'2CSK_N', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'PhoQ_sensor', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PhoQ_sensor', E'Cache', E'single Cache-like small molecule binding domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'CpxA_peri', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CpxA_peri', E'No clan, related to sCache', E'single Cache-like small molecule binding domain', true, E'pfam', array[22760860], NULL);

insert into signal_domains (name, version, kind, function) values (E'Diacid_rec', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Diacid_rec', E'No clan, related to GAF and sCache', E'Carbohydrate binding  domain', true, E'pfam', array[27049771], NULL);

insert into signal_domains (name, version, kind, function) values (E'LapD_MoxY_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LapD_MoxY_N', E'No clan, related to sCache', E'putative ligand binding domain', true, E'pfam', array[21304926], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE5', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE5', E'No clan, related to sCache', E'putative ligand binding domain', true, E'pfam', array[12486065], NULL);

insert into signal_domains (name, version, kind, function) values (E'GAPES3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GAPES3', E'No clan, related to sCache', E'putative ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'4HB_MCP', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'4HB_MCP', E'4HB_MCP', E'single four-helix bundle, small-molecule binding  domain', true, E'agfam', array[16306392], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'4HB_MCP_1', E'4HB_MCP', E'single four-helix bundle, small-molecule binding  domain', true, E'pfam', array[16306392], NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE3', E'4HB_MCP', E'single four-helix bundle, small-molecule binding  domain', true, E'pfam', array[12486065], NULL);

insert into signal_domains (name, version, kind, function) values (E'PilJ', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PilJ', E'No clan, related to 4HB_MCP', E'single four-helix bundle, small-molecule binding  domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HBM', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HBM', E'4HB_MCP', E'double four-helix bundle, bimodular, small molecule binding  domain', true, E'pfam', array[24347303], NULL);

insert into signal_domains (name, version, kind, function) values (E'NIT', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NIT', E'No clan, related to 4HB_MCP', E'double four-helix bundle, nitrate and nitrite sensing domain', true, E'pfam', array[12633990], NULL);

insert into signal_domains (name, version, kind, function) values (E'KinB_sensor', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'KinB_sensor', E'No clan, related to 4HB_MCP', E'single four-helix bundle, small-molecule binding  domain', true, E'pfam', array[24573685], NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_2', E'HBMR', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_1', E'Peripla_BP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_3', E'Peripla_BP', E'small molecule binding domain', true, E'pfam', array[7973627], NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_4', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_4', E'Peripla_BP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_5', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_5', E'Peripla_BP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peripla_BP_6', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peripla_BP_6', E'Peripla_BP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ABC_sub_bind', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ABC_sub_bind', E'Peripla_BP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'LysR_substrate', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LysR_substrate', E'PBP', E'small molecule binding domain', true, E'pfam', array[9309218], NULL);

insert into signal_domains (name, version, kind, function) values (E'PBP_like', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PBP_like', E'PBP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Phosphonate-bd', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Phosphonate-bd', E'PBP', E'alkylphosphonate binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SBP_bac_3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SBP_bac_3', E'PBP', E'small molecule binding domain', false, E'pfam', array[8336670], NULL);

insert into signal_domains (name, version, kind, function) values (E'SBP_bac_5', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SBP_bac_5', E'PBP', E'small molecule binding domain', false, E'pfam', array[8336670], NULL);

insert into signal_domains (name, version, kind, function) values (E'SBP_bac_8', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SBP_bac_8', E'PBP', E'small molecule binding domain', false, E'pfam', array[8336670], NULL);

insert into signal_domains (name, version, kind, function) values (E'SBP_bac_11', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SBP_bac_11', E'PBP', E'small molecule binding domain', false, E'pfam', array[8336670], NULL);

insert into signal_domains (name, version, kind, function) values (E'YhfZ_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'YhfZ_C', E'PBP', E'small molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'BLUF', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'BLUF', E'No clan', E'FAD-binding domain', false, E'pfam', array[12368079], NULL);

insert into signal_domains (name, version, kind, function) values (E'HNOB', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HNOB', E'HNOX-like', E'heme-NO-binding domain', true, E'pfam', array[12590654], NULL);

insert into signal_domains (name, version, kind, function) values (E'V4R', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'V4R', E'HNOX-like', E'small molecule binding domain', false, E'pfam', array[11292341], NULL);

insert into signal_domains (name, version, kind, function) values (E'XylR_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'XylR_N', E'HNOX-like', E'small molecule (likely aromatic) binding domain', true, E'pfam', NULL, array[E'5kbg']);

insert into signal_domains (name, version, kind, function) values (E'SKI', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SKI', E'P-loop_NTPase', E'Shikimate kinase enzymatic  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CbiA', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CbiA', E'P-loop_NTPase', E'Coburinic acid diamide synthase enzymatic  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'MEDS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MEDS', E'P-loop_NTPase', E'hydrocarbon derivatives binding domain', true, E'pfam', array[15814558], NULL);

insert into signal_domains (name, version, kind, function) values (E'CbiC', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CbiC', E'No clan', E'precorrin-8x methylmutase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sugar-bind', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sugar-bind', E'ISOCOT_Fold', E'putative sugar-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HNOBA', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HNOBA', E'No clan', E'heme-NO-binding associated domain', true, E'pfam', array[18006497], NULL);

insert into signal_domains (name, version, kind, function) values (E'Hemerythrin', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Hemerythrin', E'No clan', E'hemerythrin HHE cation binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Aminotran_1_2', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Aminotran_1_2', E'PLP_aminotran', E'aminotransferase enzymatic, ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Aminotran_5', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Aminotran_5', E'PLP_aminotran', E'aminotransferase enzymatic, ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Acetyltransf_1', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Acetyltransf_1', E'Acetyltrans', E'acetyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Acetyltransf_4', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Acetyltransf_4', E'Acetyltrans', E'acetyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Acetyltransf_7', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Acetyltransf_7', E'Acetyltrans', E'acetyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Acetyltransf_10', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Acetyltransf_10', E'Acetyltrans', E'acetyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Ammonium_transp', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Ammonium_transp', E'No clan', E'ammonium transporter, ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HEM4', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HEM4', E'No clan', E'Uroporphyrinogen III synthase enzymatic ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'4HBT', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'4HBT', E'HotDog', E'thiodiesterase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'MaoC_dehydratas', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MaoC_dehydratas', E'HotDog', E'putative enoyl-CoA hydratase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SnoaL_3', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SnoaL_3', E'NTF2', E'polyketide cyclase-like domain', false, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SnoaL_3', E'NTF2', E'putative small ligand binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PfkB', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PfkB', E'Ribokinase', E'Carbohydrate and pyrimidine kinase enzymatic domain', false, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PfkB', E'Ribokinase', E'carbohydrate kinase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Ada_Zn_binding', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Ada_Zn_binding', E'No clan', E'Ada metal-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DZR', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DZR', E'Zn_Beta_Ribbon', E'zinc ribbon DNA, protein or other molecule binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AlkA_N', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AlkA_N', E'TBP-like', E'AlkA N-terminal  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AsnC_trans_reg', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AsnC_trans_reg', E'Dim_A_B_barrel', E'Lrp/AsnC ligand-binding  domain', true, E'pfam', array[17962306], NULL);

insert into signal_domains (name, version, kind, function) values (E'B12-binding', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'B12-binding', E'B12-binding', E'Cobalamin binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'B12-binding_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'B12-binding_2', E'No clan', E'Cobalamin binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FHA', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FHA', E'SMAD-FHA', E'Forkhead-associated phosphopeptide-binding  domain', false, E'pfam', array[7482699, 11911881], NULL);

insert into signal_domains (name, version, kind, function) values (E'Yop-YscD_cpl', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Yop-YscD_cpl', E'SMAD-FHA', E'Forkhead-associated phosphopeptide-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FIST', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FIST', E'No clan', E'small molecule binding   domain', true, E'pfam', array[17855421], NULL);

insert into signal_domains (name, version, kind, function) values (E'FIST_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FIST_C', E'No clan', E'small molecule binding   domain', true, E'pfam', array[17855421], NULL);

insert into signal_domains (name, version, kind, function) values (E'FeoA', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FeoA', E'TrB', E'Metal-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TusA', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TusA', E'TusA-like', E'sulfurtransferase enzymatic ligand binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Fic', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fic', E'No clan', E'small molecule binding   domain', false, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fic', E'No clan', E'ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CBS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CBS', E'No clan', E'small molecule binding   domain', false, E'pfam', array[9020585], NULL);

insert into signal_domains (name, version, kind, function) values (E'SIS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SIS', E'SIS', E'phosphosugar binding domain', false, E'pfam', array[10203754], NULL);

insert into signal_domains (name, version, kind, function) values (E'Protoglobin', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Protoglobin', E'Globin', E'heme-containing oxygen-sensing domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CZB', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CZB', E'No clan', E'zinc-binding domain', true, E'pfam', array[21725005], NULL);

insert into signal_domains (name, version, kind, function) values (E'TOBE', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TOBE', E'OB', E'Inorganic molecule-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'cNMP_binding', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'cNMP_binding', E'No clan', E'Cyclic nucleotide-binding (sensory, input) domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE2', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE2', E'No clan', E'unknown', true, E'pfam', array[12486065], NULL);

insert into signal_domains (name, version, kind, function) values (E'MASE1', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MASE1', E'No clan', E'unknown', true, E'pfam', array[12673057], NULL);

insert into signal_domains (name, version, kind, function) values (E'MASE2', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MASE2', E'No clan', E'unknown', true, E'pfam', array[12673057], NULL);

insert into signal_domains (name, version, kind, function) values (E'MHYT', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MHYT', E'No clan', E'unknown', true, E'pfam', array[11728710], NULL);

insert into signal_domains (name, version, kind, function) values (E'CSS-motif', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CSS-motif', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'7TMR-DISMED2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'7TMR-DISMED2', E'No clan', E'putative carbohydrate-binding domain', true, E'pfam', array[12914674], NULL);

insert into signal_domains (name, version, kind, function) values (E'7TMR-DISM_7TM', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'7TMR-DISM_7TM', E'No clan', E'7TM diverse signaling domain', true, E'pfam', array[12914674], NULL);

insert into signal_domains (name, version, kind, function) values (E'7TMR-HDED', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'7TMR-HDED', E'No clan', E'putative ligand-binding domain', true, E'pfam', array[12914674], NULL);

insert into signal_domains (name, version, kind, function) values (E'7TMR-7TMR_HD', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'7TMR-7TMR_HD', E'GPCR_A', E'7TM sensory domain', true, E'pfam', array[12914674], NULL);

insert into signal_domains (name, version, kind, function) values (E'5TM-5TMR_LYT', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'5TM-5TMR_LYT', E'Gx_transp', E'5TM sensory domain', true, E'pfam', array[12914674], NULL);

insert into signal_domains (name, version, kind, function) values (E'TrkA_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TrkA_C', E'TrkA_C', E'ligand-binding domain', false, E'pfam', array[11292341], NULL);

insert into signal_domains (name, version, kind, function) values (E'AraC_binding', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AraC_binding', E'Cupin', E'AraC-like ligand-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AraC_binding_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AraC_binding_2', E'Cupin', E'AraC-like ligand-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AraC_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AraC_N', E'Cupin', E'AraC-like ligand-binding  domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Cupin_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cupin_2', E'Cupin', E'enzymatic ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Cupin_6', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cupin_6', E'Cupin', E'enzymatic ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NikR_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NikR_C', E'ACT', E'nickel binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ACT_4', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ACT_4', E'ACT', E'putative amino acid binding protein', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DeoRC', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DeoRC', E'ISOCOT_Fold', E'sugar derivative binding domain', true, E'pfam', array[16376935], NULL);

insert into signal_domains (name, version, kind, function) values (E'Arabinose_bd', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Arabinose_bd', E'No clan', E'arabinose-binding domain', true, E'pfam', array[27119725], NULL);

insert into signal_domains (name, version, kind, function) values (E'Arg_repressor_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Arg_repressor_C', E'No clan', E'arginine binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Fe_dep_repr_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fe_dep_repr_C', E'HTH', E'iron binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'GyrI-like', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GyrI-like', E'SHS2', E'small molecule binding   domain', false, E'pfam', array[15281131], NULL);

insert into signal_domains (name, version, kind, function) values (E'Cass2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cass2', E'SHS2', E'small molecule binding   domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FCD', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FCD', E'FadR-C', E'ligand-binding domain', true, E'pfam', array[11013219], NULL);

insert into signal_domains (name, version, kind, function) values (E'FadR_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FadR_C', E'FadR-C', E'fatty acid binding domain', true, E'pfam', array[11013219], NULL);

insert into signal_domains (name, version, kind, function) values (E'Regulator_TrmB', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Regulator_TrmB', E'PLD', E'sugar-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PrpR_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PrpR_N', E'No clan', E'putative propionate binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PmoA', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PmoA', E'No clan', E'putative methane oxygenase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'UTRA', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'UTRA', E'UTRA', E'small molecule binding   domain', true, E'pfam', array[12757941], NULL);

insert into signal_domains (name, version, kind, function) values (E'ROK', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ROK', E'Actin_ATPase', E'putative sugar-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Glucokinase', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Glucokinase', E'Actin_ATPase', E'putative sugar-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SCP2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SCP2', E'SCP2', E'sterol carrier domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Alkyl_sulf_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Alkyl_sulf_C', E'SCP2', E'alkyl sulfatase non-catalytic, hydrophobic substrate binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'WYL', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'WYL', E'No clan', E'ligand-binding domain', true, E'pfam', array[24817877], NULL);

insert into signal_domains (name, version, kind, function) values (E'Arc_trans_TRASH', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Arc_trans_TRASH', E'TRASH', E'metal-sensing domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'BPL_LplA_LipB', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'BPL_LplA_LipB', E'tRNA_synt_II', E'cofactor transferase ligand binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PhoU', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PhoU', E'PhoU', E'phosphate binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AhpC-TSA', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AhpC-TSA', E'Thioredoxin', E'alkyl hydroperoxide reductase-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Redoxin', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Redoxin', E'Thioredoxin', E'thioredoxin-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ThiP_synth', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ThiP_synth', E'No clan', E'thiamine-phosphate synthase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'3H', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'3H', E'No clan', E'ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DJ-1_PfpI', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DJ-1_PfpI', E'Glutaminase_I', E'glutaminase/protease catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PTS_EIIA_2', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PTS_EIIA_2', E'Ptase-anion_tr', E'PEP-dependent sugar phosphotransferase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PTS_IIB', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PTS_IIB', E'No clan', E'PTS system lactose/cellobiose specific IIB subunit domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RNB', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RNB', E'No clan', E'Ribonuclease catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'MerB', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MerB', E'No clan', E'alkylmercury lyase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Citrate_synt', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Citrate_synt', E'No clan', E'citrate synthase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'EPSP_synthase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'EPSP_synthase', E'EPT_RTPC', E'enolpyruvateshikimate-3-phosphate synthase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PEP_hydrolase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PEP_hydrolase', E'PK_TIM', E'phosphoenolpyruvate hydrolase-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NTP_transf_3', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NTP_transf_3', E'GT-A', E'NTP transferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NTP_transferase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NTP_transferase', E'GT-A', E'NTP transferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NTP_transf_2', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NTP_transf_2', E'GT-A', E'NTP transferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Choline_kinase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Choline_kinase', E'Pkinase', E'cholie/ethanolamine kinase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TipAS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TipAS', E'No clan', E'antibiotic-recognition domain', false, E'pfam', array[12682015], NULL);

insert into signal_domains (name, version, kind, function) values (E'NosL', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NosL', E'No clan', E'putative copper binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ParBc', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ParBc', E'ParBc', E'ParB-like nuclease domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Fic_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fic_N', E'No clan', E'ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RsbRD_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RsbRD_N', E'No clan', E'putative ligand-binding domain', false, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RsbRD_N', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SGL', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SGL', E'Beta_propeller', E'gluconolaconase-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PD40', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PD40', E'Beta_propeller', E'WD40-like beta propeller repeat', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SinI', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SinI', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'2TM', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'2TM', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peptidase_M23', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peptidase_M23', E'Hybrid', E'Metallopeptidase enzymatic, ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Peptidase_S24', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Peptidase_S24', E'Peptidase_SF', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF955', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF955', E'Peptidase_MA', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Pep_deformylase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pep_deformylase', E'No clan', E'polypeptide deformylase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PilZ', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PilZ', E'No clan', E'c-di-GMP-binding domain', false, E'pfam', array[16249258], NULL);

insert into signal_domains (name, version, kind, function) values (E'Pribosyltran', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pribosyltran', E'PRTase-like', E'phosphorybosyl transferase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Rhodanese', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Rhodanese', E'No clan', E'Cysteine/sulfate binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NUDIX', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NUDIX', E'NUDIX', E'phosphohydrolase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'LMWPc', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LMWPc', E'No clan', E'protein tyrosine phosphatase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CoA_binding', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CoA_binding', E'NADP_Rossmann', E'CoA synthetase-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DNA_methylase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DNA_methylase', E'NADP_Rossmann', E'DNA methylase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Methyltransf_23', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Methyltransf_23', E'NADP_Rossmann', E'methyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Methyltransf_11', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Methyltransf_11', E'NADP_Rossmann', E'methyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Methyltransf_25', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Methyltransf_25', E'NADP_Rossmann', E'methyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Methyltransf_31', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Methyltransf_31', E'NADP_Rossmann', E'methyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Methyltransf_14', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Methyltransf_14', E'No clan', E'methyltransferase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CTP-dep_RFKase', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CTP-dep_RFKase', E'No clan', E'riboflavin kinase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Pyridox_ox_2', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pyridox_ox_2', E'FMN-binding', E'pyridoxamine 5\'-phosphate oxidase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FlpD', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FlpD', E'No clan', E'methyl-viologen-reducing hydrogenase catalytic domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Y_Y_Y', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Y_Y_Y', E'E-set', E'ligand-binding domain', true, E'pfam', array[22532667], NULL);

insert into signal_domains (name, version, kind, function) values (E'PaaX_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PaaX_C', E'No clan', E'putative phenylacetate binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Thiamine_BP', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Thiamine_BP', E'MTH1187-YkoF', E'putative thiamine binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PG_binding_1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PG_binding_1', E'PGBD', E'putative peptidoglycan binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'GrpE', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GrpE', E'No clan', E'nucleotide binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'WhiA_N', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'WhiA_N', E'Homing_endonuc', E'endonuclease-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'LAGLIDADG_WhiA', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LAGLIDADG_WhiA', E'Homing_endonuc', E'endonuclease-like domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PucR', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PucR', E'No clan', E'putative purine binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C', E'TetR_C', E'inducer-binding domain', true, E'pfam', array[8153629], NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_2', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_3', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_3', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_4', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_4', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_5', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_5', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_6', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_6', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_7', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_7', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_8', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_8', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_9', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_9', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_10', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_10', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_11', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_11', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_12', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_12', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_C_13', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_C_13', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'WHG', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'WHG', E'TetR_C', E'inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF1956', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF1956', E'TetR_C', E'putative inducer-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AHSA1', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AHSA1', E'Bet_V_1_like', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PEGA', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PEGA', E'Transthyretin', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Virul_fac_BkrB', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Virul_fac_BkrB', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Uma2', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Uma2', E'PDDEXK', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF128', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF128', E'No clan', E'ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF234', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF234', E'PDDEXK', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF1232', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF1232', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF1612', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF1612', E'No clan', E'ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF1724', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF1724', E'No clan', E'putative ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2083', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2083', E'No clan', E'ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2087', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2087', E'No clan', E'ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2442', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2442', E'No clan', E'putative ligand-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2637', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2637', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF2690', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF2690', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF3612', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF3612', E'No clan', E'ligand-binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF4115', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF4115', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF4870', 1, E'input', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF4870', E'No caln', E'putative orotate phosphoribosyltransferase domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FeS', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FeS', E'4Fe-4S', E'Fe-S cluster domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Fer4', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fer4', E'4Fe-4S', E'4Fe-4S binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Fer4_12', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fer4_12', E'4Fe-4S', E'4Fe-4S single cluster domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sensor_TM1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sensor_TM1', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RisS_PPD', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RisS_PPD', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF3365', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF3365', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HK_sensor', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_sensor', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'STAS', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'STAS', E'STAS', E'NTP-binding domain', false, E'pfam', array[10662676], NULL);

insert into signal_domains (name, version, kind, function) values (E'STAS_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'STAS_2', E'STAS', E'NTP-binding domain', false, E'pfam', array[10662676], NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF4173', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF4173', E'Cache', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF4118', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF4118', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'KdpD', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'KdpD', E'P-loop_NTPase', E'monovalent cation sensor', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Usp', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Usp', E'HUP', E'unknown', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Reg_prop', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Reg_prop', E'Beta_propeller', E'putative disaccharide binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF3329', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF3329', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DICT', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DICT', E'No clan', E'putative small ligand binding domain, bi-partite together with CHASE6_C', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CHASE6_C', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CHASE6_C', E'No clan', E'putative small ligand binding domain, bi-partite together with DICT', true, E'pfam', array[12486065], NULL);

insert into signal_domains (name, version, kind, function) values (E'HisKA_7TM', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HisKA_7TM', E'No clan', E'7TM putative sensory domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HisK_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HisK_N', E'No clan, globin-related', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF3404', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF3404', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AA_permease_2', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AA_permease_2', E'APC', E'permease ligand binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'MASE4', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MASE4', E'No clan', E'integral membrane domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'MASE3', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MASE3', E'No clan', E'integral membrane domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SSF', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SSF', E'APC', E'sodium solute symporter domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Bac_rhodopsin', 1, E'input', E'cofactor binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Bac_rhodopsin', E'GPCR_A', E'rhodopsin light sensory domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RsbU_N', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RsbU_N', E'No clan', E'putative small ligand binding domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NMT1', 1, E'input', E'small molecule binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NMT1', E'PBP', E'small molecule binding   domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF1638', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF1638', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF4154', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF4154', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sensor', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sensor', E'No clan', E'unknown', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DegS', 1, E'input', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DegS', E'No clan', E'unknown', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sigma54_activat', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sigma54_activat', E'P-loop_NTPase', E'Sigma-54 interaction domain', true, E'pfam', array[12618438], NULL);

insert into signal_domains (name, version, kind, function) values (E'AAA_16', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AAA_16', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AAA_22', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AAA_22', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AAA_25', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AAA_25', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AAA_28', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AAA_28', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'AAA_31', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AAA_31', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'NB-ARC', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NB-ARC', E'P-loop_NTPase', E'domain of unknown signaling role', false, E'pfam', array[9545207], NULL);

insert into signal_domains (name, version, kind, function) values (E'NACHT', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'NACHT', E'P-loop_NTPase', E'AAA+ domain', false, E'pfam', array[10782090], NULL);

insert into signal_domains (name, version, kind, function) values (E'ATPase_2', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ATPase_2', E'P-loop_NTPase', E'ATP-binding domain', false, E'pfam', array[9045616], NULL);

insert into signal_domains (name, version, kind, function) values (E'ABC_tran', 1, E'unknown', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ABC_tran', E'P-loop_NTPase', E'ATP-binding domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Bat', 1, E'unknown', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Bat', E'No clan', E'GAF and HTH associated domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'BTAD', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'BTAD', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', true, E'pfam', array[12625841], NULL);

insert into signal_domains (name, version, kind, function) values (E'HEAT_2', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HEAT_2', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TPR_7', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TPR_7', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TPR_8', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TPR_8', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TPR_10', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TPR_10', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TPR_12', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TPR_12', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TPR_16', 1, E'input', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TPR_16', E'TPR', E'TPR-containing regulatory domain,  protein-protein interactions', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'SPOB_a', 1, E'transmitter', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SPOB_a', E'No clan', E'histidine kinase dimerization domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HisKA', 1, E'transmitter', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HisKA', E'His_Kinase_A', E'histidine kinase dimerization domain', true, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HisKA_2', E'His_Kinase_A', E'histidine kinase dimerization domain', true, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HisKA_3', E'His_Kinase_A', E'histidine kinase dimerization domain', true, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HWE_HK', E'His_Kinase_A', E'histidine kinase catalytic domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'H-kinase_dim', 1, E'transmitter', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'H-kinase_dim', E'His_Kinase_A', E'histidine kinase dimerization (P3) domain, CheA-specific', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HK_CA', 1, E'transmitter', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HATPase_c', E'His_Kinase_A', E'histidine kinase catalytic domain', false, E'pfam', array[10637609], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HATPase_c_2', E'His_Kinase_A', E'anti-sigma regulatory factor, monomeric histidine kinase domain', false, E'pfam', NULL, NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HATPase_c_5', E'His_Kinase_A', E'histidine kinase catalytic domain', true, E'pfam', array[10637609], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:1', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:2', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:3', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:5', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:6', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:7', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:8', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:9', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:10', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:11', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:12', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:13', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:14', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:15', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:16', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:17', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:18', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:19', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:20', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:21', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:22', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:23', NULL, E'histidine kinase catalytic domain', true, E'agfam', array[19900966], NULL);

insert into signal_domains (name, version, kind, function) values (E'HK_CA:Che', 1, E'transmitter', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HK_CA:Che', NULL, E'histidine kinase catalytic domain, CheA-specific', true, E'agfam', array[19900966], NULL);

insert into signal_domains (name, version, kind, function) values (E'Hpt', 1, E'transmitter', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Hpt', E'No clan', E'histidine-containing phosphotransfer domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'P2', 1, E'transmitter', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'P2', E'No clan', E'CheY-binding (P2) domain, CheA-specific', true, E'pfam', array[15289606], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheY-binding', 1, E'transmitter', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheY-binding', E'No clan', E'CheY-binding (P2) domain, CheA-specific', true, E'pfam', array[15289606], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheW', 1, E'chemotaxis', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheW', E'No clan', E'adaptor, scaffolding domain, chemotaxis-specific', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HAMP', 1, E'transmitter', E'signaling');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HAMP', E'No clan', E'signal amplifier/transmitter in transmembrane sensors', true, E'pfam', array[10418137], NULL);

insert into signal_domains (name, version, kind, function) values (E'MCPsignal', 1, E'chemotaxis', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MCPsignal', E'No clan', E'chemoreceptor signaling domain', true, E'pfam', array[17299051], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheB_methylest', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheB_methylest', E'No clan', E'chemotaxis methylesterase, enzymatic domain', true, E'pfam', array[9465023], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheR', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheR', E'NADP_Rossmann', E'chemotaxis methyltransferase, enzymatic domain', true, E'pfam', array[9628482], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheR_N', 1, E'chemotaxis', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheR_N', E'No clan', E'chemotaxis methyltransferase, N-terminal domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'CheD', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheD', E'No clan', E'chemotaxis glutamine deamidase, enzymatic domain', true, E'pfam', array[16469702], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheC', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheC', E'CheC-like', E'chemotaxis phosphatase CheC enzymatic domain', true, E'pfam', array[15546616], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheX', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheX', E'CheC-like', E'chemotaxis phosphatase CheX enzymatic domain', true, E'pfam', array[15546616], NULL);

insert into signal_domains (name, version, kind, function) values (E'CheZ', 1, E'chemotaxis', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CheZ', E'No clan', E'chemotaxis phosphatase CheZ enzymatic domain', true, E'pfam', array[12080332], NULL);

insert into signal_domains (name, version, kind, function) values (E'PRD', 1, E'input', E'signaling');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PRD', E'PRD', E'phosphorylatable regulatory domain', true, E'pfam', array[11751049], NULL);

insert into signal_domains (name, version, kind, function) values (E'PRD_Mga', 1, E'input', E'signaling');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PRD_Mga', E'PRD', E'phosphorylatable regulatory domain', true, E'pfam', array[11751049], NULL);

insert into signal_domains (name, version, kind, function) values (E'RR', 1, E'receiver', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RR', NULL, E'response regulator receiver domain', true, E'agfam', array[19900966], NULL),
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Response_reg', E'CheY', E'response regulator receiver domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'FleQ', 1, E'receiver', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FleQ', E'CheY', E'response regulator receiver domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Arc', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Arc', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[8107872], NULL);

insert into signal_domains (name, version, kind, function) values (E'MetJ', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MetJ', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[8092669], NULL);

insert into signal_domains (name, version, kind, function) values (E'Omega_Repress', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Omega_Repress', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[11733997], NULL);

insert into signal_domains (name, version, kind, function) values (E'PSK_trans_fac', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PSK_trans_fac', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[26150422], NULL);

insert into signal_domains (name, version, kind, function) values (E'RHH_1', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RHH_1', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[9857196], NULL);

insert into signal_domains (name, version, kind, function) values (E'RHH_3', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RHH_3', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RHH_4', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RHH_4', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'RHH_7', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RHH_7', E'Met_repress', E'DNA-binding, ribbon-helix-helix binding motif', true, E'pfam', array[18623065], NULL);

insert into signal_domains (name, version, kind, function) values (E'AphA_like', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'AphA_like', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[10331868], NULL);

insert into signal_domains (name, version, kind, function) values (E'Arg_repressor', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Arg_repressor', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'BetR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'BetR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Cro', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cro', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[9653036], NULL);

insert into signal_domains (name, version, kind, function) values (E'Crp', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Crp', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[1653449], NULL);

insert into signal_domains (name, version, kind, function) values (E'FaeA', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FaeA', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[20979070], NULL);

insert into signal_domains (name, version, kind, function) values (E'Fe_dep_repress', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Fe_dep_repress', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[8823163], NULL);

insert into signal_domains (name, version, kind, function) values (E'FeoC', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FeoC', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[22580893], NULL);

insert into signal_domains (name, version, kind, function) values (E'FUR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'FUR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[12581348], NULL);

insert into signal_domains (name, version, kind, function) values (E'GcrA', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GcrA', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15087506], NULL);

insert into signal_domains (name, version, kind, function) values (E'GerE', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GerE', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[8780507], NULL);

insert into signal_domains (name, version, kind, function) values (E'GntR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GntR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11013219, 11756427], NULL);

insert into signal_domains (name, version, kind, function) values (E'HrcA_DNA-bdg', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HrcA_DNA-bdg', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HSF_DNA-bind', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HSF_DNA-bind', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_1', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_1', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[10075916], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_10', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_10', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_11', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_11', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11353844], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_12', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_12', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_13', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_13', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_15', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_15', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[19004822], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_17', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_17', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_18', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_18', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[10802742], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_19', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_19', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[21440553], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_20', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_20', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[21632538], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_21', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_21', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_22', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_22', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_23', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_23', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_24', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_24', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[16528101], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_25', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_25', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_26', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_26', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_27', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_27', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[23396446], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_28', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_28', E'HTH', E'DNA-binding, helix-turn-helix domain, transposase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_29', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_29', E'HTH', E'DNA-binding, helix-turn-helix domain, transposase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_3', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_3', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[25847993], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_30', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_30', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_31', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_31', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[27907154], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_32', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_32', E'HTH', E'DNA-binding, helix-turn-helix domain, transposase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_33', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_33', E'HTH', E'DNA-binding, helix-turn-helix domain, transposase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_34', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_34', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[16506234], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_35', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_35', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[8590003], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_36', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_36', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_37', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_37', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_38', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_38', E'HTH', E'DNA-binding, helix-turn-helix domain, transposase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_39', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_39', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_40', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_40', E'HTH', E'DNA-binding, helix-turn-helix domain, helicase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_41', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_41', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_43', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_43', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_45', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_45', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15312764], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_46', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_46', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_47', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_47', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_5', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_5', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[19286656], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_6', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_6', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[23832782], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_7', 1, E'unknown', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_7', E'HTH', E'DNA-binding, helix-turn-helix domain, transposon resolvase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_8', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_8', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[16005641], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_AraC', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_AraC', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[23241389], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_AsnC-type', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_AsnC-type', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[17962306], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_CodY', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_CodY', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[16488888], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_Crp_2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_Crp_2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[19740754], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_DeoR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_DeoR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_IclR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_IclR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11877432], NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_Mga', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_Mga', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HTH_WhiA', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HTH_WhiA', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[19836336], NULL);

insert into signal_domains (name, version, kind, function) values (E'HxlR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HxlR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[23479646], NULL);

insert into signal_domains (name, version, kind, function) values (E'KORA', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'KORA', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[27016739], NULL);

insert into signal_domains (name, version, kind, function) values (E'KorB', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'KorB', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15170177], NULL);

insert into signal_domains (name, version, kind, function) values (E'LacI', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LacI', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15369672], NULL);

insert into signal_domains (name, version, kind, function) values (E'LexA_DNA_bind', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LexA_DNA_bind', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[8076591], NULL);

insert into signal_domains (name, version, kind, function) values (E'MarR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MarR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11473263], NULL);

insert into signal_domains (name, version, kind, function) values (E'MarR_2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MarR_2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[24531929], NULL);

insert into signal_domains (name, version, kind, function) values (E'MerR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MerR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11201751], NULL);

insert into signal_domains (name, version, kind, function) values (E'MerR-DNA-bind', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MerR-DNA-bind', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[12958362], NULL);

insert into signal_domains (name, version, kind, function) values (E'MerR_1', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MerR_1', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[25691471], NULL);

insert into signal_domains (name, version, kind, function) values (E'MerR_2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'MerR_2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[24945826], NULL);

insert into signal_domains (name, version, kind, function) values (E'Mga', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Mga', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[25402841], NULL);

insert into signal_domains (name, version, kind, function) values (E'Mor', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Mor', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[14729670], NULL);

insert into signal_domains (name, version, kind, function) values (E'PaaX', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PaaX', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'PadR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PadR', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15647287], NULL);

insert into signal_domains (name, version, kind, function) values (E'Pencillinase_R', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pencillinase_R', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[14568532], NULL);

insert into signal_domains (name, version, kind, function) values (E'Phage_CI_repr', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Phage_CI_repr', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[16507359], NULL);

insert into signal_domains (name, version, kind, function) values (E'PuR_N', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'PuR_N', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[12837783], NULL);

insert into signal_domains (name, version, kind, function) values (E'Put_DNA-bind_N', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Put_DNA-bind_N', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[25463021], NULL);

insert into signal_domains (name, version, kind, function) values (E'RepL', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RepL', E'HTH', E'DNA-binding, helix-turn-helix domain', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Rrf2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Rrf2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[22553203], NULL);

insert into signal_domains (name, version, kind, function) values (E'SgrR_N', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SgrR_N', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[17209026], NULL);

insert into signal_domains (name, version, kind, function) values (E'Sigma70_r2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sigma70_r2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[11931761], NULL);

insert into signal_domains (name, version, kind, function) values (E'Sigma70_r3', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sigma70_r3', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sigma70_r4', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sigma70_r4', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'Sigma70_r4_2', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Sigma70_r4_2', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'TetR_N', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TetR_N', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[23800819], NULL);

insert into signal_domains (name, version, kind, function) values (E'Trans_reg_C', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Trans_reg_C', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[24526190], NULL);

insert into signal_domains (name, version, kind, function) values (E'TrmB', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'TrmB', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[17720190], NULL);

insert into signal_domains (name, version, kind, function) values (E'Trp_repressor', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Trp_repressor', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[3419502], NULL);

insert into signal_domains (name, version, kind, function) values (E'UPF0122', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'UPF0122', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', array[15213388], NULL);

insert into signal_domains (name, version, kind, function) values (E'Vir_act_alpha_C', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Vir_act_alpha_C', E'HTH', E'DNA-binding, helix-turn-helix domain', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ArsD', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ArsD', E'Thioredoxin', E'DNA-binding', true, E'pfam', array[11980902], NULL);

insert into signal_domains (name, version, kind, function) values (E'ComK', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ComK', E'No clan', E'DNA-binding', true, E'pfam', array[12761164], NULL);

insert into signal_domains (name, version, kind, function) values (E'CtsR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CtsR', E'No clan', E'DNA-binding', true, E'pfam', array[19498169], NULL);

insert into signal_domains (name, version, kind, function) values (E'LytTR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'LytTR', E'No clan', E'DNA-binding', true, E'pfam', array[12034833, 23181972], NULL);

insert into signal_domains (name, version, kind, function) values (E'ROS_MUCR', 1, E'output', E'DNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ROS_MUCR', E'No clan', E'DNA-binding', true, E'pfam', array[17956987], NULL);

insert into signal_domains (name, version, kind, function) values (E'EAL', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'EAL', E'No clan', E'diguanylate phosphodiesterase', true, E'pfam', array[11557134, 19536266], NULL);

insert into signal_domains (name, version, kind, function) values (E'GGDEF', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'GGDEF', E'Nucleot_cyclase', E'diguanylate cyclase', true, E'pfam', array[15075296, 22843345], NULL);

insert into signal_domains (name, version, kind, function) values (E'HD', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HD', E'HD_PDEase', E'hydrolase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HDOD', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HDOD', E'HD_PDEase', E'hydrolase', false, E'pfam', array[16287129], NULL);

insert into signal_domains (name, version, kind, function) values (E'HD_4', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HD_4', E'HD_PDEase', E'hydrolase', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'HD_5', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'HD_5', E'HD_PDEase', E'hydrolase', true, E'pfam', array[9868367, 25691523], NULL);

insert into signal_domains (name, version, kind, function) values (E'Guanylate_cyc', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Guanylate_cyc', E'Nucleot_cyclase', E'adenylate and guanylate cyclase', true, E'pfam', array[15678099, 22226839], NULL);

insert into signal_domains (name, version, kind, function) values (E'RseA_N', 1, E'output', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'RseA_N', E'No clan', E'Sigma-E binding domain', true, E'pfam', array[12718891], NULL);

insert into signal_domains (name, version, kind, function) values (E'SpoIIE', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'SpoIIE', E'PP2C', E'protein phosphatase', true, E'pfam', array[28527238], NULL);

insert into signal_domains (name, version, kind, function) values (E'Pkinase', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pkinase', E'Pkinase', E'serine/threonine protein kinase', true, E'pfam', array[16244704], NULL);

insert into signal_domains (name, version, kind, function) values (E'Pkinase_Tyr', 1, E'output', E'enzymatic');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Pkinase_Tyr', E'Pkinase', E'tyrosine kinase', true, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ANTAR', 1, E'output', E'RNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ANTAR', E'No clan', E'RNA-binding domain', true, E'pfam', array[11796212, 22690729], NULL);

insert into signal_domains (name, version, kind, function) values (E'CsrA', 1, E'output', E'RNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'CsrA', E'No clan', E'RNA-binding domain', true, E'pfam', array[23980177], NULL);

insert into signal_domains (name, version, kind, function) values (E'Cat_RBD', 1, E'output', E'RNA binding');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Cat_RBD', E'No clan', E'RNA-binding domain', true, E'pfam', array[22750856], NULL);

insert into signal_domains (name, version, kind, function) values (E'YcgR', 1, E'output', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'YcgR', E'No clan', E'protein-protein interaction domain, flagellar-specific', true, E'pfam', array[20346719], NULL);

insert into signal_domains (name, version, kind, function) values (E'KaiB', 1, E'unknown', E'protein-protein interactions');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'KaiB', E'Thioredoxin', E'putative protein-protein interaction domain', true, E'pfam', array[15716274], NULL);

insert into signal_domains (name, version, kind, function) values (E'Resolvase', 1, E'unknown', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'Resolvase', E'No clan', E'unknown', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'DUF835', 1, E'unknown', E'unknown');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'DUF835', E'No clan', E'unknown, archael-specific', false, E'pfam', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_1', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_1', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_2', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_2', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_3', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_3', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_4', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_4', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_5', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_5', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_6', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_6', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_7', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_7', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_8', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_8', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_9', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_9', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_10', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_10', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_11', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_11', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_12', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_12', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_13', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_13', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_14', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_14', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_15', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_15', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_16', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_16', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_17', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_17', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_18', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_18', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_19', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_19', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_20', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_20', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_21', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_21', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_22', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_22', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_23', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_23', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_24', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_24', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_25', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_25', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_26', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_26', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_27', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_27', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_28', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_28', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_29', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_29', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_30', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_30', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_31', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_31', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_32', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_32', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_33', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_33', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_34', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_34', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_35', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_35', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_36', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_36', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_37', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_37', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_38', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_38', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_39', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_39', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_40', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_40', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_41', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_41', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_42', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_42', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_43', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_43', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_101', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_101', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_102', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_102', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_103', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_103', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_104', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_104', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_105', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_105', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_106', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_106', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_107', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_107', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_108', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_108', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_109', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_109', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_110', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_110', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_111', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_111', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_112', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_112', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_113', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_113', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_114', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_114', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_115', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_115', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_116', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_116', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_117', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_117', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_118', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_118', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_119', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_119', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_120', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_120', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_121', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_121', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_122', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_122', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_123', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_123', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_124', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_124', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);

insert into signal_domains (name, version, kind, function) values (E'ECF_999', 1, E'ecf', E'extracytoplasmic function');
insert into signal_domains_members (signal_domain_id, accession, name, superfamily, description, specific, source, pubmed_ids, pdb_ids) values
  (currval(pg_get_serial_sequence('signal_domains', 'id')), NULL, E'ECF_999', NULL, E'extracytoplasmic function sigma factor', true, E'ecf', NULL, NULL);


-- MIGRATION DOWN SQL
delete from signal_domains where name = 'PAS' and version = 1;
delete from signal_domains where name = 'PocR' and version = 1;
delete from signal_domains where name = 'GAF' and version = 1;
delete from signal_domains where name = 'IclR' and version = 1;
delete from signal_domains where name = 'PHY' and version = 1;
delete from signal_domains where name = 'SpoVT_C' and version = 1;
delete from signal_domains where name = 'DUF3369' and version = 1;
delete from signal_domains where name = 'DUF484' and version = 1;
delete from signal_domains where name = 'HrcA' and version = 1;
delete from signal_domains where name = 'Autoind_bind' and version = 1;
delete from signal_domains where name = 'CodY' and version = 1;
delete from signal_domains where name = 'H_kinase_N' and version = 1;
delete from signal_domains where name = 'CHASE' and version = 1;
delete from signal_domains where name = 'dCache_1' and version = 1;
delete from signal_domains where name = 'dCache_2' and version = 1;
delete from signal_domains where name = 'dCache_3' and version = 1;
delete from signal_domains where name = 'Cache_3-Cache_2' and version = 1;
delete from signal_domains where name = 'LuxQ-periplasm' and version = 1;
delete from signal_domains where name = 'CHASE7' and version = 1;
delete from signal_domains where name = 'GAPES1' and version = 1;
delete from signal_domains where name = 'sCache2' and version = 1;
delete from signal_domains where name = 'sCache3_1' and version = 1;
delete from signal_domains where name = 'sCache3_2' and version = 1;
delete from signal_domains where name = 'sCache3_3' and version = 1;
delete from signal_domains where name = 'sCache-like' and version = 1;
delete from signal_domains where name = 'Ykul_C' and version = 1;
delete from signal_domains where name = 'CHASE4' and version = 1;
delete from signal_domains where name = 'CHASE8' and version = 1;
delete from signal_domains where name = 'Stimulus_sens_1' and version = 1;
delete from signal_domains where name = 'DUF2222' and version = 1;
delete from signal_domains where name = 'SMP_2' and version = 1;
delete from signal_domains where name = '2CSK_N' and version = 1;
delete from signal_domains where name = 'PhoQ_sensor' and version = 1;
delete from signal_domains where name = 'CpxA_peri' and version = 1;
delete from signal_domains where name = 'Diacid_rec' and version = 1;
delete from signal_domains where name = 'LapD_MoxY_N' and version = 1;
delete from signal_domains where name = 'CHASE5' and version = 1;
delete from signal_domains where name = 'GAPES3' and version = 1;
delete from signal_domains where name = '4HB_MCP' and version = 1;
delete from signal_domains where name = 'CHASE3' and version = 1;
delete from signal_domains where name = 'PilJ' and version = 1;
delete from signal_domains where name = 'HBM' and version = 1;
delete from signal_domains where name = 'NIT' and version = 1;
delete from signal_domains where name = 'KinB_sensor' and version = 1;
delete from signal_domains where name = 'Peripla_BP_2' and version = 1;
delete from signal_domains where name = 'Peripla_BP_1' and version = 1;
delete from signal_domains where name = 'Peripla_BP_3' and version = 1;
delete from signal_domains where name = 'Peripla_BP_4' and version = 1;
delete from signal_domains where name = 'Peripla_BP_5' and version = 1;
delete from signal_domains where name = 'Peripla_BP_6' and version = 1;
delete from signal_domains where name = 'ABC_sub_bind' and version = 1;
delete from signal_domains where name = 'LysR_substrate' and version = 1;
delete from signal_domains where name = 'PBP_like' and version = 1;
delete from signal_domains where name = 'Phosphonate-bd' and version = 1;
delete from signal_domains where name = 'SBP_bac_3' and version = 1;
delete from signal_domains where name = 'SBP_bac_5' and version = 1;
delete from signal_domains where name = 'SBP_bac_8' and version = 1;
delete from signal_domains where name = 'SBP_bac_11' and version = 1;
delete from signal_domains where name = 'YhfZ_C' and version = 1;
delete from signal_domains where name = 'BLUF' and version = 1;
delete from signal_domains where name = 'HNOB' and version = 1;
delete from signal_domains where name = 'V4R' and version = 1;
delete from signal_domains where name = 'XylR_N' and version = 1;
delete from signal_domains where name = 'SKI' and version = 1;
delete from signal_domains where name = 'CbiA' and version = 1;
delete from signal_domains where name = 'MEDS' and version = 1;
delete from signal_domains where name = 'CbiC' and version = 1;
delete from signal_domains where name = 'Sugar-bind' and version = 1;
delete from signal_domains where name = 'HNOBA' and version = 1;
delete from signal_domains where name = 'Hemerythrin' and version = 1;
delete from signal_domains where name = 'Aminotran_1_2' and version = 1;
delete from signal_domains where name = 'Aminotran_5' and version = 1;
delete from signal_domains where name = 'Acetyltransf_1' and version = 1;
delete from signal_domains where name = 'Acetyltransf_4' and version = 1;
delete from signal_domains where name = 'Acetyltransf_7' and version = 1;
delete from signal_domains where name = 'Acetyltransf_10' and version = 1;
delete from signal_domains where name = 'Ammonium_transp' and version = 1;
delete from signal_domains where name = 'HEM4' and version = 1;
delete from signal_domains where name = '4HBT' and version = 1;
delete from signal_domains where name = 'MaoC_dehydratas' and version = 1;
delete from signal_domains where name = 'SnoaL_3' and version = 1;
delete from signal_domains where name = 'PfkB' and version = 1;
delete from signal_domains where name = 'Ada_Zn_binding' and version = 1;
delete from signal_domains where name = 'DZR' and version = 1;
delete from signal_domains where name = 'AlkA_N' and version = 1;
delete from signal_domains where name = 'AsnC_trans_reg' and version = 1;
delete from signal_domains where name = 'B12-binding' and version = 1;
delete from signal_domains where name = 'B12-binding_2' and version = 1;
delete from signal_domains where name = 'FHA' and version = 1;
delete from signal_domains where name = 'Yop-YscD_cpl' and version = 1;
delete from signal_domains where name = 'FIST' and version = 1;
delete from signal_domains where name = 'FIST_C' and version = 1;
delete from signal_domains where name = 'FeoA' and version = 1;
delete from signal_domains where name = 'TusA' and version = 1;
delete from signal_domains where name = 'Fic' and version = 1;
delete from signal_domains where name = 'CBS' and version = 1;
delete from signal_domains where name = 'SIS' and version = 1;
delete from signal_domains where name = 'Protoglobin' and version = 1;
delete from signal_domains where name = 'CZB' and version = 1;
delete from signal_domains where name = 'TOBE' and version = 1;
delete from signal_domains where name = 'cNMP_binding' and version = 1;
delete from signal_domains where name = 'CHASE2' and version = 1;
delete from signal_domains where name = 'MASE1' and version = 1;
delete from signal_domains where name = 'MASE2' and version = 1;
delete from signal_domains where name = 'MHYT' and version = 1;
delete from signal_domains where name = 'CSS-motif' and version = 1;
delete from signal_domains where name = '7TMR-DISMED2' and version = 1;
delete from signal_domains where name = '7TMR-DISM_7TM' and version = 1;
delete from signal_domains where name = '7TMR-HDED' and version = 1;
delete from signal_domains where name = '7TMR-7TMR_HD' and version = 1;
delete from signal_domains where name = '5TM-5TMR_LYT' and version = 1;
delete from signal_domains where name = 'TrkA_C' and version = 1;
delete from signal_domains where name = 'AraC_binding' and version = 1;
delete from signal_domains where name = 'AraC_binding_2' and version = 1;
delete from signal_domains where name = 'AraC_N' and version = 1;
delete from signal_domains where name = 'Cupin_2' and version = 1;
delete from signal_domains where name = 'Cupin_6' and version = 1;
delete from signal_domains where name = 'NikR_C' and version = 1;
delete from signal_domains where name = 'ACT_4' and version = 1;
delete from signal_domains where name = 'DeoRC' and version = 1;
delete from signal_domains where name = 'Arabinose_bd' and version = 1;
delete from signal_domains where name = 'Arg_repressor_C' and version = 1;
delete from signal_domains where name = 'Fe_dep_repr_C' and version = 1;
delete from signal_domains where name = 'GyrI-like' and version = 1;
delete from signal_domains where name = 'Cass2' and version = 1;
delete from signal_domains where name = 'FCD' and version = 1;
delete from signal_domains where name = 'FadR_C' and version = 1;
delete from signal_domains where name = 'Regulator_TrmB' and version = 1;
delete from signal_domains where name = 'PrpR_N' and version = 1;
delete from signal_domains where name = 'PmoA' and version = 1;
delete from signal_domains where name = 'UTRA' and version = 1;
delete from signal_domains where name = 'ROK' and version = 1;
delete from signal_domains where name = 'Glucokinase' and version = 1;
delete from signal_domains where name = 'SCP2' and version = 1;
delete from signal_domains where name = 'Alkyl_sulf_C' and version = 1;
delete from signal_domains where name = 'WYL' and version = 1;
delete from signal_domains where name = 'Arc_trans_TRASH' and version = 1;
delete from signal_domains where name = 'BPL_LplA_LipB' and version = 1;
delete from signal_domains where name = 'PhoU' and version = 1;
delete from signal_domains where name = 'AhpC-TSA' and version = 1;
delete from signal_domains where name = 'Redoxin' and version = 1;
delete from signal_domains where name = 'ThiP_synth' and version = 1;
delete from signal_domains where name = '3H' and version = 1;
delete from signal_domains where name = 'DJ-1_PfpI' and version = 1;
delete from signal_domains where name = 'PTS_EIIA_2' and version = 1;
delete from signal_domains where name = 'PTS_IIB' and version = 1;
delete from signal_domains where name = 'RNB' and version = 1;
delete from signal_domains where name = 'MerB' and version = 1;
delete from signal_domains where name = 'Citrate_synt' and version = 1;
delete from signal_domains where name = 'EPSP_synthase' and version = 1;
delete from signal_domains where name = 'PEP_hydrolase' and version = 1;
delete from signal_domains where name = 'NTP_transf_3' and version = 1;
delete from signal_domains where name = 'NTP_transferase' and version = 1;
delete from signal_domains where name = 'NTP_transf_2' and version = 1;
delete from signal_domains where name = 'Choline_kinase' and version = 1;
delete from signal_domains where name = 'TipAS' and version = 1;
delete from signal_domains where name = 'NosL' and version = 1;
delete from signal_domains where name = 'ParBc' and version = 1;
delete from signal_domains where name = 'Fic_N' and version = 1;
delete from signal_domains where name = 'RsbRD_N' and version = 1;
delete from signal_domains where name = 'SGL' and version = 1;
delete from signal_domains where name = 'PD40' and version = 1;
delete from signal_domains where name = 'SinI' and version = 1;
delete from signal_domains where name = '2TM' and version = 1;
delete from signal_domains where name = 'Peptidase_M23' and version = 1;
delete from signal_domains where name = 'Peptidase_S24' and version = 1;
delete from signal_domains where name = 'DUF955' and version = 1;
delete from signal_domains where name = 'Pep_deformylase' and version = 1;
delete from signal_domains where name = 'PilZ' and version = 1;
delete from signal_domains where name = 'Pribosyltran' and version = 1;
delete from signal_domains where name = 'Rhodanese' and version = 1;
delete from signal_domains where name = 'NUDIX' and version = 1;
delete from signal_domains where name = 'LMWPc' and version = 1;
delete from signal_domains where name = 'CoA_binding' and version = 1;
delete from signal_domains where name = 'DNA_methylase' and version = 1;
delete from signal_domains where name = 'Methyltransf_23' and version = 1;
delete from signal_domains where name = 'Methyltransf_11' and version = 1;
delete from signal_domains where name = 'Methyltransf_25' and version = 1;
delete from signal_domains where name = 'Methyltransf_31' and version = 1;
delete from signal_domains where name = 'Methyltransf_14' and version = 1;
delete from signal_domains where name = 'CTP-dep_RFKase' and version = 1;
delete from signal_domains where name = 'Pyridox_ox_2' and version = 1;
delete from signal_domains where name = 'FlpD' and version = 1;
delete from signal_domains where name = 'Y_Y_Y' and version = 1;
delete from signal_domains where name = 'PaaX_C' and version = 1;
delete from signal_domains where name = 'Thiamine_BP' and version = 1;
delete from signal_domains where name = 'PG_binding_1' and version = 1;
delete from signal_domains where name = 'GrpE' and version = 1;
delete from signal_domains where name = 'WhiA_N' and version = 1;
delete from signal_domains where name = 'LAGLIDADG_WhiA' and version = 1;
delete from signal_domains where name = 'PucR' and version = 1;
delete from signal_domains where name = 'TetR_C' and version = 1;
delete from signal_domains where name = 'TetR_C_2' and version = 1;
delete from signal_domains where name = 'TetR_C_3' and version = 1;
delete from signal_domains where name = 'TetR_C_4' and version = 1;
delete from signal_domains where name = 'TetR_C_5' and version = 1;
delete from signal_domains where name = 'TetR_C_6' and version = 1;
delete from signal_domains where name = 'TetR_C_7' and version = 1;
delete from signal_domains where name = 'TetR_C_8' and version = 1;
delete from signal_domains where name = 'TetR_C_9' and version = 1;
delete from signal_domains where name = 'TetR_C_10' and version = 1;
delete from signal_domains where name = 'TetR_C_11' and version = 1;
delete from signal_domains where name = 'TetR_C_12' and version = 1;
delete from signal_domains where name = 'TetR_C_13' and version = 1;
delete from signal_domains where name = 'WHG' and version = 1;
delete from signal_domains where name = 'DUF1956' and version = 1;
delete from signal_domains where name = 'AHSA1' and version = 1;
delete from signal_domains where name = 'PEGA' and version = 1;
delete from signal_domains where name = 'Virul_fac_BkrB' and version = 1;
delete from signal_domains where name = 'Uma2' and version = 1;
delete from signal_domains where name = 'DUF128' and version = 1;
delete from signal_domains where name = 'DUF234' and version = 1;
delete from signal_domains where name = 'DUF1232' and version = 1;
delete from signal_domains where name = 'DUF1612' and version = 1;
delete from signal_domains where name = 'DUF1724' and version = 1;
delete from signal_domains where name = 'DUF2083' and version = 1;
delete from signal_domains where name = 'DUF2087' and version = 1;
delete from signal_domains where name = 'DUF2442' and version = 1;
delete from signal_domains where name = 'DUF2637' and version = 1;
delete from signal_domains where name = 'DUF2690' and version = 1;
delete from signal_domains where name = 'DUF3612' and version = 1;
delete from signal_domains where name = 'DUF4115' and version = 1;
delete from signal_domains where name = 'DUF4870' and version = 1;
delete from signal_domains where name = 'FeS' and version = 1;
delete from signal_domains where name = 'Fer4' and version = 1;
delete from signal_domains where name = 'Fer4_12' and version = 1;
delete from signal_domains where name = 'Sensor_TM1' and version = 1;
delete from signal_domains where name = 'RisS_PPD' and version = 1;
delete from signal_domains where name = 'DUF3365' and version = 1;
delete from signal_domains where name = 'HK_sensor' and version = 1;
delete from signal_domains where name = 'STAS' and version = 1;
delete from signal_domains where name = 'STAS_2' and version = 1;
delete from signal_domains where name = 'DUF4173' and version = 1;
delete from signal_domains where name = 'DUF4118' and version = 1;
delete from signal_domains where name = 'KdpD' and version = 1;
delete from signal_domains where name = 'Usp' and version = 1;
delete from signal_domains where name = 'Reg_prop' and version = 1;
delete from signal_domains where name = 'DUF3329' and version = 1;
delete from signal_domains where name = 'DICT' and version = 1;
delete from signal_domains where name = 'CHASE6_C' and version = 1;
delete from signal_domains where name = 'HisKA_7TM' and version = 1;
delete from signal_domains where name = 'HisK_N' and version = 1;
delete from signal_domains where name = 'DUF3404' and version = 1;
delete from signal_domains where name = 'AA_permease_2' and version = 1;
delete from signal_domains where name = 'MASE4' and version = 1;
delete from signal_domains where name = 'MASE3' and version = 1;
delete from signal_domains where name = 'SSF' and version = 1;
delete from signal_domains where name = 'Bac_rhodopsin' and version = 1;
delete from signal_domains where name = 'RsbU_N' and version = 1;
delete from signal_domains where name = 'NMT1' and version = 1;
delete from signal_domains where name = 'DUF1638' and version = 1;
delete from signal_domains where name = 'DUF4154' and version = 1;
delete from signal_domains where name = 'Sensor' and version = 1;
delete from signal_domains where name = 'DegS' and version = 1;
delete from signal_domains where name = 'Sigma54_activat' and version = 1;
delete from signal_domains where name = 'AAA_16' and version = 1;
delete from signal_domains where name = 'AAA_22' and version = 1;
delete from signal_domains where name = 'AAA_25' and version = 1;
delete from signal_domains where name = 'AAA_28' and version = 1;
delete from signal_domains where name = 'AAA_31' and version = 1;
delete from signal_domains where name = 'NB-ARC' and version = 1;
delete from signal_domains where name = 'NACHT' and version = 1;
delete from signal_domains where name = 'ATPase_2' and version = 1;
delete from signal_domains where name = 'ABC_tran' and version = 1;
delete from signal_domains where name = 'Bat' and version = 1;
delete from signal_domains where name = 'BTAD' and version = 1;
delete from signal_domains where name = 'HEAT_2' and version = 1;
delete from signal_domains where name = 'TPR_7' and version = 1;
delete from signal_domains where name = 'TPR_8' and version = 1;
delete from signal_domains where name = 'TPR_10' and version = 1;
delete from signal_domains where name = 'TPR_12' and version = 1;
delete from signal_domains where name = 'TPR_16' and version = 1;
delete from signal_domains where name = 'SPOB_a' and version = 1;
delete from signal_domains where name = 'HisKA' and version = 1;
delete from signal_domains where name = 'H-kinase_dim' and version = 1;
delete from signal_domains where name = 'HK_CA' and version = 1;
delete from signal_domains where name = 'HK_CA:Che' and version = 1;
delete from signal_domains where name = 'Hpt' and version = 1;
delete from signal_domains where name = 'P2' and version = 1;
delete from signal_domains where name = 'CheY-binding' and version = 1;
delete from signal_domains where name = 'CheW' and version = 1;
delete from signal_domains where name = 'HAMP' and version = 1;
delete from signal_domains where name = 'MCPsignal' and version = 1;
delete from signal_domains where name = 'CheB_methylest' and version = 1;
delete from signal_domains where name = 'CheR' and version = 1;
delete from signal_domains where name = 'CheR_N' and version = 1;
delete from signal_domains where name = 'CheD' and version = 1;
delete from signal_domains where name = 'CheC' and version = 1;
delete from signal_domains where name = 'CheX' and version = 1;
delete from signal_domains where name = 'CheZ' and version = 1;
delete from signal_domains where name = 'PRD' and version = 1;
delete from signal_domains where name = 'PRD_Mga' and version = 1;
delete from signal_domains where name = 'RR' and version = 1;
delete from signal_domains where name = 'FleQ' and version = 1;
delete from signal_domains where name = 'Arc' and version = 1;
delete from signal_domains where name = 'MetJ' and version = 1;
delete from signal_domains where name = 'Omega_Repress' and version = 1;
delete from signal_domains where name = 'PSK_trans_fac' and version = 1;
delete from signal_domains where name = 'RHH_1' and version = 1;
delete from signal_domains where name = 'RHH_3' and version = 1;
delete from signal_domains where name = 'RHH_4' and version = 1;
delete from signal_domains where name = 'RHH_7' and version = 1;
delete from signal_domains where name = 'AphA_like' and version = 1;
delete from signal_domains where name = 'Arg_repressor' and version = 1;
delete from signal_domains where name = 'BetR' and version = 1;
delete from signal_domains where name = 'Cro' and version = 1;
delete from signal_domains where name = 'Crp' and version = 1;
delete from signal_domains where name = 'FaeA' and version = 1;
delete from signal_domains where name = 'Fe_dep_repress' and version = 1;
delete from signal_domains where name = 'FeoC' and version = 1;
delete from signal_domains where name = 'FUR' and version = 1;
delete from signal_domains where name = 'GcrA' and version = 1;
delete from signal_domains where name = 'GerE' and version = 1;
delete from signal_domains where name = 'GntR' and version = 1;
delete from signal_domains where name = 'HrcA_DNA-bdg' and version = 1;
delete from signal_domains where name = 'HSF_DNA-bind' and version = 1;
delete from signal_domains where name = 'HTH_1' and version = 1;
delete from signal_domains where name = 'HTH_10' and version = 1;
delete from signal_domains where name = 'HTH_11' and version = 1;
delete from signal_domains where name = 'HTH_12' and version = 1;
delete from signal_domains where name = 'HTH_13' and version = 1;
delete from signal_domains where name = 'HTH_15' and version = 1;
delete from signal_domains where name = 'HTH_17' and version = 1;
delete from signal_domains where name = 'HTH_18' and version = 1;
delete from signal_domains where name = 'HTH_19' and version = 1;
delete from signal_domains where name = 'HTH_20' and version = 1;
delete from signal_domains where name = 'HTH_21' and version = 1;
delete from signal_domains where name = 'HTH_22' and version = 1;
delete from signal_domains where name = 'HTH_23' and version = 1;
delete from signal_domains where name = 'HTH_24' and version = 1;
delete from signal_domains where name = 'HTH_25' and version = 1;
delete from signal_domains where name = 'HTH_26' and version = 1;
delete from signal_domains where name = 'HTH_27' and version = 1;
delete from signal_domains where name = 'HTH_28' and version = 1;
delete from signal_domains where name = 'HTH_29' and version = 1;
delete from signal_domains where name = 'HTH_3' and version = 1;
delete from signal_domains where name = 'HTH_30' and version = 1;
delete from signal_domains where name = 'HTH_31' and version = 1;
delete from signal_domains where name = 'HTH_32' and version = 1;
delete from signal_domains where name = 'HTH_33' and version = 1;
delete from signal_domains where name = 'HTH_34' and version = 1;
delete from signal_domains where name = 'HTH_35' and version = 1;
delete from signal_domains where name = 'HTH_36' and version = 1;
delete from signal_domains where name = 'HTH_37' and version = 1;
delete from signal_domains where name = 'HTH_38' and version = 1;
delete from signal_domains where name = 'HTH_39' and version = 1;
delete from signal_domains where name = 'HTH_40' and version = 1;
delete from signal_domains where name = 'HTH_41' and version = 1;
delete from signal_domains where name = 'HTH_43' and version = 1;
delete from signal_domains where name = 'HTH_45' and version = 1;
delete from signal_domains where name = 'HTH_46' and version = 1;
delete from signal_domains where name = 'HTH_47' and version = 1;
delete from signal_domains where name = 'HTH_5' and version = 1;
delete from signal_domains where name = 'HTH_6' and version = 1;
delete from signal_domains where name = 'HTH_7' and version = 1;
delete from signal_domains where name = 'HTH_8' and version = 1;
delete from signal_domains where name = 'HTH_AraC' and version = 1;
delete from signal_domains where name = 'HTH_AsnC-type' and version = 1;
delete from signal_domains where name = 'HTH_CodY' and version = 1;
delete from signal_domains where name = 'HTH_Crp_2' and version = 1;
delete from signal_domains where name = 'HTH_DeoR' and version = 1;
delete from signal_domains where name = 'HTH_IclR' and version = 1;
delete from signal_domains where name = 'HTH_Mga' and version = 1;
delete from signal_domains where name = 'HTH_WhiA' and version = 1;
delete from signal_domains where name = 'HxlR' and version = 1;
delete from signal_domains where name = 'KORA' and version = 1;
delete from signal_domains where name = 'KorB' and version = 1;
delete from signal_domains where name = 'LacI' and version = 1;
delete from signal_domains where name = 'LexA_DNA_bind' and version = 1;
delete from signal_domains where name = 'MarR' and version = 1;
delete from signal_domains where name = 'MarR_2' and version = 1;
delete from signal_domains where name = 'MerR' and version = 1;
delete from signal_domains where name = 'MerR-DNA-bind' and version = 1;
delete from signal_domains where name = 'MerR_1' and version = 1;
delete from signal_domains where name = 'MerR_2' and version = 1;
delete from signal_domains where name = 'Mga' and version = 1;
delete from signal_domains where name = 'Mor' and version = 1;
delete from signal_domains where name = 'PaaX' and version = 1;
delete from signal_domains where name = 'PadR' and version = 1;
delete from signal_domains where name = 'Pencillinase_R' and version = 1;
delete from signal_domains where name = 'Phage_CI_repr' and version = 1;
delete from signal_domains where name = 'PuR_N' and version = 1;
delete from signal_domains where name = 'Put_DNA-bind_N' and version = 1;
delete from signal_domains where name = 'RepL' and version = 1;
delete from signal_domains where name = 'Rrf2' and version = 1;
delete from signal_domains where name = 'SgrR_N' and version = 1;
delete from signal_domains where name = 'Sigma70_r2' and version = 1;
delete from signal_domains where name = 'Sigma70_r3' and version = 1;
delete from signal_domains where name = 'Sigma70_r4' and version = 1;
delete from signal_domains where name = 'Sigma70_r4_2' and version = 1;
delete from signal_domains where name = 'TetR_N' and version = 1;
delete from signal_domains where name = 'Trans_reg_C' and version = 1;
delete from signal_domains where name = 'TrmB' and version = 1;
delete from signal_domains where name = 'Trp_repressor' and version = 1;
delete from signal_domains where name = 'UPF0122' and version = 1;
delete from signal_domains where name = 'Vir_act_alpha_C' and version = 1;
delete from signal_domains where name = 'ArsD' and version = 1;
delete from signal_domains where name = 'ComK' and version = 1;
delete from signal_domains where name = 'CtsR' and version = 1;
delete from signal_domains where name = 'LytTR' and version = 1;
delete from signal_domains where name = 'ROS_MUCR' and version = 1;
delete from signal_domains where name = 'EAL' and version = 1;
delete from signal_domains where name = 'GGDEF' and version = 1;
delete from signal_domains where name = 'HD' and version = 1;
delete from signal_domains where name = 'HDOD' and version = 1;
delete from signal_domains where name = 'HD_4' and version = 1;
delete from signal_domains where name = 'HD_5' and version = 1;
delete from signal_domains where name = 'Guanylate_cyc' and version = 1;
delete from signal_domains where name = 'RseA_N' and version = 1;
delete from signal_domains where name = 'SpoIIE' and version = 1;
delete from signal_domains where name = 'Pkinase' and version = 1;
delete from signal_domains where name = 'Pkinase_Tyr' and version = 1;
delete from signal_domains where name = 'ANTAR' and version = 1;
delete from signal_domains where name = 'CsrA' and version = 1;
delete from signal_domains where name = 'Cat_RBD' and version = 1;
delete from signal_domains where name = 'YcgR' and version = 1;
delete from signal_domains where name = 'KaiB' and version = 1;
delete from signal_domains where name = 'Resolvase' and version = 1;
delete from signal_domains where name = 'DUF835' and version = 1;
delete from signal_domains where name = 'ECF_1' and version = 1;
delete from signal_domains where name = 'ECF_2' and version = 1;
delete from signal_domains where name = 'ECF_3' and version = 1;
delete from signal_domains where name = 'ECF_4' and version = 1;
delete from signal_domains where name = 'ECF_5' and version = 1;
delete from signal_domains where name = 'ECF_6' and version = 1;
delete from signal_domains where name = 'ECF_7' and version = 1;
delete from signal_domains where name = 'ECF_8' and version = 1;
delete from signal_domains where name = 'ECF_9' and version = 1;
delete from signal_domains where name = 'ECF_10' and version = 1;
delete from signal_domains where name = 'ECF_11' and version = 1;
delete from signal_domains where name = 'ECF_12' and version = 1;
delete from signal_domains where name = 'ECF_13' and version = 1;
delete from signal_domains where name = 'ECF_14' and version = 1;
delete from signal_domains where name = 'ECF_15' and version = 1;
delete from signal_domains where name = 'ECF_16' and version = 1;
delete from signal_domains where name = 'ECF_17' and version = 1;
delete from signal_domains where name = 'ECF_18' and version = 1;
delete from signal_domains where name = 'ECF_19' and version = 1;
delete from signal_domains where name = 'ECF_20' and version = 1;
delete from signal_domains where name = 'ECF_21' and version = 1;
delete from signal_domains where name = 'ECF_22' and version = 1;
delete from signal_domains where name = 'ECF_23' and version = 1;
delete from signal_domains where name = 'ECF_24' and version = 1;
delete from signal_domains where name = 'ECF_25' and version = 1;
delete from signal_domains where name = 'ECF_26' and version = 1;
delete from signal_domains where name = 'ECF_27' and version = 1;
delete from signal_domains where name = 'ECF_28' and version = 1;
delete from signal_domains where name = 'ECF_29' and version = 1;
delete from signal_domains where name = 'ECF_30' and version = 1;
delete from signal_domains where name = 'ECF_31' and version = 1;
delete from signal_domains where name = 'ECF_32' and version = 1;
delete from signal_domains where name = 'ECF_33' and version = 1;
delete from signal_domains where name = 'ECF_34' and version = 1;
delete from signal_domains where name = 'ECF_35' and version = 1;
delete from signal_domains where name = 'ECF_36' and version = 1;
delete from signal_domains where name = 'ECF_37' and version = 1;
delete from signal_domains where name = 'ECF_38' and version = 1;
delete from signal_domains where name = 'ECF_39' and version = 1;
delete from signal_domains where name = 'ECF_40' and version = 1;
delete from signal_domains where name = 'ECF_41' and version = 1;
delete from signal_domains where name = 'ECF_42' and version = 1;
delete from signal_domains where name = 'ECF_43' and version = 1;
delete from signal_domains where name = 'ECF_101' and version = 1;
delete from signal_domains where name = 'ECF_102' and version = 1;
delete from signal_domains where name = 'ECF_103' and version = 1;
delete from signal_domains where name = 'ECF_104' and version = 1;
delete from signal_domains where name = 'ECF_105' and version = 1;
delete from signal_domains where name = 'ECF_106' and version = 1;
delete from signal_domains where name = 'ECF_107' and version = 1;
delete from signal_domains where name = 'ECF_108' and version = 1;
delete from signal_domains where name = 'ECF_109' and version = 1;
delete from signal_domains where name = 'ECF_110' and version = 1;
delete from signal_domains where name = 'ECF_111' and version = 1;
delete from signal_domains where name = 'ECF_112' and version = 1;
delete from signal_domains where name = 'ECF_113' and version = 1;
delete from signal_domains where name = 'ECF_114' and version = 1;
delete from signal_domains where name = 'ECF_115' and version = 1;
delete from signal_domains where name = 'ECF_116' and version = 1;
delete from signal_domains where name = 'ECF_117' and version = 1;
delete from signal_domains where name = 'ECF_118' and version = 1;
delete from signal_domains where name = 'ECF_119' and version = 1;
delete from signal_domains where name = 'ECF_120' and version = 1;
delete from signal_domains where name = 'ECF_121' and version = 1;
delete from signal_domains where name = 'ECF_122' and version = 1;
delete from signal_domains where name = 'ECF_123' and version = 1;
delete from signal_domains where name = 'ECF_124' and version = 1;
delete from signal_domains where name = 'ECF_999' and version = 1;
