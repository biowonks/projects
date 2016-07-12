/* eslint-disable no-unused-expressions, no-new, no-magic-numbers */

'use strict'

// Local
let GenbankMistAdapter = require('./GenbankMistAdapter'),
	Seq = require('./Seq')

// Mock models
class MockModel {
	build(data) {
		return data
	}
}

class MockSeqModel extends MockModel {
	fromSeq(data) {
		return data
	}
}

let mockModels = {
	Component: new MockModel(),
	GenomeReference: new MockModel(),
	Gene: new MockModel(),
	ComponentFeature: new MockModel(),
	Xref: new MockModel(),
	Aseq: new MockSeqModel(),
	Dseq: new MockSeqModel()
}

describe('GenbankMistAdapter', function() {
	describe('constructor', function() {
		it('throws error if models are not passed into instantiation', function() {
			expect(function() {
				new GenbankMistAdapter()
			}).throw(Error)
		})
	})

	describe('findRefSeqError', function() {
		let x = new GenbankMistAdapter(mockModels)
		it('undefined / null record returns error', function() {
			expect(x.findRefSeqError()).instanceof(Error)
		})

		it('string record returns error', function() {
			let error = x.findRefSeqError('dummy')
			expect(error).instanceof(Error)
			expect(error.message).equal('GenbankRecord must be an object')
		})

		it('missing locus returns error', function() {
			let error = x.findRefSeqError({})
			expect(error).instanceof(Error)
			expect(error.message).equal('missing locus')
		})

		let locus = {
				name: 'NC_091234',
				bp: 10,
				moleculeType: 'DNA',
				topology: 'linear',
				divisionCode: 'CON',
				date: '01-01-2002'
			},
			locusFields = ['name', 'bp', 'moleculeType', 'topology', 'divisionCode', 'date']

		for (let locusField of locusFields) {
			it(`missing locus field ${locusField} returns error`, function() {
				let oldValue = locus[locusField]
				Reflect.deleteProperty(locus, locusField)
				let error = x.findRefSeqError({locus})
				expect(error).instanceof(Error)
				expect(error.message).equal('invalid locus')
				locus[locusField] = oldValue
			})
		}

		it('missing accession returns error', function() {
			let error = x.findRefSeqError({locus})
			expect(error).instanceof(Error)
			expect(error.message).equal('missing accession')
		})

		it('missing accession.primary returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {}
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('invalid accession')
		})

		it('missing accession.secondary returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234'
				}
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('invalid accession')
		})

		it('accession.secondary is not an array returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: {}
				}
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('invalid accession')
		})

		it('incompatible version returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: null
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('invalid version')
		})

		it('missing references returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('references must be present and an array')
		})

		it('references is not an array returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: {}
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('references must be present and an array')
		})

		it('missing origin returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: []
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('missing origin')
		})

		it('features is not an array returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				features: {},
				origin: 'ACGTACGTAT'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('features must be an array')
		})

		it('features is not an array returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				features: {},
				origin: 'ACGTACGTAT'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('features must be an array')
		})

		it('features without key returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				features: [
					{}
				],
				origin: 'ACGTACGTAT'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('feature at index 0 does not have a key and/or location')
		})

		it('features without location returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				features: [
					{key: 'gene'}
				],
				origin: 'ACGTACGTAT'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('feature at index 0 does not have a key and/or location')
		})

		it('features without key and location at index 1 returns error', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				features: [
					{key: 'gene', location: '1..10'},
					{}
				],
				origin: 'ACGTACGTAT'
			})
			expect(error).instanceof(Error)
			expect(error.message).equal('feature at index 1 does not have a key and/or location')
		})

		it('valid input returns null', function() {
			let error = x.findRefSeqError({
				locus,
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				origin: 'ACGTACGTAT'
			})
			expect(error).null
		})
	})

	describe('formatRefSeq', function() {
		let refSeq = null

		beforeEach(() => {
			refSeq = {
				locus: {
					name: 'NC_091234',
					bp: 20,
					moleculeType: 'DNA',
					topology: 'linear',
					divisionCode: 'CON',
					date: '01-01-2002'
				},
				accession: {
					primary: 'NC_091234',
					secondary: []
				},
				version: 'NC_091234.1',
				references: [],
				origin: 'ACGTACGTATACGTACGTAT'
			}
		})

		it('throws error if invalid genbank record', function() {
			let x = new GenbankMistAdapter(mockModels)
			expect(function() {
				x.formatRefSeq()
			}).throw(Error)
		})

		it('barebones refseq record returns barebones mist structure', function() {
			let x = new GenbankMistAdapter(mockModels),
				result = x.formatRefSeq(refSeq)

			expect(result).deep.equal({
				genomeReferences: [],
				component: {
					id: 1,
					genome_id: 1,
					accession: refSeq.accession.primary,
					version: 1,
					genbank_accession: null,
					genbank_version: null,
					name: null,
					role: null,
					assigned_molecule: null,
					type: null,
					genbank_refseq_relationship: null,
					definition: null,
					molecule_type: 'DNA',
					is_circular: false,
					annotation_date: refSeq.locus.date,
					comment: null,
					dna: 'ACGTACGTATACGTACGTAT',
					length: 20,
					stats: {}
				},
				genes: [],
				xrefs: [],
				componentFeatures: [],
				aseqs: [],
				dseqs: []
			})
		})

		it('respects the genome id constructor argument', function() {
			let x = new GenbankMistAdapter(mockModels, 2),
				result = x.formatRefSeq(refSeq)

			expect(result.component.genome_id).equal(2)
		})

		it('references are formatted as expected', function() {
			let x = new GenbankMistAdapter(mockModels)
			refSeq.references = [
				{
					number: 2,
					pubmed: 1234,
					medline: 5678,
					title: 'title 2',
					authors: 'authors 2',
					consortium: 'consortium 2',
					journal: 'journal 2',
					remark: 'remark 2',
					notes: 'notes 2'
				},
				{
					number: 1,
					pubmed: 4321,
					medline: 8765,
					title: 'title 1',
					authors: 'authors 1',
					consortium: 'consortium 1',
					journal: 'journal 1',
					remark: 'remark 1',
					notes: 'notes 1'
				}
			]
			let result = x.formatRefSeq(refSeq)

			expect(result.genomeReferences).deep.equal([
				{
					id: 1,
					genome_id: 1,
					pubmed_id: 4321,
					medline_id: 8765,
					title: 'title 1',
					authors: 'authors 1',
					consortium: 'consortium 1',
					journal: 'journal 1',
					remark: 'remark 1',
					notes: 'notes 1'
				},
				{
					id: 2,
					genome_id: 1,
					pubmed_id: 1234,
					medline_id: 5678,
					title: 'title 2',
					authors: 'authors 2',
					consortium: 'consortium 2',
					journal: 'journal 2',
					remark: 'remark 2',
					notes: 'notes 2'
				}
			])
		})

		describe('features', function() {
			it('sorted by start, location length, location string, gene, remainder', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						location: '5..10',
						key: 'gene'
					},
					{
						location: '1..20',
						key: 'gene'
					},
					{
						location: 'join(1..5,6..10)',
						key: 'CDS',
						custom: 'A'
					},
					{
						location: 'join(1..5,6..10)',
						key: 'dummy',
						custom: 'B'
					},
					{
						location: 'join(1..5,6..10)',
						key: 'gene',
						custom: 'C'
					},
					{
						location: '1..10',
						key: 'gene'
					}
				]

				let result = x.formatRefSeq(refSeq)
				expect(result.genes.length).equal(4)

				let gene = result.genes[0]
				expect(gene.id).equal(1)
				expect(gene.location).equal('1..10')

				gene = result.genes[1]
				expect(gene.id).equal(2)
				expect(gene.location).equal('join(1..5,6..10)')
				expect(gene.qualifiers.custom).equal('C')
				expect(gene.cognate_key).equal('CDS')
				expect(gene.cognate_qualifiers.custom).equal('A')

				gene = result.genes[2]
				expect(gene.id).equal(3)
				expect(gene.location).equal('1..20')

				gene = result.genes[3]
				expect(gene.id).equal(4)
				expect(gene.location).equal('5..10')

				expect(result.componentFeatures.length).equal(1)
				expect(result.componentFeatures[0].qualifiers.custom).equal('B')
			})

			it('basic gene fields', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '1..2',
						locus_tag: ['locus_tag'],
						old_locus_tag: ['old_locus_tag'],
						gene: ['name1', 'name2'],
						gene_synonym: ['syn1', 'syn2'],
						pseudo: true,
						note: ['note1', 'note2'],
						custom: ['custom1', 'custom2'],
						db_xref: [
							'GI:12345',
							'GeneID:54321'
						]
					}
				]

				let result = x.formatRefSeq(refSeq),
					dseq = new Seq(refSeq.origin.substr(0, 2))
				expect(result.genes.length).equal(1)
				expect(result.genes[0]).deep.equal({
					id: 1,
					component_id: 1,
					location: '1..2',
					strand: '+',
					start: 1,
					stop: 2,
					length: 2,
					dseq_id: dseq.seqId(),
					locus: 'locus_tag',
					old_locus: 'old_locus_tag',
					names: ['name1', 'name2', 'syn1', 'syn2'],
					pseudo: true,
					notes: 'note1; note2',
					qualifiers: {
						custom: 'custom1; custom2'
					},
					cognate_key: null,
					cognate_qualifiers: {},

					accession: null,
					version: null,
					aseq_id: null,
					codon_start: null,
					translation_table: null,
					product: null
				})

				expect(result.dseqs.length).equal(1)
				expect(result.dseqs[0].sequence()).equal(refSeq.origin.substr(0, 2))

				expect(result.xrefs.length).equal(1)
				expect(result.xrefs[0]).deep.equal({
					id: 1,
					gene_id: 1,
					database: 'GeneID',
					database_id: '54321'
				})
			})

			it('gene + CDS populates CDS fields', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '1..6'
					},
					{
						key: 'CDS',
						location: '1..6',
						translation: ['TY'],
						product: ['product'],
						codon_start: [1],
						transl_table: [11],
						protein_id: ['ABC.1'],
						custom: 'custom'
					}
				]

				let result = x.formatRefSeq(refSeq),
					dseq = new Seq(refSeq.origin.substr(0, 6)),
					aseq = new Seq(refSeq.features[1].translation[0])
				expect(result.genes.length).equal(1)
				expect(result.genes[0]).deep.equal({
					id: 1,
					component_id: 1,
					location: '1..6',
					strand: '+',
					start: 1,
					stop: 6,
					length: 6,
					dseq_id: dseq.seqId(),
					locus: null,
					old_locus: null,
					names: null,
					pseudo: false,
					notes: null,
					qualifiers: {},
					cognate_key: 'CDS',
					cognate_qualifiers: {
						custom: 'custom'
					},
					product: 'product',
					codon_start: 1,
					translation_table: 11,
					accession: 'ABC',
					version: 1,
					aseq_id: aseq.seqId()
				})

				expect(result.dseqs.length).equal(1)
				expect(result.dseqs[0].sequence()).equal(refSeq.origin.substr(0, 6))

				expect(result.aseqs.length).equal(1)
				expect(result.aseqs[0].sequence()).equal(refSeq.features[1].translation[0])
			})

			it('gene + tRNA', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '1..6'
					},
					{
						key: 'tRNA',
						location: '1..6',
						product: ['product'],
						custom: ['custom']
					}
				]

				let result = x.formatRefSeq(refSeq),
					dseq = new Seq(refSeq.origin.substr(0, 6))
				expect(result.genes.length).equal(1)
				expect(result.genes[0]).deep.equal({
					id: 1,
					component_id: 1,
					location: '1..6',
					strand: '+',
					start: 1,
					stop: 6,
					length: 6,
					dseq_id: dseq.seqId(),
					locus: null,
					old_locus: null,
					names: null,
					pseudo: false,
					notes: null,
					qualifiers: {},
					cognate_key: 'tRNA',
					cognate_qualifiers: {
						custom: 'custom',
						product: 'product'
					},
					product: null,
					codon_start: null,
					translation_table: null,
					accession: null,
					version: null,
					aseq_id: null
				})

				expect(result.componentFeatures.length).equal(0)
			})

			it('two genes with same locations throws error', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '1..6'
					},
					{
						key: 'gene',
						location: '1..6'
					}
				]

				expect(function() {
					x.formatRefSeq(refSeq)
				}).throw(Error)
			})

			it('non-gene feature', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'stem_loop',
						location: '2..5'
					}
				]
				let result = x.formatRefSeq(refSeq)
				expect(result.componentFeatures).deep.equal([
					{
						id: 1,
						component_id: 1,
						gene_id: null,
						key: 'stem_loop',
						location: '2..5',
						strand: '+',
						start: 2,
						stop: 5,
						length: 4,
						qualifiers: {}
					}
				])
			})

			it('link last gene data based on location: gene + CDS + X', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '2..5'
					},
					{
						key: 'CDS',
						location: '2..5'
					},
					{
						key: 'stem_loop',
						location: '2..5'
					}
				]
				let result = x.formatRefSeq(refSeq)
				expect(result.genes.length).equal(1)
				expect(result.componentFeatures).deep.equal([
					{
						id: 1,
						component_id: 1,
						gene_id: 1,
						key: 'stem_loop',
						location: '2..5',
						strand: '+',
						start: 2,
						stop: 5,
						length: 4,
						qualifiers: {}
					}
				])
			})

			it('identical cross-references between shared locations are ignored', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '2..5',
						db_xref: [
							'GeneID:100'
						]
					},
					{
						key: 'CDS',
						location: '2..5',
						db_xref: [
							'GeneID:100'
						]
					},
					{
						key: 'gene',
						location: '7..10',
						db_xref: [
							'GeneID:200'
						]
					}
				]
				let result = x.formatRefSeq(refSeq)
				expect(result.xrefs).deep.equal([
					{
						id: 1,
						gene_id: 1,
						database: 'GeneID',
						database_id: '100'
					},
					{
						id: 2,
						gene_id: 2,
						database: 'GeneID',
						database_id: '200'
					}
				])
			})

			it('sequences are not reset between calls', function() {
				let x = new GenbankMistAdapter(mockModels)
				refSeq.features = [
					{
						key: 'gene',
						location: '2..5'
					}
				]
				x.formatRefSeq(refSeq)
				let result = x.formatRefSeq(refSeq)
				expect(result.genes.length).equal(1)
				expect(result.genes[0].id).equal(2)
			})
		})
	})
})
