'use strict';

module.exports = function(models, optLogger) {
  if (optLogger) {
    optLogger.info('Setting up model associations');
  }

  const {
    BioSample,
    Worker,
    Genome,
    WorkerModule,
    Component,
    Gene,
    GeneCluster,
    GeneClusterMember,
    Aseq,
    Dseq,
    SignalDomain,
    SignalDomainMember,
    SignalGene,
  } = models;

  Worker.hasMany(WorkerModule);

  Genome.hasMany(WorkerModule);
  Genome.belongsTo(Worker);

  Genome.hasMany(Component);
  Component.belongsTo(Genome);

  Genome.belongsTo(BioSample);
  BioSample.hasMany(Genome);

  WorkerModule.belongsTo(Worker);
  WorkerModule.belongsTo(Genome);

  Component.hasMany(Gene);
  Gene.belongsTo(Component);

  Gene.belongsTo(Aseq);
  Gene.belongsTo(Dseq);

  Aseq.hasMany(Gene);
  Dseq.hasMany(Gene);

  Component.hasMany(GeneCluster);
  GeneCluster.belongsTo(Component);

  GeneCluster.hasMany(GeneClusterMember, {
    foreignKey: 'genes_cluster_id',
  });
  GeneClusterMember.belongsTo(GeneCluster, {
    foreignKey: 'genes_cluster_id',
  });

  SignalDomain.hasMany(SignalDomainMember);
  SignalDomainMember.belongsTo(SignalDomain);

  Component.hasMany(SignalGene);
  Gene.hasOne(SignalGene);
  SignalGene.belongsTo(Gene);
  SignalGene.belongsTo(Component);
};
