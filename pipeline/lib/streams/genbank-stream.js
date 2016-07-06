'use strict'

// Core
const assert = require('assert'),
	stream = require('stream'),
	StringDecoder = require('string_decoder').StringDecoder

// Vendor
const split = require('split'),
	pumpify = require('pumpify')

// Local
const GenbankKeywordNode = require('../bio/GenbankKeywordNode')

// Constants
const kKeywordInformationOffset = 12,
	kOriginSequenceOffset = 10,
	kFeatureInformationOffset = 21,
	kNumLocusFields = 7
	// kIgnoredKeywords = new Set([
	// 	'NID',
	// 	'PROJECT',
	// 	'BASE COUNT'
	// ])
	// kDivisionCodes = new Set([
	// 	'PRI', // primate
	// 	'ROD', // rodent
	// 	'MAM', // other mammalian
	// 	'VRT', // other vertebrate
	// 	'INV', // invertebrate
	// 	'PLN', // plant, fungal, and algal
	// 	'BCT', // bacterial
	// 	'VRL', // viral
	// 	'PHG', // bacteriophage
	// 	'SYN', // synthetic
	// 	'UNA', // unannotated
	// 	'EST', // expressed sequence tags
	// 	'PAT', // patent
	// 	'STS', // sequence tagged sites
	// 	'GSS', // genome survey sequences
	// 	'HTG', // high throughput genomic
	// 	'HTC', // high throughput cDNA
	// 	'ENV', // environental sampling
	// 	'CON', // constructed
	// 	'TSA'  // transcriptome shotgun assembly sequences
	// ])

/**
 * Parses one or more input GenBank records and emits a corresponding POD encapsulatingthis
 * information.
 *
 * Only performs limited validation. For example, this script checks for 7 whitespace separated
 * values following the LOCUS keyword; however, the actual values themselves are not inspected.
 * Thus, most validation is delegated to other classes. No checks are done to ensure that all
 * data is present. GenbankStream happily emits sparsely populated PODs with what information
 * is able to be extracted. If a keyword that should only appear once is found twice an error is
 * thrown.
 *
 * For example:
 *
 * '//' --> empty POD ({locus: null, ...})
 *
 * `LOCUS ...
 * //` --> will only have the locus line values.
 *
 * For the GenBank record specification, please see Section 3.4.2 Entry Organization of
 * ftp://ftp.ncbi.nih.gov/genbank/gbrel.txt
 *
 * Feature table specification: http://www.insdc.org/files/feature_table.html
 *
 * Resulting Genbank PODs look like the following (assuming all fields are present):
 *
 * {
 *   locus
 *   definition
 *   accession: {
 *     primary
 *     secondary: [...] (null if none are provided, may contain a range XXX-YYYY)
 *   }
 *   version
 *   dbLink: {
 *     <resource>: [...]
 *     ...
 *   }
 * }
 *
 * Notes:
 * - Old GenBank formats (e.g. those predating 2004) are not supported
 *
 * - Because GI numbers are being phased out, these are not parsed from the VERSION line
 *
 * - Merges all keywords into a single array regardless if they are separated on multiple period
 *   separated entries.
 *
 * - Processes each root keyword section one by one and only after the entire root keyword and
 *   any sub-keyword lines have been read.
 *
 * - Generically parses any and all keywords / subkeywords as though each may span multiple lines;
 *   however, only recognized keywords are processed and streamed. Unrecognized keywords do not
 *   have any constraints (apart from the base GenBank format). Recognized keywords and their
 *   associated subkeywords though, are streamed and loosely validated (e.g. DEFINITION does not
 *   have to end with a period, SOURCE must have an ORGANISM subkeyword).
 *
 * - No root keyword may occur multiple times per entry.
 *
 * Feature table parsing notes
 * - Key names are limited to 15 characters
 * - Qualifier names are limited to 20 characters
 * - Key and qualifier names must have at least one letter and may contain any of:
 *   A-Z, a-z, 0-9, _, -, ', *
 * - Each feature key has a location that may span multiple lines. If there are any qualifiers,
 *   these begin immediately after the location line.
 * - qualifier values belong to one of 4 classes:
 *   1) Free text: enclosed in double quotes, if double quotes are used internally, these are
 *      escaped by using a second quotation mark immediately before the first one.
 *   2) Enumerated values: case insensitive
 *   3) Citation / reference numbers: unsigned integer enclosed in square brackets
 *   4) Sequences: illegal since 1998 (therefore ignored)
 *
 * - Column positions
 *   1-5 blank
 *   6-20 feature key name
 *   21 blank
 *   22-80 location
 *
 * - No spaces are permitted between the qualifier name and the preceding / or =
 * - Location operators may not have a space between its name and the opening parenthesis
 * - Valid boolean values are yes and no
 * - <integer> refers to unsigned integer values
 *
 * - Unfortunately, the INSDC does not document which qualifiers may have multiple
 *   values (which are formatted with repeating qualifier names). I presume this is
 *   to make it more extensible and simpler to augment by 3rd parties. To this end,
 *   all qualifier values are wrapped inside an array (which will usually only have
 *   one element). The only exception to this rule are valueless qualifiers (e.g.
 *   /pseudo) which are assigned true.
 *
 *   The resulting data structure is harder to read and more bulky; however, it
 *   provides a reliable output for consumers as well as supporting future qualifiers
 *   with multiple values without having to modify the code.
 */
class GenbankStream extends stream.Transform {
	constructor(options = {}) {
		options.objectMode = true
		super(options)

		this.decoder_ = new StringDecoder('utf8')
		this.entry_ = null

		this.observedRootKeywords_ = new Set()
		this.rootKeywordNode_ = null
		this.currentKeywordNode_ = null

		// Because the feature table is so large, it utilizes slightly different parsing
		// logic than the other keywords. This flag simplifies checking that we are in
		// the feature table section.
		this.parsingFeatures_ = false
		this.currentFeature_ = null
		this.currentQualifierName_ = null
		this.currentQualifierValue_ = null
	}

	// ----------------------------------------------------
	// Overrided methods
	_transform(rawLine, encoding, done) {
		let line = this.decoder_.write(rawLine)

		try {
			// --------------------------------------------
			if (!this.entry_) {
				// Ignore blank lines between records (or at the end of the file)
				if (!line || /^\s*$/.test(line)) {
					done()
					return
				}
				this.entry_ = this.blankEntry_()
			}

			// --------------------------------------------
			if (this.parsingFeatures_) {
				// Hackish way of checking for another keyword without the full check
				let anotherFeatureLine = line[0] === ' '
				if (anotherFeatureLine) {
					this.handleFeatureLine_(line)
					done()
					return
				}

				this.handleCurrentQualifier_()
				if (this.currentFeature_) {
					this.entry_.features.push(this.currentFeature_)
					this.currentFeature_ = null
				}

				this.parsingFeatures_ = false
			}

			// --------------------------------------------
			if (this.isKeywordContinuationLine_(line)) {
				if (!this.currentKeywordNode_)
					throw new Error('Keyword continuation line found without associated keyword')

				// Special handling of different
				let keywordInfoOffset = null
				switch (this.currentKeywordNode_.keyword()) {
					case 'ORIGIN':
						keywordInfoOffset = kOriginSequenceOffset
						break
				}

				this.currentKeywordNode_.pushLine(this.extractKeywordInfo_(line, keywordInfoOffset))
				done()
				return
			}

			// --------------------------------------------
			let keyword = this.keywordFromLine_(line)
			if (keyword) {
				this.handleKeywordLine_(keyword, this.extractKeywordInfo_(line))
				done()
				return
			}

			// --------------------------------------------
			let isTerminator = line[0] === '/' && line[1] === '/'
			if (isTerminator) {
				this.processRootKeywordNode_()
				this.push(this.entry_)
				this.resetForNextEntry_()
				done()
				return
			}

			throw new Error(`Internal error; unhandled line: ${line}`)
		}
		catch (error) {
			done(error)
		}
	}

	_flush(done) {
		if (this.entry_)
			done(new Error('Last record missing record terminator: //'))
		else
			done()
	}

	// ----------------------------------------------------
	// Private methods
	resetForNextEntry_() {
		this.entry_ = null
		this.observedRootKeywords_.clear()
	}

	/**
	 * @returns {object} blank result initialized with null values
	 */
	blankEntry_() {
		return {
			locus: null,
			definition: null,
			accession: null,
			version: null,
			dbLink: null,
			keywords: null,
			segment: null,
			source: null,
			references: [],
			comment: null,
			features: [],
			contig: null,
			origin: null
		}
	}

	extractKeywordInfo_(line, optOffset) {
		return line.substr(optOffset || kKeywordInformationOffset).trim()
	}

	handleKeywordLine_(keyword, keywordInfo) {
		let keywordNode = new GenbankKeywordNode(keyword, keywordInfo),
			keywordLevel = keywordNode.level()

		let isRootKeyword = keywordLevel === 0
		if (isRootKeyword) {
			this.processRootKeywordNode_()

			// Special case: REFERENCE may occur multiple times
			if (keyword !== 'REFERENCE' && this.observedRootKeywords_.has(keyword))
				throw new Error(`Record contains multiple ${keyword} lines`)
			this.observedRootKeywords_.add(keyword)

			this.rootKeywordNode_ =	this.currentKeywordNode_ = keywordNode

			if (keyword === 'FEATURES')
				this.parsingFeatures_ = true

			return
		}

		// Child of the current keyword node
		// (current) root -> Level 1 (keywordNode) OR
		// (current) level 1 -> level 2 (keywordNode)
		let parentNode = this.currentKeywordNode_

		// Sibling
		// (current) level 1 -> level 1 (keywordNode) OR
		// (current) level 2 -> level 2 (keywordNode)
		if (keywordLevel === this.currentKeywordNode_.level())
			parentNode = this.currentKeywordNode_.parent()
		// Level 2 -> Level 1 (keywordNode)
		else if (keywordLevel + 1 === this.currentKeywordNode_.level())
			parentNode = this.currentKeywordNode_.parent().parent()

		if (parentNode.level() + 1 !== keywordLevel)
			throw new Error(`invalid sublevel for keyword: ${keyword}`)

		parentNode.addChild(keywordNode)
		this.currentKeywordNode_ = keywordNode
	}

	isKeywordContinuationLine_(line) {
		return /^ {10}/.test(line) || (
			this.currentKeywordNode_ &&
			this.currentKeywordNode_.keyword() === 'ORIGIN' &&
			/^\s*\d+ $/.test(line.substr(0, kOriginSequenceOffset))
		)
	}

	/**
	 * Based on the specification, looks for the following cases:
	 * 1) Keyword beginning at the first column up to a maximum of 10 characters
	 * 2) Subkeyword beginning in column 3 and up to 8 characters long
	 * 3) Subkeyword beginning in column 4 and up to 7 characters long
	 *
	 * @param {string} line the input line to inspect
	 * @returns {string} any matching keyword or subkeyword (with prefixed spacing); null otherwise
	 */
	keywordFromLine_(line) {
		let keyword = null,
			matches = /^([A-Z ]{1,10}| {2}[A-Z ]{1,8}| {3}[A-Z ]{1,7}) {2}/.exec(line)
		if (matches)
			keyword = matches[1].trimRight()
		return keyword || null
	}

	/**
	 * Features are parsed and handled separately
	 * @returns {undefined}
	 */
	processRootKeywordNode_() {
		let rootNode = this.rootKeywordNode_
		if (!rootNode)
			return

		switch (rootNode.keyword()) {
			case 'LOCUS':
				this.entry_.locus = this.parseLocus_(rootNode)
				break
			case 'DEFINITION':
				this.entry_.definition = this.parseNodeValue_(rootNode)
				break
			case 'ACCESSION':
				this.entry_.accession = this.parseAccession_(rootNode)
				break
			case 'VERSION':
				this.entry_.version = this.parseVersion_(rootNode)
				break
			case 'SEGMENT':
				this.entry_.segment = this.parseSegment_(rootNode)
				break
			case 'DBLINK':
				this.entry_.dbLink = this.parseDbLink_(rootNode)
				break
			case 'KEYWORDS':
				this.entry_.keywords = this.parseKeywords_(rootNode)
				break
			case 'SOURCE':
				this.entry_.source = this.parseSource_(rootNode)
				break
			case 'REFERENCE':
				this.entry_.references.push(this.parseReference_(rootNode))
				break
			case 'COMMENT':
				this.entry_.comment = this.parseComment_(rootNode)
				break
			case 'CONTIG':
				this.entry_.contig = this.parseContig_(rootNode)
				break
			case 'ORIGIN':
				this.entry_.origin = this.parseOrigin_(rootNode)
				break

			default:
				this.emit('warning', `unhandled root keyword: ${rootNode.keyword()}`)
				break
		}

		this.rootKeywordNode_ = this.currentKeywordNode_ = null
	}

	/**
	 * The LOCUS line is structured with values in specific position ranges; however, it is recommended
	 * to use a token based approach for parsing and not rely on actual positions in case this changes
	 * in the future.
	 *
	 * @param {string} locusNode contains the expected locus fields without 'LOCUS'
	 * @returns {object} parsed locus values
	 */
	parseLocus_(locusNode) {
		let lines = locusNode.lines()
		if (lines.length > 1)
			throw new Error('LOCUS may not span multiple lines')

		let keywordInfo = lines[0],
			parts = keywordInfo.split(/\s+/),
			hasRightNumFields = parts.length === kNumLocusFields
		if (!hasRightNumFields)
			throw new Error(`LOCUS line does not have ${kNumLocusFields} fields: ${keywordInfo}`)

		/* eslint-disable no-magic-numbers */
		return {
			name: parts[0],
			bp: Number(parts[1]),
			// (ss-|ds-|ms-)(NA|DNA|RNA|tRNA|rRNA|mRNA|uRNA)
			// ss- = single stranded
			// ds- = double stranded
			// ms- = mixed stranded
			// uRNA = small nuclear RNA
			moleculeType: parts[3],
			topology: parts[4],
			divisionCode: parts[5],
			date: parts[6]
		}
		/* eslint-enable no-magic-numbers */
	}

	parseAccession_(accessionNode) {
		let accessions = accessionNode.joinedLines().split(/\s+/),
			primaryAccession = accessions.shift()

		if (!primaryAccession)
			throw new Error('ACCESSION value is required')

		return {
			primary: primaryAccession,
			secondary: accessions
		}
	}

	parseVersion_(versionNode) {
		let lines = versionNode.lines(),
			version = lines[0]
		if (lines.length > 1)
			throw new Error('VERSION may not span multiple lines')

		if (!version)
			throw new Error('VERSION value is required')

		let matches = /^(\w+\.[1-9]\d*)/.exec(version)
		if (!matches)
			throw new Error('VERSION value must contain a compound accession with the primary accession and its corresponding version separated by a period')

		return matches[1]
	}

	/**
	 * The specification does not indicate if the values for a given resource may span multiple
	 * lines; however, this seems like a likely probability and thus is handled here.
	 *
	 * Because there may be multiple identifiers associated with a specific resource, the value
	 * for each resource is encapsulated in an array.
	 *
	 * As of April 2013, the supported DBLINK cross-reference types are "Project" (predecessor of
	 * BioProject), "BioProject", "BioSample", "Trace Assembly Archive", Sequence Read Archive",
	 * and "Assembly". But rather than just support this set, generically parses all resources
	 * that adhere to the format '<resource name>:<csv list of identifiers>'.
	 *
	 * @param {GenbankKeywordNode} dbLinkNode associated keywordInfo lines
	 * @returns {object} map of the associated resource and their associated identifiers
	 */
	parseDbLink_(dbLinkNode) {
		let result = {},
			currentResource = null,
			currentIdString = null,
			lines = dbLinkNode.lines(),
			firstLine = lines.shift(),
			matches = this.parseDbLinkResource_(firstLine)

		if (!matches)
			throw new Error('DBLINK invalid value; expected format <resource name>:<id[,id...]>')

		currentResource = matches[1]
		currentIdString = matches[2]

		lines.forEach((line) => {
			let resourceMatches = this.parseDbLinkResource_(line)
			if (resourceMatches) {
				result[currentResource] = currentIdString.split(',')
				currentResource = resourceMatches[1]
				currentIdString = resourceMatches[2]
			}
			else {
				// This means that the ids carried on to the next line
				if (line.indexOf(':') >= 0)
					throw new Error('DBLINK continuation line has unexpected colon character; resource name must begin the line and immediately be followed by a colon')

				// Flexibly handle cases where identifiers span multiple lines and have inconsistent commas
				let currentEndsWithComma = currentIdString.endsWith(','),
					lineStartsWithComma = line.startsWith(',')
				if (currentEndsWithComma && lineStartsWithComma)
					currentIdString += line.substr(1)
				else if (!currentEndsWithComma && !lineStartsWithComma)
					currentIdString += ',' + line
				else
					currentIdString += line
			}
		})

		result[currentResource] = currentIdString.split(',')

		// Check that there are no invalid identifiers
		for (let resource in result) {
			result[resource].forEach((identifier, i) => {
				let isInvalidIdentifier = !identifier || /\s/.test(identifier)
				if (isInvalidIdentifier)
					throw new Error(`DBLINK identifier cannot contain whitespace or be empty; associated resource: ${resource}`)

				if (/^\d+$/.test(identifier))
					result[resource][i] = Number(identifier)
			})
		}

		return result
	}

	parseDbLinkResource_(line) {
		let matches = /^([\w-. ]+\w):\s*(\S.*)/.exec(line)
		if (matches)
			matches[2] = matches[2].trim()
		return matches
	}

	/**
	 * Ignores empty values and removes duplicates.
	 *
	 * @param {GenbankKeywordNode} keywordNode input keyword lines
	 * @returns {Array.<string>} unique, non-empty keyword result
	 */
	parseKeywords_(keywordNode) {
		let keywordString = keywordNode.joinedLines()
		if (!keywordString)
			throw new Error('KEYWORDS value is required')

		let keywords = keywordString.substr(0, keywordString.length - 1)
			.trim()
			.replace(/\./g, ';')
			.split(/\s*;\s*/),
			truthyKeywords = keywords.filter((keyword) => !!keyword),
			uniqueKeywords = [...new Set(truthyKeywords)]

		return uniqueKeywords
	}

	parseSegment_(segmentNode) {
		if (segmentNode.lines().length > 1)
			throw new Error('SEGMENT may not span multiple lines')

		let matches = /^([1-9]\d*) of ([1-9]\d*)/.exec(segmentNode.lines()[0])
		if (!matches)
			throw new Error('SEGMENT must adhere to the format: <digits> of <digits')

		return {
			number: Number(matches[1]),
			total: Number(matches[2])
		}
	}

	/**
	 * The first line of the ORGANISM sub-keyword contains the formal scientific name; however,
	 * due to names exceeding 68 characters (80 - 13 + 1), this value may span multiple lines.
	 * Thus, to distinguish when the formal name completes and the taxonomic classification
	 * begins, it is necessary to look for semicolons to determine the first taxonomic line.
	 * Obviously if the first taxonomic value is greater than 68 characters, this will be
	 * erroneously considered part of the common name.
	 *
	 * @param {GenbankKeywordNode} sourceNode root node containing SOURCE information
	 * @returns {object} parsed information
	 */
	parseSource_(sourceNode) {
		let result = {
			commonName: sourceNode.joinedLines(),
			formalName: null,
			taxonomicRanks: null
		}

		if (!result.commonName)
			throw new Error('SOURCE value is required')

		let organismNode = sourceNode.child('  ORGANISM')
		if (!organismNode)
			return result

		let organismLines = organismNode.lines(),
			taxonomy = '',
			ontoTaxonomy = false
		result.formalName = organismLines[0]
		if (result.formalName.indexOf(';') >= 0)
			throw new Error('  ORGANISM formal name (first line) may not contain a semicolon')
		for (let i = 1; i < organismLines.length; i++) {
			let line = organismLines[i]
			if (ontoTaxonomy) {
				taxonomy += ` ${line}`
			}
			else if (line.indexOf(';') >= 0) {
				ontoTaxonomy = true
				taxonomy = line
			}
			else {
				result.formalName += ` ${line}`
			}
		}

		if (!result.formalName)
			throw new Error('  ORGANISM value (formal name) is required')

		if (!taxonomy)
			throw new Error('  ORGANISM taxonomic classification is missing')

		if (taxonomy.endsWith('.'))
			taxonomy = taxonomy.slice(0, -1)

		result.taxonomicRanks = taxonomy.split(/;\s*/)

		return result
	}

	parseReference_(referenceNode) {
		let value = referenceNode.joinedLines()
		if (!value)
			throw new Error('REFERENCE value is required')

		let matches = /^([1-9]\d*)/.exec(value)
		if (!matches)
			throw new Error('REFERENCE must adhere to the format <number>[ <notes>]')

		let journalNode = referenceNode.child('  JOURNAL'),
			remainingValue = value.substr(matches[1].length)

		if (remainingValue && remainingValue[0] !== ' ')
			throw new Error('REFERENCE must adhere to the format <number>[ <notes>]')

		return {
			number: Number(matches[1]),
			notes: remainingValue.trim() || null,
			authors: this.parseNodeValue_(referenceNode.child('  AUTHORS')),
			consortium: this.parseNodeValue_(referenceNode.child('  CONSRTM')),
			title: this.parseNodeValue_(referenceNode.child('  TITLE')),
			journal: this.parseNodeValue_(journalNode),
			pubmed: journalNode ? this.parseNumber_(journalNode.child('   PUBMED')) : null,
			medline: this.parseNumber_(referenceNode.child('  MEDLINE')),
			remark: this.parseNodeValue_(referenceNode.child('  REMARK'))
		}
	}

	parseNodeValue_(keywordNode) {
		if (!keywordNode)
			return null

		let result = keywordNode.joinedLines()
		if (!result)
			throw new Error(`${keywordNode.keyword()} value may not be empty`)

		return result
	}

	parseNumber_(keywordNode) {
		if (!keywordNode)
			return null

		let value = keywordNode.lines()[0]
		if (!value)
			throw new Error(`${keywordNode.keyword()} value may not be empty`)

		if (keywordNode.lines().length > 1)
			throw new Error(`${keywordNode.keyword()} value may not span multiple lines`)

		if (!/^\d*$/.test(value))
			throw new Error(`${keywordNode.keyword()} value is not a valid unsigned integer`)

		return Number(value)
	}

	parseComment_(keywordNode) {
		let value = keywordNode.lines().join('\n')
		if (!value)
			throw new Error('COMMENT value may not be empty')

		return value.trimRight()
	}

	parseContig_(contigNode) {
		let value = contigNode.lines()
			.join('')
			.trim()

		if (!value)
			throw new Error('CONTIG value may not be empty')

		return value
	}

	parseOrigin_(originNode) {
		let sequenceLines = originNode.lines()
		sequenceLines.shift() // Ignore first line

		return sequenceLines
			.join('')
			.replace(/ /g, '')
	}

	// ----------------------------------------------------
	// Feature table parsing
	/**
	 * Handles the parsing of all lines contained within the feature table section. There are
	 * two cases that must be considered:
	 * 1) The line begins a new feature
	 * 2) The line is a continuation line of an existing feature
	 *
	 * @param {string} line input line belonging to feature table
	 * @returns {undefined}
	 */
	handleFeatureLine_(line) {
		// Case 2: continuation line
		// Continuation line logic before new feature lines because there will be more continuation
		// lines than new feature lines
		if (this.isFeatureContinuationLine_(line)) {
			this.handleFeatureContinuationLine_(line)
			return
		}

		// Case 1: a new feature is beginning
		let feature = this.featureFromLine_(line)
		if (feature) {
			if (!feature.location)
				throw new Error(`feature ${feature.name} does not have a location`)

			if (this.currentFeature_) {
				this.handleCurrentQualifier_()
				this.entry_.features.push(this.currentFeature_)
			}

			this.currentFeature_ = feature
			return
		}

		throw new Error('Internal error: unexpected feature table line: ' + line)
	}

	handleFeatureContinuationLine_(line) {
		if (!this.currentFeature_)
			throw new Error('Feature continuation line found without associated feature key')

		// Three cases:
		// 1) Continuation of the feature location
		// 2) Beginning of a qualifier
		// 3) Continuation of an existing qualifier

		let featureInfo = this.extractFeatureInfo_(line),
			isQualifier = featureInfo.startsWith('/')

		if (!featureInfo)
			throw new Error('Blank feature lines are not allowed')

		// Case 2: start of another qualifier
		if (isQualifier) {
			let qualifier = this.parseQualifier_(featureInfo)
			if (qualifier.name === 'key' || qualifier.name === 'location')
				throw new Error('qualifier name must not be "key" or "location"')

			this.handleCurrentQualifier_()

			this.currentQualifierName_ = qualifier.name
			this.currentQualifierValue_ = qualifier.value
			return
		}

		// Case 1: location spans multiple lines
		let isLocationContinuation = !isQualifier && !this.currentQualifierName_
		if (isLocationContinuation) {
			this.currentFeature_.location += featureInfo
			return
		}

		// Case 3: qualifier continuation line
		assert(this.currentQualifierName_, 'Feature qualifier continuation line is not associated qualifier name')
		if (!this.currentQualifierValue_)
			throw new Error('Feature qualifier continuation line is missing initial value')

		this.currentQualifierValue_ += ` ${featureInfo}`
	}

	featureFromLine_(line) {
		let matches = /^ {5}([\w_\-'*]{1,15}) /.exec(line)
		if (matches) {
			return {
				key: matches[1],
				location: this.extractFeatureInfo_(line)
			}
		}

		return null
	}

	isFeatureContinuationLine_(line) {
		return /^ {21}\S/.test(line)
	}

	extractFeatureInfo_(line) {
		return line.substr(kFeatureInformationOffset).trim()
	}

	/**
	 * Any processing of the qualifier value should be postponed to when all lines of the qualifier
	 * have been parsed (::handleCurrentQualifier_()) and not in this function.
	 *
	 * @param {string} featureInfo the first line (and perhaps the only line) of the qualifier value
	 * @returns {object} initial qualifier name and value
	 */
	parseQualifier_(featureInfo) {
		let matches = /^\/([\w_\-'*]{1,20})(?:=(.+))?/.exec(featureInfo)
		if (!matches)
			throw new Error('Invalid feature qualifier line')

		return {
			name: matches[1],
			value: typeof matches[2] === 'string' ? matches[2].trim() : true
			// qualifiers without any value are given value of          ^^^^
			// true. For example, the pseudo qualifier. This facilitates
			// testing for this value in the resulting object.
		}
	}

	handleCurrentQualifier_() {
		if (!this.currentQualifierName_)
			return

		let value = this.currentQualifierValue_
		if (typeof value === 'string') {
			let startsWithQuote = value.startsWith('"'),
				endsWithQuote = value.endsWith('"'),
				freeFormText = startsWithQuote || endsWithQuote
			if (startsWithQuote && !endsWithQuote || !startsWithQuote && endsWithQuote)
				throw new Error(`Invalid qualifier free-form text for qualifier, ${this.currentQualifierName_}: missing beginning / end quotes`)
			else if (freeFormText)
				// Remove the leading and trailing quotes, and decode double quotes
				value = value.slice(1, -1).replace(/""/g, '"')
			else if (/^-?\d+(\.\d*)?$/.test(value))
				value = Number(value)
		}

		// ---------------------------------------
		// All lines have been parsed for this qualifier. Perform any relevant processing
		// before pushing onto the current feature.
		switch (this.currentQualifierName_) {
			case 'translation':
				value = value.replace(/\s+/g, '')
				break
		}

		let hasValue = value !== true
		if (hasValue) {
			// All qualifier values are stored inside arrays to accommodate multiple
			// values with the same qualifier name
			if (!this.currentFeature_[this.currentQualifierName_])
				this.currentFeature_[this.currentQualifierName_] = [value]
			else
				this.currentFeature_[this.currentQualifierName_].push(value)
		}
		else {
			// e.g. /pseudo
			this.currentFeature_[this.currentQualifierName_] = value
		}

		this.currentQualifierName_ = null
		this.currentQualifierValue_ = null
	}
}

module.exports = function(options) {
	return pumpify.obj(split(), new GenbankStream(options))
}
