require('./index.pug') // Not stricly necessary, but live reloads any changes to index.pug

import React from 'react'
import {render} from 'react-dom'

class App extends React.Component {
	render() {
		return <p>Hello MiST!</p>
	}
}

render(<App />, document.getElementById('root'))
