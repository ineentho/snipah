exports.games = {};

var i = 0;

exports.gen = function(req, res){
	i++;
	exports.games[i] = req.params.map;
	console.log("Created Game#" + i + " on map " + req.params.map + ".");
	res.end("/g/" + i);
};