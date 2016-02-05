'use strict'

let Seq = require('./Seq')

describe('Seq', function() {
	let defaultSeq = new Seq()

	describe('isEmpty', function() {
		it('default constructed sequence should be empty', function() {
			expect(defaultSeq.isEmpty()).true
		})

		it('whitespace characters should be empty', function() {
			let seq = new Seq(' \n\f\t\r')
			expect(seq.isEmpty()).true
		})

		let inputs = [
			'A',
			' A',
			'A ',
			'1',
			'!@#$%^&*'
		]
		inputs.forEach(function(characters) {
			it(`'${characters}' should not be empty`, function() {
				expect((new Seq(characters)).isEmpty()).false
			})
		})
	})

	describe('invalidSymbol', function() {
		it('should equal "@"', function() {
			expect(defaultSeq.invalidSymbol()).equal('@')
		})
	})

	describe('isValid', function() {
		it('default constructed sequence should be valid', function() {
			expect(defaultSeq.isValid()).true
		})

		it('all alphabetic characters should be valid', function() {
			let seq = new Seq('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
			expect(seq.isValid()).true
		})

		let inputs = '1234567890!@#$%^&*()-_=+`~,./;\'\\<>?"{}|'.split('')
		inputs.forEach(function(character) {
			it(`'${character}' should not be valid`, function() {
				expect((new Seq(character)).isValid()).false
			})
		})
	})

	describe('length', function() {
		it('default constructed sequence should have zero length', function() {
			expect(defaultSeq.length()).equal(0)
		})

		it('ATG should have length 3', function() {
			let seq = new Seq('ATG')
			expect(seq.length()).equal(3)
		})

		it('dirty characters should not count towards length', function() {
			let seq = new Seq(' A T G')
			expect(seq.length()).equal(3)
		})
	})

	describe('sequence', function() {
		it('default constructed sequence should return empty string', function() {
			expect(defaultSeq.sequence()).a('string')
			expect(defaultSeq.sequence()).equal('')
		})

		it('basic sequence should be retrievable', function() {
			let seq = new Seq('ATG')
			expect(seq.sequence()).equal('ATG')
		})

		it('whitespace should not be removed', function() {
			let seq = new Seq(' A\nTG\n')
			expect(seq.sequence()).equal('ATG')
		})

		it('all characters should be upper-cased', function() {
			let seq = new Seq('atg')
			expect(seq.sequence()).equal('ATG')
		})

		it('invalid characters should be replaced with the invalid symbol', function() {
			let seq = new Seq('A1T%G'),
				seqString = 'A' + seq.invalidSymbol() + 'T' + seq.invalidSymbol() + 'G'
			expect(seq.sequence()).equal(seqString)
		})
	})

	describe('seqId', function() {
		let fixtures = [
			{
				seqId: 'yg8A8H8N-4x1Ezf8WW-YbA',
				sequence: 'MTNVLIVEDEQAIRRFLRTALEGDGMRVFEAETLQRGLLEAATRKPDLIILDLGLPDGDGIEFIRDLRQWSAVPVIVLSARSEESDKIAALDAGADDYLSKPFGIGELQARLRVALRRHSATTAPDPLVKFSDVTVDLAARVIHRGEEEVHLTPIEFRLLAVLLNNAGKVLTQRQLLNQVWGPNAVEHSHYLRIYMGHLRQKLEQDPARPRHFITETGIGYRFML'
			},
			{
				seqId: 'naytI0dLM_rK2kaC1m3ZSQ',
				sequence: 'MNNEPLRPDPDRLLEQTAAPHRGKLKVFFGACAGVGKTWAMLAEAQRLRAQGLDIVVGVVETHGRKDTAAMLEGLAVLPLKRQAYRGRHISEFDLDAALARRPALILMDELAHSNAPGSRHPKRWQDIEELLEAGIDVFTTVNVQHLESLNDVVSGVTGIQVRETVPDPFFDAADDVVLVDLPPDDLRQRLKEGKVYIAGQAERAIEHFFRKGNLIALRELALRRTADRVDEQMRAWRGHPGEEKVWHTRDAILLCIGHNTGSEKLVRAAARLASRLGSVWHAVYVETPALHRLPEKKRRAILSALRLAQELGAETATLSDPAEEKAVVRYAREHNLGKIILGRPASRRWWRRETFADRLARIAPDLDQVLVALDEPPARTINNAPDNRSFKDKWRVQIQGCVVAAALCAVITLIAMQWLMAFDAANLVMLYLLGVVVVALFYGRWPSVVATVINVVSFDLFFIAPRGTLAVSDVQYLLTFAVMLTVGLVIGNLTAGVRYQARVARYREQRTRHLYEMSKALAVGRSPQDIAATSEQFIASTFHARSQVLLPDDNGKLQPLTHPQGMTPWDDAIAQWSFDKGLPAGAGTDTLPGVPYQILPLKSGEKTYGLVVVEPGNLRQLMIPEQQRLLETFTLLVANALERLTLTASEEQARMASEREQIRNALLAALSHDLRTPLTVLFGQAEILTLDLASEGSPHARQASEIRQHVLNTTRLVNNLLDMARIQSGGFNLKKEWLTLEEVVGSALQMLEPGLSSPINLSLPEPLTLIHVDGPLFERVLINLLENAVKYAGAQAEIGIDAHVEGENLQLDVWDNGPGLPPGQEQTIFDKFARGNKESAVPGVGLGLAICRAIVDVHGGTITAFNRPEGGACFRVTLPQQTAPELEEFHEDM'
			},
			{
				seqId: 'GS8z3QwN5MzpxU0aTuxuaA',
				sequence: 'MSGLRPALSTFIFLLLITGGVYPLLTTVLGQWWFPWQANGSLIREGDTVRGSALIGQNFTGNGYFHGRPSATAEMPYNPQASGGSNLAVSNPELDKLIAARVAALRAANPDASASVPVELVTASASGLDNNITPQAAAWQIPRVAKARNLSVEQLTQLIAKYSQQPLVKYIGQPVVNIVELNLALDKLDE'
			},
			{
				seqId: '1B2M2Y8AsgTpgAmY7PhCfg',
				sequence: ''
			}
		]

		fixtures.forEach(function(fiture) {
			it(`${fiture.seqId} from ${fiture.sequence.substr(0, 32) + '...'}`, function() {
				let seq = new Seq(fiture.sequence)
				expect(seq.seqId()).equal(fiture.seqId)
			})
		})
	})
})
