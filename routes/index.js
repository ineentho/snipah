exports.games;

exports.index = function(req, res){
	res.render("index", {
		gameId: "_gameId",
		mapName: "_mapName"
	});
};

exports.joinGame = function(req, res){
	res.render("index", {
		gameId: req.params.id,
		mapName: exports.games[req.params.id]
	});
}