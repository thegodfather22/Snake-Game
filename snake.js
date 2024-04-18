var ctx;

var config = new Object();
config.grid_size = 22;
config.number_obstacles = 20;
config.square_size = 22;
config.snake_length = 1;
config.runTimeout = 0;

function init(){
	
    ctx = document.getElementById('canvas').getContext("2d");
	
	var message = new Object();
	message.do = 'init';
	message.config = config;
	worker.postMessage(message);
	change_search();
}

function refresh_view(data){

	document.getElementById('eaten_Apples').innerHTML = data.stats.food;
	
    for(var i = 0 ; i < config.grid_size ; i++){
		for(var j = 0 ; j < config.grid_size ; j++){
			switch(data.squares[i][j]){
			case 0:
				ctx.fillStyle = "#000";
				ctx.beginPath();
				ctx.rect(i * config.square_size, j * config.square_size, config.square_size - 1, config.square_size - 1);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fillStyle = "#000";
				ctx.stroke();
				ctx.strokeStyle="#303d38";
				break;
			case 1:
				ctx.fillStyle = "#000";
				ctx.beginPath();
				ctx.rect(i * config.square_size,j * config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 2:
                ctx.fillStyle = "red";
				ctx.beginPath();
				ctx.rect(i * config.square_size,j * config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 3:
				ctx.fillStyle = "#05442c";
				ctx.beginPath();
				ctx.rect(i * config.square_size,j * config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 4:
				ctx.fillStyle = "#804000";
				ctx.beginPath();
				ctx.rect(i * config.square_size,j * config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			default:
				if(data.squares[i][j] == 5){
					ctx.fillStyle = "#00FF00";
					ctx.beginPath();
					ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
					ctx.closePath();
					ctx.fill();
					break;
				}
				if(data.squares[i][j] == 6){
					ctx.fillStyle = "#800080";
					ctx.beginPath();
					ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
					ctx.closePath();
					ctx.fill();
					break;	
				}		
			}
		}
	}
}

var worker = new Worker("snake-worker.js");

worker.onmessage = function(event) {
	
    if(event.data.type == 'move') {
		refresh_view(event.data);
    }
};

worker.onerror = function(error) {  
	console.log(error.message);
};  

function start(){
	var message = new Object();
	message.do = 'start';
	worker.postMessage(message);
}

function pause(){
	var message = new Object();
	message.do = 'pause';
	worker.postMessage(message);
}

function resume(){
	var message = new Object();
	message.do = 'resume';
	worker.postMessage(message);
}

function change_search(){
	var message = new Object();
	message.do = 'set_search';
	message.search = document.getElementById('search').value;
	worker.postMessage(message);
}
