var backgroundImage, foregroundImage, character, scope;

var myShotSound, enemyShotSound;

var gameStopped = true;


function loadMap(map){
	console.log("Loading map")
	backgroundImage = new Image();
	backgroundImage.src = "/maps/" + map + "/bg.png";

	foregroundImage = new Image();
	foregroundImage.src = "/maps/" + map + "/foreground.png";

	character = new Image();
	character.src = "/images/character.png";

	hitbox = new Image();
	hitbox.src = "/images/hitbox.png";

	scope = new Image();
	scope.src = "/images/scope.png";


	myShotSound = [];
	enemyShotSound = [];

	for(var i = 0; i < 3; i++){
		myShotSound[i] = new buzz.sound( "/sound/shot", {
		    formats: ["ogg", "mp3"]
		});

		enemyShotSound[i] = new buzz.sound( "/sound/shot", {
		    formats: ["ogg", "mp3"]
		});
		enemyShotSound[i].setVolume(20);
	}
}

function outOfFocus(){
	document.getElementById("outOfFocus").style.display = "block";
	document.removeEventListener("mousemove", moveCallback, false);
}

function inFocus(){
	document.getElementById("outOfFocus").style.display = "none";
	document.addEventListener("mousemove", moveCallback, false);
}

function errorCallback(e){
	outOfFocus();
}

function requestLock(){
	var canvas = document.getElementById("draw");
	canvas.addEventListener('click', function(){
		if(gameStopped)
			return;
		lockPointer();
	});
}

var onMove;

function moveCallback(e) {
	var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
	var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;


	if(onMove != undefined)
		onMove(movementX, movementY);
}

function lockPointer(){

	var canvas = document.getElementById("draw");
	outOfFocus();

	function pointerLockChange(){
		if(document.mozPointerLockElement === canvas ||
			document.webkitPointerLockElement === canvas ||
			document.pointerLockElement === canvas)
			inFocus();
		else
			outOfFocus();
	}

	document.addEventListener('pointerlockerror', errorCallback, false);
	document.addEventListener('mozpointerlockerror', errorCallback, false);
	document.addEventListener('webkitpointerlockerror', errorCallback, false);

	document.addEventListener('pointerlockchange', pointerLockChange, false);
	document.addEventListener('mozpointerlockchange', pointerLockChange, false);
	document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

	canvas.requestPointerLock = canvas.requestPointerLock ||
			     canvas.mozRequestPointerLock ||
			     canvas.webkitRequestPointerLock;
	// Ask the browser to lock the pointer
	canvas.requestPointerLock();

	// Ask the browser to release the pointer
	/*document.exitPointerLock = document.exitPointerLock ||
				   document.mozExitPointerLock ||
				   document.webkitExitPointerLock;
	document.exitPointerLock();*/
}

var hitTimer;

function stopGame(){
	gameStopped = true;
}

var canvas;
var context;

var coverSizeY;
var coverSize;

var scopeCoverX;
var scopeCoverY;

window.addEventListener("load", function(){
	console.log("Loaded canvas and context");
	canvas = document.getElementById("draw");
	context = canvas.getContext("2d");
});

var characterPos;

var loadedOnce = false;

var enemyShotSoundI = 0;
var myShotSoundI = 0;

function showGame(_characterPos){
	gameStopped = false;
	characterPos = _characterPos;
	lockPointer();
	console.log("Starting game");

	if(!loadedOnce){
		socket.on("hit", function(data){
			enemyShotSound[enemyShotSoundI].play();
			if(data.where == "nowhere")
				return;
			hitTimer = 10;

			enemyShotSoundI++;
			if(enemyShotSoundI > 2)
				enemyShotSoundI = 0;
		});

		window.addEventListener('resize', function resizeEvent(){
			if(gameStopped)
				return;

			canvas.width = window.innerWidth;
		    canvas.height = window.innerHeight;

		    centerX = (canvas.width - 1920) / 2;
			centerY = (canvas.height - 1080) / 2;

			coverSizeY = (canvas.height - 600) / 2;
			coverSize = (canvas.width - 1000) / 2;

			scopeCoverX = (canvas.width - scope.width) / 2;
			scopeCoverY = (canvas.height - scope.height) / 2;

		    return resizeEvent;
		}(), false);


		loadedOnce = true;
	}


	frame(+new Date(), true);
}

var cameraX = 0;


var cameraY = 0;

onMove = function(x, y){
	cameraX -= x / 2.0;

	//if(cameraX > 0)
	//	cameraX = 0;
/*
	if(cameraX < 0 - 2000 * zoom + 1000)
		cameraX = 0 - 2000 * zoom + 1000;
*/
	cameraY -= y / 2.0;
	/*
	if(cameraY > 0)
		cameraY = 0;

*/
}
var scoped = false;

function toggleScope(){
	scoped = !scoped;

	if(scoped){
		cameraX -= 1000/4;
		cameraY -= 600/4;
	}
	else{
		cameraX += 1000/4;
		cameraY += 600/4;
	}
}

function drawCharacter(charImg){
	context.drawImage(charImg,
	/*x*/ coverSize + (cameraX + characterPos.x) * zoom, 
	/*y*/ coverSizeY + (cameraY + characterPos.y) * zoom,
	/*width*/ charImg.width * zoom,
	/*height*/ charImg.height * zoom);

}

function drawLayer(layer){
	context.drawImage(layer,
	/*x*/ coverSize + cameraX * zoom,
	/*y*/ coverSizeY + cameraY * zoom,
	/*width*/ width * zoom,
	/*height*/ height * zoom);
}

var damageTexts = [];

function hit(where){
	socket.emit("hit", {where: where});
	console.log(where + "!");

	var dmg;
	if(where == "headshot")
		dmg = 200;
	else if(where == "body")
		dmg = 100;
	else if(where == "arm")
		dmg = 50;
	else if(where == "heart")
		dmg = 200;
	else
		return;

	damageTexts.push({dmg: dmg,
		x: characterPos.x + 5,
		y:  characterPos.y,
		ticks: 120
	});
}

var recoiling = 0;

window.addEventListener("mousedown", function(e){
	if(gameStopped)
		return;
	if(e.which == 3)
		toggleScope();
	else if(e.which == 1){
		if(!scoped)
			return;


		drawCharacter(hitbox);
		drawLayer(foregroundImage);

		var x = canvas.width / 2;
		var y = canvas.height / 2;


		function testP(xOffset, yOffset){
			var p = context.getImageData(x + xOffset, y + yOffset, 1, 1).data;
			if(p[0] == 255 && p[1] == 0 && p[2] == 255)
				hit("headshot");
			else if(p[0] == 255 && p[1] == 0 && p[2] == 127)
				hit("body");
			else if(p[0] == 127 && p[1] == 0 && p[2] == 127)
				hit("arm");
			else if(p[0] == 127 && p[1] == 0 && p[2] == 255)
				hit("heart");
			else{
				hit("nowhere")
				return false;
			}
			return true;
		}

		testP(0, 0) || testP(0, 1) || testP(1, 0) || testP(0, -1) || testP(-1, 0)

		//Shoot
		recoiling = 4;
		
		myShotSound[myShotSoundI].play();

		myShotSoundI++;
		if(myShotSoundI > 2)
			myShotSoundI = 0;
	}
});

window.addEventListener("keydown", function(e){
	if(e.keyCode == 32)
		toggleScope();
});

var zoom;

var width = 2000, height = 600;

function frame(time, first){
	if(first){
		cameraX = -(2000/2 - 500);
		cameraY = 0;
		scoped = false;
	}
	
	hitTimer--;

	if(recoiling > 0){
		cameraX -= 10;
		cameraY += 10;
		recoiling--;
	}

	context.fillStyle = "black";
	context.clearRect(0, 0, 1920, 1080);

	if(scoped){
		zoom = 2;
	}
	else{
		zoom = 1;
	}

	var thisCoverSizeX = scoped ? scopeCoverX : coverSize;
	var thisCoverSizeY = scoped ? scopeCoverY : coverSizeY;

	drawLayer(backgroundImage);
	drawCharacter(character);
	drawLayer(foregroundImage);

	if(scoped)
		context.drawImage(scope, canvas.width/2 -scope.width/2, canvas.height/2 - scope.height/2);


	if(scoped){
		context.fillStyle = "black";
		drawOverlay(true);
	}

	context.fillStyle = "gray";

	drawOverlay(false);

	if(hitTimer>0){
		context.fillStyle = "rgba(255, 0, 0, 0.4)";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}


	context.font = "20pt Arial";
	context.fillStyle = "red";

	for(var i = 0; i < damageTexts.length; i++){
		var txt = damageTexts[i];
		context.fillText(txt.dmg,
			coverSize + (cameraX + txt.x) * zoom,
			coverSizeY + (cameraY + txt.y) * zoom);

		txt.y -= .3;
		txt.ticks --;
		if(txt.ticks == 0)
			damageTexts.splice(i, 1);
	}

	function drawOverlay(scopeOverlay){
		var thisCoverSizeX = scopeOverlay ? scopeCoverX : coverSize;
		var thisCoverSizeY = scopeOverlay ? scopeCoverY : coverSizeY;
		var thisWidth = scopeOverlay ? scope.width : 1000;
		var thisHeight = scopeOverlay ? scope.height : 600;

		var extra = scopeOverlay ? 2 : 0;

		context.fillRect(0, 0, thisCoverSizeX, canvas.height); //left side
		context.fillRect(thisCoverSizeX + thisWidth - extra, 0, thisCoverSizeX + extra, canvas.height); //right side
		context.fillRect(0, 0, canvas.width, thisCoverSizeY + extra); //top
		context.fillRect(0, thisCoverSizeY + thisHeight , canvas.width, thisCoverSizeY); //bottom
	} 
	
	if(gameStopped){
		console.log("Game stopped.");
		return;
	}

	window.requestAnimationFrame(frame);
}