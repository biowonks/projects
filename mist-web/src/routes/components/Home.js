const mistLogoSrc = require('../../assets/images/mist-logo.png')

import React from 'react'
import { genomesCount } from '../../modules/genomes/actions/genomes-count'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

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
				<h3 className="text-center">{amount} genomes</h3>
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