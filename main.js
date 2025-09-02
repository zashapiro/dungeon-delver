// Main.js - Entry point for Dungeon Delver: Idle Empire
// Game initialization and core game loop

// Generator class for all income-producing buildings
class Generator {
    constructor(id, name, baseCost, baseIncome, description, floor = -1) {
        this.id = id;
        this.name = name;
        this.baseCost = baseCost;
        this.baseIncome = baseIncome;
        this.description = description;
        this.floor = floor; // -1 = surface, 1+ = underground floors
        this.owned = 0;
        this.level = 1; // For future upgrades
        this.costMultiplier = 1.15; // Each purchase increases cost by 15%
    }
    
    getCost() {
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.owned));
    }
    
    getIncome() {
        return this.baseIncome * this.owned * this.level;
    }
    
    canAfford(gold) {
        return gold >= this.getCost();
    }
    
    purchase(game) {
        const cost = this.getCost();
        if (game.gold >= cost) {
            game.gold -= cost;
            this.owned++;
            
            // Visual feedback for purchase
            spawnFloatingText(400, 200, `-${formatNumber(cost)}`, '#FF6B6B');
            addScreenShake(5);
            
            // Update displays
            updateGoldDisplay();
            updateGeneratorDisplays();
            
            console.log(`Purchased ${this.name}! Now own ${this.owned}, cost was ${formatNumber(cost)}`);
            return true;
        }
        return false;
    }
}

// Game state object
const game = {
    // Core properties
    gold: 0,
    clickValue: 1,
    goldPerSecond: 0,
    lastGoldAmount: 0,
    passiveIncomeTimer: 0,
    passiveIncomeInterval: 100, // Update passive income every 100ms for smoothness
    
    // Canvas and rendering
    canvas: null,
    ctx: null,
    
    // Timing
    lastTime: 0,
    fps: 60,
    fpsCounter: 0,
    lastFpsTime: 0,
    gpsUpdateTimer: 0,
    gpsUpdateInterval: 1000, // Update GPS every second
    
    // Camera system
    camera: {
        y: 0,
        targetY: 0,
        transitioning: false
    },
    
    // Generators
    generators: [],
    
    // Visual effects
    floatingTexts: [],
    particles: [],
    screenShakeAmount: 0,
    screenShakeTime: 0,
    
    // Enhanced click system
    clickStreak: 0,
    lastClickTime: 0,
    clickStreakDecay: 1000, // milliseconds
    
    // Mountain click area
    mountainArea: {
        x: 300,
        y: 150,
        width: 360,
        height: 250
    },
    
    // Game state
    initialized: false,
    paused: false
};

// Initialize the game
function init() {
    console.log('🏔️ Initializing Dungeon Delver: Idle Empire');
    
    // Get canvas and context
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    if (!game.ctx) {
        console.error('Failed to get canvas context');
        return;
    }
    
    // Set up canvas properties
    game.ctx.imageSmoothingEnabled = false; // Pixel art style
    
    // Add event listeners
    setupEventListeners();
    
    // Initialize generators
    initializeGenerators();
    
    // Initialize UI elements
    initializeUI();
    
    // Draw initial test content
    drawTestContent();
    
    // Start game loop
    game.initialized = true;
    game.lastTime = performance.now();
    gameLoop(game.lastTime);
    
    // Set up debug commands
    setupDebugCommands();
    
    console.log('✅ Game initialized successfully');
}

// Set up event listeners
function setupEventListeners() {
    // Canvas click detection
    game.canvas.addEventListener('click', handleCanvasClick);
    
    // Mouse cursor changes
    game.canvas.addEventListener('mousemove', handleMouseMove);
    
    // Guild button
    const guildButton = document.getElementById('guildButton');
    guildButton.addEventListener('click', handleGuildClick);
    
    // Modal close button
    const closeModal = document.getElementById('closeModal');
    closeModal.addEventListener('click', closeGuildModal);
    
    // Modal overlay click to close
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.addEventListener('click', closeGuildModal);
    
    // Prevent context menu on canvas
    game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Initialize generators
function initializeGenerators() {
    // Create surface miner (Floor -1 = surface)
    const surfaceMiner = new Generator(
        'surface_miner',
        'Surface Miner',
        15, // base cost
        1,  // base income per second
        'Hardy miners who work the surface deposits',
        -1  // surface level
    );
    
    game.generators.push(surfaceMiner);
    
    console.log('⚒️ Generators initialized');
}

// Initialize UI elements
function initializeUI() {
    updateGoldDisplay();
    updateGPSDisplay();
    updateClickPowerDisplay();
    updateGeneratorDisplays();
}

// Handle mouse movement for cursor changes
function handleMouseMove(event) {
    const rect = game.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Scale coordinates if canvas is scaled
    const scaleX = game.canvas.width / rect.width;
    const scaleY = game.canvas.height / rect.height;
    const mouseX = x * scaleX;
    const mouseY = y * scaleY;
    
    // Check if mouse is over mountain
    if (isPointInMountain(mouseX, mouseY)) {
        game.canvas.style.cursor = 'pointer';
    } else {
        game.canvas.style.cursor = 'default';
    }
}

// Handle canvas clicks
function handleCanvasClick(event) {
    const rect = game.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Scale coordinates if canvas is scaled
    const scaleX = game.canvas.width / rect.width;
    const scaleY = game.canvas.height / rect.height;
    const clickX = x * scaleX;
    const clickY = y * scaleY;
    
    // Check if click is on mountain
    if (isPointInMountain(clickX, clickY)) {
        const currentTime = performance.now();
        
        // Calculate click streak for bonus effects
        if (currentTime - game.lastClickTime < game.clickStreakDecay) {
            game.clickStreak = Math.min(game.clickStreak + 1, 10); // Max streak of 10
        } else {
            game.clickStreak = 1;
        }
        game.lastClickTime = currentTime;
        
        // Calculate gold earned (base click value)
        const goldEarned = game.clickValue;
        game.gold += goldEarned;
        updateGoldDisplay();
        
        // Enhanced visual feedback based on streak
        const streakBonus = Math.floor(game.clickStreak / 3); // Every 3 clicks gets bonus
        const particleCount = 5 + streakBonus;
        const shakeIntensity = 2 + Math.min(streakBonus, 3);
        
        spawnFloatingText(clickX, clickY, `+${formatNumber(goldEarned)}`, getStreakColor());
        spawnParticles(clickX, clickY, particleCount, getStreakColor());
        addScreenShake(shakeIntensity);
        
        // Play different sound effect based on streak (future implementation)
        console.log(`Mountain clicked! Streak: ${game.clickStreak}, Gold: ${formatNumber(game.gold)}`);
    }
}

// Get color based on click streak
function getStreakColor() {
    if (game.clickStreak >= 7) return '#FF4500'; // Orange-red for high streak
    if (game.clickStreak >= 4) return '#FFA500'; // Orange for medium streak
    return '#FFD700'; // Gold for normal clicks
}

// Handle guild button click
function handleGuildClick() {
    if (game.gold >= 5000) {
        openGuildModal();
    } else {
        console.log('Not enough gold for guild!');
    }
}

// Open guild modal
function openGuildModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.classList.remove('hidden');
    game.paused = true;
}

// Close guild modal
function closeGuildModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.classList.add('hidden');
    game.paused = false;
}

// Update UI displays
function updateGoldDisplay() {
    const goldDisplay = document.getElementById('goldDisplay');
    goldDisplay.textContent = `Gold: ${formatNumber(game.gold)}`;
    
    // Update guild button availability
    const guildButton = document.getElementById('guildButton');
    if (game.gold >= 5000) {
        guildButton.classList.remove('disabled');
        guildButton.innerHTML = '<span>🏰 GUILD</span><small>Click to Build</small>';
    } else {
        guildButton.classList.add('disabled');
        const needed = 5000 - game.gold;
        guildButton.innerHTML = `<span>🏰 GUILD</span><small>Need ${formatNumber(needed)} Gold</small>`;
    }
}

function updateGPSDisplay() {
    const gpsDisplay = document.getElementById('gpsDisplay');
    gpsDisplay.textContent = `GPS: ${formatNumber(game.goldPerSecond)}`;
}

function updateClickPowerDisplay() {
    const clickDisplay = document.getElementById('clickPowerDisplay');
    clickDisplay.textContent = `Click Power: ${formatNumber(game.clickValue)}`;
}

function updateFPSDisplay() {
    const fpsDisplay = document.getElementById('fpsDisplay');
    fpsDisplay.textContent = `FPS: ${Math.round(game.fps)}`;
}

// Update generator displays in the UI
function updateGeneratorDisplays() {
    const economySection = document.getElementById('economyUpgrades');
    
    // Clear existing content
    economySection.innerHTML = '<h3>Economy Upgrades</h3>';
    
    // Add generator buttons
    game.generators.forEach(generator => {
        const button = document.createElement('button');
        button.className = 'upgrade-button generator-button';
        button.id = `generator_${generator.id}`;
        
        const cost = generator.getCost();
        const canAfford = generator.canAfford(game.gold);
        const income = generator.getIncome();
        
        // Calculate efficiency (income per gold spent)
        const efficiency = generator.owned > 0 ? (income / (generator.baseCost * generator.owned)) : (generator.baseIncome / generator.baseCost);
        
        button.innerHTML = `
            <div style="font-size: 8px; margin-bottom: 3px; color: ${canAfford ? '#FFD700' : '#999'};">
                <strong>${generator.name}</strong> <span style="color: #AAA;">(${generator.owned})</span>
            </div>
            <div style="font-size: 6px; color: #BBB; margin-bottom: 2px;">
                ${generator.description}
            </div>
            <div style="font-size: 7px; display: flex; justify-content: space-between;">
                <span style="color: ${canAfford ? '#90EE90' : '#FF6B6B'};">Cost: ${formatNumber(cost)}</span>
                <span style="color: #87CEEB;">+${formatNumber(generator.baseIncome)}/s</span>
            </div>
            ${income > 0 ? `<div style="font-size: 6px; color: #98FB98; margin-top: 1px;">Currently: +${formatNumber(income)}/s</div>` : ''}
        `;
        
        if (!canAfford) {
            button.classList.add('disabled');
        }
        
        // Remove old event listeners and add new ones
        const newButton = button.cloneNode(true);
        newButton.addEventListener('click', () => {
            if (canAfford && generator.purchase(game)) {
                // Add purchase effect
                addScreenShake(4);
                spawnParticles(400, 300, 8, '#90EE90');
            }
        });
        
        economySection.appendChild(newButton);
    });
}

// Enhanced number formatting function
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) {
        const k = num / 1000;
        return k >= 100 ? Math.floor(k) + 'K' : k.toFixed(1) + 'K';
    }
    if (num < 1000000000) {
        const m = num / 1000000;
        return m >= 100 ? Math.floor(m) + 'M' : m.toFixed(1) + 'M';
    }
    if (num < 1000000000000) {
        const b = num / 1000000000;
        return b >= 100 ? Math.floor(b) + 'B' : b.toFixed(1) + 'B';
    }
    if (num < 1000000000000000) {
        const t = num / 1000000000000;
        return t >= 100 ? Math.floor(t) + 'T' : t.toFixed(1) + 'T';
    }
    // For extremely large numbers
    const qa = num / 1000000000000000;
    return qa >= 100 ? Math.floor(qa) + 'Qa' : qa.toFixed(1) + 'Qa';
}

// Smooth number ticker animation (for future use)
function createNumberTicker(targetValue, currentValue, speed = 0.1) {
    const diff = targetValue - currentValue;
    if (Math.abs(diff) < 0.01) return targetValue;
    return currentValue + (diff * speed);
}

// Check if point is within mountain click area
function isPointInMountain(x, y) {
    const mountain = game.mountainArea;
    return x >= mountain.x && x <= mountain.x + mountain.width &&
           y >= mountain.y && y <= mountain.y + mountain.height;
}

// Visual feedback functions
function flashCanvas() {
    game.canvas.style.filter = 'brightness(1.2)';
    setTimeout(() => {
        game.canvas.style.filter = 'brightness(1)';
    }, 100);
}

// Screen shake effect
function addScreenShake(intensity) {
    game.screenShakeAmount = intensity;
    game.screenShakeTime = 200; // milliseconds
}

// Enhanced floating text system
function spawnFloatingText(x, y, text, color = '#FFD700') {
    game.floatingTexts.push({
        x: x,
        y: y,
        text: text,
        life: 1.5, // Slightly longer life for better visibility
        maxLife: 1.5,
        velocity: { x: (Math.random() - 0.5) * 20, y: -60 },
        color: color,
        scale: 1.0,
        maxScale: 1.2
    });
    
    // Limit to 15 floating texts for performance
    if (game.floatingTexts.length > 15) {
        game.floatingTexts.shift();
    }
}

// Enhanced particle system
function spawnParticles(x, y, count, color = '#FFD700') {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 1.0;
        const speed = 40 + Math.random() * 60;
        
        game.particles.push({
            x: x + (Math.random() - 0.5) * 10, // Small spawn variance
            y: y + (Math.random() - 0.5) * 10,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 40
            },
            life: 1.2,
            maxLife: 1.2,
            size: 2 + Math.random() * 4,
            color: color,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    // Limit particles for performance
    if (game.particles.length > 75) {
        game.particles.splice(0, game.particles.length - 75);
    }
}

// Initial drawing (replaced by render loop)
function drawTestContent() {
    // Initial content - now handled by render loop
    drawBackground();
}

// Draw background and mountain
function drawBackground() {
    const ctx = game.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height / 2);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#E0F6FF'); // Light blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513'; // Mountain brown
    ctx.fillRect(0, 400, game.canvas.width, 240);
    
    // Draw mountain shape
    ctx.fillStyle = '#696969'; // Stone gray
    ctx.beginPath();
    ctx.moveTo(300, 400);
    ctx.lineTo(480, 150);
    ctx.lineTo(660, 400);
    ctx.closePath();
    ctx.fill();
    
    // Add mountain peak highlight
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.moveTo(300, 400);
    ctx.lineTo(480, 150);
    ctx.lineTo(530, 250);
    ctx.lineTo(350, 400);
    ctx.closePath();
    ctx.fill();
    
    // Draw instruction text
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Click the mountain for gold!', 480, 100);
    
    // Draw grass line
    ctx.fillStyle = '#228B22'; // Grass green
    ctx.fillRect(0, 500, game.canvas.width, 20);
    
    // Add decorative trees
    drawTree(150, 480);
    drawTree(750, 480);
    drawTree(800, 480);
}

// Draw enhanced floating texts
function drawFloatingTexts() {
    const ctx = game.ctx;
    
    game.floatingTexts.forEach(text => {
        const alpha = text.life / text.maxLife;
        ctx.globalAlpha = alpha;
        
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.scale(text.scale, text.scale);
        
        // Add outline for better visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeText(text.text, 0, 0);
        
        // Draw main text
        ctx.fillStyle = text.color;
        ctx.fillText(text.text, 0, 0);
        
        ctx.restore();
    });
    
    ctx.globalAlpha = 1.0;
}

// Draw enhanced particles
function drawParticles() {
    const ctx = game.ctx;
    
    game.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        // Draw particle as a rotated square with slight glow effect
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        
        // Add subtle glow
        if (alpha > 0.5) {
            ctx.globalAlpha = (alpha - 0.5) * 0.3;
            ctx.fillStyle = particle.color;
            const glowSize = particle.size * 1.5;
            ctx.fillRect(-glowSize / 2, -glowSize / 2, glowSize, glowSize);
        }
        
        ctx.restore();
    });
    
    ctx.globalAlpha = 1.0;
}

// Helper function to draw a simple tree
function drawTree(x, y) {
    const ctx = game.ctx;
    
    // Tree trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 5, y, 10, 20);
    
    // Tree leaves (simple circle)
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, y - 5, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Main game loop
function gameLoop(currentTime) {
    if (!game.initialized) return;
    
    // Calculate delta time
    const deltaTime = currentTime - game.lastTime;
    game.lastTime = currentTime;
    
    // Calculate FPS
    game.fpsCounter++;
    if (currentTime - game.lastFpsTime >= 1000) {
        game.fps = game.fpsCounter;
        game.fpsCounter = 0;
        game.lastFpsTime = currentTime;
        updateFPSDisplay();
    }
    
    // Update game state (if not paused)
    if (!game.paused) {
        update(deltaTime);
    }
    
    // Render
    render();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Calculate total passive income from all generators
function calculateTotalIncome() {
    return game.generators.reduce((total, generator) => {
        return total + generator.getIncome();
    }, 0);
}

// Update game state
function update(deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    
    // Update passive income from generators
    game.passiveIncomeTimer += deltaTime;
    if (game.passiveIncomeTimer >= game.passiveIncomeInterval) {
        const totalIncome = calculateTotalIncome();
        if (totalIncome > 0) {
            const incomePerTick = totalIncome * (game.passiveIncomeInterval / 1000);
            game.gold += incomePerTick;
            updateGoldDisplay();
        }
        game.passiveIncomeTimer = 0;
    }
    
    // Update GPS calculation (now includes passive income)
    game.gpsUpdateTimer += deltaTime;
    if (game.gpsUpdateTimer >= game.gpsUpdateInterval) {
        const goldDiff = game.gold - game.lastGoldAmount;
        game.goldPerSecond = goldDiff;
        game.lastGoldAmount = game.gold;
        game.gpsUpdateTimer = 0;
        updateGPSDisplay();
        updateGeneratorDisplays(); // Update affordability
    }
    
    // Update screen shake
    if (game.screenShakeTime > 0) {
        game.screenShakeTime -= deltaTime;
        if (game.screenShakeTime <= 0) {
            game.screenShakeAmount = 0;
        }
    }
    
    // Update click streak decay
    const currentTime = performance.now();
    if (currentTime - game.lastClickTime > game.clickStreakDecay) {
        game.clickStreak = 0;
    }
    
    // Update floating texts with enhanced animation
    for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
        const text = game.floatingTexts[i];
        text.x += text.velocity.x * dt;
        text.y += text.velocity.y * dt;
        text.life -= dt;
        
        // Add scale animation (grow then shrink)
        const lifeProgress = 1 - (text.life / text.maxLife);
        if (lifeProgress < 0.3) {
            text.scale = 1.0 + (lifeProgress / 0.3) * 0.2; // Grow
        } else {
            text.scale = 1.2 - ((lifeProgress - 0.3) / 0.7) * 0.2; // Shrink
        }
        
        // Add velocity decay
        text.velocity.x *= 0.98;
        text.velocity.y *= 0.99;
        
        if (text.life <= 0) {
            game.floatingTexts.splice(i, 1);
        }
    }
    
    // Update particles with enhanced physics
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];
        particle.x += particle.velocity.x * dt;
        particle.y += particle.velocity.y * dt;
        particle.velocity.y += 180 * dt; // Slightly stronger gravity
        particle.velocity.x *= 0.99; // Air resistance
        particle.rotation += particle.rotationSpeed * dt;
        particle.life -= dt;
        
        if (particle.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

// Render game
function render() {
    const ctx = game.ctx;
    
    // Apply screen shake
    ctx.save();
    if (game.screenShakeAmount > 0) {
        const shakeX = (Math.random() - 0.5) * game.screenShakeAmount;
        const shakeY = (Math.random() - 0.5) * game.screenShakeAmount;
        ctx.translate(shakeX, shakeY);
    }
    
    // Clear and draw background
    drawBackground();
    
    // Draw floating texts
    drawFloatingTexts();
    
    // Draw particles
    drawParticles();
    
    ctx.restore();
}

// Debug commands for testing
function setupDebugCommands() {
    window.debug = {
        addGold: (amount) => {
            game.gold += amount;
            updateGoldDisplay();
            console.log(`Added ${amount} gold. Total: ${formatNumber(game.gold)}`);
        },
        setGold: (amount) => {
            game.gold = amount;
            updateGoldDisplay();
            console.log(`Set gold to: ${formatNumber(game.gold)}`);
        },
        testClick: () => {
            const rect = game.canvas.getBoundingClientRect();
            handleCanvasClick({
                clientX: rect.left + 480,
                clientY: rect.top + 300
            });
        },
        testStreak: (count = 10) => {
            for (let i = 0; i < count; i++) {
                setTimeout(() => debug.testClick(), i * 100);
            }
        },
        setClickValue: (value) => {
            game.clickValue = value;
            updateClickPowerDisplay();
            console.log(`Click value set to: ${formatNumber(game.clickValue)}`);
        },
        testNumbers: () => {
            const testValues = [999, 1500, 1000000, 1500000000, 1500000000000];
            testValues.forEach(val => {
                console.log(`${val} -> ${formatNumber(val)}`);
            });
        },
        getFPS: () => {
            console.log(`Current FPS: ${game.fps}`);
            return game.fps;
        },
        getStats: () => {
            console.log(`Gold: ${formatNumber(game.gold)}`);
            console.log(`GPS: ${formatNumber(game.goldPerSecond)}`);
            console.log(`Click Value: ${formatNumber(game.clickValue)}`);
            console.log(`Click Streak: ${game.clickStreak}`);
            console.log(`Floating Texts: ${game.floatingTexts.length}`);
            console.log(`Particles: ${game.particles.length}`);
            console.log(`Generators:`)
            game.generators.forEach(gen => {
                console.log(`  ${gen.name}: ${gen.owned} owned, +${formatNumber(gen.getIncome())}/s, next costs ${formatNumber(gen.getCost())}`);
            });
        },
        buyMiner: () => {
            const miner = game.generators.find(g => g.id === 'surface_miner');
            if (miner) {
                miner.purchase(game);
            }
        },
        testPassiveIncome: () => {
            debug.buyMiner();
            debug.buyMiner();
            debug.buyMiner();
            console.log('Bought 3 miners, watch your gold grow!');
        }
    };
    
    console.log('🔧 Enhanced Debug commands available:');
    console.log('  debug.addGold(amount) - Add gold');
    console.log('  debug.setGold(amount) - Set gold amount');
    console.log('  debug.testClick() - Simulate mountain click');
    console.log('  debug.testStreak(count) - Test click streak');
    console.log('  debug.setClickValue(value) - Change click power');
    console.log('  debug.testNumbers() - Test number formatting');
    console.log('  debug.getStats() - Show game statistics');
    console.log('  debug.getFPS() - Show current FPS');
    console.log('  debug.buyMiner() - Purchase a surface miner');
    console.log('  debug.testPassiveIncome() - Buy 3 miners to test passive income');
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOM Content Loaded - Starting game...');
    init();
});

// Handle page visibility for pause/resume
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Game paused (tab hidden)');
        game.paused = true;
    } else {
        console.log('▶️ Game resumed (tab visible)');
        game.paused = false;
        game.lastTime = performance.now(); // Reset timing to avoid large delta
    }
});