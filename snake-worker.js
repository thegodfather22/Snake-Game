function Point(pos_x,pos_y){
	this.x = pos_x;
	this.y = pos_y;
}

function Node(parent,point,children,g_score,h_score){
	this.parent = parent;
	this.point = point;
	this.children = children;
	this.g_score = g_score;
	this.h_score = h_score;
	this.f_score = g_score + h_score;
}

var config = new Object();
var stats = new Object();
stats.food = 0;
var squares;
var snake;
var food;
var length = 0;
var moves = new Array();

function init(){

	squares = new Array(config.grid_size);

	for(var i = 0 ; i < config.grid_size ; i++){
		squares[i] = new Array(config.grid_size);
	}
	
    for(var i = 0 ; i < config.grid_size ; i++){
		for(var j = 0 ; j < config.grid_size ; j++){
			
            if(i == 0 || j == 0 || i == config.grid_size - 1 || j == config.grid_size - 1){
				squares[i][j] = 3;
			}
            
            else{
				squares[i][j] = 0;
			}
		}
	}
	
    snake = place_snake(config.snake_length);
	place_obstacles(config.number_obstacles);
	place_food();
	refresh_view();
}

onmessage = function(event) {
	console.log(event.data.do);
	switch(event.data.do){
		case 'start':
			start();
			break;
		case 'pause':
			pause();
			break;
		case 'resume':
			resume();
			break;
		case 'init':
			config = event.data.config;
			init();
			break;
		case 'set_search':
			config.search = event.data.search;
			break;
		case 'g':
	}
}

function run(){
    if(moves.length == 0){
		switch(config.search){
			case 'A* with Euclidean':
				findpath_a("H1");
				break;
			case 'A* with Manhatten':
				findpath_a("H2");
				break;
			case 'A* with (E + M) / 2':
				findpath_a("H1+H2");
				break;
		}
	}
    
    else{
		move(moves.shift());
	}
	
    refresh_view();

    clearTimeout(config.runTimeout);
	config.runTimeout = setTimeout(run, 100);
}

function findpath_a(search_type){
	postMessage("running " + search_type);

    var openList = new Array();
	var closedList = new Array(config.grid_size);

    for(var i = 0 ; i < config.grid_size ; i++){
		closedList[i] = new Array(config.grid_size);
	}

    for(var i = 0 ; i < config.grid_size ; i++){
		for(var j = 0 ; j < config.grid_size ; j++){
			closedList[i][j] = 0;
		}
	}
	
	openList.push(new Node(null,snake[0],new Array(),0,heuristic_estimate(snake[0],food,search_type)));
	
    while (openList.length != 0) {
		
        openList.sort(function(a,b){return a.f_score - b.f_score})
		
        var n = openList.shift();
		
		if(closedList[n.point.x][n.point.y] == 1){
			continue;
        }
		
		if (squares[n.point.x][n.point.y] == 2) {
			
            do{
				moves.unshift(n.point);
				
                if(squares[n.point.x][n.point.y] == 0){
					squares[n.point.x][n.point.y] = 1;
                }
				
                n = n.parent;
			} while(n.parent != null)
			
            break;
		}
		
        closedList[n.point.x][n.point.y] = 1;
		
		if(closedList[n.point.x][n.point.y - 1] == 0 && (squares[n.point.x][n.point.y - 1] == 0 || squares[n.point.x][n.point.y - 1] == 2)){
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y - 1),new Array(),n.g_score + 1,heuristic_estimate(new Point(n.point.x,n.point.y-1),food,search_type)));
        }
		if(closedList[n.point.x + 1][n.point.y] == 0 && (squares[n.point.x + 1][n.point.y] == 0 || squares[n.point.x + 1][n.point.y] == 2)){
			n.children.unshift(new Node(n,new Point(n.point.x + 1,n.point.y),new Array(),n.g_score + 1,heuristic_estimate(new Point(n.point.x+1,n.point.y),food,search_type)));
        }
		if(closedList[n.point.x][n.point.y + 1] == 0 && (squares[n.point.x][n.point.y + 1] == 0 || squares[n.point.x][n.point.y + 1] == 2)){
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y + 1),new Array(),n.g_score + 1,heuristic_estimate(new Point(n.point.x,n.point.y + 1),food,search_type)));
        }
		if(closedList[n.point.x - 1][n.point.y] == 0 && (squares[n.point.x - 1][n.point.y] == 0 || squares[n.point.x - 1][n.point.y] == 2)){
			n.children.unshift(new Node(n,new Point(n.point.x - 1,n.point.y),new Array(),n.g_score + 1,heuristic_estimate(new Point(n.point.x - 1,n.point.y),food,search_type)));
        }
		
        for(var i = 0 ; i < n.children.length ; i++){
		
            var index = in_openlist(openList,n.children[i]);
		
            if(index < 0){
				openList.push(n.children[i]);
			}
            
            else{
				if(n.children[i].f_score < openList[index].f_score){
					
					for(var j = 0 ; j < openList[index].children.length ; j++){
						openList[index].children[j].parent = n.children[i];
					}
                    
					n.children[i].children = openList[index].children;
					
                    //remove the old node from openList
					openList.splice(index,1);
					//add new node to openList
					openList.push(n.children[i]);
					//Update the scores for all child nodes.
					update_scores(n.children[i]);
				}
			}
		}
	}
}

function update_scores(parent){
	for(var i = 0 ; i < parent.children.length ; i++){
		parent.children[i].g_score = parent.g_score + 1;
		parent.children[i].h_score = heuristic_estimate(parent.children[i].point);
		parent.children[i].f_score = parent.children[i].g_score + parent.children[i].h_score;
		update_scores(parent.children[i]);
	}
}

function in_openlist(openList , aNode){
	for(var i = 0 ; i < openList.length ; i++){
		if(openList[i].point.x == aNode.point.x && openList[i].point.y == aNode.point.y)
			return i;
	}
	return -1;
}

function heuristic_estimate(point1, point2 , search_type){
	switch(search_type){
		case "H1":
			return heuristic_estimate_E(point1 , point2);
		case "H2":
			return heuristic_estimate_M(point1 , point2);
		case "H1+H2":
			return (heuristic_estimate_E(point1 , point2) + heuristic_estimate_M(point1 , point2)) / 2;
	}
}

//First heuristic: calculate the direct path to the food. This will usually be less than actual, because it's a slant distance.
function heuristic_estimate_E(point1 , point2){
	return Math.sqrt(Math.pow(point1.x - point2.x , 2) + Math.pow(point1.y - point2.y , 2));
}
//Second heuristic: calculate the actual distance that the snake would have to travel to reach the food.
function heuristic_estimate_M(point1,point2){
	return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

//start the run function
function start(){
	init();
	config.runTimeout = setTimeout(run, 100);
	stats.food = 0;
}

function pause(){
	clearTimeout(config.runTimeout);
}

function resume(){
	config.runTimeout = setTimeout(run,100);
}

function refresh_view(){
	var message = new Object();
	message.type = 'move';
	message.squares = squares;
	message.stats = stats;
	postMessage(message);
}

function move(new_head){
    //check that this is a legal move. Square must be adjacent and empty (can move to empty, food or path).
    if((!is_adjacent(new_head,snake[0])) || squares[new_head.x][new_head.y] > 2){
        pause();
        return false;
    }
    if(squares[new_head.x][new_head.y] == 2){
		
        place_food();
       
        var tail = new Point(snake[snake.length - 1].x, snake[snake.length - 1].y);
        
        snake.push(tail);
        
        stats.food++;
    }

    if(squares[new_head.x][new_head.y] != 2){
        squares[snake[snake.length - 1].x][snake[snake.length - 1].y] = 0;
    }
    
    for(var i = snake.length - 1 ; i > 0; i--){
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }
    
    snake[0].x = new_head.x;
    snake[0].y = new_head.y;
    
    for(var i = 0 ; i < snake.length ; i++){
        squares[snake[i].x][snake[i].y] = 5 + i;
    }

    return true;
}


function is_adjacent(point1, point2){
	if(point1.x == point2.x && (point1.y == point2.y - 1 || point1.y == point2.y + 1))
		return true;
	if(point1.y == point2.y && (point1.x == point2.x - 1 || point1.x == point2.x + 1))
		return true;
	return false;
}

function place_snake(length){
	var middle_x = Math.floor(config.grid_size / 2);
	var middle_y = Math.floor(config.grid_size / 2);
	var snake = new Array(length);
	while(length){
		squares[middle_x + length][middle_y] = 4 + length;
		snake[length - 1] = new Point(middle_x + length , middle_y);
		length--;
	}
	return snake;
}

function place_obstacles(count,flag){
    
    for(var c = 0 ; c < count ;) {
	var random_x = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
	var random_y = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
	if(squares[random_x][random_y] == 0){
		squares[random_x][random_y] = 4;
		c++;
	}
}
}


function place_food(){
	do{
		var random_x = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
		var random_y = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
	} while(squares[random_x][random_y] != 0);
	squares[random_x][random_y] = 2;
	food = new Point(random_x,random_y);
}

