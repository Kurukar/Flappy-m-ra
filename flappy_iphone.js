const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

let iphoneY = canvas.height / 2;
let iphoneRotation = 0;
let jump = false;
let gravity = 0.7;
let jumpForce = -7;
let jumpTimer = 0;
let pipes = [];
let gameover = false;
let score = 0;
let gameSpeed = 2;

const iphoneImg = new Image();
iphoneImg.src = "iphone.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const backgroundImg = new Image();
backgroundImg.src = "pozadi.jpg";

function jumpAction() {
    if (!gameover) {
        jump = true;
        jumpTimer = 10;
    }
}

function restartGame() {
    pipes = [];
    iphoneY = canvas.height / 2;
    iphoneRotation = 0;
    gameover = false;
    score = 0;
    gameSpeed = 2;
    gravity = 0.7;
    updateScore();
}

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * 200) + 100;
    pipes.push({
        x: canvas.width,
        height: pipeHeight,
        gap: 150,
        passed: false,
    });
}

function updateScore() {
    scoreElement.textContent = score;
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Draw iPhone with rotation
    ctx.save();
    ctx.translate(canvas.width / 4 + 20, iphoneY + 20);
    ctx.rotate(iphoneRotation);
    ctx.drawImage(iphoneImg, -20, -20, 40, 40);
    ctx.restore();

    // Draw pipes
    pipes.forEach(pipe => {
        if (pipe.orientation === "up") {
            ctx.drawImage(pipeImg, pipe.x, 0, 50, pipe.height);
        } else {
            ctx.save();
            ctx.translate(pipe.x + 25, pipe.height);
            ctx.rotate(Math.PI);
            ctx.drawImage(pipeImg, -25, 0, 50, pipe.height);
            ctx.restore();
        }
        ctx.drawImage(pipeImg, pipe.x, pipe.height + pipe.gap, 50, canvas.height - pipe.height - pipe.gap);
    });

    // iPhone jump
    if (jump && iphoneY > 0) {
        iphoneY += jumpForce * (jumpTimer / 10);
        jumpTimer--;
        if (jumpTimer === 0) {
            jump = false;
        }
    } else {
        iphoneY += gravity;
    }

    // Rotate iPhone smoothly based on jump movement
    if (jump) {
        iphoneRotation = Math.PI / 6 * (jumpTimer / 10); // Plynulé natočení při skoku
    } else {
        iphoneRotation = 0;
    }

    // Check for collisions
    pipes.forEach(pipe => {
        if (
            (canvas.width / 4 + 40 > pipe.x && canvas.width / 4 < pipe.x + 50)
            &&
            (iphoneY < pipe.height || iphoneY + 40 > pipe.height + pipe.gap)
        ) {
            gameover = true;
        }
    });

    if (iphoneY > canvas.height - 50 || iphoneY < 0) {
        gameover = true;
    }

    if (gameover) {
        alert("Game Over! Your Score: " + score);
        restartGame();
    }

    // Check for scoring
    pipes.forEach(pipe => {
        if (pipe.x < canvas.width / 4 && !pipe.passed) {
            pipe.passed = true;
            score++;
            updateScore();
            // Add speed after passing a pipe
            gameSpeed += 0.2;
            gravity += 0.2;
        }
    });

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= gameSpeed;
    });

    // Remove off-screen pipes and generate new ones
    pipes = pipes.filter(pipe => pipe.x > -50);

    if (pipes.length === 0 || canvas.width - pipes[pipes.length - 1].x > 200) {
        createPipe();
    }

    requestAnimationFrame(gameLoop);
}

// Set up event listeners
document.addEventListener("keydown", jumpAction);

// Start the game loop
gameLoop();
