let tileSize = 31;
let rows = 17;
let columns = 40;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

// Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
};

let shipImg;
let shipVelocityX = tileSize;

// Aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let maxLevels = 5; // Maximum levels
let currentLevel = 1; // Start at level 1
let alienCount = 0;
let alienVelocityX = 1;

// Bullets
let bulletArray = [];
let bulletVelocityY = -10;
let bulletWidth = tileSize / 8;
let bulletHeight = tileSize / 2;

// Game state
let score = 0;
let gameOver = false;
let displayLevelMessage = false;
let gameWon = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Disable context menu on right-click to prevent unwanted behavior
    board.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    // Load images
    shipImg = new Image();
    shipImg.src = "images/ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    alienImg = new Image();
    alienImg.src = "images/alien-cyan.png";
    createAliens();

    requestAnimationFrame(update);
    board.addEventListener("mousemove", moveShip);
    board.addEventListener("mousedown", shoot);
};

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    // Display level message, win message, or game over message
    if (displayLevelMessage) {
        context.fillStyle = "white";
        context.font = "32px courier";
        if (gameWon) {
            context.fillText("You Win!", board.width / 2 - 70, board.height / 2);
            setTimeout(() => {
                displayLevelMessage = false;
            }, 1000);
        } else {
            context.fillText("Level " + currentLevel, board.width / 2 - 50, board.height / 2);
            setTimeout(() => {
                displayLevelMessage = false;
            }, 1000);
        }
        return;
    }

    if (gameOver) {
        context.fillStyle = "white";
        context.font = "32px courier";
        context.fillText("Game Over!", board.width / 2 - 90, board.height / 2);
        return;
    }

    // Draw ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Draw aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // If alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                // Move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Move bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Check for bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear used bullets
    bulletArray = bulletArray.filter(bullet => !bullet.used && bullet.y >= 0);

    // Check win condition
    if (alienCount === 0) {
        if (currentLevel < maxLevels) {
            nextLevel();
        } else {
            gameWon = true;
            displayLevelMessage = true;
        }
    }

    // Draw score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    let rect = board.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;

    if (mouseX >= 0 && mouseX <= board.width - ship.width) {
        ship.x = mouseX;
    } else if (mouseX < 0) {
        ship.x = 0;
    } else if (mouseX > board.width - ship.width) {
        ship.x = board.width - ship.width;
    }
}

function createAliens() {
    alienArray = [];
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    e.preventDefault(); // Prevent default behavior of mouse event

    if (gameOver) {
        return;
    }

    if (e.button === 0) { // Left mouse button
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: bulletWidth,
            height: bulletHeight,
            used: false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function nextLevel() {
    currentLevel++;
    displayLevelMessage = true;

    score += alienColumns * alienRows * 100;
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);

    alienVelocityX *= 1.5; // Increase horizontal velocity multiplicatively with each level

    createAliens();
}