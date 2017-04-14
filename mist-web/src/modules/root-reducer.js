import { combineReducers } from 'redux'
import { genomesReducer } from './genomes/genomes.reducer'

export default combineReducers({
	genomes: genomesReducer
})
