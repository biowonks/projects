import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchGenomes } from '../../modules/genomes/genomes.reducer'

class Genomes extends React.Component {
	componentDidMount() {
		this.props.fetchGenomes()
	}

	render() {
		return (
			<div>
				<h2>Member Genomes</h2>
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
	return bindActionCreators({fetchGenomes}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Genomes)
