'use strict'

// Vendor
const split = require('split'),
	pumpify = require('pumpify'),
	through2 = require('through2')

module.exports = function(options) {
	let lastLine = null,
		parser = through2.obj(options, (line, encoding, done) => {
			let transformedLine = line + '\n'

			// ----------------------------------------------------
			/**
			 * Many of the NCBI GenBank files appear to have multi-line product / function feature
			 * values that are not properly continued. For example:
			 *
			 * /product="crotonobetainyl-CoA--carnitine CoA-transferase
			 * /alpha-methylacyl-CoA racemase 1"
			 *
			 * Here, on the first line, the product value is not terminated with quotes indicating
			 * that its value will continue on the next line; however, the next line begins with a
			 * '/' indicating a new feature key is starting. From inspecting the above value it is
			 * clear that /alpha-methylacyl-CoA is not a feature key but rather the rest of the
			 * product value.
			 *
			 * Other examples:
			 *
			 * /product="electron-transferring-flavoprotein dehydrogenase
			 * / geranylgeranyl hydrogenase-like protein"
			 *
			 * /function="Phosphatidylserine/phosphatidylglycerophosphate
			 * /cardiolipin synthases and related enzymes"
			 *
			 * This tweak corrects for these problems.
			 */
			if (/^\s+\/(product|function)="[^"]*$/.test(lastLine) && /^\s+\//.test(line))
				transformedLine = line.replace(/\/\s*/, '')

			lastLine = transformedLine
			done(null, transformedLine)
		})

	return pumpify.obj(split(), parser)
}
