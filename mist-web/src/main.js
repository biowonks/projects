require('./index.pug') // Not stricly necessary, but live reloads any changes to index.pug
require('./assets/styles/main.scss')

import React from 'react'
import {render} from 'react-dom'
import { Provider } from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import ReduxPromise from 'redux-promise'
import {hashHistory, Router} from 'react-router'
import rootReducer from './modules/root-reducer'
import rootRoute from './routes'

const initialState = undefined
const store = createStore(rootReducer, initialState, applyMiddleware(ReduxPromise))

render(
	<Provider store={store}>
		<Router history={hashHistory}>
			{rootRoute}
		</Router>
	</Provider>
	, document.getElementById('root')
)
