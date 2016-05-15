'use strict'

// 3rd party includes
let nock = require('nock')

// Local includes
let TaxonomyService = require('./TaxonomyService')


let kSampleTaxonomyXml = `
<?xml version="1.0"?>
<!DOCTYPE TaxaSet PUBLIC "-//NLM//DTD Taxon, 14th January 2002//EN" "http://www.ncbi.nlm.nih.gov/entrez/query/DTD/taxon.dtd">
<TaxaSet><Taxon>
	<TaxId>41253</TaxId>
	<ScientificName>Dothideaceae</ScientificName>
	<ParentTaxId>5014</ParentTaxId>
	<Rank>family</Rank>
	<Division>Plants and Fungi</Division>
	<GeneticCode>
		<GCId>1</GCId>
		<GCName>Standard</GCName>
	</GeneticCode>
	<MitoGeneticCode>
		<MGCId>4</MGCId>
		<MGCName>Mold Mitochondrial; Protozoan Mitochondrial; Coelenterate Mitochondrial; Mycoplasma; Spiroplasma</MGCName>
	</MitoGeneticCode>
	<Lineage>cellular organisms; Eukaryota; Opisthokonta; Fungi; Dikarya; Ascomycota; saccharomyceta; Pezizomycotina; leotiomyceta; dothideomyceta; Dothideomycetes; Dothideomycetidae; Dothideales</Lineage>
	<LineageEx>
		<Taxon>
			<TaxId>131567</TaxId>
			<ScientificName>cellular organisms</ScientificName>
			<Rank>no rank</Rank>
		</Taxon>
		<Taxon>
			<TaxId>2759</TaxId>
			<ScientificName>Eukaryota</ScientificName>
			<Rank>superkingdom</Rank>
		</Taxon>
		<Taxon>
			<TaxId>33154</TaxId>
			<ScientificName>Opisthokonta</ScientificName>
			<Rank>no rank</Rank>
		</Taxon>
		<Taxon>
			<TaxId>4751</TaxId>
			<ScientificName>Fungi</ScientificName>
			<Rank>kingdom</Rank>
		</Taxon>
		<Taxon>
			<TaxId>451864</TaxId>
			<ScientificName>Dikarya</ScientificName>
			<Rank>subkingdom</Rank>
		</Taxon>
		<Taxon>
			<TaxId>4890</TaxId>
			<ScientificName>Ascomycota</ScientificName>
			<Rank>phylum</Rank>
		</Taxon>
		<Taxon>
			<TaxId>716545</TaxId>
			<ScientificName>saccharomyceta</ScientificName>
			<Rank>no rank</Rank>
		</Taxon>
		<Taxon>
			<TaxId>147538</TaxId>
			<ScientificName>Pezizomycotina</ScientificName>
			<Rank>subphylum</Rank>
		</Taxon>
		<Taxon>
			<TaxId>716546</TaxId>
			<ScientificName>leotiomyceta</ScientificName>
			<Rank>no rank</Rank>
		</Taxon>
		<Taxon>
			<TaxId>715962</TaxId>
			<ScientificName>dothideomyceta</ScientificName>
			<Rank>no rank</Rank>
		</Taxon>
		<Taxon>
			<TaxId>147541</TaxId>
			<ScientificName>Dothideomycetes</ScientificName>
			<Rank>class</Rank>
		</Taxon>
		<Taxon>
			<TaxId>451867</TaxId>
			<ScientificName>Dothideomycetidae</ScientificName>
			<Rank>subclass</Rank>
		</Taxon>
		<Taxon>
			<TaxId>5014</TaxId>
			<ScientificName>Dothideales</ScientificName>
			<Rank>order</Rank>
		</Taxon>
	</LineageEx>
	<CreateDate>1995/07/13 17:14:00</CreateDate>
	<UpdateDate>1999/05/03 12:02:00</UpdateDate>
	<PubDate>1996/03/02 00:00:00</PubDate>
</Taxon>

</TaxaSet>`


describe.skip('Services', function() {
	describe('TaxonomyService', function() {
		let taxonomyService = new TaxonomyService()

		describe('eutilUrl', function() {
			it('returns taxonomyId appended', function() {
				let taxonomyId = 123
				expect(/123$/.test(taxonomyService.eutilUrl(taxonomyId))).true
			})
		})

		describe('fetch', function() {
			it('undefined taxonomicId throws error', function() {
				expect(() => {
					taxonomyService.fetch()
				}).throw(Error)
			})

			it('invalid numeric taxonomicId throws error', function() {
				expect(() => {
					taxonomyService.fetch('ab123')
				}).throw(Error)
			})

			let fixtureString = '41253',
				fixtureInteger = 41253,
				fixtures = [fixtureString, fixtureInteger]
			fixtures.forEach((fixture) => {
				it(fixture + ' (' + typeof fixture + ') works', function() {
					let taxonomyId = fixture,
						eutilUrl = taxonomyService.eutilUrl(taxonomyId),
						nockEutilRequest = nock(eutilUrl)

					nockEutilRequest.reply(200, kSampleTaxonomyXml) // eslint-disable-line

					return taxonomyService.fetch(taxonomyId)
						.then((taxonomyResult) => {
							nockEutilRequest.done()
							expect(taxonomyResult.lineage).deep.equal([
								'cellular organisms',
								'Eukaryota',
								'Opisthokonta',
								'Fungi',
								'Dikarya',
								'Ascomycota',
								'saccharomyceta',
								'Pezizomycotina',
								'leotiomyceta',
								'dothideomyceta',
								'Dothideomycetes',
								'Dothideomycetidae',
								'Dothideales'
							])
						})
				})
			})
		})

		describe('taxonomicGroup', function() {

		})
	})
})

