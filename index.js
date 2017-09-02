#!/usr/bin/env node
var graph = require('fbgraph');

const krakow_bilgoraj_id = 516840211676632; //or your other group

var program = require('commander');

const getPostUrl = function(id){
	return getPostUrlFromGroupAndPostId(krakow_bilgoraj_id ,id);
}

const getPostUrlFromGroupAndPostId = function(groupId,id){

	var formedId = String(id).split("_")[1];
	return 'https://www.facebook.com/groups/'+groupId+'/permalink/'+formedId+'/';
}
 
const parseCityConnection = function(city){

    if(city.toLowerCase()[0] == 'b'){
        return 'Kraków -> Biłgoraj';
    }else{
        return 'Biłgoraj -> Kraków';
    }
};

const isFromKrakowToBilgoraj = function(message){
	if(message == undefined) return false;
    var krkIndex  = message.toLowerCase().indexOf("krak");
    var bilgoIndex  = message.toLowerCase().indexOf("goraj");
    return krkIndex < bilgoIndex;
}
const isValidOffer = function(message, city){
	//console.log('message: '+message+", city: "+city);
    city = parseCityConnection(city);

    var krkToBilg = isFromKrakowToBilgoraj(message);

    if(message.toLowerCase().indexOf('szuk') !== -1){
    	return false;
    }

    if(city[0]== 'K'){
        return krkToBilg;
    }else {
        return !krkToBilg;
    }
}

const printResults = function(res){
	var collection = res["data"];
    
    if(collection == undefined){
		console.error('token wygasł. spróbuj z nowo wygenerowanym');
        process.exit(1);
	}

	var k = 0;

    for(var j = 0; j < collection.length; j++){
        var offer = collection[j];
        var message = offer["message"];
        var id = offer["id"];
        if(message == undefined) {
        	continue;
        }
        if(isValidOffer(message, program.destination)){
            console.log('\n\n['+k+'] : '+offer["message"]+"\nurl: "+getPostUrl(id));
        	++k;
        } else {
            //console.error('not match: '+off);
        }
    }
}

program
  .arguments('<token>')
  .option('-D, --destination <destination>', 'Miasto docelowe(K/B) - Kraków/Biłgoraj')
  .option('-L, --limit <limit>', 'ilość rekordów do przeszukania (100)')
  .action(function(token) {
    	console.log('limit: '+program.limit+', destination: %s', program.destination);
    	if(program.destination == undefined){
    		console.log('użyj \'--destination Kraków\' lub \'--destination Biłgoraj\'');
    		process.exit(1);
    	}
        var limit = 100;

        if(program.limit){
            limit = program.limit;
        }

        console.log('szukanie połączenia '+parseCityConnection(program.destination));
        graph.setAccessToken(token);
        graph.get(String(krakow_bilgoraj_id) + "/feed?limit="+limit, function(err, res) {
        
        printResults(res);
        
        });

  })
  .parse(process.argv);

 
 /**
 readme: 
 npm install -g

 usage:  

 $snippet --destination Kraków --limit 50 t0k3N

 */
