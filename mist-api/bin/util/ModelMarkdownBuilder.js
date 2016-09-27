'use strict'

module.exports =
class ModelMarkdownBuilder {
	constructor(Sequelize) {
		this.Sequelize_ = Sequelize
		this.md_ = null
		this.model_ = null
	}

	markdown(model) {
		let definition = model.definition,
			fields = definition.fields

		this.model_ = model
		this.md_ = this.header_()

		this.md_ += this.example_()

		if (definition.description)
			this.md_ += definition.description + '\n\n'

		this.md_ += this.tableOpen_()
		Object.keys(fields).forEach((fieldName) => {
			let fieldSpec = fields[fieldName]
			this.md_ += this.tableRowField_(fieldName, fieldSpec)
		})

		this.md_ += this.timestampRows_()
		this.md_ += this.tableClose_()

		this.model_ = null
		return this.md_
	}

	header_(definition) {
		return `## ${this.model_.name}\n`
	}

	tableOpen_() {
		return `<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
<th>Constraints</th>
</tr>
</thead>
<tbody>
`
	}

	tableRowField_(fieldName, fieldSpec) {
		let constraints = []
		if (Reflect.has(fieldSpec, 'allowNull') && !fieldSpec.allowNull)
			constraints.push('not null')

		return this.tableRow_(fieldName, fieldSpec.type, fieldSpec.description, constraints)
	}

	tableRow_(fieldName, type, description = '', constraints = []) {
		return `<tr>
<td>${fieldName}</td>
<td>${this.type_(type)}</td>
<td>${description}</td>
<td>${constraints.join(', ')}</td>
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

	example_() {
		let fields = this.model_.definition.fields,
			example = {}

		Object.keys(fields).forEach((fieldName) => {
			let fieldSpec = fields[fieldName]
			example[fieldName] = fieldSpec.example || null
		})

		let json = JSON.stringify(example, null, 2)
		return '> Example record\n\n```json\n' + json + '\n```\n\n'
	}
}
