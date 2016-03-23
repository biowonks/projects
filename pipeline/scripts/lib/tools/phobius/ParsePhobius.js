'use strict'

let fs = require('fs')

var file = "/home/amit/phob_short.out"


function parsePhobShort(file) {
	var header="", topology= "",start = 0, end = 0
        
	fs.readFile(file, function (err, logData) {
		if(err) throw err
		var text = logData.toString();
		var lines = text.split('\n')
	
		lines.forEach(function(line) {
		        if(line){
				var arr_line = line.split(/\s+/)
				//console.log(arr_line)
				if(arr_line[0] != "SEQENCE" && arr_line[1] != "ID" )
				{
					header = arr_line[0]
					topology = arr_line[3]		
					topology = topology.replace(/[o,i]/g," ")
				
					var tm_arr = topology.trim().split(/\s+/)
					
					tm_arr.forEach(function(tm){
						var pos = tm.split("-")
						start = pos[0]
						end = pos[1]
						console.log(header + " " + start + " " + end) 
						
					})
	
				}
			}
		})
	})

}

parsePhobShort(file)


