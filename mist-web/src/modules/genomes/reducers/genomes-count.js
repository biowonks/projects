export default (state = [], action) => {
	if (action.error)
		return state

	switch (action.type) {
		case 'GENOMES-COUNT':
			return Number(action.payload.headers['x-total-count'])

		default:
			return state
	}
}
