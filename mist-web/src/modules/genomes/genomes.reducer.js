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

export function searchGenomes(query) {
	// const payload = axios.get(`https://api.mistdb.com/v1/genomes?query=${query}`)
	const payload = axios.get(`http://localhost:5000/v1/genomes?query=${query}`)
	return {
		type: 'GENOMES-SEARCH',
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
		case 'GENOMES-SEARCH':
			return state.set('genomes', fromJS(action.payload.data))

		default:
			return state
	}
}
