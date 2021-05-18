/*
 Midterm
 Ian Macfarlane
 A02243880
*/

let prevTime = performance.now();

let backgroundImage = document.getElementById('background');
let bombImage = document.getElementById('bomb');
let checkmarkImage = document.getElementById('checkmark');
let explosionImage = document.getElementById('explosion');
let numberImage = [];
numberImage.push(document.getElementById('number0'));
numberImage.push(document.getElementById('number1'));
numberImage.push(document.getElementById('number2'));
numberImage.push(document.getElementById('number3'));
numberImage.push(document.getElementById('number4'));
numberImage.push(document.getElementById('number5'));
numberImage.push(document.getElementById('number6'));
numberImage.push(document.getElementById('number7'));
numberImage.push(document.getElementById('number8'));
numberImage.push(document.getElementById('number9'));
let subMenu = document.getElementById('subMenu');

let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');

canvas.addEventListener('click', onClick);

let prepTimer;
let score = 0;
let gameTimer = 0;
let bombs;
let gameOver = false;
let showHighScores = false;

generateLevel(1);

gameLoop(prevTime);

function gameLoop(timeStamp) {
	elapsedTime = timeStamp - prevTime;
	prevTime = timeStamp;

	processInput();
	update(elapsedTime);
	render();

	requestAnimationFrame(gameLoop);
}

function processInput() {
}

function onClick(e) {
	if (prepTimer <= 0) {
		let xClick = e.pageX-canvas.offsetLeft;
		let yClick = e.pageY-canvas.offsetTop;

		// if click on bomb
		let column = 0;
		let row = 0;
		for (let i = 0; i < bombs.length; i++) {

			if (xClick > 100+(100*column) && xClick < 150+(100*column) && yClick > 100+(50*row) && yClick < 100+(50*(row+1))) {
				if (bombs[i] !== 0 && bombs[i] !== 'defused') {
					score += Math.floor(bombs[i])+1;
					bombs[i] = 'defused';
				}
			}

			column++;
			if (column === 3) {
				column = 0;
				row++;
			}

		}
	}
}

function onNewGameClick(e) {
	// new game
	score = 0;
	gameTimer = 0;
	gameOver = false;

	generateLevel(1);
}

function onHighScoresClick(e) {
	// high scores
	if (localStorage.score) {
		let board = JSON.parse(localStorage.score);
		let scoreBoard = '';
		for (let i = 0; i < board.length; i++) {
			scoreBoard += '<div>' + board[i] + '</div>';
		}
		subMenu.innerHTML = scoreBoard;
	}
	else {
		subMenu.innerHTML = '<div>No Scores</div>';
	}
	showHighScores = true;
}

function onCreditsClick(e) {
	// credits
	subMenu.innerHTML = '<div>Developed by Ian Macfarlane</div>';
}

function update(elapsedTime) {

	// update prepTimer
	if (prepTimer > 0) {
		prepTimer -= elapsedTime/1000;
	}

	// if prep timer is finished
	if (prepTimer <= 0 && !gameOver) {

		// update game timer
		gameTimer += elapsedTime/1000;

		// countdown bomb timers
		for (let i = 0; i < bombs.length; i++) {
			if (bombs[i] > 0) {
				bombs[i] -= elapsedTime/1000;
			}
			if (bombs[i] < 0) {
				// bomb explodes
				bombs[i] = 0;// only lose points once
				score -= 3;
				if (score < 0) {
					score = 0;
				}
			}
		}

		// end level conditions
		let exploded = 0;
		let defused = 0;
		for (let i = 0; i < bombs.length; i++) {
			if (bombs[i] === 'defused') {
				defused++;
			}
			else if (bombs[i] === 0) {
				exploded++;
			}
		}

		if (defused+exploded === bombs.length) {
			// end of level
			if (defused === bombs.length) {
				// next level
				if (bombs.length == 6) {
					generateLevel(2);
				}
				else if (bombs.length == 9) {
					generateLevel(3);
				}
				else {
					// game over
					gameOver = true;
					highScore(score);
				}
			}
			else {
				// game over
				gameOver = true;
				highScore(score);
			}
		}
	}
}

function render() {

	context.clearRect(0, 0, canvas.width, canvas.height);

	// background image
	context.drawImage(backgroundImage, 0, 0);

	// prep timer
	if (prepTimer > 0) {
		context.font = '32px Monospace';
		context.fillStyle = '#000';
		context.fillText(Math.floor(prepTimer)+1, 130, 70);
	}

	// game over
	if (gameOver) {
		context.font = '32px Monospace';
		context.fillStyle = '#000';
		context.fillText('GAME OVER', 170, 70);
	}

	// score
	context.font = '16px Monospace';
	context.fillStyle = '#000';
	context.fillText('SCORE ' + score, 400, 30);

	// game timer
	context.font = '16px Monospace';
	context.fillStyle = '#000';
	context.fillText('TIME ' + gameTimer.toFixed(2) + ' S', 400, 50);

	// display bombs
	let column = 0;
	let row = 0;
	for (let i = 0; i < bombs.length; i++) {

		if (bombs[i] == 0) {
			// display explosion
			context.drawImage(explosionImage, 100+(100*column), 100+(50*row), 50, 50);
		}
		else {
			context.drawImage(bombImage, 100+(100*column), 100+(50*row), 50, 50);
			if (bombs[i] == 'defused') {
				context.drawImage(checkmarkImage, 100+(100*column), 100+(50*row), 50, 50);
			}
		}

		// draw timer
		if (bombs[i] > 0) {
			if (prepTimer <= 0) {
				context.drawImage(numberImage[Math.floor(bombs[i])+1], 111+(100*column), 111+(50*row), 40, 40);
			}
			else {
				context.drawImage(numberImage[Math.floor(bombs[i])], 111+(100*column), 111+(50*row), 40, 40);
			}
		}

		column++;
		if (column === 3) {
			column = 0;
			row++;
		}

	}

	// TODO gravity controlled sparks on explode
}

// initialize bombs array with countdown times
function generateLevel(level) {

	// initalize prepTimer
	prepTimer = 3;

	// initalize bombs array
	bombs = [];

	// initalize bomb timers based on level
	let bombTimers = [3, 3, 2, 2, 1, 1];
	if (level > 1) {
		bombTimers.push(4);
		bombTimers.push(3);
		bombTimers.push(2);
	}
	if (level > 2) {
		bombTimers.push(5);
		bombTimers.push(4);
		bombTimers.push(3);
	}

	// randomly assign bomb timer to bomb
	while (bombTimers.length > 0) {
		bombs.push(bombTimers.splice(Math.floor(Math.random()*bombTimers.length), 1));
	}
}

function highScore(score) {
	// persist top 5 high scores to browser
	let board;
	let recorded = false;
	if (localStorage.score) {
		board = JSON.parse(localStorage.score);
	}
	else {
		board = [];
	}

	if (board.length === 0) {
		board.push(score);
	}
	else {
		for (let i = 0; i < board.length; i++) {
			if (score > board[i] && !recorded) {
				board.splice(i, 0, score);
				recorded = true;
			}
		}
		if (!recorded) {
			board.push(score);
		}
		if (board.length === 6) {
			board.pop();
		}
	}
	localStorage.score = JSON.stringify(board);
	if (showHighScores) {
		onHighScoresClick();
	}
}
