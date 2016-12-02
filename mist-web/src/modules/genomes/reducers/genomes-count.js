export default (state = [], action) => {
	if (action.error)
		return state

	switch (action.type) {
		case 'GENOMES-COUNT':
			console.log(action.payload)
			return Number(action.payload.headers['x-total-count'])

		default:
			return state
	}
}
