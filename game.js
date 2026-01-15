// ===== GAME DATA =====
const PAIN_POINTS = [
    {
        text: "Energy Waste",
        solution: "Smart Energy Management",
        metrics: ["+24% Energy Savings", "-18% Operating Cost", "Real-time Monitoring"]
    },
    {
        text: "Low Space Utilization",
        solution: "Space Analytics Dashboard",
        metrics: ["+35% Space Efficiency", "-22% Vacancy Rate", "Occupancy Insights"]
    },
    {
        text: "Blind Footfall Data",
        solution: "People Sensing Solution",
        metrics: ["+18% Conversion Rate", "-12% Labor Cost", "Traffic Pattern Analysis"]
    },
    {
        text: "Manual Operation",
        solution: "Automation Platform",
        metrics: ["+40% Productivity", "-30% Manual Tasks", "Smart Workflow Engine"]
    },
    {
        text: "Security Blind Spots",
        solution: "AI Security System",
        metrics: ["+95% Detection Rate", "-45% False Alarms", "Predictive Alerts"]
    },
    {
        text: "Customer Wait Times",
        solution: "Queue Management AI",
        metrics: ["-28% Wait Time", "+32% Satisfaction", "Dynamic Resource Allocation"]
    },
    {
        text: "Inventory Inaccuracy",
        solution: "Real-time Inventory Tracking",
        metrics: ["+98% Accuracy", "-15% Stockouts", "Automated Reordering"]
    },
    {
        text: "Environmental Impact",
        solution: "Sustainability Analytics",
        metrics: ["-40% Carbon Footprint", "+25% Green Score", "ESG Compliance"]
    }
];

// ===== GAME STATE =====
let gameState = {
    score: 0,
    combo: 0,
    comboTimer: null,
    missed: 0,
    maxMissed: 3,
    isPlaying: false,
    painsSolved: 0,
    bestCombo: 0,
    totalImpact: 0,
    spawnInterval: null,
    activePainPoints: [],
    achievedSolutions: []
};

// ===== DOM ELEMENTS =====
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const gameCanvas = document.getElementById('gameCanvas');
const sliceCanvas = document.getElementById('sliceCanvas');
const solutionContainer = document.getElementById('solutionContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
const comboDisplay = document.getElementById('comboDisplay');
const missedDisplay = document.getElementById('missedDisplay');

// ===== SLICE TRAIL =====
const ctx = sliceCanvas.getContext('2d');
let isSlicing = false;
let slicePoints = [];

function resizeCanvas() {
    sliceCanvas.width = window.innerWidth;
    sliceCanvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== EVENT LISTENERS =====
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    showScreen('startScreen');
    resetGame();
});

// Mouse events
gameCanvas.addEventListener('mousedown', (e) => {
    isSlicing = true;
    slicePoints = [{x: e.clientX, y: e.clientY}];
});

gameCanvas.addEventListener('mousemove', (e) => {
    if (isSlicing) {
        slicePoints.push({x: e.clientX, y: e.clientY});
        drawSliceTrail();
        checkSlice(e.clientX, e.clientY);
        
        // Limit trail length
        if (slicePoints.length > 20) {
            slicePoints.shift();
        }
    }
});

gameCanvas.addEventListener('mouseup', () => {
    isSlicing = false;
    fadeOutTrail();
});

// Touch events
gameCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isSlicing = true;
    const touch = e.touches[0];
    slicePoints = [{x: touch.clientX, y: touch.clientY}];
});

gameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isSlicing) {
        const touch = e.touches[0];
        slicePoints.push({x: touch.clientX, y: touch.clientY});
        drawSliceTrail();
        checkSlice(touch.clientX, touch.clientY);
        
        if (slicePoints.length > 20) {
            slicePoints.shift();
        }
    }
});

gameCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isSlicing = false;
    fadeOutTrail();
});

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
    [startScreen, gameScreen, gameOverScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===== GAME FUNCTIONS =====
function startGame() {
    resetGame();
    showScreen('gameScreen');
    gameState.isPlaying = true;
    startSpawning();
}

function resetGame() {
    gameState = {
        score: 0,
        combo: 0,
        comboTimer: null,
        missed: 0,
        maxMissed: 3,
        isPlaying: false,
        painsSolved: 0,
        bestCombo: 0,
        totalImpact: 0,
        spawnInterval: null,
        activePainPoints: [],
        achievedSolutions: []
    };
    
    gameCanvas.innerHTML = '';
    solutionContainer.innerHTML = '';
    updateHUD();
}

function updateHUD() {
    scoreDisplay.textContent = gameState.score;
    comboDisplay.textContent = `${gameState.combo}x`;
    missedDisplay.textContent = `${gameState.missed}/${gameState.maxMissed}`;
    
    // Animate combo
    if (gameState.combo > 1) {
        comboDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            comboDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

// ===== PAIN POINT SPAWNING =====
function startSpawning() {
    let spawnDelay = 2000; // Start with 2 seconds
    
    function spawn() {
        if (!gameState.isPlaying) return;
        
        spawnPainPoint();
        
        // Gradually increase difficulty
        spawnDelay = Math.max(800, spawnDelay - 50);
        gameState.spawnInterval = setTimeout(spawn, spawnDelay);
    }
    
    spawn();
}

function spawnPainPoint() {
    const painData = PAIN_POINTS[Math.floor(Math.random() * PAIN_POINTS.length)];
    
    const painCard = document.createElement('div');
    painCard.className = 'pain-card';
    painCard.textContent = painData.text;
    
    // Random horizontal position
    const startX = Math.random() * (window.innerWidth - 200);
    const startY = window.innerHeight + 100;
    
    // Random trajectory
    const endX = startX + (Math.random() - 0.5) * 300;
    const endY = -100;
    
    painCard.style.left = startX + 'px';
    painCard.style.bottom = '-100px';
    
    painCard.dataset.solution = painData.solution;
    painCard.dataset.metrics = JSON.stringify(painData.metrics);
    painCard.dataset.sliced = 'false';
    
    gameCanvas.appendChild(painCard);
    gameState.activePainPoints.push(painCard);
    
    // Animate upward
    const duration = 5000 + Math.random() * 2000; // 5-7 seconds
    const startTime = Date.now();
    
    function animate() {
        if (!gameState.isPlaying || painCard.dataset.sliced === 'true') return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentX = startX + (endX - startX) * easeProgress;
        const currentY = startY + (endY - startY) * easeProgress;
        
        painCard.style.left = currentX + 'px';
        painCard.style.bottom = (window.innerHeight - currentY) + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Pain point escaped
            handleMiss(painCard);
        }
    }
    
    animate();
}

function handleMiss(painCard) {
    if (painCard.dataset.sliced === 'false') {
        gameState.missed++;
        updateHUD();
        
        // Remove card
        painCard.style.opacity = '0';
        setTimeout(() => painCard.remove(), 300);
        
        // Remove from active array
        gameState.activePainPoints = gameState.activePainPoints.filter(p => p !== painCard);
        
        // Check game over
        if (gameState.missed >= gameState.maxMissed) {
            endGame();
        }
    }
}

// ===== SLICE DETECTION =====
function checkSlice(x, y) {
    gameState.activePainPoints.forEach(painCard => {
        if (painCard.dataset.sliced === 'true') return;
        
        const rect = painCard.getBoundingClientRect();
        
        // Check if slice intersects pain card
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            slicePainPoint(painCard, x, y);
        }
    });
}

function slicePainPoint(painCard, x, y) {
    painCard.dataset.sliced = 'true';
    
    // Update score and combo
    gameState.combo++;
    gameState.bestCombo = Math.max(gameState.bestCombo, gameState.combo);
    gameState.score += 100 * gameState.combo;
    gameState.painsSolved++;
    
    updateHUD();
    
    // Reset combo timer
    clearTimeout(gameState.comboTimer);
    gameState.comboTimer = setTimeout(() => {
        gameState.combo = 0;
        updateHUD();
    }, 2000);
    
    // Get solution data
    const solution = painCard.dataset.solution;
    const metrics = JSON.parse(painCard.dataset.metrics);
    
    // Add to achievements
    if (!gameState.achievedSolutions.includes(solution)) {
        gameState.achievedSolutions.push(solution);
    }
    
    // Calculate impact
    const impact = metrics.reduce((sum, metric) => {
        const match = metric.match(/[+-](\d+)%/);
        return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    gameState.totalImpact += impact;
    
    // Create particles
    createParticles(x, y);
    
    // Show solution popup
    showSolution(solution, metrics, x, y);
    
    // Remove pain card
    painCard.style.opacity = '0';
    painCard.style.transform = 'scale(0) rotate(45deg)';
    setTimeout(() => {
        painCard.remove();
        gameState.activePainPoints = gameState.activePainPoints.filter(p => p !== painCard);
    }, 300);
}

// ===== VISUAL EFFECTS =====
function drawSliceTrail() {
    ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    
    if (slicePoints.length < 2) return;
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
    
    ctx.beginPath();
    ctx.moveTo(slicePoints[0].x, slicePoints[0].y);
    
    for (let i = 1; i < slicePoints.length; i++) {
        ctx.lineTo(slicePoints[i].x, slicePoints[i].y);
    }
    
    ctx.stroke();
}

function fadeOutTrail() {
    let alpha = 0.8;
    
    function fade() {
        ctx.globalAlpha = alpha;
        alpha -= 0.1;
        
        if (alpha > 0) {
            requestAnimationFrame(fade);
        } else {
            ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.globalAlpha = 1;
            slicePoints = [];
        }
    }
    
    fade();
}

function createParticles(x, y) {
    const colors = ['#ef4444', '#f97316', '#fbbf24'];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        gameCanvas.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = x;
        let py = y;
        let opacity = 1;
        const startTime = Date.now();
        
        function animateParticle() {
            const elapsed = (Date.now() - startTime) / 1000;
            
            px += vx * elapsed;
            py += vy * elapsed;
            opacity -= elapsed * 2;
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = Math.max(0, opacity);
            
            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        animateParticle();
    }
}

function showSolution(solution, metrics, x, y) {
    const popup = document.createElement('div');
    popup.className = 'solution-popup';
    popup.style.left = Math.min(x, window.innerWidth - 350) + 'px';
    popup.style.top = Math.min(y, window.innerHeight - 300) + 'px';
    
    const title = document.createElement('div');
    title.className = 'solution-title';
    title.textContent = solution;
    popup.appendChild(title);
    
    metrics.forEach((metric, index) => {
        const metricDiv = document.createElement('div');
        metricDiv.className = 'metric-item';
        metricDiv.textContent = metric;
        popup.appendChild(metricDiv);
        
        // Create floating metric
        setTimeout(() => {
            const floatingMetric = document.createElement('div');
            floatingMetric.className = 'floating-metric';
            floatingMetric.textContent = metric;
            floatingMetric.style.left = (x + Math.random() * 100 - 50) + 'px';
            floatingMetric.style.top = y + 'px';
            solutionContainer.appendChild(floatingMetric);
            
            setTimeout(() => floatingMetric.remove(), 2000);
        }, index * 100);
    });
    
    solutionContainer.appendChild(popup);
    
    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'scale(0.8)';
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// ===== GAME OVER =====
function endGame() {
    gameState.isPlaying = false;
    clearTimeout(gameState.spawnInterval);
    
    // Clear all active pain points
    gameState.activePainPoints.forEach(p => p.remove());
    gameState.activePainPoints = [];
    
    // Show game over screen
    setTimeout(() => {
        showScreen('gameOverScreen');
        displayStats();
    }, 500);
}

function displayStats() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('painsSolved').textContent = gameState.painsSolved;
    document.getElementById('bestCombo').textContent = gameState.bestCombo + 'x';
    document.getElementById('totalImpact').textContent = '+' + gameState.totalImpact + '%';
    
    // Display achievements
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    
    if (gameState.achievedSolutions.length === 0) {
        const noAchievements = document.createElement('div');
        noAchievements.style.color = 'rgba(255, 255, 255, 0.5)';
        noAchievements.textContent = 'No pain points solved';
        achievementsList.appendChild(noAchievements);
    } else {
        gameState.achievedSolutions.forEach(solution => {
            const item = document.createElement('div');
            item.className = 'achievement-item';
            item.textContent = solution;
            achievementsList.appendChild(item);
        });
    }
}
