import axios from 'axios'
import { fromJS } from 'immutable'

// Actions
export function countGenomes() {
	const payload = axios.get('https://api.mistdb.com/v1/genomes?count&per_page=0')

	return {
		type: 'GENOMES-COUNT',
		payload
	}
}

export function fetchGenomes() {
	const payload = axios.get('https://api.mistdb.com/v1/genomes')

	return {
		type: 'GENOMES-FETCH',
		payload
	}
}

// Default
const defaultState = fromJS({
	count: null,
	genomes: []
})

// Reducer
export function genomesReducer(state = defaultState, action) {
	if (action.error)
		return state

	switch (action.type) {
		case 'GENOMES-COUNT':
			return state.set('count', Number(action.payload.headers['x-total-count']));

		case 'GENOMES-FETCH':
			return state.set('genomes', fromJS(action.payload.data))

		default:
			return state
	}
}
