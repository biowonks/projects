'use strict'

let aseqs = [
	"9wGL2VKFU0p_dqk5C89jCQ",
	'F5JkfN0xgfYnys4mWPgXrw',
	'KNVlSayWs0nwsHb7P-lQjw',
	'-5emqhPajMGqpBdb7FaryQ',
	'st4Dp7uZc5Y_4dM7ZHU7-g',
	'-Ap48pVOI-t91tYq3I0ROg',
	'KS-E8Am79hDTIzDvM2-a0g',
	'YN5c_-qEUEYW2KvBh_07XQ',
	'-C4jrt8Diyh5mEgr_JFo1w',
	'-Df1Zd_Sc7CbW41ahxkm6w',
	'1av5D6s6FrWf6M14rmx4XQ',
	'cZ4jboJjjXuVN-IymDqycQ',
	'tHBbp1FHNXDqXBF5bTlCOw',
	'yPiQOONAyviT128n0wHFOQ',
	'QpR3SwiGLNiwvlhqWTAlpw',
	'-Kuf5qaUppieCkTiY3N2dQ',
	'N65C1aoerNkIy_GvW-M_zg',
	'8rz6HV_joH9m4US1ssna5w',
	'-STSD2PmHwFLxCdbieijPg',
	'-W6Z6_YzWKqusH2RFEmebw',
	'LUtAFZMWEJa_gM0FeaW_TQ',
	'3QMj7ek52OObHkJF8VO5TA',
	'-XAV4JNBd-qXJNQvifUlTA',
	'-Y04thxvcMvmrP6UHqlqCQ',
	'-bh-_SqmbKWSIobei_N7NQ',
	'-d_etXUV8SSKTlof2VA-rg',
	'-e2pJpK4ey4slWadnOhaBw',
	'-hNcRpQMoLQEkEtunBi7IQ',
	'-tClBuES0_JjzoGN-0dHOw',
	'-im6B_A-bO39I8kLcFt2KQ',
	'-r5nb0yXl5RTwyZEXDR27Q',
	'-szneQ-hlr8ACIC58roXiA',
	'-tbWzyIT7BQhnLylNsMJxQ',
	'-ttq2mExPkL53M_MJVjPhA',
	'-utsackVJxRflCjtpHTiVA',
	'-xf_1_7qoM5fknF6cnK-kQ',
	'mqfLVza6zUeU_UR5z8RaAQ',
	'FY6QlIqCnkcNNz_s5D2z5Q',
	'foxhM-6-BLOlEQcpYTeDtA',
	'-zuSbbnBMv6JxkPCbi5HGQ',
	'06-Wm3vRloiVngpWD9FB4g',
	'06QJSiYOizYFiTyca5t8PQ',
	'08ROLrfTA3HfNiPepswB9g',
	'0IGvkwqdmw2jNlMIgclr-w',
	'Mi6F_laS46AwM5-be3byJQ',
	'0MshdamVNR8N88O7otQTWw',
	'0Oim5TglLSyZNjHrQ8qdkQ',
	'0Pgp4HO2MwVKE9nlKIJ8rw',
	'0S46Q6eJYFuo8WEmxrbhNg',
	'0VYnFJ7Zr_9WzB6liEkOyw',
	'0ZQg98fWdubzBSCm-Bb54Q',
	'0eW15YXM890l3Wa9vZ8ZWg',
	'0fMc53Z1usOd0nAlKUe42w',
	'0jOk_Lai7IaM7jdUIx9C5g',
	'0RwMA-OuBkdCSu00wETYZg',
	'iswpMu6IWjY3Zp1tlpAhgA',
	'_e_gH9dlI-vpjiEgdmNAng',
	'enZ_SX0tUKOyLs9AC3puEg',
	'hc6sED-ESyAw-iATv8A3Kw',
	'SUdngQCVTEZiXf4-DUAeTw',
	'EzLwwz1xnZTBzn95OFZ1cA',
	'JlDBipEWsMqI5jnVpD7Z0w',
	'Yebm_dsfqvP-SvXgDPVfcQ',
	'tWD7ECVS1rr4yeiXuauOYA',
	'0sRPOTttloyhFIVnIid5Rw',
	'0wm_qHeYvi8esgd-SaWm8A',
	'1-WpQKHJL3QAVbVz90CQBA',
	'17mhCr6Q3DRcVJ2xDjAUnw',
	'18dwI1g4uPSAC7Jos3WjSA',
	'1Cwi_LGGquOUnMTyKnQy0w',
	'1D6Y0pSXqB46jbdxqjkP8A',
	'1DB3cBEU4VAgDCyuWmFdEg',
	'1E1rn7QpEFQBYUKDIVmGsw',
	'1F5iP20Q4vE4al0aQpdZWg',
	'7Jw3qXIc8UpbNYGrZaOl-A',
	'1Lj7ZBIS5YJ4keduAJNAjw',
	'1MKaSceYuZU_La-M2lqdqw',
	'1MT2ypdqU6wmLgztxvZB1Q',
	'1RX-F39GFfKZxZmC1iXSPw',
	'1SogOENQnsRPo-rZsOxLXw',
	'1TNzRnbHK75FQJh2oXjp1A',
	'1VZV4ZN1WkZkuabQyFg2xw',
	'aLVxfr2KlN6-6Qdz0yc1xw',
	'wAh_wCoXUqaq17pt5jELQg',
	'2T-oT9RzZJeSEr-eV2jUdA',
	'8FnUCT2BtWPZLg4mLLUZ-g',
	'a1zoHqbqGelkw22AX4cvAQ',
	'CrOuyqtdcadjqmVt4_ZcKw'
]

let fs = require('fs'),
	http = require('http'),
	qs = require('querystring'),
	StringDecoder = require('string_decoder').StringDecoder,
	JSONStream = require('JSONStream')

let readStream = fs.createReadStream('./test-data/just12kAseqs.txt'), // , {highWaterMark: 3 * 64 }),
	decoder = new StringDecoder('utf8'),
	stream = JSONStream.parse('*')

let myJson = [],
	buf = ''

readStream.on('data', (chunk) => {
	buf += decoder.write(chunk)
})

readStream.on('end', () => {
	console.log('done here')
})


readStream
console.log('this')
console.log(buf)

// You were writing blocking codes.
// Idea is stream from file to load into a string to pass to seqdepot via POST but that is stupid because seqdepot only takes 1000 queries, so we should buffer it and trigger the requests every 1000 aseqs.


let bufList = '\n' + buf

let aseqReq = '\n' + aseqs.join('\n')

let options = {
	host: 'seqdepot.net',
	path: '/api/v1/aseqs?type=aseq_id',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
}


let req = http.request(options, (res) => {
	res.on('data', (chunk) => {
		console.log(chunk.toString())
	})
	res.on('error', (err) => {
		console.log(err)
	})
})

req.write(bufList)
req.end()
