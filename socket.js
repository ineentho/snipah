var games = {};
var charPosMapA = require("./characterPosMapA.js");
var clients = 0;

exports.start = function(io){
	io.set('log level', 1);


	io.on('connection', function(socket){
		clients++;
		console.log("[Global] Client #" + clients + " connected");
		socket.on('joined', function(data){
			var game;
			var gameId;
			var playerNum;

			function log(message){
				console.log("[Room#" + gameId + "] " + message)
			}

			function getOtherPlayer(){
				if(playerNum === 1)
					return game.playerB;
				return game.playerA;
			}

			function getMe(){
				if(playerNum === 1)
					return game.playerA;
				return game.playerB;
			}

			if(data.gameId == undefined){
				log("Error: " + data.gameId);
				return;
			}
			gameId = data.gameId;

			if(data.started){
				log("Player created room#" + data.gameId);

				playerNum = 1;

				games[data.gameId] = {};
				game = games[data.gameId];

				if(game == undefined){
					return;
				}
				gameId = data.gameId;

				game.playerA = {socket: socket}
			}
			else{
				playerNum = 2;

				log("Player joined room#" + data.gameId);
				game = games[data.gameId];

				if(game == undefined){
					log("Game does not exist.");
					socket.emit("unexistingGame");
					return;
				}

				game.playerB = {
					socket: socket
				}

				game.playerA.socket.emit("startGame");
				game.playerB.socket.emit("startGame");
			}

			socket.on("ready", onReady);
			function onReady(data){
				var targetPlayer;
				if(playerNum == 1){
					targetPlayer = game.playerB;
					game.playerA.ready = data.state;
				}
				else{
					targetPlayer = game.playerA;
					game.playerB.ready = data.state;
				}

				if(targetPlayer == null){
					disconnect();
					return;
				}
				targetPlayer.socket.emit("ready", {state: data.state});

				log("Ready [A: " + game.playerA.ready +", B: " + game.playerB.ready);

				if(game.playerA.ready && game.playerB.ready){
					log("Both ready");

					var pos = Math.floor(Math.random()*Object.keys(charPosMapA.possiblePositions).length);

					position = charPosMapA.possiblePositions[pos]

					game.playerA.socket.emit("bothReady", {pos: position});
					game.playerB.socket.emit("bothReady", {pos: position});

					game.playerA.hp = 200;
					game.playerB.hp = 200;
				}
			}

			socket.on("hit", onHit);
			function onHit(data){
				getOtherPlayer().socket.emit("hit", data);

				log("HIT");
				var dmg;
				if(data.where == "headshot")
					dmg = 200;
				else if(data.where == "body")
					dmg = 100;
				else if(data.where == "arm")
					dmg = 50;
				else if(data.where == "heart")
					dmg = 200;
				else
					return;

				var winner = playerNum === 1 ? 2 : 1;

				getMe().hp -= dmg;
				if(getMe().hp <= 0){
					getOtherPlayer().socket.emit("winner", {won: false});
					socket.emit("winner", {won: true});
				}
			}

			socket.on("offerRematch", offerRematch);
			function offerRematch(){
				getOtherPlayer().socket.emit("offerRematch");
				console.log("Offering rematch");

				//Reset stats
				game.playerA.hp = 200;
				game.playerB.hp = 200;

				game.playerA.ready = false;
				game.playerB.ready = false;

			}

			socket.on("leaveGame", leaveGame);
			function leaveGame(){
				console.log("Left game");
				getOtherPlayer().socket.emit("partnerLeft");
				disconnect();
			}

			socket.on('disconnect', onDisconnect);
			function onDisconnect(){
				log("Socket Disconnected");
				if(games[gameId] === null){
					log("Game is null, won't disconnect again.");
					return;
				}

				if(game.playerA != null)
					game.playerA.socket.emit("unexistingGame");
				if(game.playerB != null)
					game.playerB.socket.emit("unexistingGame");
				
				disconnect();
			}

			function disconnect(){
				log("Clearing room #" + gameId);

				game.playerA.socket.removeListener("disconnect", onDisconnect);
				game.playerA.socket.removeListener("hit", onHit);
				game.playerA.socket.removeListener("ready", onReady);
				game.playerA.socket.removeListener("leaveGame", leaveGame);
				game.playerA.socket.removeListener("offerRematch", offerRematch);

				game.playerB.socket.removeListener("disconnect", onDisconnect);
				game.playerB.socket.removeListener("hit", onHit);
				game.playerB.socket.removeListener("ready", onReady);
				game.playerB.socket.removeListener("leaveGame", leaveGame);
				game.playerB.socket.removeListener("offerRematch", offerRematch);

				games[gameId] = null;
				game = null;
			}
		});
		socket.on("ping", function(){
			socket.emit("ping");
		});
	});
}