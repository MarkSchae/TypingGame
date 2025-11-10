const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const typingInput = document.getElementById('typing-input');
const storyText = document.getElementById('story-text');
const healthContainer = document.getElementById('health-container');
const killsContainer = document.getElementById('kills-container');
const bulletsContainer = document.getElementById('bullets-container');
const nextLevelButton = document.getElementById('next-level-button');
const previousLevelButton = document.getElementById('previous-level-button');
const upgradeContainer = document.getElementById('upgrade-container');
const playerId = document.querySelector('#stats-user-id');
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
console.log(playerId);


const ship = {
    x: canvas.width / 2,
    y: canvas.height - 200,
    width: 50,
    height: 30,
    speed: 5,
    health: 20,
    velocity: 0,
    maxSpeed: 30,
    acceleration: 4,
    guns: 1 // Number of guns the ship has
};

const stats = {
    totalBulletsFired: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalGames: 0
};

const bullets = [];
const bulletSpeed = 7;
const bulletWidth = 5;
const bulletHeight = 10;

const homingMissiles = [];
const homingMissileSpeed = 5;

let laserActive = false;
let laserDuration = 8000; // Laser lasts for 8 seconds
let laserStartTime = 0;

const alienBullets = [];
const alienBulletSpeed = 2;
const alienBulletWidth = 5;
const alienBulletHeight = 10;

const aliens = [];
const alienWidth = 40;
const alienHeight = 30;
let alienSpeed = 0.2;
const requiredKills = 20;
let alienCount = 0;
let kills = 0;

let targetLetters = [];
let currentIndex = 0;
let gameRunning = true;
let currentLevel = 1;
const maxLevels = 13;
let shipMovingRight = true;

const boss = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: 100,
    health: 100,
    cannons: [
        { x: canvas.width * 0.2, y: 90, angle: 0 },
        { x: canvas.width * 0.4, y: 90, angle: 0 },
        { x: canvas.width * 0.6, y: 90, angle: 0 },
        { x: canvas.width * 0.8, y: 90, angle: 0 }
    ],
    bulletSpeed: 1,
    bulletInterval: 5000,
    bullets: [],
    firing: false,
    firingInterval: null,
    randomDirections: [],
    moving: false,
    directionChangeInterval: null,
    aliens: []
};

const animations = [];

function getNewText() {
    const texts = [
        "Defend Earth from the alien invasion!",
        "Aliens are approaching! Prepare yourself!",
        "Protect humanity! Shoot the invaders!",
        "The fate of the world rests in your hands!"
    ];
    let newText;
    do {
        newText = texts[Math.floor(Math.random() * texts.length)];
    } while (newText === storyText.textContent);
    return newText;
}

function updateStoryText() {
    requestAnimationFrame(() => {
        storyText.textContent = getNewText();
        targetLetters = storyText.textContent.split('');
        currentIndex = 0;
        typingInput.focus();
    });
}

function drawShip() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x - ship.width / 2, ship.y + ship.height);
    ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y + bulletHeight < 0) {
            bullets.splice(index, 1);
        }
    });
}

function drawHomingMissiles() {
    ctx.fillStyle = 'blue';
    homingMissiles.forEach(missile => {
        ctx.fillRect(missile.x, missile.y, bulletWidth, bulletHeight);
    });
}

function updateHomingMissiles() {
    homingMissiles.forEach((missile, index) => {
        if (alienBullets.length === 0) {
            missile.y -= homingMissileSpeed;
        } else {
            let closestBullet = null;
            let closestDistance = Infinity;

            alienBullets.forEach(bullet => {
                const dx = bullet.x - missile.x;
                const dy = bullet.y - missile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestBullet = bullet;
                }
            });

            if (closestBullet) {
                const angle = Math.atan2(closestBullet.y - missile.y, closestBullet.x - missile.x);
                missile.x += homingMissileSpeed * Math.cos(angle);
                missile.y += homingMissileSpeed * Math.sin(angle);
            }
        }

        if (missile.y + bulletHeight < 0 || missile.y > canvas.height || missile.x < 0 || missile.x > canvas.width) {
            homingMissiles.splice(index, 1);
        }
    });
}

function activateUpgrade(upgrade) {
    upgradeContainer.style.display = 'none';
    if (upgrade === 'Homing Missile') {
        ship.upgrade = 'Homing Missile';
    } else if (upgrade === 'Laser of Doom') {
        ship.upgrade = 'Laser of Doom';
    } else if (upgrade === 'Mini Gun') {
        ship.upgrade = 'Mini Gun';
        ship.guns = 3; // Add two additional guns
    }
    nextLevel();
}

function activateLaserOfDoom() {
    laserActive = true;
    laserStartTime = Date.now();
    setTimeout(() => {
        laserActive = false;
    }, laserDuration);
}

function drawLaserOfDoom() {
    if (laserActive) {
        ctx.fillStyle = 'cyan';
        ctx.fillRect(ship.x - 2, 0, 4, ship.y);
    }
}

function updateLaserOfDoom() {
    if (laserActive) {
        // Destroy all aliens in the path of the laser
        aliens.forEach((alien, index) => {
            if (alien.x <= ship.x + 2 && alien.x + alienWidth >= ship.x - 2) {
                removeAlienAndBullets(index);
                kills++;
                updateKillsDisplay();
                addAnimation(alien.x, alien.y, 'laserAlien');
                if (kills >= requiredKills && aliens.length === 0) {
                    levelComplete();
                }
            }
        });
        // Destroy all alien bullets in the path of the laser
        alienBullets.forEach((bullet, index) => {
            if (bullet.x <= ship.x + 2 && bullet.x + alienBulletWidth >= ship.x - 2) {
                alienBullets.splice(index, 1);
                addAnimation(bullet.x, bullet.y, 'laserBullet');
            }
        });
    }
}

function removeAlienAndBullets(alienIndex) {
    const alien = aliens[alienIndex];
    if (alien && alien.bulletInterval) {
        clearInterval(alien.bulletInterval);
    }
    aliens.splice(alienIndex, 1);
}

typingInput.addEventListener('input', (event) => {
    const typedLetter = typingInput.value.slice(-1);
    if (checkLetter(typedLetter)) {
        // Increment total bullets fired
        stats.totalBulletsFired += ship.guns;
        updateBulletsDisplay()
        // Fire bullets from all guns
        for (let i = 0; i < ship.guns; i++) {
            const offset = (i - (ship.guns - 1) / 2) * 15; // Spread out the bullets
            bullets.push({
                x: ship.x - bulletWidth / 2 + offset,
                y: ship.y,
            });
        }
        if (currentLevel >= 11 && ship.upgrade === 'Homing Missile') {
            homingMissiles.push({
                x: ship.x - bulletWidth / 2,
                y: ship.y,
            });
        }
        if (currentLevel >= 11 && ship.upgrade === 'Laser of Doom' && !laserActive) {
            activateLaserOfDoom();
        }
        currentIndex++;
        if (currentIndex >= targetLetters.length) {
            updateStoryText();
        }
        if (currentLevel >= 6) {
            ship.velocity = Math.min(ship.velocity + ship.acceleration, ship.maxSpeed);
        }
    } else {
        // Remove the incorrect character from the input field
        typingInput.value = typingInput.value.slice(0, -1);
    }
});

function drawAlienBullets() {
    ctx.fillStyle = 'yellow';
    alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, alienBulletWidth, alienBulletHeight);
    });
}

function updateAlienBullets() {
    alienBullets.forEach((bullet, index) => {
        bullet.y += alienBulletSpeed;
        if (bullet.y > canvas.height) {
            alienBullets.splice(index, 1);
            ship.health -= 1;
            updateHealthDisplay();
            addAnimation(bullet.x, bullet.y, 'alienBulletBottom');
            if (ship.health <= 0) {
                gameOver();
            }
        } else {
            if (
                bullet.x < ship.x + ship.width / 2 &&
                bullet.x + alienBulletWidth > ship.x - ship.width / 2 &&
                bullet.y < ship.y + ship.height &&
                bullet.y + alienBulletHeight > ship.y
            ) {
                alienBullets.splice(index, 1);
                ship.health -= 1;
                addAnimation(bullet.x, bullet.y, 'alienBulletShip');
                updateHealthDisplay();
                if (ship.health <= 0) {
                    gameOver();
                }
            }
        }
    });
}

function drawAliens() {
    ctx.fillStyle = 'green';
    aliens.forEach(alien => {
        ctx.fillRect(alien.x, alien.y, alienWidth, alienHeight);
    });
}

function updateAliens() {
    aliens.forEach((alien, index) => {
        alien.y += alienSpeed;
        if (alien.y > canvas.height) {
            removeAlienAndBullets(index);
            ship.health -= 1;
            updateHealthDisplay();
            addAnimation(alien.x, alien.y, 'alienPass');
            if (ship.health <= 0) {
                gameOver();
            }
        }
    });

    if (alienCount >= requiredKills && aliens.length === 0) {
        levelComplete();
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
            if (
                bullet.x < alien.x + alienWidth &&
                bullet.x + bulletWidth > alien.x &&
                bullet.y < alien.y + alienHeight &&
                bullet.y + bulletHeight > alien.y
            ) {
                bullets.splice(bulletIndex, 1);
                removeAlienAndBullets(alienIndex);
                // Increment kills
                stats.totalKills++;
                kills++;
                updateKillsDisplay();
                addAnimation(bullet.x, bullet.y, 'bulletAlien');
                if (kills >= requiredKills && aliens.length === 0) {
                    levelComplete();
                }
            }
        });
    });

    aliens.forEach((alien, alienIndex) => {
        if (
            alien.x < ship.x + ship.width / 2 &&
            alien.x + alienWidth > ship.x - ship.width / 2 &&
            alien.y < ship.y + ship.height &&
            alien.y + alienHeight > ship.y
        ) {
            removeAlienAndBullets(alienIndex);
            ship.health -= 1;
            addAnimation(alien.x, alien.y, 'alienShip');
            updateHealthDisplay();
            if (ship.health <= 0) {
                gameOver();
            }
        }
    });
}

function checkHomingMissileCollisions() {
    homingMissiles.forEach((missile, missileIndex) => {
        alienBullets.forEach((bullet, bulletIndex) => {
            if (
                missile.x < bullet.x + alienBulletWidth &&
                missile.x + bulletWidth > bullet.x &&
                missile.y < bullet.y + alienBulletHeight &&
                missile.y + bulletHeight > bullet.y
            ) {
                homingMissiles.splice(missileIndex, 1);
                alienBullets.splice(bulletIndex, 1);
                addAnimation(missile.x, missile.y, 'homingMissileAlienBullet');
            }
        });
    });
}

let lastSpawnTime = 0;

function spawnAlien() {
    const currentTime = Date.now();
    const minInterval = 500;

    if (typeof lastSpawnTime === 'undefined') {
        lastSpawnTime = 0;
    }

    if (alienCount < requiredKills) {
        if (currentLevel < 6) {
            const newAlien = {
                x: ship.x - alienWidth / 2,
                y: -alienHeight,
                bullets: [],
                bulletInterval: null
            };
            aliens.push(newAlien);
            alienCount++;
            setTimeout(spawnAlien, 5000 / currentLevel);
        } else {
            if (currentTime - lastSpawnTime >= minInterval) {
                let newAlien;
                let isOverlapping;
                let attempts = 0;
                const maxAttempts = 50;

                do {
                    isOverlapping = false;
                    const newX = Math.random() * (canvas.width - alienWidth);
                    newAlien = {
                        x: newX,
                        y: -alienHeight,
                        bullets: [],
                        bulletInterval: null
                    };

                    for (const alien of aliens) {
                        if (Math.abs(alien.x - newAlien.x) < alienWidth && Math.abs(alien.y - newAlien.y) < alienHeight) {
                            isOverlapping = true;
                            break;
                        }
                    }
                    attempts++;
                } while (isOverlapping && attempts < maxAttempts);

                if (!isOverlapping) {
                    aliens.push(newAlien);
                    alienCount++;
                    lastSpawnTime = currentTime;

                    if (currentLevel >= 11) {
                        newAlien.bulletInterval = setInterval(() => {
                            const newBullet = {
                                x: newAlien.x + alienWidth / 2 - alienBulletWidth / 2,
                                y: newAlien.y + alienHeight
                            };
                            alienBullets.push(newBullet);
                        }, 1000);
                    }
                }
            }

            const spawnInterval = 10000 / currentLevel;
            setTimeout(spawnAlien, spawnInterval);
        }
    }
}

function checkLetter(inputLetter) {
    return inputLetter === targetLetters[currentIndex];
}

function updateHealthDisplay() {
    healthContainer.textContent = `Health: ${ship.health}`;
}

function updateKillsDisplay() {
    killsContainer.textContent = `Kills: ${stats.totalKills}`;
}

function updateBulletsDisplay() {
    bulletsContainer.textContent = `Bullets Fired: ${stats.totalBulletsFired}`;
}

function updateBossHealthDisplay() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Boss Health: ${boss.health}`, 10, 100);
}

// I think this need to be linked to run on game start, but i think it already is doing that by default
// Learn how to add crf tokens with js stuff
async function sendStatsToBackend(stats) {
    const userId = parseInt(playerId.getAttribute('data-stats-user-id'));
    console.log(userId);
    try {
        const playerStatsResponse = await fetch(`/aliens/players_stats/${userId}`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrfToken
            },

            body: JSON.stringify({
                totalKills: stats.totalKills,
                totalDeaths: stats.totalDeaths,
                totalBulletsFired: stats.totalBulletsFired,
                totalGames: stats.totalGames,
            })
        });// Check that request.user = data.user.id when posting this update 
        // Just remeber that when recieving data from the database we need to convert the json string to a json object with response.json so that we can manipulate that object in the js
        /*const leaderboardResponse = await fetch('/leaderboard/', {
            method: 'PUT',
            body: json.stringify({
                totalKills: stats.totalKills,
                totalDeaths: stats.totalDeaths,
                totalBulletsFired: stats.totalBulletsFired,
                totalGames: stats.totalGames,
            })
        });*/
        console.log(playerStatsResponse);
        if (!playerStatsResponse.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle the json response from the server
        const playerStatsData = await responseData.json();
        //const leaderboardData = await leaderboardResponse.json();
        console.log('Stats and leaderboard successfully updated:', playerStatsData);
    } catch (error) {
        console.error('Failed to send stats and leaderboard:', error);
    }
}

function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
    gameRunning = false;
    // Increment deaths
    stats.totalDeaths++; 
    stats.totalGames++;
    // Send stats to the backend
    sendStatsToBackend(stats); 
    document.querySelector('#play-again').style.display = 'block';
    document.querySelector('#stat-page').style.display = 'block';
}

function levelComplete() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText('Level Complete', canvas.width / 2 - 180, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Press Enter to move to the next level', canvas.width / 2 - 220, canvas.height / 2 + 60);
    gameRunning = false;
    // Send stats to the backend
    
    
    if (currentLevel === 10) {
        displayUpgradeOptions();
    } else {
        document.addEventListener('keydown', handleNextLevelKeyPress);
    }
}

function displayUpgradeOptions() {
    upgradeContainer.style.display = 'block';
}

function handleUpgradeSelection(event) {
    const upgrade = event.target.closest('.upgrade-option').dataset.upgrade;
    if (upgrade) {
        activateUpgrade(upgrade);
    }
}

function handleNextLevelKeyPress(event) {
    if (event.key === 'Enter') {
        nextLevel();
    }
}

function nextLevel() {
    document.removeEventListener('keydown', handleNextLevelKeyPress);
    currentLevel++;
    if (currentLevel === 6) {
        alienSpeed = 0.2;
    } else {
        alienSpeed += 0.1;
    }
    if (currentLevel > maxLevels) {
        currentLevel = 1;
        alienSpeed = 0.2;
    }
    kills = 0;
    alienCount = 0;
    aliens.length = 0;
    typingInput.value = '';
    updateStoryText();
    updateHealthDisplay();
    gameRunning = true;
    if (currentLevel === 7 || currentLevel === 12) {
        spawnBoss();
    } else {
        spawnAlien();
    }
    gameLoop();
    typingInput.focus();
}

function previousLevel() {
    if (currentLevel > 1) {
        currentLevel--;
        alienSpeed = 0.2 + (currentLevel - 1) * 0.1;
        kills = 0;
        alienCount = 0;
        aliens.length = 0;
        typingInput.value = '';
        updateStoryText();
        updateHealthDisplay();
        gameRunning = true;
        if (currentLevel === 6) {
            spawnAlien();
        } else {
            spawnAlien();
        }
        gameLoop();
        typingInput.focus();
    }
}

function drawBoss() {
    ctx.fillStyle = 'purple';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    ctx.fillStyle = 'orange';
    boss.cannons.forEach(cannon => {
        ctx.save();
        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannon.angle * Math.PI / 180);
        ctx.fillRect(0, 0, bulletWidth, bulletHeight);
        ctx.restore();
    });
}

function drawBossBullets() {
    ctx.fillStyle = 'blue';
    boss.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });
}

function updateBossBullets() {
    boss.bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        if (bullet.x <= 0 || bullet.x + bulletWidth >= canvas.width) {
            bullet.vx *= -1;
        }
        if (bullet.y <= 0) {
            bullet.vy *= -1;
        }

        if (bullet.y > canvas.height) {
            boss.bullets.splice(index, 1);
            ship.health -= 1;
            updateHealthDisplay();
            addAnimation(bullet.x, bullet.y, 'bossBulletBottom');
            if (ship.health <= 0) {
                gameOver();
            }
        } else {
            if (
                bullet.x < ship.x + ship.width / 2 &&
                bullet.x + bulletWidth > ship.x - ship.width / 2 &&
                bullet.y < ship.y + ship.height &&
                bullet.y + bulletHeight > ship.y
            ) {
                boss.bullets.splice(index, 1);
                ship.health -= 1;
                addAnimation(bullet.x, bullet.y, 'bossBulletShip');
                updateHealthDisplay();
                if (ship.health <= 0) {
                    gameOver();
                }
            }
        }
    });
}

function checkBossCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        boss.bullets.forEach((bossBullet, bossBulletIndex) => {
            if (
                bullet.x < bossBullet.x + bulletWidth &&
                bullet.x + bulletWidth > bossBullet.x &&
                bullet.y < bossBullet.y + bulletHeight &&
                bullet.y + bulletHeight > bossBullet.y
            ) {
                bullets.splice(bulletIndex, 1);
                boss.bullets.splice(bossBulletIndex, 1);
                addAnimation(bullet.x, bullet.y, 'bulletBossBullet');
            }
        });

        if (
            bullet.x < boss.x + boss.width &&
            bullet.x + bulletWidth > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bulletHeight > boss.y
        ) {
            bullets.splice(bulletIndex, 1);
            boss.health -= 1;
            addAnimation(bullet.x, bullet.y, 'bulletBoss');
            if (boss.health <= 0) {
                levelComplete();
            } else if (boss.health <= 50 && !boss.firing) {
                startBossFiring();
            }
        }
    });
}

function startBossFiring() {
    boss.firing = true;
    boss.firingInterval = setInterval(() => {
        if (gameRunning && (currentLevel === 7 || currentLevel === 12)) {
            boss.cannons.forEach(cannon => {
                let angleRad, vx, vy;
                angleRad = 0;
                vx = 0;
                vy = boss.bulletSpeed;
                boss.bullets.push({ x: cannon.x, y: cannon.y, vx, vy });

                if (boss.health <= 50) {
                    angleRad = cannon.angle * (Math.PI / 180);
                    vx = Math.cos(angleRad) * boss.bulletSpeed;
                    vy = Math.sin(angleRad) * boss.bulletSpeed;
                    boss.bullets.push({ x: cannon.x, y: cannon.y, vx, vy });

                    cannon.angle += cannon.direction * 2;
                    if (cannon.angle >= 170 || cannon.angle <= 10) {
                        cannon.direction *= -1;
                    }
                }
            });
        }
    }, boss.bulletInterval);
}

function spawnBoss() {
    boss.health = 100;
    boss.cannons.forEach(cannon => {
        cannon.angle = 10;
        cannon.direction = 1;
    });
    startBossFiring();
    if (currentLevel === 12) {
        boss.moving = true;
        spawnBossAliens();
    }
}

function spawnBossAliens() {
    for (let i = 0; i < 5; i++) {
        const defender = {
            x: Math.random() * (canvas.width - alienWidth),
            y: boss.y + boss.height + i * (alienHeight + 10),
            bullets: [],
            bulletInterval: null
        };
        boss.aliens.push(defender);
    }

    for (let i = 0; i < 3; i++) {
        const attacker = {
            x: Math.random() * (canvas.width - alienWidth),
            y: -alienHeight,
            bullets: [],
            bulletInterval: setInterval(() => {
                const newBullet = {
                    x: attacker.x + alienWidth / 2 - alienBulletWidth / 2,
                    y: attacker.y + alienHeight
                };
                alienBullets.push(newBullet);
            }, 1000)
        };
        boss.aliens.push(attacker);
    }
}

function updateBoss() {
    if (boss.moving) {
        boss.x += Math.sin(Date.now() / 1000) * 2;
        boss.y += Math.cos(Date.now() / 1000) * 2;
    }

    // Change shooting directions randomly
    if (boss.randomDirections.length === 0) {
        for (let i = 0; i < boss.cannons.length; i++) {
            boss.randomDirections.push({
                angle: Math.random() * 360,
                direction: Math.random() < 0.5 ? 1 : -1
            });
        }
    }

    boss.cannons.forEach((cannon, index) => {
        cannon.angle += boss.randomDirections[index].direction * 2;
        if (cannon.angle >= 170 || cannon.angle <= 10) {
            boss.randomDirections[index].direction *= -1;
        }
    });

    // Update boss aliens
    boss.aliens.forEach((alien, index) => {
        alien.y += alienSpeed;
        if (alien.y > canvas.height) {
            boss.aliens.splice(index, 1);
        }
    });
}

function drawBossAliens() {
    ctx.fillStyle = 'green';
    boss.aliens.forEach(alien => {
        ctx.fillRect(alien.x, alien.y, alienWidth, alienHeight);
    });
}

function addAnimation(x, y, type) {
    const duration = 30;
    animations.push({ x, y, type, frame: 0, duration });
}

function drawAnimations() {
    animations.forEach((animation, index) => {
        if (animation.frame < animation.duration) {
            ctx.fillStyle = animation.frame % 2 === 0 ? 'yellow' : 'orange';
            ctx.beginPath();
            ctx.arc(animation.x, animation.y, animation.frame * 2, 0, Math.PI * 2);
            ctx.fill();
            animation.frame++;
        } else {
            animations.splice(index, 1);
        }
    });
}

typingInput.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace') {
        event.preventDefault();
    }
});

nextLevelButton.addEventListener('click', () => {
    if (gameRunning) {
        levelComplete();
    } else {
        nextLevel();
    }
});

previousLevelButton.addEventListener('click', () => {
    if (!gameRunning) {
        previousLevel();
    }
});

typingInput.setAttribute('autocomplete', 'off');
typingInput.setAttribute('autocorrect', 'off');
typingInput.setAttribute('spellcheck', 'false');

function gameLoop() {
    if (gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShip();
        drawBullets();
        updateBullets();
        drawHomingMissiles();
        updateHomingMissiles();
        if (currentLevel === 7 || currentLevel === 12) {
            drawBoss();
            drawBossBullets();
            updateBossBullets();
            checkBossCollisions();
            updateBoss();
            if (currentLevel === 12) {
                drawBossAliens();
                updateAliens();
            }
            updateBossHealthDisplay();
        } else {
            drawAliens();
            updateAliens();
            if (currentLevel >= 11) {
                drawAlienBullets();
                updateAlienBullets();
            }
        }
        drawLaserOfDoom();
        updateLaserOfDoom();
        drawAnimations();
        checkCollisions();
        checkHomingMissileCollisions();
        if (currentLevel >= 6) {
            if (shipMovingRight) {
                ship.x += ship.velocity;
                if (ship.x + ship.width / 2 >= canvas.width) {
                    shipMovingRight = false;
                }
            } else {
                ship.x -= ship.velocity;
                if (ship.x - ship.width / 2 <= 0) {
                    shipMovingRight = true;
                }
            }
            ship.velocity = Math.max(ship.velocity - 0.1, 0);
        }
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Level: ${currentLevel}`, canvas.width - 120, 30);
        requestAnimationFrame(gameLoop);
    }
}

upgradeContainer.addEventListener('click', handleUpgradeSelection);

updateStoryText();
spawnAlien();
gameLoop();