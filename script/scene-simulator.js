var origin = {'left':0,'right':0};
var map = {'row':1,'col':1};
var userPos = {'x':0,'y':0, 'rotate':0};

var currentState = 1;
var boundary = {'top':1,'left':0.5,'bottom':0,'right':0.5};
var obstacle = [];

var moveSpeed = 0.05;
var rotateSpeed = 10;

var report = "";
var reportTimer;
var reportTemp = [];
var angleTemp = [];

var userSize = 0.3;
var blockSize = 0.5;
var timer;
var timeCount = 0;
var hits = 0;

var detectionRange = 5;

$(document).ready(function(){
	//reportData();
	genGrid(1,1);
	reportTimer = setInterval(reportData, 100);
	$('#input-w').keyup(function(){
		checkSizeComplete();
	});
	$('#input-h').keyup(function(){
		checkSizeComplete();
	});
	$(document).keydown(function(e) {
		if(e.keyCode == 83) document.location="matlab:radar.stopTimer()";
		if(currentState == 4){
		    if(e.keyCode == 37) rotateLeft();
		    if(e.keyCode == 38) moveUp();
		    if(e.keyCode == 39) rotateRight();
		    //if(e.keyCode == 40) turnBack();
		}
	});
});

function genGrid(w,h){

	var grid = document.getElementById('grid-cover');

	$('#grid-cover').width(((w+1)*5)+'vw');
	$('#grid-cover').height((h*5)+'vw');

	grid.innerHTML = "";
	for(i = 0; i < h; i++){
		for(j = 0; j < w; j++){
			var gw = (j+1)-(w/2)-0.5;
			var gh = h-(i+1)+0.5;
			grid.innerHTML += '<div class="grid" id="maps'+gw+'s'+gh+'"></div>'; //id = map-h-w
		}
	}
	grid.innerHTML += '<div class="user" id="user"><div class="radar"></div><div class="nose"></div></div>';

	reposGrid();

	map.col = w;
	map.row = h;

	boundary.top = h;
	boundary.left = -w/2;
	boundary.right = w/2;
	boundary.bottom = 0;

	updateUserPosition();
}

function reposGrid(){
	var gc = $('#grid-cover');
	var gw = -gc.width()/2;
	var gh = -gc.height()/2;
	gc.css({'margin-left':gw+'px'});
	gc.css({'margin-top':gh+'px'});
}

function expand(){
	$('#scene-cover').width('100%');
	$('#control-cover').width('0%');
	resizeGrid();
}

function updateUserPosition(){

	if(userPos.x > boundary.right) userPos.x = boundary.right;
	if(userPos.x < boundary.left) userPos.x = boundary.left;
	if(userPos.y < boundary.bottom) userPos.y = boundary.bottom;
	if(userPos.y >= boundary.top) {
		userPos.y = boundary.top;
		changeState(5);
	}

	var x = userPos.x;
	var y = userPos.y;

	var user = $('#user');
	var mapW = ($('.grid').width() * map.col) + ((map.col + 1) * 2); // * 2px
	var mapH = $('.grid').height() * map.row + ((map.row + 1) * 2); 

	var scale = $('.grid').width();

	var dirX = 0, dirY = 0;
	if(x != 0) dirX = x / Math.abs(x);
	if(y != 0) dirY = y / Math.abs(y);

	var userX = (x * scale) + (mapW/2) - 2 + (dirX * Math.floor(x) * 2);
	var userY = mapH - (y * scale) - 2 - (dirY * (Math.floor(y) + 1) * 2);

	user.css({'left':userX+'px','top':userY+'px'});
}

function changeState(state){

	currentState = state;

	//state 1 define area size
	if(state == 1){
		$('#result-panel').fadeOut(2);
		$('#obj-panel').fadeOut(2);
		$('#size-panel').fadeIn(2);
		$('#user').hide();
	} 

	//state 2 selected obstacle
	else if(state == 2){
		var w = $('#input-w').val();
		var h = $('#input-h').val();
		if(w !== "" && h !== ""){
			genGrid(parseInt(w),parseInt(h));
			$('#start-panel').fadeOut(2);
			$('#size-panel').fadeOut(2);
			$('#obj-panel').fadeIn(2);
			$('#user').show();
			$('.grid').click(function(){
				if(currentState == 2){
					if($(this).hasClass('grid-selected')){
						if($(this).hasClass('grid-selected-s')){
							$(this).removeClass('grid-selected-s');
							$(this).addClass('grid-selected-m');
						} else if($(this).hasClass('grid-selected-m')){
							$(this).removeClass('grid-selected-m');
							$(this).addClass('grid-selected-l');
						} else if($(this).hasClass('grid-selected-l')){
							$(this).removeClass('grid-selected-l');
							$(this).removeClass('grid-selected');
						} 
					} else {
						$(this).addClass('grid-selected grid-selected-s');
					}
				}
			});
		}
	} 

	//state 3 start state
	else if(state == 3){
		genObstacle();
		$('#obj-panel').fadeOut(2);
		$('#start-panel').fadeIn(2);
	}

	//state 4 play
	else if(state == 4){
		document.location="matlab:radar.startTimer();";
		timer = setInterval(function(){
			timeCount++;
		}, 1000);
		$('#log-panel').fadeIn(2);
		$('#start-panel').fadeOut(2);
	}

	//state 5 result
	else if(state == 5){
		clearInterval(timer);
		$('#log-panel').fadeOut(2);
		$('#result-panel').fadeIn(2);
		var avRate = 100;
		if(obstacle.length > 0) avRate = Math.floor((obstacle.length - hits) * 10000 / obstacle.length)/100;

		var timeMin = Math.floor(timeCount / 60);
		var timeSec = timeCount - (timeMin * 60);
		if(timeSec < 10) timeSec = "0"+timeSec;

		var info = document.getElementById('result-info');
		info.innerHTML = "Time: "+timeMin+":"+timeSec+" <br>"+
            "Obstacle: "+obstacle.length+" <br>" +
            "Hit: "+hits+" <br>" +
            "Avoidance Rate: "+avRate+"% <br><br>";

		reset();
		document.location="matlab:radar.finish();radar.data=[0 1000];";
	}
}

function checkSizeComplete(){
	var w = $('#input-w').val();
	var h = $('#input-h').val();
	if(w !== "" && h !== ""){
		$('#size-btn').removeClass('btn-disable');
	} else {
		$('#size-btn').addClass('btn-disable');
	}
}

function moveUp(){
	var ux = userPos.x;
	var uy = userPos.y;
	var deg = userPos.rotate;
	ux += Math.sin(toRadians(deg)) * moveSpeed;
	uy += Math.cos(toRadians(deg)) * moveSpeed;
	ux = toDecimal(ux);
	uy = toDecimal(uy);

	var noCollide = true;
	var noWay = false;
	var collideCase = [0,0,0];

	for(i = 0; i < obstacle.length; i++){
		var distance = obstacle[i].distance;
		var angle = obstacle[i].direction;
		var block = document.getElementById(obstacle[i].id);
		var ox = obstacle[i].x;
		var oy = obstacle[i].y;

		if(collide(ox,oy,ux,uy)){
			noCollide = false;
			
			// console.log(ux,uy,ox,oy);
			// console.log('ux - userSize < ox + blockSize = '+(ux - userSize)+' < '+(ox + blockSize));
			// console.log('ux + userSize > ox - blockSize = '+(ux + userSize)+' > '+(ox - blockSize));
			// console.log('uy - userSize < oy + blockSize = '+(uy - userSize)+' < '+(oy + blockSize));
			// console.log('uy + userSize > oy - blockSize = '+(uy + userSize)+' > '+(oy - blockSize));
			// console.log('userPos.y + userSize , oy - blockSize = '+(userPos.y + userSize)+' , '+(oy - blockSize));
			// console.log('userPos.y - userSize , oy + blockSize = '+(userPos.y + userSize)+' , '+(oy - blockSize));

			//below
			if(ux - userSize < ox + blockSize && 
			   ux + userSize > ox - blockSize && 
			   uy + userSize > oy - blockSize &&
			   userPos.y + userSize <= oy - blockSize){
				// console.log('collide case 1');
				collideCase[0] = 1;
				setBlockCollide(obstacle[i].id);
			} 
			//left right
			else if((ux - userSize < ox + blockSize || ux + userSize > ox - blockSize) && 
					uy - userSize < oy + blockSize && 
					uy + userSize > oy - blockSize &&
					userPos.y + userSize > oy - blockSize &&
					userPos.y - userSize < oy + blockSize){
				// console.log('collide case 2');
				collideCase[1] = 1;
				setBlockCollide(obstacle[i].id);
			} 
			//top
			else if(ux - userSize < ox + blockSize && 
			   ux + userSize > ox - blockSize && 
			   uy - userSize < oy + blockSize &&
			   userPos.y - userSize >= oy + blockSize){
				// console.log('collide case 3');
				collideCase[2] = 1;
				setBlockCollide(obstacle[i].id);
			}

		}
	}

	if(collideCase[0] == 1 && collideCase[1] == 1){
		//nothing
	} else if(collideCase[2] == 1 && collideCase[1] == 1){
		//nothing
	} else if(collideCase[0] == 1 || collideCase[2] == 1){
		userPos.x = ux;
	} else if(collideCase[1] == 1){
		userPos.y = uy;
	}

	if(noCollide){
		userPos.x = ux;
		userPos.y = uy;
	}

	updateUserPosition();
}

function rotateRight(){
	userPos.rotate += rotateSpeed;
	if(userPos.rotate >= 180) userPos.rotate -= 360;
	$('#user').css({'transform' : 'rotate('+ userPos.rotate +'deg) translate(-50%,-50%)'});
	// console.log('user deg : '+userPos.rotate);
}

function rotateLeft(){
	userPos.rotate -= rotateSpeed;
	if(userPos.rotate < -180) userPos.rotate += 360;
	$('#user').css({'transform' : 'rotate('+ userPos.rotate +'deg) translate(-50%,-50%)'});
	// console.log('user deg : '+userPos.rotate);
}

function turnBack(){
	userPos.rotate -= 180;
	if(userPos.rotate < -180) userPos.rotate += 360;
	$('#user').css({'transform' : 'rotate('+ userPos.rotate +'deg) translate(-50%,-50%)'});
	// console.log('user deg : '+userPos.rotate);
}

function genObstacle(){
	var objs = document.getElementsByClassName('grid-selected');
	obstacle = [];
	for(i = 0; i < objs.length; i++){
		var id = objs[i].id;
		var x = parseFloat(id.split('s')[1]);
		var y = parseFloat(id.split('s')[2]);
		var type = objs[i].classList[2];
		var sizeText = type.split('-')[2];
		var size = 1;

		if(sizeText == 's') 	 size = 1;
		else if(sizeText == 'm') size = 2;
		else if(sizeText == 'l') size = 3;

		obstacle[i] = {'id':id,'x':x,'y':y,'distance':0,'direction':0,'size':size};
	}
	//console.log('obstacle list :');
	//console.log(obstacle);
	//console.log('-------');
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function toDecimal(val){
	return Math.floor(val * 10000) / 10000;
}

function calObstacleDirection(){
	report = "";
	var log = "";
	var ux = userPos.x;
	var uy = userPos.y;
	for(i = 0; i < obstacle.length; i++){
		var disx = obstacle[i].x - ux;
		var disy = Math.abs(obstacle[i].y - uy);
		var angle = 0;

		if(obstacle[i].y > uy) {
			// console.log('case 1');
			if(obstacle[i].x == ux) angle = 0 - userPos.rotate;
			else 				    angle = toDegrees(Math.atan(disx/disy)) - userPos.rotate;
		}
		else {
			// console.log('case 2');
			if(obstacle[i].x == ux) angle = 180;
			else {			   
				angle = toDegrees(Math.atan(disy/disx));
				if(angle < 0) 		{
					// console.log('case 2.1');
					angle -= 90;
				}
				else if(angle > 0)	{
					// console.log('case 2.2');
					angle += 90;
				}
				else {
					// console.log('case 2.3');
					if(obstacle[i].x < ux) angle = -90;
					else 			       angle = 90;
				}
			}
			angle -= userPos.rotate;
		}


		if(angle >= 180) angle -= 360;
		else if(angle < -180) angle += 360;

		angle = toDecimal(angle);

		var distance = Math.sqrt((disx*disx)+(disy*disy));
		distance = toDecimal(distance);


		//console.log('Collide '+collision($('#user'),$('#'+obstacle[i].id)));
		// console.log('Obstacle Id '+obstacle[i].id+' : direction = '+angle+' , distance = '+distance);
		obstacle[i].distance = distance;
		obstacle[i].direction = angle;

		var coordination = [0,0,0,0,0,0,0,0,0];
		coordination[0] = Math.sqrt(( (disx-blockSize) * (disx-blockSize) ) + ( (disy-blockSize) * (disy-blockSize) ));
		coordination[1] = Math.sqrt(( (disx) * (disx) ) + ( (disy-blockSize) * (disy-blockSize) ));
		coordination[2] = Math.sqrt(( (disx+blockSize) * (disx+blockSize) ) + ( (disy-blockSize) * (disy-blockSize) ));
		coordination[3] = Math.sqrt(( (disx-blockSize) * (disx-blockSize) ) + ( (disy) * (disy) ));
		coordination[4] = distance;
		coordination[5] = Math.sqrt(( (disx+blockSize) * (disx+blockSize) ) + ( (disy) * (disy) ));
		coordination[6] = Math.sqrt(( (disx-blockSize) * (disx-blockSize) ) + ( (disy+blockSize) * (disy+blockSize) ));
		coordination[7] = Math.sqrt(( (disx) * (disx) ) + ( (disy+blockSize) * (disy+blockSize) ));
		coordination[8] = Math.sqrt(( (disx+blockSize) * (disx+blockSize) ) + ( (disy+blockSize) * (disy+blockSize) ));

		var minDis = 100000;
		for(k = 0; k < 9; k++){
			if(coordination[k] < minDis){
				minDis = coordination[k];
			}
		}

		if(angle >= -90 && angle <= 90 && distance < detectionRange){
			if(report == "") report = angle+' '+minDis+' '+obstacle[i].size;
			else 	   report += '; '+angle+' '+minDis+' '+obstacle[i].size;
			log += 'direction = '+(Math.floor(angle*100)/100)+', distance (m) = '+(Math.floor(minDis*100)/100)+', size = '+obstacle[i].size+'<br>';
		}

		// var block = document.getElementById(obstacle[i].id);
		// if(collide(obstacle[i].x,obstacle[i].y,ux,uy) && angle >= -45 && angle <= 45 && !hasClass(block,'collide')){
		// 	block.className += " collide";
		// }

	}

	document.getElementById('console').innerHTML = "<h1>Console</h1><br>"+log;
}

function reportData(){
	if(currentState == 4){
		calObstacleDirection();
		if(report == "") document.location="matlab:radar.data=[0 1000];";
		else            document.location="matlab:radar.data=["+report+"];";
	}
}

function reset(){
	$('#input-w').val('');
	$('#input-h').val('');
	userPos = {'x':0,'y':0, 'rotate':0};
	genGrid(1,1);
	obstacle = [];
	hits = 0;
	timeCount = 0;
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function collide(ox,oy,ux,uy){

	// console.log('check collide : user = ' + ux + ',' + uy+' : obj = '+ ox+','+oy);

	if(ux - userSize >= ox + blockSize) {
		// console.log('no collide left');
		return false;
	}
	if(ux + userSize <= ox - blockSize) {
		// console.log('no collide right');
		return false;
	}
	if(uy - userSize >= oy + blockSize) {
		// console.log('no collide top');
		return false;
	}
	if(uy + userSize <= oy - blockSize) {
		// console.log('no collide bot');
		return false;
	}

	// console.log('collide');
	return true;
}

function setBlockCollide(id){
	var block = document.getElementById(id);
	if(!hasClass(block,'collide')){
		block.className += " collide";
		hits++;
	}
}