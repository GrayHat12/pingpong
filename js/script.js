// grab a reference of our "canvas" using its id
const canvas = document.getElementById('canvas');

/* get a "context". Without "context", we can't draw on canvas */
const ctx = canvas.getContext('2d');


// some sounds
const hitSound = new Audio('../sounds/hitSound.wav');
const scoreSound = new Audio('../sounds/scoreSound.wav');
const wallHitSound = new Audio('../sounds/wallHitSound.wav');
const muteButton = document.getElementById("muteButton");
const mutedElStr = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-mute-fill" viewBox="0 0 16 16">
  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
</svg>
`;
const notmutedElStr = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up-fill" viewBox="0 0 16 16">
    <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
    <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
</svg>
`;
let gameInterval;
let started = false;
let computersPlayTogether = true;

const difficultyEl = document.getElementById("difficulty");
const playAgainst = document.getElementById("playagainst");

playAgainst.addEventListener("click", changePlayer);
difficultyEl.addEventListener("change", onChangeDifficulty);

muteButton.addEventListener("click", mute);
muteButton.innerHTML = notmutedElStr;

function changePlayer() {
    if (computersPlayTogether) {
        playAgainst.innerText = "Let Computers Play against each other";
    } else {
        playAgainst.innerText = "Play Against Graybot";
    }
    computersPlayTogether = !computersPlayTogether;
    stopGame();
    //startGame();
}

function mute() {
    hitSound.muted = !hitSound.muted;
    scoreSound.muted = !scoreSound.muted;
    wallHitSound.muted = !wallHitSound.muted;
    if (hitSound.muted) {
        muteButton.innerHTML = mutedElStr;
    } else {
        muteButton.innerHTML = notmutedElStr;
    }
}

canvas.addEventListener("click", startGame);

function stopGame() {
    if (gameInterval)
        clearInterval(gameInterval);
    ctx.fillStyle = 'yellow';
    ctx.fillRect(canvas.width / 4 - 50, canvas.height / 2 - 25, 3 * (canvas.width / 4) - 50, 70);
    ctx.fillStyle = 'green';
    ctx.font = '50px sans-serif';
    // syntax --> fillText(text, x, y)
    ctx.fillText("START GAME", canvas.width / 4, canvas.height / 2 + 25);
    started = false;
}

function onChangeDifficulty() {
    console.log(difficultyEl.value);
    difficultyLevel = parseInt(difficultyEl.value);
    reset();
}

/* some extra variables */
const netWidth = 4;
const netHeight = canvas.height;

const paddleWidth = 10;
const paddleHeight = 100;

let upArrowPressed = false;
let downArrowPressed = false;
let difficultyLevel = 1;

/* some extra variables ends */

/* objects */
// net
const net = {
    x: canvas.width / 2 - netWidth / 2,
    y: 0,
    width: netWidth,
    height: netHeight,
    color: "#FFF"
};

// user paddle
let user = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#53bd68',
    score: 0
};

let ai = {
    x: canvas.width - (paddleWidth + 10),
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#eb4034',
    score: 0
};

// ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
    color: '#05EDFF',
    additionalX: 0,
    additionalY: 0,
    increment: 0.2,
};

function startGame() {
    if (started) return;
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    user = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#53bd68',
        score: 0
    };

    ai = {
        x: canvas.width - (paddleWidth + 10),
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#eb4034',
        score: 0
    };

    // ball
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 7,
        velocityX: 5,
        velocityY: 5,
        color: '#05EDFF',
        additionalX: 0,
        additionalY: 0,
        increment: 0.2 * difficultyLevel
    };
    // calls gameLoop() function 60 times per second
    gameInterval = setInterval(gameLoop, 1000 / 60);
    started = true;
}

/* objects declaration ends */

/* drawing functions */

// function to draw net
function drawNet() {
    // set the color of net
    ctx.fillStyle = net.color;

    // syntax --> fillRect(x, y, width, height)
    ctx.fillRect(net.x, net.y, net.width, net.height);
}

// function to draw score
function drawScore(x, y, score) {
    ctx.fillStyle = '#fff';
    ctx.font = '35px sans-serif';

    // syntax --> fillText(text, x, y)
    ctx.fillText(score, x, y);
}

// function to draw paddle
function drawPaddle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// function to draw ball
function drawBall(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    // syntax --> arc(x, y, radius, startAngle, endAngle, antiClockwise_or_not)
    ctx.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
    ctx.closePath();
    ctx.fill();
}
/* drawing functions end */



/* moving Paddles */
// add an eventListener to browser window
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// gets activated when we press down a key
function keyDownHandler(event) {
    // get the keyCode
    switch (event.keyCode) {
        // "up arrow" key
        case 38:
            // set upArrowPressed = true
            upArrowPressed = true;
            break;
        // "down arrow" key
        case 40:
            downArrowPressed = true;
            break;
    }
}

// gets activated when we release the key
function keyUpHandler(event) {
    switch (event.keyCode) {
        // "up arraow" key
        case 38:
            upArrowPressed = false;
            break;
        // "down arrow" key
        case 40:
            downArrowPressed = false;
            break;
    }
}

/* moving paddles section end */


// reset the ball
function reset() {
    // reset ball's value to older values
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    ball.increment = 0.2 * difficultyLevel;

    // changes the direction of ball
    ball.velocityX = -ball.velocityX;
    ball.velocityY = -ball.velocityY;
}

function moveAIPaddle() {
    let nextX = ball.x + ball.velocityX + ball.additionalX;
    let nextY = ball.y + ball.velocityY + ball.additionalY;
    if (nextX < ball.x) return;
    let m = (nextY - ball.y) / (nextX - ball.x);
    let py = ball.y - m * (ball.x - canvas.width);
    let tomove = py - (ai.y + ai.height / 2);
    if (tomove < 0) {
        ai.y += Math.max(tomove, -8);
    } else {
        ai.y += Math.min(tomove, 8);
    }
    ai.y = Math.max(0, ai.y);
    ai.y = Math.min(canvas.height - ai.height, ai.y);
}


// collision Detect function
function collisionDetect(player, ball) {
    // returns true or false
    player.top = player.y;
    player.right = player.x + player.width;
    player.bottom = player.y + player.height;
    player.left = player.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}

// update function, to update things position
function update() {

    if (computersPlayTogether) {
        user.y += ((ball.y - (user.y + user.height / 2))) * 0.09;
    } else {
        // move the paddle
        if (upArrowPressed) {
            user.y -= 8;
        } else if (downArrowPressed) {
            user.y += 8;
        }
    }
    user.y = Math.max(0, user.y);
    user.y = Math.min(canvas.height - user.height, user.y);


    // check if ball hits top or bottom wall
    if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
        // play wallHitSound
        wallHitSound.play();

        ball.velocityY = -ball.velocityY;

        if (ball.y + ball.radius >= canvas.height) {
            ball.additionalY -= Math.floor(ball.speed / 3);
        }
        if (ball.y - ball.radius <= 0) {
            ball.additionalY += Math.floor(ball.speed / 3);
        }
    }

    // if ball hit on right wall
    if (ball.x + ball.radius >= canvas.width) {
        // play scoreSound
        scoreSound.play();

        // then user scored 1 point
        user.score += 1;
        reset();
    }

    // if ball hit on left wall
    if (ball.x - ball.radius <= 0) {
        // play scoreSound
        scoreSound.play();

        // then ai scored 1 point
        ai.score += 1;
        reset();
    }

    // move the ball
    ball.x += ball.velocityX + ball.additionalX;
    ball.y += ball.velocityY + ball.additionalY;
    if (ball.x < ball.radius) {
        ball.x = ball.radius;
    }
    if (ball.x > (canvas.width - ball.radius)) {
        ball.x = canvas.width - ball.radius;
    }

    if (ball.additionalX != 0) {
        ball.additionalX = ball.additionalX + (ball.additionalX < 0 ? 1 : -1) * 1;
    }
    if (ball.additionalY != 0) {
        ball.additionalY = ball.additionalY + (ball.additionalY < 0 ? 1 : -1) * 1;
    }


    // ai paddle movement
    moveAIPaddle();
    //ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.09;

    // collision detection on paddles
    let player = (ball.x < canvas.width / 2) ? user : ai;

    if (collisionDetect(player, ball)) {
        // play hitSound
        hitSound.play();

        // default angle is 0deg in Radian
        let angle = 0;

        let part = player.y + (player.height / 4);
        let _part = player.height / 4;
        let ballfromPaddleTop = ball.y - player.y;


        // if ball hit the top fourth of paddle
        if (0 <= ballfromPaddleTop && ballfromPaddleTop <= _part) {
            // then -1 * Math.PI / 12 = -15deg
            //angle = -1 * Math.PI / 12;
            let divdor = ((Math.PI / 4 - Math.PI / 12) / _part) * ballfromPaddleTop;
            angle = -1 * divdor;
        } else if (_part <= ballfromPaddleTop && ballfromPaddleTop <= (_part * 2)) {
            // if it hit second 4th of paddle
            // then angle will be -1 * Math.PI / 4 = -45deg
            //angle = -1 * Math.PI / 4;
            let divdor = ((Math.PI / 4 - 0) / _part) * (ballfromPaddleTop - _part);
            angle = -1 * divdor;
        } else if ((_part * 2) <= ballfromPaddleTop && ballfromPaddleTop <= (_part * 3)) {
            // if it hit third 4th of paddle
            // then angle will be Math.PI / 4 = 45deg
            //angle = Math.PI / 4;
            let divdor = ((Math.PI / 4 - 0) / _part) * (ballfromPaddleTop - (2 * _part));
            angle = divdor;
        } else if ((_part * 3) <= ballfromPaddleTop && ballfromPaddleTop <= (_part * 4)) {
            // if it hit third 4th of paddle
            // then angle will be Math.PI / 12 = 15deg
            //angle = Math.PI / 12;
            let divdor = ((Math.PI / 4 - Math.PI / 12) / _part) * (ballfromPaddleTop - (3 * _part));
            angle = divdor;
        }

        //console.log('angle', angle, ballfromPaddleTop, _part, ball, player);

        /* change velocity of ball according to on which paddle the ball hitted */
        ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);

        ball.additionalX += (player === user ? 1 : -1) * Math.floor(ball.speed / 3);

        // increase ball speed
        ball.speed += ball.increment;
        ball.speed = Math.min(15, ball.speed);
    }

}

// render function draws everything on to canvas
function render() {
    // set a style
    ctx.fillStyle = "#000"; /* whatever comes below this acquires black color (#000). */
    // draws the black board
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // draw net
    drawNet();
    // draw user score
    drawScore((canvas.width / 10), canvas.height / 6, `${computersPlayTogether ? "Computer" : "You"}: ${user.score}`);
    // draw ai score
    drawScore(6 * canvas.width / 10, canvas.height / 6, `GrayBot: ${ai.score}`);
    // draw user paddle
    drawPaddle(user.x, user.y, user.width, user.height, user.color);
    // draw ai paddle
    drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);
    // draw ball
    drawBall(ball.x, ball.y, ball.radius, ball.color);
}


// gameLoop
function gameLoop() {
    // update() function here
    update();
    // render() function here
    render();
}

render();
stopGame();