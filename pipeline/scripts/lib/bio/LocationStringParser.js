/**
 * Parses feature locations typically associated with GenBank records. The resulting Location
 * object may be paired with a source DNA sequence to produce the source transcript.
 *
 * Locations vary in complexity from single bases to multiple transformations of join, complement,
 * order, etc. The location string is first parsed into a tree representation and then traversed
 * to produce a single location object representing this location string.
 */

'use strict'

// Core node libraries
let assert = require('assert')

// Local includes
let LocationPoint = require('./LocationPoint'),
	BetweenLocationPoint = require('./BetweenLocationPoint'),
	FuzzyLocationPoint = require('./FuzzyLocationPoint'),
	BoundedLocationPoint = require('./BoundedLocationPoint'),
	Location = require('./Location'),
	ComplementLocation = require('./ComplementLocation'),
	JoinLocation = require('./JoinLocation')

module.exports =
class LocationStringParser {
	/**
	 * @param {string} locationString
	 * @return {AbstractLocation}
	 */
	parse(locationString) {
		let root = new Node('root')
		this.recursivelyParse_(locationString, root)
		return root.location()
	}

	// ----------------------------------------------------
	// Private methods
	recursivelyParse_(locationString, parentNode) {
		if (/^complement\(/.test(locationString)) {
			let node = new ComplementNode()
			parentNode.push(node)
			this.recursivelyParse_(locationString.substr('complement('.length), node)
		}
		else if (/^join\(/.test(locationString)) {
			let node = new JoinNode()
			parentNode.push(node)
			this.recursivelyParse_(locationString.substr('join('.length), node)
		}
		else if (/^order\(/.test(locationString)) {
			let node = new OrderNode()
			parentNode.push(node)
			this.recursivelyParse_(locationString.substr('join('.length), node)
		}
		else if (locationString[0] === ',') {
			this.recursivelyParse_(locationString.substr(1), parentNode)
		}
		else if (locationString[0] === ')') {
			this.recursivelyParse_(locationString.substr(1), parentNode.parent())
		}
		else {
			let matches = /^(?:([A-Za-z0-9](?:[A-Za-z0-9._]*[A-Za-z0-9])?):)?([<>0-9.^]+?)([,)]|$)/.exec(locationString)
			//                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     ^^^^^^^^^^^  ^^^^^^
			//                  1. optional accession                         2. location  3. end character
			if (!matches)
				return

			let totalMatchLength = matches[0].length,
				accession = matches[1],
				locationText = matches[2],
				endCharacter = matches[3],
				remainingLocationString = locationString.substr(totalMatchLength),
				location = this.parseLocation_(locationText, accession)

			if (!location)
				throw new Error()

			parentNode.push(new LocationNode(location))

			// parentNode.addLocation(location)
			if (endCharacter === ')')
				this.recursivelyParse_(remainingLocationString, parentNode.parent())
			else if (endCharacter === ',')
				this.recursivelyParse_(remainingLocationString, parentNode)
		}
	}

	parseLocation_(locationText, optAccession) {
		let parts = locationText.split('..'),
			startLocationPoint = this.parseLocationPoint_(parts[0]),
			stopLocationPoint = parts.length > 1 ? this.parseLocationPoint_(parts[1]) : startLocationPoint

		if (startLocationPoint && stopLocationPoint)
			return new Location(startLocationPoint, stopLocationPoint, optAccession)

		return null
	}

	parseLocationPoint_(locationPointText) {
		// Single base location: 345
		if (/^\d+$/.test(locationPointText))
			return new LocationPoint(parseInt(locationPointText))

		// 102.110 or 123^124
		if (/^\d+[.^]\d+/.test(locationPointText)) {
			let isBetween = locationPointText.indexOf('^') >= 0,
				positions = locationPointText.split(/[.^]/)

			positions[0] = parseInt(positions[0])
			positions[1] = parseInt(positions[1])

			return isBetween
				? new BetweenLocationPoint(positions[0], positions[1])
				: new BoundedLocationPoint(positions[0], positions[1])
		}

		// <123 or >123
		if (locationPointText[0] === '>' || locationPointText[0] === '<')
			return new FuzzyLocationPoint(locationPointText[0], parseInt(locationPointText.substr(1)))

		return null
	}
}

// --------------------------------------------------------
/**
 * Private classes for supporting the parse process. Note these are not exported.
 */

/**
 * Generic tree node.
 */
class Node {
	constructor() {
		this.parent_ = null
		this.children_ = []
	}

	location() {
		assert(this.hasChildren())
		assert(this.isRoot())
		return this.children_[0].location()
	}

	parent() {
		return this.parent_
	}

	push(childNode) {
		assert(childNode !== this)
		childNode.parent_ = this
		this.children_.push(childNode)
	}

	hasChildren() {
		return this.children_.length > 0
	}

	isLeaf() {
		return !this.hasChildren()
	}

	isRoot() {
		return this.parent_ === null
	}

	children() {
		return this.children_
	}
}

/**
 * Represents the complement of one and only one child location.
 */
class ComplementNode extends Node {
	location() {
		assert(this.children().length === 1, 'complement nodes must have one and only have one child')
		return new ComplementLocation(this.children()[0].location())
	}

	push(childNode) {
		if (this.hasChildren())
			throw new Error('complement nodes may only have one child')

		super.push(childNode)
	}
}

/**
 * Represents the join operator of one or multiple child locations.
 */
class JoinNode extends Node {
	location() {
		assert(this.hasChildren(), 'join nodes must have at least one child')
		let locations = []
		this.children().forEach((childNode) => {
			locations.push(childNode.location())
		})
		return new JoinLocation(locations)
	}
}

class OrderNode extends Node {
	location() {
		throw new Error('not yet implemented')
	}
}

/**
 * Represents a simple location, which does not have any children.
 */
class LocationNode extends Node {
	constructor(location) {
		super()
		this.location_ = location
	}

	push(childNode) {
		throw new Error('location nodes may not have children')
	}

	location() {
		return this.location_
	}
}
