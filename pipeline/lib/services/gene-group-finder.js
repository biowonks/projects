'use strict'

const distanceCutoff = 200 // See documentation
const MinGroupSize = 2

module.exports =
class GeneGroupFinder {
	constructor() {
		this.groups = []
	}
	parse(object) {
		object.sort(function(a, b) {
			return b.start - a.start
		})
		let tempGroup = {items: [], strand: ''}
		object.array.forEach(function(element) {
			if (tempGroup.length === 0) {
				tempGroup.push(element)
			}
			else if (tempGroup.strand === element.strand && tempGroup.items[-1].stop - element.start < distanceCutoff) {
				tempGroup.items.push(element)
			}
			else {
				if (tempGroup.items.length >= MinGroupSize)
					this.group.push(tempGroup)
				tempGroup = {group: [element], strand: element.strand}
			}
		}, this)
	}
}
