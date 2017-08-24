import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Observable, Subject } from 'rxjs'

import {
	fetchGenomes,
	searchGenomes
} from '../../modules/genomes/genomes.reducer'

class Genomes extends React.Component {
	constructor(props) {
		super(props)

		this.input = null
		this.destroy$ = new Subject()
	}

	componentDidMount() {
		this.props.fetchGenomes()

		Observable.fromEvent(this.input, 'input')
			.takeUntil(this.destroy$)
			.map((event) => event.target.value)
			.distinctUntilChanged()
			.debounceTime(200)
			.subscribe((query) => this.props.searchGenomes(query))
	}

	componentWillUnmount() {
		this.destroy$.next(null);
	}

	render() {
		return (
			<div>
				<h2>Member Genomes</h2>
				<div>
					<label>Search</label>
					<input ref={(input) => this.input = input} />
				</div>
				<ul>
					{this.props.genomes.map((genome) => {
						return <li key={genome.get('id')}>{genome.get('name')}</li>
					})}
				</ul>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		genomes: state.genomes.get('genomes')
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({fetchGenomes, searchGenomes}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Genomes)
