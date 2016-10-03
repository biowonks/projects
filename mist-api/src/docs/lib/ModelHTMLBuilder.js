'use strict'

// Vendor
const highlight = require('highlight.js')

module.exports =
class ModelHTMLBuilder {
	constructor(Sequelize) {
		this.Sequelize_ = Sequelize
		this.model_ = null
	}

	html(model, exampleRecord = null) {
		let definition = model.definition,
			fields = definition.fields

		this.model_ = model
		let html = this.header_()
		if (definition.description)
			html += toHTMLParagraphs(definition.description)

		html += this.exampleRecordHTML_(exampleRecord)
		html += this.tableOpen_()
		if (this.hasDefaultPrimaryKey_(fields) && !fields.id)
			html += this.tableRow_('id', this.Sequelize_.INTEGER, 'auto-incrementing, primary identifier')
		Object.keys(fields).forEach((fieldName) => {
			let fieldSpec = fields[fieldName]
			html += this.tableRowField_(fieldName, fieldSpec)
		})
		html += this.timestampRows_()
		html += this.tableClose_()

		this.model_ = null
		return html
	}

	hasDefaultPrimaryKey_(fields) {
		for (let fieldName in fields) {
			if (fields[fieldName].primaryKey)
				return false
		}

		return true
	}

	header_(definition) {
		return `<h2 id="${this.model_.name}-model">${this.model_.name}</h2>\n`
	}

	exampleRecordHTML_(exampleRecord) {
		if (!exampleRecord)
			return ''

		let json = JSON.stringify(exampleRecord, null, 2),
			highlighted = highlight.highlight('json', json).value,
			html = `<pre class="highlight json"><code>${highlighted}</code></pre>`

		return html
	}

	tableOpen_() {
		return `<table class="model-structure">
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
`
	}

	tableRowField_(fieldName, fieldSpec) {
		// let constraints = []
		// if (Reflect.has(fieldSpec, 'allowNull') && !fieldSpec.allowNull)
		// 	constraints.push('not null')

		return this.tableRow_(fieldName, fieldSpec.type, fieldSpec.description)
	}

	tableRow_(fieldName, type, description = '') {
		return `<tr>
<td class="field-name">${fieldName}</td>
<td class="data-type">${this.type_(type)}</td>
<td>${description}</td>
</tr>
`
	}

	timestampRows_() {
		if (!this.model_.options.timestamps)
			return ''

		let result = ''
		if (this.model_.options.createdAt !== false)
			result += this.tableRow_('created_at', this.Sequelize_.DATE, 'date/time record was created')
		if (this.model_.options.updatedAt !== false)
			result += this.tableRow_('updated_at', this.Sequelize_.DATE, 'date/time record was last updated')
		return result
	}

	type_(type) {
		if (type.key === this.Sequelize_.ARRAY.key)
			return `array(${this.type_(type.type)})`

		return type.key.toLowerCase()
	}

	tableClose_() {
		return '</tbody>\n</table>\n'
	}
}

/**
 * @param {String} value
 * @returns {String} - replaces all multiple occurrences of newlines with HTML paragraphs
 */
function toHTMLParagraphs(value) {
	if (!value)
		return null

	return '<p>' + value.replace(/\n{2,}/g, '</p></p>') + '</p>'
}
