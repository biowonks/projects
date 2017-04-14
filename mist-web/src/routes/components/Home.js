const mistLogoSrc = require('../../assets/images/mist-logo.png')

import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { genomesCount } from '../../modules/genomes/genomes.reducer'

const logoStyle = {
	maxWidth: '50%'
}

class Home extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		this.props.genomesCount()
	}

	render() {
		let amount = this.props.numGenomes ? this.props.numGenomes : '...'

		return (
			<div>
				<img className="center-block" style={logoStyle} src={mistLogoSrc} />
				<h3 className="text-center"><Link to="/genomes">{amount} genomes</Link></h3>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		numGenomes: state.genomesCount
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({genomesCount}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)