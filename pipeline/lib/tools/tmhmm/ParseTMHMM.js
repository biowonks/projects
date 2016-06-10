'use strict'

let fs = require('fs')

var infile = "/home/amit/test.fa"
var outfile = "/home/amit/test_out"



var childProcess = require('child_process'),
	phobius
	var command = "/home/amit/phobius/phobius.pl -short "+infile+">"+outfile
	phobius = childProcess.exec(command, function (error, stdout, stderr) {
		if (error) {
		      console.log(error.stack);
		      console.log('Error code: '+error.code);
		      console.log('Signal received: '+error.signal);
		}
		console.log('Child Process STDOUT: '+stdout);
		console.log('Child Process STDERR: '+stderr);
	});

	phobius.on('exit', function (code) {
	      //console.log('Child process exited with exit code '+code);
	});






let fs = require('fs')

//var file = "/home/amit/phob_long.out"
////var file = "/home/amit/tmhmm_long.out"
var file = "/home/amit/phob_short.out"
////var file = "/home/amit/tmhmm_short.out"



fs.readFile(file, function (err, logData) {
	if(err) throw err
	var text = logData.toString();
        
	var lines = text.split('\n')

        console.log(lines)
	//parsePhobLong(lines)
	//parseTmhmmLong(lines)
	parsePhobShort(lines)
	//parseTmhmmShort(lines)


})






function parsePhobShort(input){
	var header="", topology= "",start = 0, end = 0

	input.forEach(function(line) {
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
					console.log("TM "+header + " " + start + " " + end) 
					
				})

			}
		}
	})

}



function parseTmhmmShort(input){
	var header="", topology= "",start = 0, end = 0

	input.forEach(function(line) {
		if(line){
			var arr_line = line.split(/\s+/)

			header = arr_line[0]
			topology = arr_line[5]
			topology = topology.replace(/[o,i,Topology=]/g," ")
	
			var tm_arr = topology.trim().split(/\s+/)

			tm_arr.forEach(function(tm){
				var pos = tm.split("-")
				start = pos[0]
				end = pos[1]
				console.log("TM "+header + " " + start + " " + end)

			})

		}
	})
}









function parsePhobLong(input){
	
	var header="", start = 0, end = 0
	
	input.forEach(function(line) {
		var arr_line = line.split(/\s+/)
		if(arr_line[0] == "ID" )
		{
			header = arr_line[1]
		}
		else if(arr_line[1] == "TRANSMEM")
		{
			start = arr_line[2]
			end = arr_line[3]
			console.log("TM "+header + " " + start + " " + end )
		}
	})
}
















function parseTmhmmLong(input){

        var header="", start = 0, end = 0
	
	input.forEach(function(line) {
		var arr_line = line.split(/\s+/)
			//console.log(arr_line)
			if(arr_line[2] == "TMhelix")
			{
				header = arr_line[0]
				start = arr_line[3]
                        	end = arr_line[4]	
				console.log("TM "+header + " " + start + " " + end )
			}
	})
}
