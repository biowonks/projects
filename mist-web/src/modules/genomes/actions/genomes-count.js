import axios from 'axios'

export function genomesCount() {
	const payload = axios.get('https://api.mistdb.com/v1/genomes?count&per_page=0')

	return {
		type: 'GENOMES-COUNT',
		payload
	}
}
