var disableStartscreen;

window.addEventListener("load", function(){
	var canvas = document.getElementById("draw");
	var context = canvas.getContext("2d");

	var centerX, centerY, mouseX, mouseY;

	window.addEventListener('resize', function resizeEvent(){
		canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        centerX = (canvas.width - 1920) / 2;
		centerY = (canvas.height - 1080) / 2;

        return resizeEvent;
	}(), false);
	
	window.addEventListener('mousemove', function(e){
		mouseX = e.x;
		mouseY = e.y;
	});

	var disabled = false;

	disableStartscreen = function(){
		disabled = true;
	}

	context.globalAlpha = 1;

	var houses = new Image();
	houses.src = "/images/houses.png";

	var fog = new Image();
	fog.src = "/images/fog.png";

	function frame(){
		context.clearRect(0, 0, 1920, 1080);

		if(disabled)
			return;

		context.fillStyle = "white";

		var x = centerX + (mouseX - 1920/2) / 10;
		var y = centerY + (mouseY - 1080/2) / 10;

		context.fillRect(x + 5, y + 5, 1910, 1070);
		context.drawImage(houses, centerX, centerY);
		context.drawImage(fog, x, y);

		window.requestAnimationFrame(frame);
	}

	frame();
});