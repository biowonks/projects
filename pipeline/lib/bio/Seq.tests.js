/* eslint-disable no-unused-expressions, no-magic-numbers */

'use strict'

let Seq = require('./Seq')

describe('Seq', function() {
	let defaultSeq = new Seq()

	describe('clone', function() {
		it('creates an identical, yet distinct sequence')
	})

	describe('fastaSequence', function() {
		let defaultCharsPerLine = Seq.kDefaultCharsPerLine,
			sequence = 'AAAAATTTTTGGGGGCCCCC',
			seq = new Seq(sequence)

		before(() => {
			Seq.kDefaultCharsPerLine = 5
		})

		after(() => {
			Seq.kDefaultCharsPerLine = defaultCharsPerLine
		})

		it('default charsPerLine', function() {
			expect(seq.fastaSequence()).equal('AAAAA\nTTTTT\nGGGGG\nCCCCC\n')
		})

		it('0 charsPerLine assumes default charsPerLine', function() {
			expect(seq.fastaSequence()).equal('AAAAA\nTTTTT\nGGGGG\nCCCCC\n')
		})

		it('Negative charsPerLine throws error', function() {
			expect(function() {
				seq.fastaSequence(-1)
			}).throw(Error)
		})

		it('Non-number parameter throws error', function() {
			expect(function() {
				seq.fastaSequence('non-number')
			}).throw(Error)
		})

		it('charsPerLine > length returns entire sequence', function() {
			expect(seq.fastaSequence(sequence.length + 1)).equal(sequence + '\n')
		})

		it('charsPerLine === length returns entire sequence', function() {
			expect(seq.fastaSequence(sequence.length)).equal(sequence + '\n')
		})

		it('charsPerLine < length splits it into lines as expected', function() {
			expect(seq.fastaSequence(3)).equal('AAA\nAAT\nTTT\nTGG\nGGG\nCCC\nCC\n')
		})
	})

	describe('gcPercent', function() {
		it('returns the same results as seqUtil.gcPercent but using the Seq sequence')
	})

	describe('invalidSymbol', function() {
		it('should equal "@"', function() {
			expect(defaultSeq.invalidSymbol()).equal('@')
		})
	})

	describe('isEmpty', function() {
		it('default constructed sequence should be empty', function() {
			expect(defaultSeq.isEmpty()).true
		})

		it('non-space whitespace should be removed and result in empty sequence', function() {
			let seq = new Seq('\n\f\t\r\v')
			expect(seq.isEmpty()).true
		})

		it('surrounding whitespace should be trimmed', function() {
			let seq = new Seq(' \n ')
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

		it('A-Z, a-z, ., *, -, " " should be valid', function() {
			let seq = new Seq('ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz.*-')
			expect(seq.isValid()).true
		})

		let inputs = '1234567890!@#$%^&()_=+`~,/;\'\\<>?"{}|'.split('')
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

		it('surruonding spaces are trimmed and do not count towards the length', function() {
			let seq = new Seq(' ATG ')
			expect(seq.length()).equal(3)
		})

		it('internal spaces count towards length', function() {
			let seq = new Seq('A T G')
			expect(seq.length()).equal(5)
		})
	})

	describe('normalize', function() {
		it('removes internal whitespace and upper-cases sequence', function() {
			let seq = new Seq('a T g')
			seq.normalize()
			expect(seq.sequence()).equal('ATG')
		})

		it('returns itself', function() {
			let seq = new Seq('a T g')
			expect(seq.normalize()).equal(seq)
		})
	})

	describe('sequence', function() {
		it('default constructed sequence should return empty string', function() {
			expect(defaultSeq.sequence()).a('string')
			expect(defaultSeq.sequence()).equal('')
		})

		it('basic sequence should be retrievable', function() {
			let seq = new Seq('AtG')
			expect(seq.sequence()).equal('AtG')
		})

		it('all whitespace except internal spaces is removed', function() {
			let seq = new Seq(' A\n TG\n ')
			expect(seq.sequence()).equal('A TG')
		})

		it('case is not changed', function() {
			let seq = new Seq('aTg')
			expect(seq.sequence()).equal('aTg')
		})

		it('invalid characters should be replaced with the invalid symbol', function() {
			let seq = new Seq('A1T%G'),
				seqString = `A${seq.invalidSymbol()}T${seq.invalidSymbol()}G`
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

		function randomPosition(string) {
			return Math.floor(Math.random() * string.length)
		}

		function randomlyLowerCase(sequence) {
			let pos = randomPosition(sequence)
			return sequence.substr(0, pos) + sequence[pos].toLowerCase() + sequence.substr(pos + 1)
		}

		function randomlyInsertSpace(sequence) {
			let pos = randomPosition(sequence)
			return `${sequence.substr(0, pos)} ${sequence.substr(pos)}`
		}

		function changeCaseAndInjectWhitespace(sequence) {
			let result = sequence
			for (let i = 0; i < 10; i++) {
				result = randomlyLowerCase(result)
				result = randomlyInsertSpace(result)
			}

			return result
		}

		fixtures.forEach(function(fixture) {
			it(`${fixture.seqId} from ${fixture.sequence.substr(0, 32)}...`, function() {
				let seq = new Seq(fixture.sequence)
				expect(seq.seqId()).equal(fixture.seqId)
			})

			if (!fixture.sequence)
				return

			let mungedSequence = changeCaseAndInjectWhitespace(fixture.sequence)
			it(`${fixture.seqId} from ${mungedSequence.substr(0, 32)}...`, function() {
				let seq = new Seq(mungedSequence)
				expect(seq.seqId()).equal(fixture.seqId)
				expect(seq.sequence()).equal(mungedSequence.trim())
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
					{start: 12, stop: 12, expectedSequence: seqStr.substr(12 - 1, 1)}
				]

			examples.forEach(function(example) {
				it(`${example.start} .. ${example.stop} --> ${example.expectedSequence}`, function() {
					let result = linearSeq.subseq(example.start, example.stop)

					expect(result).instanceof(Seq)
					expect(result !== linearSeq).equal(true, 'subseq method should return new instance')
					expect(result.isCircular()).false

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
				{start: 15, stop: 5, expectedSequence: 'KLCVNMQWERT'},
				{start: 10, stop: 9, expectedSequence: 'SDFGHKLCVNMQWERTYIPA'}
			]

			examples.forEach(function(example) {
				it(`${example.start} .. ${example.stop} --> ${example.expectedSequence}`, function() {
					let result = circularSeq.subseq(example.start, example.stop)
					expect(result.sequence()).equal(example.expectedSequence)
					expect(result.isCircular()).false
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

		it('upper case', function() {
			expect(nucleotideSeq.complement().sequence()).equal('TTAACCGGRRYYWWSSMMKKXXNNTTTAAACCCGGG')
		})

		it('lower case', function() {
			let x = new Seq(nucleotideSeq.sequence().toLowerCase())
			expect(x.complement().sequence()).equal('ttaaccggrryywwssmmkkxxnntttaaacccggg')
		})

		it('non nucleotides should not be modified', function() {
			let x = new Seq('E')
			expect(x.complement().sequence()).equal('E')
		})
	})

	describe('reverseComplement', function() {
		let nucleotideSeq = new Seq('AATTGGCCYYRRWWSSKKMMXXNNAAATTTGGGCCC')
		it('reverse complementary', function() {
			expect(nucleotideSeq.reverseComplement().sequence()).equal('GGGCCCAAATTTNNXXKKMMSSWWYYRRGGCCAATT')
		})
		it('reverse complementary of reverse complement', function() {
			let sequence = nucleotideSeq
				.reverseComplement()
				.reverseComplement()
				.sequence()
			expect(sequence).equal(nucleotideSeq.sequence())
		})
	})
})
