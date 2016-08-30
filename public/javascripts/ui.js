var player, socket;

window.addEventListener("load", function(){
	var gameId = document.getElementById("gameId").value;
	var mapName = document.getElementById("mapName").value;


	var visible = "connecting";

	function setErrorMessage(msg){
		document.getElementsByClassName("errorMessage")[0].innerHTML = msg;
	}

	function setEndMessage(msg){
		document.getElementsByClassName("endMessage")[0].innerHTML = "<h2>" + msg + "</h2><br>" + 
		"<button id='backToMenu'>Return to menu</button>" + 
		"<button id='startRematch'>Offer Rematch</button>";

		document.getElementById("backToMenu").addEventListener("click", function(){
			socket.emit("leaveGame");
			show("startButton");
		});

		document.getElementById("startRematch").addEventListener("click", function(){
			socket.emit("offerRematch");
			showReadyCheck(true);
		});
	}


	function show(what, height){
		document.getElementsByClassName("menu")[0].style.display = "block";

		if(height == undefined) height = "200px";
		console.log("Show " + what)

		document.getElementsByClassName(visible)[0].style.height = 0;
		document.getElementsByClassName("loadingGame")[0].style.height = 0;

		if(what == null)
			return;	
	document.getElementsByClassName(what)[0].style.height = height;
		visible = what;
	}

	socket = io.connect(window.location.host, {
		"max reconnection attempts": Infinity,
		"reconnection limit": 3000

	});

	socket.on("offerRematch", function(){
		showReadyCheck(true);
	});

	socket.on("partnerLeft", function(){
		document.getElementById("startRematch").disabled = "disabled";
	});

	socket.on('error', function(data){
			console.log("Error: " + data.msg);
			setErrorMessage("<h2>Disconnected from the server.</h2>");
			console.log("DC from the server.");
			show("errorMessage");
		});

	var time;

	setInterval(checkPing, 3000);
	checkPing();

	function checkPing(){
		socket.emit("ping");
		time = window.performance.now();
	}

	socket.on("ping", function(){
		var ping = Math.round(((window.performance.now() - time) / 2) * 100) / 100;
		document.getElementById("pingDisplay").innerHTML = "Ping: <b>" + ping + "</b>";
	});

	var gameEnded = false;

	socket.on("unexistingGame", function(data){
		if(gameEnded){
			document.getElementById("startRematch").disabled = "disabled";
			return;
		}

		setErrorMessage("<h2>Game does not exist.</h2><p>Returning to start in 3 seconds.</p>");
		console.log("Game does not exist. (Sent from server: " + data + ")");
		show("errorMessage");

		setTimeout(function(){
			show("startButton");
		}, 3000);
	});

	socket.on('connect', function(){
		console.log("Connected");
		show("startButton");
	});

	socket.on("winner", function(data){
		console.log("Win: " + data.won);
		if(data.won){
			setEndMessage("Congratulations, you won!");
		}
		else
			setEndMessage("You lost, better luck next time!");

		document.exitPointerLock = document.exitPointerLock ||
			document.mozExitPointerLock || document.webkitExitPointerLock;
		document.exitPointerLock();
		show("endMessage", "250px");

		gameEnded = true;

		stopGame();
	});


	function showReadyCheck(rematch){
		loadMap(mapName);

		var readySound = new buzz.sound( "/sound/ready", {
		    formats: ["ogg", "mp3"]
		});

		readySound.setVolume(20);

		var notReadySound = new buzz.sound( "/sound/notReady", {
		    formats: ["ogg", "mp3"]
		});

		notReadySound.setVolume(20);

		gameEnded = false;

		if(rematch){
			document.getElementsByClassName("readyCheckInfo")[0].innerHTML = "Your opponent has offered you a rematch.";
		}
		else{
			document.getElementsByClassName("readyCheckInfo")[0].innerHTML = "";
		}

		show("readyCheck");

		var pos;
		var ele;
		if(player === 1)
			ele = "toggleReadyA";
		else
			ele = "toggleReadyB";

		var opponentReady;
		if(player === 1)
			opponentReady = "toggleReadyB";
		else
			opponentReady = "toggleReadyA";

		socket.on("ready", function(data){
			console.log("Socket: Opponent ready");
			toggleReady(document.getElementById(opponentReady), !data.state);
		});

		var cursorLockAllowed = false;
		var toggleCooldown = false;

		function toggleReady(ele, state){

			//if(toggleCooldown)
			//	return;

			console.log("RState: " + state);

			if(state){
				

				ele.style.color = "gray";
				ele.innerHTML = "Not Ready";

				notReadySound.play();

				toggleCooldown = true;

			}
			else{
				ele.style.color = "green";
				ele.innerHTML = "Ready";

				readySound.play();

				/*ele.style.pointerEvents = "none";
				setTimeout(function(){
					ele.style.pointerEvents = "auto";
					ele.style.color = "gray";
					toggleCooldown = false;
				}, 2000);*/
			}
		}

		var warningSign = document.getElementsByClassName("warning")[0];

		function lockError(){
			alert("You have to allow pointerlock.\nAll FPS games use this feature, but since we use modern web technlogies" + 
				" without any plugins we have to ask for access. You will see more of this from other games aswell in the future." + 
				" You can disable pointer lock at any time by pressing escape.");
		}

		var waitingForAccept;

		function pointerLockChange(){
			if(document.mozPointerLockElement === warningSign ||
				document.webkitPointerLockElement === warningSign ||
				document.pointerLockElement === warningSign){
				console.log("Pointer locked.");

				if(waitingForAccept != undefined){
					console.log(waitingForAccept);
					toggleReady(waitingForAccept, waitingForAccept.style.color == "green");
					if(waitingForAccept.style.color == "green")
						socket.emit("ready", {state: true});
					else
						socket.emit("ready", {state: false});
				}


				document.exitPointerLock = document.exitPointerLock ||
					document.mozExitPointerLock || document.webkitExitPointerLock;

				document.exitPointerLock();

				warningSign.style.display = "none";
				cursorLockAllowed = true;

				document.removeEventListener('pointerlockerror', lockError, false);
				document.removeEventListener('mozpointerlockerror', lockError, false);
				document.removeEventListener('webkitpointerlockerror', lockError, false);

				document.removeEventListener('pointerlockchange', pointerLockChange, false);
				document.removeEventListener('mozpointerlockchange', pointerLockChange, false);
				document.removeEventListener('webkitpointerlockchange', pointerLockChange, false);


			} else {
				console.log("Pointer unlocked.")
			}
		}

		function testPointerLock(){
			document.addEventListener('pointerlockerror', lockError, false);
			document.addEventListener('mozpointerlockerror', lockError, false);
			document.addEventListener('webkitpointerlockerror', lockError, false);

			document.addEventListener('pointerlockchange', pointerLockChange, false);
			document.addEventListener('mozpointerlockchange', pointerLockChange, false);
			document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

			warningSign.requestPointerLock = warningSign.requestPointerLock ||
			     warningSign.mozRequestPointerLock || warningSign.webkitRequestPointerLock;

			warningSign.requestPointerLock();
		}

		warningSign.addEventListener("click", function(){
			testPointerLock();
		});

		document.getElementById(ele).addEventListener("click", eleClick);
		function eleClick(e){
			console.log(e.target);
			if(!cursorLockAllowed){
				waitingForAccept = e.target;
				testPointerLock();

				document.getElementsByClassName("warning")[0].style.background = "red";
				document.getElementsByClassName("warning")[0].style.display = "block";
				setTimeout(function(){
					document.getElementsByClassName("warning")[0].style.background = "orange";
				}, 300);
				return;
			}
			console.log("B Toggled ready ");
			console.log(e.target.style);
			toggleReady(e.target, e.target.style.color == "green");

			console.log("Toggled ready " +  (e.target.style.color == "green"));

			if(e.target.style.color == "green")
				socket.emit("ready", {state: true});
			else
				socket.emit("ready", {state: false});
		}
		socket.on("bothReady", function(data){
			document.getElementById(ele).removeEventListener("click", eleClick, false);
			console.log("Both ready")
			pos = data.pos;
			console.log(data);

			show()

			var timer = 3;
			requestLock();
			document.getElementById("countdown").style.display = "block";
			var interv = setInterval(function(){
				timer--;
				document.getElementById("countdown").innerHTML = timer;

				if(timer == 0){
					document.getElementById("countdown").style.display = "none";
					document.getElementById("countdown").innerHTML = "3";
					disableStartscreen();
					showGame(pos);
					clearInterval(interv);
				}
			}, 600);


			setTimeout(function(){
				document.getElementsByClassName("menu")[0].style.display = "none";
				document.getElementById("toggleReadyA").style.color = "gray";
				document.getElementById("toggleReadyB").style.color = "gray";
			}, 500);
		});
	}



		document.getElementById("startNewGame").addEventListener("click", function(){
			socket.removeAllListeners("ready");
			socket.removeAllListeners("startGame");
			socket.removeAllListeners("bothReady");
			show("mapSelect");
		});

		var mapSelectButtons = document.getElementsByClassName("selectMap");

		for(var i = 0; i < mapSelectButtons.length; i++){
			mapSelectButtons[i].addEventListener("click", function(e){
				mapName = e.toElement.id;
				xmlhttp=new XMLHttpRequest();

				xmlhttp.onreadystatechange = function(){
					if(xmlhttp.readyState==4){
						if(xmlhttp.status == 200){
							history.pushState({}, "Game", xmlhttp.responseText);
							document.getElementById("link").value = window.location.href;
							document.getElementsByClassName("mapSelect")[0].style.height = 0;
							show("waitingForPartner", "150px");

							var gameId = window.location.href.split("/")[4];

							socket.emit("joined", {gameId: gameId, started: true});
							socket.on("startGame", function(data){
								//document.getElementsByClassName("menu")[0].style.display = "none";
								document.getElementsByClassName("waitingForPartner")[0].style.height = 0;
								player = 1;
								document.getElementById("explainA").innerHTML = "(You)";
								document.getElementById("explainA").style.fontWeight = "bold";
								document.getElementById("explainB").innerHTML = "(Your opponent)";
								showReadyCheck();
							});
						}
						else{
							alert("Error starting room.");
							show("errorMessage");
							show("startButton");
						}
					}
				}

				xmlhttp.open("GET","/getlink/" + mapName, true);
				xmlhttp.send();
			});
		}
	if(gameId === "_gameId"){

	}
	else{
		//Join game
		show("loadingGame");
		socket.emit("joined", {gameId: gameId});

		socket.on("startGame", function(data){
			//document.getElementsByClassName("menu")[0].style.display = "none";
			document.getElementsByClassName("loadingGame")[0].style.height = 0;
			document.getElementById("explainB").innerHTML = "(You)";
			document.getElementById("explainB").style.fontWeight = "bold";
			document.getElementById("explainA").innerHTML = "(Your opponent)";
			player = 2;
			showReadyCheck();
		});
	}
});