const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.font = "40px Verdana";

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const BOARD_Y = 50;
const BOARD_P1_X = 300;
const BOARD_P2_X = 500;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_P1_X = 10;
const PADDLE_P2_X = 770;
const PADDLE_START_Y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
const BALL_R = 15;
const BALL_START_X = CANVAS_WIDTH / 2;
const BALL_START_Y = CANVAS_HEIGHT / 2;
const BALL_START_X_VELOCITY = 4.5;
const BALL_START_Y_VELOCITY = 1.5;
const STATE_CHANGE_INTERVAL = 20;
const PADDLE_STEP = 3;
const P1_UP_BUTTON = "KeyQ";
const P1_DOWN_BUTTON = "KeyA";
const P2_UP_BUTTON = "KeyP";
const P2_DOWN_BUTTON = "KeyL";
const PAUSE_BUTTON = "Escape";
const UP_ACTION = "up";
const DOWN_ACTION = "down";
const STOP_ACTION = "stop";

class Ball{
    constructor(){
        this.x = BALL_START_X
        this.y = BALL_START_Y
        this.xVelocity = BALL_START_X_VELOCITY
        this.yVelocity = BALL_START_Y_VELOCITY
    }
    moveByStep(){
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    moveToStart(){
        this.x = BALL_START_X;
        this.y = BALL_START_Y;
        paused = true;
        setTimeout(() => paused = false, 1000)
    }
    draw(x, y, r){
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
    move(){
        this.moveByStep();
    }
    isOutsideOnLeft(){
        return this.x - BALL_R <= 0;
    }
    isOutsideOnRight(){
        return this.x + BALL_R >= CANVAS_WIDTH;
    }
    bounceFromWall(){
        this.yVelocity = -this.yVelocity;
    }
    bounceFromPaddle(){
        this.xVelocity = -this.xVelocity;
    }
    shouldBounceFromTopWall(){
        return this.y <= BALL_R && this.yVelocity < 0;
    }
    shouldBounceFromBottomWall(){
        return this.y + BALL_R >= CANVAS_HEIGHT && this.yVelocity > 0;
    }
    isOnTheSameHeightAsPaddle(paddleY){
        return isInBetween(this.y, paddleY, paddleY + PADDLE_HEIGHT);
    }
    shouldBounceFromLeftPaddle(){
        return this.xVelocity < 0 && isInBetween(this.x - BALL_R, PADDLE_P1_X, PADDLE_P1_X + PADDLE_WIDTH) && this.isOnTheSameHeightAsPaddle(p1.paddle.y);
    }
    shouldBounceFromRightPaddle(){
        return this.xVelocity > 0 && isInBetween(this.x + BALL_R, PADDLE_P2_X, PADDLE_P2_X + PADDLE_WIDTH) && this.isOnTheSameHeightAsPaddle(p2.paddle.y);
    }
}

class Player{
    constructor(paddleX, boardX) {
        this.points = 0;
        this.boardX = boardX;
        this.action = STOP_ACTION;
        this.paddle = new Paddle(paddleX)
    }
    makeAction(){
        if (this.action == UP_ACTION){
            this.paddle.stepUp();
        } else if (this.action == DOWN_ACTION){
            this.paddle.stepDown();
        }
    }
    drawPoints(){
        drawPoints(this.points.toString(), this.boardX, 50);
    }
    draw(){
        this.drawPoints();
        this.paddle.draw();
    }
};

class Paddle{
    constructor(paddleX){ 
        this.x = paddleX;
        this.y = PADDLE_START_Y;
    }
    setY(newY){
        const minPaddleY = 0;
        const maxPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;
        this.y = coerceIn(newY, minPaddleY, maxPaddleY);
    }
    stepDown(){
        this.setY(this.y + PADDLE_STEP);
    }
    stepUp(){
        this.setY(this.y - PADDLE_STEP);
    }
    draw(){
        ctx.fillRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }
};

const p1 = new Player(PADDLE_P1_X, BOARD_P1_X)
const p2 = new Player(PADDLE_P2_X, BOARD_P2_X)
const ball = new Ball()

let paused = false;

function drawState(){
    clearCanvas();
    ball.draw(ball.x, ball.y, BALL_R);
    p1.draw();
    p2.draw();
}

function movePaddles(){
    p1.makeAction();
    p2.makeAction();
}

function coercePaddle(paddleY){
    const minPaddleY = 0;
    const maxPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;

    return coerceIn(paddleY, minPaddleY, maxPaddleY);
}

function coerceIn(value, min, max){
    return Math.max(Math.min(value, max), min);
}

function updateState(){
    ball.move();
    movePaddles();
}

function updateAndDrawState(){
    if(!paused){
        updateState();
        drawState();
        if(ball.isOutsideOnLeft()){
            ball.moveToStart();
            p2.points++;
        } else if(ball.isOutsideOnRight()){
            ball.moveToStart();
            p1.points++;
        }
        if(ball.shouldBounceFromTopWall() || ball.shouldBounceFromBottomWall()){
            ball.bounceFromWall();
        }
        if(ball.shouldBounceFromLeftPaddle() || ball.shouldBounceFromRightPaddle()){
            ball.bounceFromPaddle();
        }
    }
}

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
}

function drawPaddle(x, y){
    ctx.fillRect(x, y, 20, 100);
}

function drawPoints(text, x, y){
    ctx.fillText(text, x, y);
}

function isInBetween(value, min, max){
    return value >= min && value <= max;
}

window.addEventListener("keydown", event => {
    let code = event.code;
    if(code==P1_UP_BUTTON){
        p1.action = UP_ACTION;
    } else if(code==P1_DOWN_BUTTON){
        p1.action = DOWN_ACTION;
    } else if(code==P2_UP_BUTTON){
        p2.action = UP_ACTION;
    } else if(code==P2_DOWN_BUTTON){
        p2.action = DOWN_ACTION;
    } else if(code == PAUSE_BUTTON){
        paused = !paused;
    }
})

window.addEventListener("keyup", event => {
    let code = event.code;
    if((code==P1_UP_BUTTON && p1.action == UP_ACTION) || (code==P1_DOWN_BUTTON && p1.action == DOWN_ACTION)){
        p1.action = STOP_ACTION;
    } else if((code==P2_UP_BUTTON && p2.action == UP_ACTION) || (code==P2_DOWN_BUTTON && p2.action == DOWN_ACTION)){
        p2.action = STOP_ACTION;
    }
})

drawState();
setInterval(updateAndDrawState, STATE_CHANGE_INTERVAL);