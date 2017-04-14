import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from '../components/App'
import Home from './components/Home'
import Genomes from './components/Genomes'

export default (
	<Route path="/" component={App}>
		<IndexRoute component={Home} />
		<Route path="/genomes" component={Genomes} />
	</Route>
)
