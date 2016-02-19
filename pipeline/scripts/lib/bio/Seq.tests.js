'use strict'

let Seq = require('./Seq')

describe('Seq', function() {
	let defaultSeq = new Seq()

	describe('invalidSymbol', function() {
		it('should equal "@"', function() {
			expect(defaultSeq.invalidSymbol()).equal('@')
		})
	})

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

		fixtures.forEach(function(fixture) {
			it(`${fixture.seqId} from ${fixture.sequence.substr(0, 32) + '...'}`, function() {
				let seq = new Seq(fixture.sequence)
				expect(seq.seqId()).equal(fixture.seqId)
			})
		})
	})

	describe('setCircular, isCircular', function() {
		it('new Seqs are linear by default', function() {
			let seq = new Seq('ATG')
			expect(seq.isCircular()).false
		})

		it('returns seq instance', function() {
			let seq = new Seq('ATG'),
				tmp = seq.setCircular()

			expect(seq === tmp).true
		})

		it('set to circular', function() {
			let seq = new Seq('ATG')
			seq.setCircular()
			expect(seq.isCircular()).true
		})

		it('setCircular() -> setCircular(false) restores linear property', function() {
			let seq = new Seq('ATG')
			seq.setCircular()
			seq.setCircular(false)
			expect(seq.isCircular()).false
		})
	})

	describe('subseq', function() {
		let linearSeq = new Seq('QWERTYIPASDFGHKLCVNM'),
			//                   |   |    |    |    |  
			//                   1   5    10   15   20
			circularSeq = new Seq('QWERTYIPASDFGHKLCVNM').setCircular()

		describe('basic assertions', function() {
			it('start value of zero throws error', function() {
				expect(function() {
					linearSeq.subseq(0, 5)
				}).throw(Error)
			})

			it('negative start value throws error', function() {
				expect(function() {
					linearSeq.subseq(-1, 5)
				}).throw(Error)
			})

			it('stop value of zero throws error', function() {
				expect(function() {
					linearSeq.subseq(1, 0)
				}).throw(Error)
			})

			it('negative stop value throws error', function() {
				expect(function() {
					linearSeq.subseq(5, -1)
				}).throw(Error)
			})

			it('start value greater than length throws error', function() {
				expect(function() {
					linearSeq.subseq(linearSeq.length() + 1, 5)
				}).throw(Error)
			})

			it('stop value greater than length throws error', function() {
				expect(function() {
					linearSeq.subseq(1, linearSeq.length() + 1)
				}).throw(Error)
			})
		})

		describe('on linear sequences', function() {
			let seqStr = linearSeq.sequence(),
				examples = [
					{start: 1, stop: linearSeq.length(), expectedSequence: seqStr},
					{start: 2, stop: 5, expectedSequence: seqStr.substr(2 - 1, 5 - 2 + 1)},
					{start: 12, stop: 12, expectedSequence: seqStr.substr(12 - 1, 1)},
				]

			examples.forEach(function(example) {
				it(`${example.start} .. ${example.stop} --> ${example.expectedSequence}`, function() {
					let result = linearSeq.subseq(example.start, example.stop)

					expect(result).instanceof(Seq)
					expect(result !== linearSeq).equal(true, 'subseq method should return new instance')

					expect(result.sequence()).equal(example.expectedSequence)
				})
			})

			it('start greater than stop throws error', function() {
				expect(function() {
					linearSeq.subseq(15, 10)
				}).throw(Error)
			})
		})

		describe('on circular sequences', function() {
			let examples = [
				{start: 15, stop: 5, expectedSequence: 'KLCVNM' + 'QWERT'},
				{start: 10, stop: 9, expectedSequence: 'SDFGHKLCVNM' + 'QWERTYIPA'}
			]

			examples.forEach(function(example) {
				it(`${example.start} .. ${example.stop} --> ${example.expectedSequence}`, function() {
					let result = circularSeq.subseq(example.start, example.stop)
					expect(result.sequence()).equal(example.expectedSequence)
				})
			})
		})
	})

	describe('complement', function() {
		let nucleotideSeq = new Seq('AATTGGCCYYRRWWSSKKMMXXNNAAATTTGGGCCC')

		it('should return Seq', function() {
			let x = new Seq('A'),
				result = x.complement()

			expect(result).instanceof(Seq)
			expect(result !== x).true
		})

		it('empty sequence should return empty sequence', function() {
			let x = new Seq()
			expect(x.complement().sequence()).equal('')
		})

		it('complementary', function() {
			expect(nucleotideSeq.complement().sequence()).equal('TTAACCGGRRYYWWSSMMKKXXNNTTTAAACCCGGG')
		})

		it('lower case letters throw error', function() {
			let x = new Seq('at', true)
			expect(function() {
				x.complement()
			}).throw(Error)
		})

		it('non nucleotides should throw error', function() {
			let x = new Seq('E')
			expect(function() {
				x.complement()
			}).throw(Error)
		})
	})

	describe('reverseComplement', function() {
		let nucleotideSeq = new Seq('AATTGGCCYYRRWWSSKKMMXXNNAAATTTGGGCCC')
		it('reverse complementary', function() {
			expect(nucleotideSeq.reverseComplement().sequence()).equal('GGGCCCAAATTTNNXXKKMMSSWWYYRRGGCCAATT')
		})
		it('reverse complementary of reverse complement', function() {
			expect(nucleotideSeq.reverseComplement().reverseComplement().sequence()).equal(nucleotideSeq.sequence())
		})
	})
})
