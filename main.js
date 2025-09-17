// Main.js - Entry point for Dungeon Delver: Idle Empire
// Game initialization and core game loop

// Upgrade class for economy and click upgrades
class Upgrade {
    constructor(id, name, description, baseCost, maxLevel, effect, category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.baseCost = baseCost;
        this.maxLevel = maxLevel;
        this.currentLevel = 0;
        this.effect = effect; // Function that applies the upgrade effect
        this.category = category; // 'economy' or 'clicking'
        this.costMultiplier = 1.5; // Each level increases cost by 50%
    }
    
    getCost() {
        if (this.currentLevel >= this.maxLevel) return Infinity;
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.currentLevel));
    }
    
    canAfford(gold) {
        return gold >= this.getCost() && this.currentLevel < this.maxLevel;
    }
    
    purchase() {
        const cost = this.getCost();
        if (game.gold >= cost && this.currentLevel < this.maxLevel) {
            game.gold -= cost;
            this.currentLevel++;
            this.effect(); // Apply the upgrade effect
            updateGoldDisplay();
            // Upgrades now handled by canvas UI
            return true;
        }
        return false;
    }
    
    isMaxed() {
        return this.currentLevel >= this.maxLevel;
    }
}

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
        this.enabled = true; // Can be disabled for floors with bosses
    }
    
    getCost() {
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.owned));
    }
    
    getIncome() {
        let income = this.baseIncome * this.owned * this.level;
        
        // Apply global production multiplier
        income *= game.globalProductionMultiplier;
        
        // Apply miner efficiency multiplier (only for surface miners)
        if (this.id === 'surface_miner') {
            income *= game.minerEfficiencyMultiplier;
        }
        
        return income;
    }
    
    canAfford(gold) {
        return this.enabled && gold >= this.getCost();
    }
    
    purchase(game) {
        const cost = this.getCost();
        if (this.enabled && game.gold >= cost) {
            game.gold -= cost;
            this.owned++;
            
            // Check for underground reveal (first underground generator purchase)
            if (this.floor > 0 && !game.camera.undergroundRevealed) {
                triggerUndergroundReveal();
            }
            
            // Visual feedback for purchase
            spawnFloatingText(400, 200, `-${formatNumber(cost)}`, '#FF6B6B');
            addScreenShake(5);
            
            // Update displays
            updateGoldDisplay();
            // Generators now handled by canvas UI
            
            console.log(`Purchased ${this.name}! Now own ${this.owned}, cost was ${formatNumber(cost)}`);
            return true;
        }
        return false;
    }
}

// Canvas UI System Classes
class UIComponent {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.enabled = true;
        this.hovered = false;
    }
    
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    render(ctx) {
        // Override in subclasses
    }
    
    handleClick(x, y) {
        return false; // Return true if click was handled
    }
    
    handleMouseMove(x, y) {
        const wasHovered = this.hovered;
        this.hovered = this.containsPoint(x, y) && this.enabled;
        return this.hovered !== wasHovered;
    }
}

class UIButton extends UIComponent {
    constructor(x, y, width, height, text, onClick, style = {}) {
        super(x, y, width, height);
        this.text = text;
        this.onClick = onClick;
        this.style = {
            backgroundColor: style.backgroundColor || '#2C2C2C',
            borderColor: style.borderColor || '#4A4A4A',
            textColor: style.textColor || '#F0F0F0',
            hoverBgColor: style.hoverBgColor || '#4A4A4A',
            hoverBorderColor: style.hoverBorderColor || '#FFD700',
            disabledBgColor: style.disabledBgColor || '#1A1A1A',
            disabledTextColor: style.disabledTextColor || '#666666',
            fontSize: style.fontSize || 14,
            fontFamily: style.fontFamily || 'Arial',
            borderWidth: style.borderWidth || 2,
            ...style
        };
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        let bgColor = this.style.backgroundColor;
        let borderColor = this.style.borderColor;
        let textColor = this.style.textColor;
        
        if (!this.enabled) {
            bgColor = this.style.disabledBgColor;
            textColor = this.style.disabledTextColor;
        } else if (this.hovered) {
            bgColor = this.style.hoverBgColor;
            borderColor = this.style.hoverBorderColor;
        }
        
        // Draw button background
        ctx.fillStyle = bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = this.style.borderWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw text (handle multiline)
        ctx.fillStyle = textColor;
        ctx.font = `${scaledSize(this.style.fontSize)}px ${this.style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = this.text.split('\n');
        const lineHeight = scaledSize(this.style.fontSize + 2);
        const totalHeight = lines.length * lineHeight;
        const startY = this.y + this.height / 2 - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(
                line,
                this.x + this.width / 2,
                startY + index * lineHeight
            );
        });
    }
    
    handleClick(x, y) {
        // Debug ANY button click in left nav area (generators, upgrades, guild, etc.)
        if (x < 300) {
            console.log(`🎯 Button debug: "${this.text}" at click(${Math.round(x)},${Math.round(y)}) vs button(${this.x},${this.y},${this.width},${this.height}) visible=${this.visible} enabled=${this.enabled}`);
            console.log(`📍 containsPoint result: ${this.containsPoint(x, y)}`);
        }

        if (!this.visible || !this.enabled || !this.containsPoint(x, y)) {
            return false;
        }

        if (this.onClick) {
            this.onClick();
        }
        return true;
    }
    
    setText(newText) {
        this.text = newText;
    }
}

class CanvasUIManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.components = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Bind event listeners
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    }
    
    addComponent(component) {
        this.components.push(component);
    }
    
    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
        }
    }
    
    render() {
        for (const component of this.components) {
            if (component.visible) {
                component.render(this.ctx);
            }
        }
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Scale coordinates if canvas is scaled
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = x * scaleX;
        const clickY = y * scaleY;

        // Debug click coordinates in left nav area
        if (clickX < 300) {
            console.log(`🖱️ Click debug: raw(${Math.round(x)},${Math.round(y)}) scaled(${Math.round(clickX)},${Math.round(clickY)}) canvas(${this.canvas.width}x${this.canvas.height}) rect(${Math.round(rect.width)}x${Math.round(rect.height)})`);
            console.log(`🎯 Scale factors: ${scaleX.toFixed(2)}x, ${scaleY.toFixed(2)}x`);
        }

        // Check components in reverse order (last added = topmost)
        for (let i = this.components.length - 1; i >= 0; i--) {
            if (this.components[i].handleClick(clickX, clickY)) {
                return; // Click was handled, stop propagation
            }
        }

        // If no UI component handled the click, pass to game logic
        handleGameClick(clickX, clickY);
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Scale coordinates if canvas is scaled
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouseX = x * scaleX;
        this.mouseY = y * scaleY;
        
        // Update hover states for all components
        for (const component of this.components) {
            component.handleMouseMove(this.mouseX, this.mouseY);
        }
        
        // Update cursor based on hover state
        this.updateCursor();
        
        // Store mouse position for game logic
        game.mouseX = this.mouseX;
        game.mouseY = this.mouseY;
    }
    
    updateCursor() {
        // Check if hovering over any interactive element
        let hoveredComponent = null;
        for (const component of this.components) {
            if (component.hovered && component.enabled) {
                hoveredComponent = component;
                break;
            }
        }
        
        if (hoveredComponent) {
            this.canvas.style.cursor = 'pointer';
        } else if (isPointInMountain(this.mouseX, this.mouseY)) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.boundHandleClick);
        this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
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
    uiManager: null,
    
    // Timing
    lastTime: 0,
    fps: 60,
    fpsCounter: 0,
    lastFpsTime: 0,
    gpsUpdateTimer: 0,
    gpsUpdateInterval: 1000, // Update GPS every second
    
    // Camera system
    camera: {
        y: 0,          // Current camera position
        targetY: 0,    // Target camera position
        transitioning: false,
        transitionSpeed: 2, // Speed of camera transitions
        undergroundRevealed: false // Has the underground been revealed?
    },
    
    // Generators
    generators: [],
    
    // Floor click areas for direct purchasing
    floorAreas: [],
    
    // Upgrades system
    upgrades: {
        economy: [],
        clicking: []
    },
    
    // UI scaling
    scaleFactor: 1.0,
    
    // Combat system
    monsters: [],
    heroes: [],
    breachTriggered: false,
    breachTime: 0,
    heroSpawnTimer: 0,
    heroSpawnRate: 30000, // Spawn every 30 seconds (milliseconds)
    maxHeroes: 1, // Maximum number of heroes at once (starts at 1)
    guildLevel: 0, // Guild level (0 = not built, 1+ = operational)
    
    // Global multipliers from upgrades
    minerEfficiencyMultiplier: 1.0,
    globalProductionMultiplier: 1.0,
    autoClickRate: 0, // Clicks per second from auto-clicker
    
    // Visual effects
    floatingTexts: [],
    particles: [],
    screenShakeAmount: 0,
    screenShakeTime: 0,
    
    // Animation system
    animationTime: 0,
    miners: [], // Visual miner sprites
    miningCart: {
        x: 200,
        direction: 1, // 1 = right, -1 = left
        active: false
    },
    
    // Enhanced click system
    clickStreak: 0,
    lastClickTime: 0,
    clickStreakDecay: 1000, // milliseconds
    
    // Mountain click area - will be updated in init to center on canvas
    mountainArea: {
        x: 520, // Will be updated dynamically in resizeCanvasToFullScreen
        y: 0,   // Will be updated dynamically in resizeCanvasToFullScreen
        width: 360,
        height: 250
    },
    
    // Game state
    initialized: false,
    paused: false,
    
    // Save system
    lastSaveTime: 0,
    autoSaveInterval: 10000, // Auto-save every 10 seconds
    lastPlayTime: Date.now(),
    totalPlaytime: 0
};

// Responsive Left Column Layout System
const LAYOUT = {
    leftColumn: {
        // Responsive width: 20% of screen width, with constraints
        widthRatio: 0.20,         // 20% of screen width
        minWidth: 280,            // Minimum width (for very wide screens)
        maxWidth: 350,            // Maximum width (for narrow screens)
        sections: {
            gold: { y: 0, height: 80 },
            upgrades: { y: 80, height: 120 },
            generators: { y: 200, heightRatio: 0.45 }, // 45% of remaining space
            guild: { fromBottom: 100, height: 80 }
        }
    },
    gameWorld: {
        // Game world always starts after left column with 10px buffer
        bufferFromLeftColumn: 10,
        surface: {
            grassLineRatio: 0.60,  // 60% down screen - ground level
            mountainRatio: 0.20,   // 20% down screen - mountain peak  
            minerOffset: -15,       // 15px above grass (ON the ground)
            campOffset: -50        // 50px above grass (ON the ground)
        },
        underground: {
            bufferFromSurface: 60,  // 60px below grass line
            floorHeight: 70         // 70px per floor
        }
    }
};

// Responsive Left Column Layout Functions
function getLeftColumnWidth() {
    if (!game.canvas) return LAYOUT.leftColumn.minWidth; // Fallback during initialization
    
    // Calculate responsive width: 20% of screen width with constraints
    const responsiveWidth = game.canvas.width * LAYOUT.leftColumn.widthRatio;
    return Math.max(LAYOUT.leftColumn.minWidth, 
           Math.min(LAYOUT.leftColumn.maxWidth, responsiveWidth));
}

function getGameWorldStartX() {
    // Game world always starts after left column with buffer
    return getLeftColumnWidth() + LAYOUT.gameWorld.bufferFromLeftColumn;
}

function getGoldSectionY() {
    return 0; // Always at top
}

function getUpgradesSectionY() {
    // Position upgrades below gold section
    return getGoldSectionY() + LAYOUT.leftColumn.sections.gold.height;
}

function getGeneratorsSectionY() {
    // Position generators below upgrades section
    return getUpgradesSectionY() + LAYOUT.leftColumn.sections.upgrades.height;
}

function getGeneratorsSectionHeight() {
    const remainingHeight = game.canvas.height - getGeneratorsSectionY() - LAYOUT.leftColumn.sections.guild.height;
    return Math.floor(remainingHeight * LAYOUT.leftColumn.sections.generators.heightRatio);
}

function getGuildSectionY() {
    return game.canvas.height - LAYOUT.leftColumn.sections.guild.fromBottom;
}

function getGuildButtonY() {
    return getGuildSectionY() + 10; // 10px down from guild section start
}

function getUpgradesPanelY() {
    return getMinerY() - Math.floor(game.canvas.height * 0.12) - 10;
}

// Game World Positioning Functions (relative to right side)
function getSurfaceY() {
    return Math.floor(game.canvas.height * LAYOUT.gameWorld.surface.grassLineRatio);
}

function getMountainY() {
    return Math.floor(game.canvas.height * LAYOUT.gameWorld.surface.mountainRatio);
}

function getMinerY() {
    return getSurfaceY() + LAYOUT.gameWorld.surface.minerOffset;
}

function getCampY() {
    return getSurfaceY() + LAYOUT.gameWorld.surface.campOffset;
}

function getUndergroundStartY() {
    return getSurfaceY() + LAYOUT.gameWorld.underground.bufferFromSurface;
}

function getFloorHeight() {
    return LAYOUT.gameWorld.underground.floorHeight;
}

function getFloorY(floor) {
    if (floor <= 0) {
        return getMinerY(); // Surface level
    }
    // Underground floors
    return getUndergroundStartY() + (floor - 1) * getFloorHeight();
}

// Save System
const SaveSystem = {
    save() {
        try {
            game.lastSaveTime = Date.now();
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                gold: game.gold,
                clickValue: game.clickValue,
                totalPlaytime: game.totalPlaytime + (Date.now() - game.lastPlayTime),
                generators: game.generators.map(generator => ({
                    id: generator.id,
                    owned: generator.owned,
                    level: generator.level
                })),
                // Upgrades
                upgrades: {
                    economy: game.upgrades.economy.map(upgrade => ({
                        id: upgrade.id,
                        currentLevel: upgrade.currentLevel
                    })),
                    clicking: game.upgrades.clicking.map(upgrade => ({
                        id: upgrade.id,
                        currentLevel: upgrade.currentLevel
                    }))
                },
                // Multipliers
                minerEfficiencyMultiplier: game.minerEfficiencyMultiplier,
                globalProductionMultiplier: game.globalProductionMultiplier,
                autoClickRate: game.autoClickRate,
                // Camera state
                cameraY: game.camera.y,
                undergroundRevealed: game.camera.undergroundRevealed,
                // Combat system
                breachTriggered: game.breachTriggered,
                breachTime: game.breachTime,
                heroSpawnTimer: game.heroSpawnTimer,
                maxHeroes: game.maxHeroes,
                guildLevel: game.guildLevel,
                heroes: game.heroes.map(hero => ({
                    type: hero.type,
                    health: hero.health,
                    state: hero.state,
                    deathTimer: hero.deathTimer
                })),
                // Visual state
                miners: game.miners.length,
                miningCartActive: game.miningCart.active
            };
            
            localStorage.setItem('dungeonDelverSave', JSON.stringify(saveData));
            console.log('💾 Game saved successfully');
            this.showSaveNotification('Game Saved!');
            return true;
        } catch (error) {
            console.error('❌ Save failed:', error);
            this.showSaveNotification('Save Failed!', true);
            return false;
        }
    },
    
    load() {
        try {
            const saveString = localStorage.getItem('dungeonDelverSave');
            if (!saveString) {
                console.log('📁 No save data found, starting fresh');
                return null;
            }
            
            const saveData = JSON.parse(saveString);
            console.log('📂 Save data loaded:', saveData);
            
            // Calculate offline progress
            const offlineTime = Date.now() - saveData.timestamp;
            const offlineHours = offlineTime / (1000 * 60 * 60);
            
            if (offlineTime > 5000) { // Only show if offline > 5 seconds
                const offlineGold = this.calculateOfflineEarnings(saveData, offlineTime);
                saveData.offlineGold = offlineGold;
                saveData.offlineTime = offlineTime;
            }
            
            return saveData;
        } catch (error) {
            console.error('❌ Load failed:', error);
            this.showSaveNotification('Load Failed!', true);
            return null;
        }
    },
    
    calculateOfflineEarnings(saveData, offlineTime) {
        // Calculate what the player would have earned while offline
        let totalIncome = 0;
        
        saveData.generators.forEach(genData => {
            const generator = game.generators.find(g => g.id === genData.id);
            if (generator) {
                totalIncome += generator.baseIncome * genData.owned * genData.level;
            }
        });
        
        const offlineSeconds = offlineTime / 1000;
        const maxOfflineHours = 8; // Cap offline earnings at 8 hours
        const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
        
        return totalIncome * cappedSeconds;
    },
    
    applySaveData(saveData) {
        if (!saveData) return false;
        
        // Apply basic data
        game.gold = saveData.gold || 0;
        game.clickValue = saveData.clickValue || 1;
        game.totalPlaytime = saveData.totalPlaytime || 0;
        
        // Apply camera state
        game.camera.y = saveData.cameraY || 0;
        game.camera.targetY = game.camera.y;
        game.camera.undergroundRevealed = saveData.undergroundRevealed || false;
        
        // Restore combat state
        game.breachTriggered = saveData.breachTriggered || false;
        game.breachTime = saveData.breachTime || 0;
        game.heroSpawnTimer = saveData.heroSpawnTimer || 0;
        game.maxHeroes = saveData.maxHeroes || 1;
        game.guildLevel = saveData.guildLevel || 0;
        
        // Restore heroes
        game.heroes = [];
        if (saveData.heroes) {
            saveData.heroes.forEach(heroData => {
                // Use guild building position if available, otherwise fallback
                let spawnX, spawnY;
                if (game.guildBuildingArea) {
                    spawnX = game.guildBuildingArea.centerX;
                    spawnY = game.guildBuildingArea.y + game.guildBuildingArea.height;
                } else {
                    spawnX = game.canvas.width - 100; // Fallback: right edge
                    spawnY = game.canvas.height / 2;
                }
                const hero = new Hero(spawnX, spawnY, heroData.type);
                hero.health = heroData.health;
                hero.state = heroData.state;
                hero.deathTimer = heroData.deathTimer;
                game.heroes.push(hero);
            });
        }
        
        // Restart monster spawning if breach was active
        if (game.breachTriggered && !game.monsterSpawnTimer) {
            game.monsterSpawnTimer = setInterval(() => {
                if (game.breachTriggered) {
                    spawnMonster();
                }
            }, 5000); // Every 5 seconds
        }
        
        // Apply generator data
        saveData.generators.forEach(genData => {
            const generator = game.generators.find(g => g.id === genData.id);
            if (generator) {
                generator.owned = genData.owned || 0;
                generator.level = genData.level || 1;
            }
        });
        
        // Apply upgrade data
        if (saveData.upgrades) {
            saveData.upgrades.economy.forEach(upgradeData => {
                const upgrade = game.upgrades.economy.find(u => u.id === upgradeData.id);
                if (upgrade) {
                    upgrade.currentLevel = upgradeData.currentLevel || 0;
                }
            });
            
            saveData.upgrades.clicking.forEach(upgradeData => {
                const upgrade = game.upgrades.clicking.find(u => u.id === upgradeData.id);
                if (upgrade) {
                    upgrade.currentLevel = upgradeData.currentLevel || 0;
                }
            });
        }
        
        // Apply multipliers
        game.minerEfficiencyMultiplier = saveData.minerEfficiencyMultiplier || 1.0;
        game.globalProductionMultiplier = saveData.globalProductionMultiplier || 1.0;
        game.autoClickRate = saveData.autoClickRate || 0;
        
        // Update displays
        updateGoldDisplay();
        updateGPSDisplay();
        updateClickPowerDisplay();
        // Generators now handled by canvas UI
        // Upgrades now handled by canvas UI
        updateMiners();
        
        // Handle offline earnings
        if (saveData.offlineGold && saveData.offlineGold > 0) {
            game.gold += saveData.offlineGold;
            updateGoldDisplay();
            
            const offlineMinutes = Math.floor(saveData.offlineTime / (1000 * 60));
            this.showOfflineProgress(saveData.offlineGold, offlineMinutes);
        }
        
        console.log('✅ Save data applied successfully');
        return true;
    },
    
    showOfflineProgress(goldEarned, minutes) {
        // Create and show offline progress popup
        const popup = document.createElement('div');
        popup.id = 'offlinePopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #2C2C2C, #4A4A4A);
            border: 3px solid #FFD700;
            padding: 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            color: #F0F0F0;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            min-width: 300px;
        `;
        
        popup.innerHTML = `
            <div style="color: #FFD700; margin-bottom: 15px; font-size: 12px;">⏰ WELCOME BACK!</div>
            <div style="margin-bottom: 10px;">You were offline for:</div>
            <div style="color: #87CEEB; margin-bottom: 15px; font-size: 11px;">${minutes} minutes</div>
            <div style="margin-bottom: 10px;">Your miners earned:</div>
            <div style="color: #90EE90; margin-bottom: 20px; font-size: 14px;">💰 ${formatNumber(goldEarned)} gold</div>
            <button onclick="this.parentElement.remove()" style="
                background: #4A7C4A;
                border: 2px solid #90EE90;
                color: white;
                padding: 8px 16px;
                font-family: inherit;
                font-size: 8px;
                cursor: pointer;
            ">COLLECT</button>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    },
    
    showSaveNotification(message, isError = false) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isError ? '#8B0000' : '#2C5234'};
            color: white;
            padding: 8px 12px;
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
            border: 1px solid ${isError ? '#DC143C' : '#90EE90'};
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => notification.style.opacity = '1', 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },
    
    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('dungeonDelverSave');
            location.reload(); // Restart the game
        }
    },
    
    export() {
        const saveData = localStorage.getItem('dungeonDelverSave');
        if (saveData) {
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dungeon-delver-save.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showSaveNotification('Save Exported!');
        }
    },
    
    import(fileInput) {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    localStorage.setItem('dungeonDelverSave', JSON.stringify(saveData));
                    this.showSaveNotification('Save Imported! Reloading...');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    this.showSaveNotification('Invalid Save File!', true);
                }
            };
            reader.readAsText(file);
        }
    }
};

// Camera System Functions
function triggerUndergroundReveal() {
    if (game.camera.undergroundRevealed || game.camera.transitioning) return;
    
    console.log('🌋 Underground reveal triggered!');
    game.camera.undergroundRevealed = true;
    game.camera.transitioning = true;
    // Pan down to show both surface and start of underground
    game.camera.targetY = Math.floor(game.canvas.height * 0.18); // 18% down screen
    
    // Show dramatic message
    spawnFloatingText(game.canvas.width / 2, 300, 'UNDERGROUND REVEALED!', '#FFD700');
    addScreenShake(8);
    
    // Longer screen shake for drama
    game.screenShakeAmount = 6;
    game.screenShakeTime = 1000; // 1 second of shaking
}

function updateCamera(deltaTime) {
    if (!game.camera.transitioning) return;
    
    const dt = deltaTime / 1000;
    const diff = game.camera.targetY - game.camera.y;
    const oldCameraY = game.camera.y;
    
    if (Math.abs(diff) < 1) {
        // Close enough, snap to target
        game.camera.y = game.camera.targetY;
        game.camera.transitioning = false;
        console.log('📹 Camera transition complete');
    } else {
        // Smooth camera movement with easing
        game.camera.y += diff * game.camera.transitionSpeed * dt;
    }
    
    // Recreate floor buttons when camera position changes significantly
    if (Math.abs(game.camera.y - oldCameraY) > 0.1) {
        // createFloorControls(); // Removed - all controls now in left column
        createCanvasUI(); // Recreate the left column instead
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function scaledSize(baseSize) {
    return Math.floor(baseSize * (game.scaleFactor || 1.0));
}

function resizeCanvasToFullScreen() {
    // Set canvas size to match CSS dimensions exactly to prevent scaling issues
    const rect = game.canvas.getBoundingClientRect();
    game.canvas.width = rect.width;
    game.canvas.height = rect.height;

    // Also update canvas style to ensure it matches
    game.canvas.style.width = rect.width + 'px';
    game.canvas.style.height = rect.height + 'px';
    
    // Calculate scale factor based on screen size (baseline: 1400x900)
    const baseWidth = 1400;
    const baseHeight = 900;
    game.scaleFactor = Math.min(game.canvas.width / baseWidth, game.canvas.height / baseHeight);
    game.scaleFactor = Math.max(1.0, game.scaleFactor); // Minimum scale of 1x
    
    console.log(`📺 Canvas resized to full screen: ${game.canvas.width}x${game.canvas.height} (scale: ${game.scaleFactor.toFixed(2)}x)`);
    console.log(`📏 Responsive layout: Left column ${getLeftColumnWidth()}px, Game world starts at ${getGameWorldStartX()}px`);

    // Update mountain area position and size (centered in game world area after left column)
    const gameWorldWidth = game.canvas.width - getLeftColumnWidth();
    game.mountainArea.x = getGameWorldStartX() + (gameWorldWidth - 360 * game.scaleFactor) / 2;
    game.mountainArea.y = getMountainY(); // Dynamic Y position
    game.mountainArea.width = 360 * game.scaleFactor;
    game.mountainArea.height = 250 * game.scaleFactor;

    // Recreate UI components if they exist (to fix click detection after resize)
    // Only recreate if already initialized to avoid duplicate creation during startup
    if (game.uiManager && game.initialized && game.upgrades) {
        console.log('🔄 Recreating UI components after resize...');
        createCanvasUI();
    }
}

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
    
    // Set canvas to full screen size
    resizeCanvasToFullScreen();
    
    // Set up canvas properties
    game.ctx.imageSmoothingEnabled = false; // Pixel art style
    
    // Initialize Canvas UI Manager
    game.uiManager = new CanvasUIManager(game.canvas, game.ctx);
    console.log('🎨 Canvas UI Manager initialized');
    
    // Add event listeners
    setupEventListeners();
    
    // Add window resize listener for full screen support
    window.addEventListener('resize', resizeCanvasToFullScreen);
    
    // Initialize generators
    initializeGenerators();
    
    // Initialize upgrades
    initializeUpgrades();
    
    // Load saved game data
    const saveData = SaveSystem.load();
    SaveSystem.applySaveData(saveData);
    
    // Initialize UI elements
    initializeUI();
    
    // Create canvas UI components
    createCanvasUI();
    
    // Draw initial test content
    drawTestContent();
    
    // Initialize last save time
    game.lastSaveTime = Date.now();
    
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
    // Canvas events now handled by UI manager
    console.log('🖱️ Canvas events handled by UI Manager');
    
    // Guild button
    const guildButton = document.getElementById('guildButton');
    guildButton.addEventListener('click', handleGuildClick);
    
    // Settings button
    const settingsButton = document.getElementById('settingsButton');
    settingsButton.addEventListener('click', openSettingsModal);
    
    // Sky panel toggle
    const skyToggle = document.getElementById('skyPanelToggle');
    const skyPanel = document.getElementById('skyUpgradesPanel');
    skyToggle.addEventListener('click', () => {
        skyPanel.classList.toggle('collapsed');
        skyToggle.textContent = skyPanel.classList.contains('collapsed') ? '+' : '−';
    });
    
    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    closeModal.addEventListener('click', closeGuildModal);
    
    const closeSettings = document.getElementById('closeSettings');
    closeSettings.addEventListener('click', closeSettingsModal);
    
    // Modal overlay clicks to close
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.addEventListener('click', closeGuildModal);
    
    const settingsOverlay = document.getElementById('settingsOverlay');
    settingsOverlay.addEventListener('click', closeSettingsModal);
    
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
    
    // Create first underground generator (Floor 1)
    const drillOperator = new Generator(
        'drill_operator',
        'Drill Operator',
        100, // base cost
        5,   // base income per second
        'Deep drilling specialists who extract ore from Floor 1',
        1    // Floor 1 underground
    );
    
    // Create Floor 2 generator
    const blastEngineer = new Generator(
        'blast_engineer',
        'Blast Engineer',
        1000, // base cost
        25,   // base income per second
        'Explosive experts who blast through tough rock on Floor 2',
        2     // Floor 2 underground
    );
    
    // Create Floor 3 generator
    const crystalHarvester = new Generator(
        'crystal_harvester',
        'Crystal Harvester',
        10000, // base cost
        150,   // base income per second
        'Elite miners who harvest precious crystals from Floor 3',
        3      // Floor 3 underground
    );
    
    // Create Floor 4 generator (initially disabled until boss is defeated)
    const shadowMiner = new Generator(
        'shadow_miner',
        'Shadow Miner',
        50000, // base cost (higher due to danger)
        300,   // base income per second
        'Brave miners who work the secured Floor 4 shadows',
        4      // Floor 4 underground
    );
    shadowMiner.enabled = false; // Disabled until boss is defeated
    
    game.generators.push(surfaceMiner);
    game.generators.push(drillOperator);
    game.generators.push(blastEngineer);
    game.generators.push(crystalHarvester);
    game.generators.push(shadowMiner);
    
    console.log('⚒️ Generators initialized');
}

// Initialize upgrades
function initializeUpgrades() {
    // Economy Upgrades
    const minerEfficiency = new Upgrade(
        'miner_efficiency',
        'Miner Efficiency',
        '+10% production from Surface Miners',
        1000, // base cost
        10,   // max level
        () => {
            game.minerEfficiencyMultiplier += 0.1;
            console.log(`🔧 Miner efficiency now ${(game.minerEfficiencyMultiplier * 100).toFixed(0)}%`);
        },
        'economy'
    );
    
    const globalProduction = new Upgrade(
        'global_production',
        'Global Production',
        '+5% production from all generators',
        5000, // base cost
        20,   // max level
        () => {
            game.globalProductionMultiplier += 0.05;
            console.log(`📈 Global production now ${(game.globalProductionMultiplier * 100).toFixed(0)}%`);
        },
        'economy'
    );
    
    // Click Upgrades
    const clickPower = new Upgrade(
        'click_power',
        'Click Power',
        'Double click value',
        500, // base cost
        10,  // max level
        () => {
            game.clickValue *= 2;
            updateClickPowerDisplay();
            console.log(`👆 Click power now ${formatNumber(game.clickValue)}`);
        },
        'clicking'
    );
    
    const autoClicker = new Upgrade(
        'auto_clicker',
        'Auto-Clicker',
        '+1 automatic click per second',
        10000, // base cost
        5,     // max level
        () => {
            game.autoClickRate += 1;
            console.log(`🤖 Auto-clicker now ${game.autoClickRate}/sec`);
        },
        'clicking'
    );
    
    // Add upgrades to game arrays
    game.upgrades.economy.push(minerEfficiency);
    game.upgrades.economy.push(globalProduction);
    game.upgrades.clicking.push(clickPower);
    game.upgrades.clicking.push(autoClicker);
    
    console.log('⚡ Upgrades initialized');
}

// Initialize UI elements
function initializeUI() {
    updateGoldDisplay();
    // Upgrades now handled by canvas UI
    updateGPSDisplay();
    updateClickPowerDisplay();
    // Generators now handled by canvas UI
}

// Create canvas-based UI components
function createCanvasUI() {
    if (!game.uiManager) {
        console.error('UI Manager not initialized!');
        return;
    }

    console.log('🎨 Creating unified left column UI');
    console.log(`🔍 Layout debug: Canvas ${game.canvas.width}x${game.canvas.height}, Left column width: ${getLeftColumnWidth()}px`);
    console.log(`🔍 Section positions: Gold=${getGoldSectionY()}, Generators=${getGeneratorsSectionY()}, Upgrades=${getUpgradesSectionY()}, Guild=${getGuildSectionY()}`);

    // Clear existing components to avoid duplicates
    game.uiManager.components = [];

    // Create the unified left column (replaces top bar, upgrades panel, guild button)
    createLeftColumn();

    console.log('✅ Left Column UI created successfully');
}

function createLeftColumn() {
    // Main left column background
    const leftColumn = new UIComponent(0, 0, getLeftColumnWidth(), game.canvas.height);
    leftColumn.render = function(ctx) {
        // Column background
        ctx.fillStyle = 'rgba(44, 44, 44, 0.95)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Column border
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.width, this.height);
    };
    
    game.uiManager.addComponent(leftColumn);
    
    // Create individual sections
    createGoldSection();
    createUpgradesSection();
    createGeneratorsSection();  
    createGuildSection();
}

function createGoldSection() {
    const goldSection = new UIComponent(0, getGoldSectionY(), getLeftColumnWidth(), LAYOUT.leftColumn.sections.gold.height);
    
    goldSection.handleClick = function(x, y) {
        // Check if click is on settings button
        const settingsIconX = this.width - 15; // Actual icon position
        const settingsIconY = 25; // Actual icon position (relative to section)
        const settingsX = settingsIconX - 15; // Generous clickable area
        const settingsY = settingsIconY - 15; // Generous clickable area
        const settingsSize = 30; // Larger clickable area
        
        const relativeX = x - this.x; // Convert to relative coordinates
        const relativeY = y - this.y; // Convert to relative coordinates
        
        if (relativeX >= settingsX && relativeX <= settingsX + settingsSize &&
            relativeY >= settingsY && relativeY <= settingsY + settingsSize) {
            openSettingsModal();
            return true; // Click was handled
        }
        
        return false; // Click not handled
    };
    
    goldSection.render = function(ctx) {
        // Section background
        ctx.fillStyle = 'rgba(34, 34, 34, 0.8)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Section border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Gold amount
        ctx.fillStyle = '#FFD700';
        ctx.font = `${scaledSize(18)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`💰 ${formatNumber(game.gold)}`, 15, this.y + 25);
        
        // GPS
        ctx.fillStyle = '#90EE90';
        ctx.font = `${scaledSize(14)}px Arial`;
        ctx.fillText(`📈 ${formatNumber(game.goldPerSecond)}/s`, 15, this.y + 45);
        
        // Click power
        ctx.fillStyle = '#87CEEB';
        ctx.fillText(`👆 +${formatNumber(game.clickValue)}`, 15, this.y + 65);
        
        // Settings icon (top right corner)
        ctx.fillStyle = '#CCCCCC';
        ctx.font = `${scaledSize(16)}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText('⚙️', this.width - 15, this.y + 25);
    };
    
    game.uiManager.addComponent(goldSection);
}

function createGeneratorsSection() {
    // Generators section within left column
    const generatorsSection = new UIComponent(0, getGeneratorsSectionY(), getLeftColumnWidth(), getGeneratorsSectionHeight());
    generatorsSection.render = function(ctx) {
        // Section background
        ctx.fillStyle = 'rgba(34, 34, 34, 0.8)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Section border
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#8B7355';
        ctx.font = `${scaledSize(14)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏭 GENERATORS', this.x + 15, this.y + 15);
    };
    
    game.uiManager.addComponent(generatorsSection);
    
    // Add generator buttons
    createGeneratorButtons(generatorsSection);
}

function createGuildSection() {
    // Guild section within left column
    const guildSection = new UIComponent(0, getGuildSectionY(), getLeftColumnWidth(), LAYOUT.leftColumn.sections.guild.height);
    guildSection.render = function(ctx) {
        // Section background
        ctx.fillStyle = 'rgba(34, 34, 34, 0.8)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Section border
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#4169E1';
        ctx.font = `${scaledSize(14)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏰 GUILD', this.x + 15, this.y + 15);
        
        // Guild status
        ctx.fillStyle = '#F0F0F0';
        ctx.font = `${scaledSize(12)}px Arial`;
        ctx.fillText(`Heroes: ${game.heroes.length}/${game.maxHeroes}`, this.x + 15, this.y + 35);
        ctx.fillText(`Combat Status: ${game.breachTriggered ? 'ACTIVE' : 'READY'}`, this.x + 15, this.y + 50);
    };
    
    game.uiManager.addComponent(guildSection);
}

function createUpgradesSection() {
    // Upgrades section within left column  
    const upgradesSection = new UIComponent(0, getUpgradesSectionY(), getLeftColumnWidth(), LAYOUT.leftColumn.sections.upgrades.height);
    upgradesSection.render = function(ctx) {
        // Section background
        ctx.fillStyle = 'rgba(34, 34, 34, 0.8)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Section border
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#9370DB';
        ctx.font = `${scaledSize(14)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎 UPGRADES', this.x + 15, this.y + 15);
    };
    
    game.uiManager.addComponent(upgradesSection);
    
    // Add upgrade buttons (simplified for now - can expand later)
    createUpgradeButtons(upgradesSection);
}

function createUpgradeButtons(parentSection) {
    // Create compact upgrade icon buttons within the upgrades section
    const squareSize = 35;
    const buttonSpacing = 5;
    const startX = 15;
    const startY = parentSection.y + 30;
    
    // Get upgrade icons
    const upgradeIcons = {
        'miner_efficiency': '⛏️',
        'global_production': '📈', 
        'click_power': '👆',
        'auto_clicker': '🤖'
    };
    
    let currentX = startX;
    let currentY = startY;
    const maxPerRow = 6;
    let currentCount = 0;
    
    // Economy upgrades
    game.upgrades.economy.forEach((upgrade, index) => {
        const icon = upgradeIcons[upgrade.id] || '🔧';

        // Debug first button position
        if (index === 0) {
            console.log(`🔍 First button debug: currentX=${currentX}, currentY=${currentY}, squareSize=${squareSize}`);
        }

        const button = new UIButton(
            currentX, currentY,
            squareSize, squareSize,
            icon,
            () => {
                if (upgrade.purchase()) {
                    console.log(`Purchased ${upgrade.name} level ${upgrade.currentLevel}`);
                }
            },
            {
                fontSize: 16,
                backgroundColor: upgrade.canAfford(game.gold) ? '#4A4A4A' : '#2A2A2A',
                borderColor: upgrade.isMaxed() ? '#32CD32' : (upgrade.canAfford(game.gold) ? '#FFD700' : '#666666'),
                textColor: upgrade.canAfford(game.gold) ? '#F0F0F0' : '#888888'
            }
        );
        
        button.tooltipText = getUpgradeButtonText(upgrade);
        button.enabled = upgrade.canAfford(game.gold) && !upgrade.isMaxed();
        
        game.uiManager.addComponent(button);
        upgrade.canvasButton = button;
        
        currentCount++;
        currentX += squareSize + buttonSpacing;
        
        if (currentCount >= maxPerRow) {
            currentCount = 0;
            currentX = startX;
            currentY += squareSize + buttonSpacing;
        }
    });
    
    // Click upgrades continue in same grid
    game.upgrades.clicking.forEach((upgrade, index) => {
        const icon = upgradeIcons[upgrade.id] || '🎯';
        
        const button = new UIButton(
            currentX, currentY,
            squareSize, squareSize,
            icon,
            () => {
                if (upgrade.purchase()) {
                    console.log(`Purchased ${upgrade.name} level ${upgrade.currentLevel}`);
                }
            },
            {
                fontSize: 16,
                backgroundColor: upgrade.canAfford(game.gold) ? '#4A4A4A' : '#2A2A2A',
                borderColor: upgrade.isMaxed() ? '#32CD32' : (upgrade.canAfford(game.gold) ? '#FFD700' : '#666666'),
                textColor: upgrade.canAfford(game.gold) ? '#F0F0F0' : '#888888'
            }
        );
        
        button.tooltipText = getUpgradeButtonText(upgrade);
        button.enabled = upgrade.canAfford(game.gold) && !upgrade.isMaxed();
        
        game.uiManager.addComponent(button);
        upgrade.canvasButton = button;
        
        currentCount++;
        currentX += squareSize + buttonSpacing;
        
        if (currentCount >= maxPerRow) {
            currentCount = 0;
            currentX = startX;
            currentY += squareSize + buttonSpacing;
        }
    });
}

// Determine if a generator is available based on gold progression
function isGeneratorAvailable(generator) {
    switch(generator.id) {
        case 'surface_miner':
            return true; // Always available
        case 'drill_operator':
            return game.gold >= 100 || generator.owned > 0; // Available when player reaches 100 gold
        case 'blast_engineer':
            return game.gold >= 1000 || generator.owned > 0; // Available when player reaches 1K gold
        case 'crystal_harvester':
            return game.gold >= 10000 || generator.owned > 0; // Available when player reaches 10K gold
        case 'shadow_miner':
            return generator.enabled && (game.gold >= 50000 || generator.owned > 0); // Available when enabled and 50K gold
        default:
            return true;
    }
}

function createGeneratorButtons(parentSection) {
    // COOKIE CLICKER APPROACH: Create ALL generator buttons upfront, control visibility
    const buttonWidth = getLeftColumnWidth() - 20; // 10px padding on each side
    const buttonHeight = 50;
    const buttonSpacing = 5;
    let yOffset = 25; // Below section title

    // Create buttons for ALL generators (not just available ones)
    game.generators.forEach((generator, index) => {
        const button = new UIButton(
            10, parentSection.y + yOffset,
            buttonWidth, buttonHeight,
            getGeneratorButtonText(generator),
            () => {
                if (generator.purchase(game)) {
                    console.log(`Purchased ${generator.name}! Now own ${generator.owned}`);
                }
            },
            {
                fontSize: 12,
                backgroundColor: '#2C2C2C',
                borderColor: '#666666',
                textColor: '#888888',
                hoverBgColor: '#4A4A4A',
                hoverBorderColor: '#8B7355'
            }
        );

        // Set initial state based on availability
        const isAvailable = isGeneratorAvailable(generator);
        button.visible = isAvailable;
        button.enabled = isAvailable && generator.canAfford(game.gold);

        game.uiManager.addComponent(button);
        generator.canvasButton = button;

        yOffset += buttonHeight + buttonSpacing;
    });
}

function createUpgradesPanel() {
    // Compact upgrades panel (left side, above surface miners) - Dynamic positioning
    const panelWidth = 280;
    const panelHeight = Math.floor(game.canvas.height * 0.12); // 12% of screen height
    const upgradesPanel = new UIComponent(
        10, getUpgradesPanelY(),
        panelWidth, panelHeight
    );
    
    upgradesPanel.render = function(ctx) {
        // Panel background
        ctx.fillStyle = 'rgba(44, 44, 44, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Panel border
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Header background
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(this.x, this.y, this.width, 30);
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = `${scaledSize(14)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎 UPGRADES', this.x + 12, this.y + 15);
    };
    
    game.uiManager.addComponent(upgradesPanel);
    
    // Add upgrade buttons
    createUpgradeButtons(upgradesPanel);
}

function createUpgradeButtons(parentPanel) {
    const squareSize = 45; // Square button size
    const buttonSpacing = 5;
    const startX = parentPanel.x + 10;
    const startY = parentPanel.y + 30; // Below header
    
    // Get upgrade icons
    const upgradeIcons = {
        'miner_efficiency': '⛏️',
        'global_production': '📈', 
        'click_power': '👆',
        'auto_clicker': '🤖'
    };
    
    let currentX = startX;
    let currentY = startY;
    const maxPerRow = 5; // 5 icons per row
    let currentCount = 0;
    
    // Economy upgrades first row
    game.upgrades.economy.forEach((upgrade, index) => {
        const icon = upgradeIcons[upgrade.id] || '🔧';
        
        const button = new UIButton(
            currentX, currentY,
            squareSize, squareSize,
            icon,
            () => {
                if (upgrade.purchase()) {
                    console.log(`Purchased ${upgrade.name} level ${upgrade.currentLevel}`);
                }
            },
            {
                fontSize: 20, // Large icon
                backgroundColor: upgrade.canAfford(game.gold) ? '#4A4A4A' : '#2A2A2A',
                borderColor: upgrade.isMaxed() ? '#32CD32' : (upgrade.canAfford(game.gold) ? '#FFD700' : '#666666'),
                textColor: upgrade.canAfford(game.gold) ? '#F0F0F0' : '#888888',
                hoverBgColor: '#6A6A6A',
                hoverBorderColor: '#FFD700'
            }
        );
        
        // Add tooltip data to button
        button.tooltipText = getUpgradeButtonText(upgrade);
        button.enabled = upgrade.canAfford(game.gold) && !upgrade.isMaxed();
        
        game.uiManager.addComponent(button);
        upgrade.canvasButton = button;
        
        currentCount++;
        currentX += squareSize + buttonSpacing;
        
        // Move to next row if needed
        if (currentCount >= maxPerRow) {
            currentCount = 0;
            currentX = startX;
            currentY += squareSize + buttonSpacing;
        }
    });
    
    // Click upgrades continue in same grid
    game.upgrades.clicking.forEach((upgrade, index) => {
        const icon = upgradeIcons[upgrade.id] || '🎯';
        
        const button = new UIButton(
            currentX, currentY,
            squareSize, squareSize,
            icon,
            () => {
                if (upgrade.purchase()) {
                    console.log(`Purchased ${upgrade.name} level ${upgrade.currentLevel}`);
                }
            },
            {
                fontSize: 20, // Large icon
                backgroundColor: upgrade.canAfford(game.gold) ? '#4A4A4A' : '#2A2A2A',
                borderColor: upgrade.isMaxed() ? '#32CD32' : (upgrade.canAfford(game.gold) ? '#FFD700' : '#666666'),
                textColor: upgrade.canAfford(game.gold) ? '#F0F0F0' : '#888888',
                hoverBgColor: '#6A6A6A',
                hoverBorderColor: '#FFD700'
            }
        );
        
        // Add tooltip data to button
        button.tooltipText = getUpgradeButtonText(upgrade);
        button.enabled = upgrade.canAfford(game.gold) && !upgrade.isMaxed();
        
        game.uiManager.addComponent(button);
        upgrade.canvasButton = button;
        
        currentCount++;
        currentX += squareSize + buttonSpacing;
        
        // Move to next row if needed
        if (currentCount >= maxPerRow) {
            currentCount = 0;
            currentX = startX;
            currentY += squareSize + buttonSpacing;
        }
    });
}

function getUpgradeButtonText(upgrade) {
    const isMaxed = upgrade.isMaxed();
    const cost = isMaxed ? 'MAX' : formatNumber(upgrade.getCost());
    return `${upgrade.name} (${upgrade.currentLevel}/${upgrade.maxLevel})\n${upgrade.description}\nCost: ${cost}`;
}

function updateAllUpgradeButtons() {
    // Update economy upgrades
    game.upgrades.economy.forEach(upgrade => {
        if (upgrade.canvasButton) {
            const canAfford = upgrade.canAfford(game.gold);
            const isMaxed = upgrade.isMaxed();
            
            // Update tooltip text but keep the icon as button text
            upgrade.canvasButton.tooltipText = getUpgradeButtonText(upgrade);
            upgrade.canvasButton.enabled = canAfford && !isMaxed;
            
            const style = upgrade.canvasButton.style;
            style.backgroundColor = canAfford && !isMaxed ? '#4A4A4A' : '#2A2A2A';
            style.borderColor = canAfford && !isMaxed ? '#FFD700' : '#666666';
            style.textColor = canAfford && !isMaxed ? '#F0F0F0' : '#888888';
        }
    });
    
    // Update clicking upgrades
    game.upgrades.clicking.forEach(upgrade => {
        if (upgrade.canvasButton) {
            const canAfford = upgrade.canAfford(game.gold);
            const isMaxed = upgrade.isMaxed();
            
            // Update tooltip text but keep the icon as button text
            upgrade.canvasButton.tooltipText = getUpgradeButtonText(upgrade);
            upgrade.canvasButton.enabled = canAfford && !isMaxed;
            
            const style = upgrade.canvasButton.style;
            style.backgroundColor = canAfford && !isMaxed ? '#4A4A4A' : '#2A2A2A';
            style.borderColor = canAfford && !isMaxed ? '#FFD700' : '#666666';
            style.textColor = canAfford && !isMaxed ? '#F0F0F0' : '#888888';
        }
    });
}

function createGuildButton() {
    // Guild button (centered in left column)
    const buttonWidth = 120;
    const buttonHeight = 60;
    const leftColumnWidth = getLeftColumnWidth();
    const guildButton = new UIButton(
        (leftColumnWidth - buttonWidth) / 2, // Center in left column, not full canvas
        getGuildButtonY(),
        buttonWidth, buttonHeight,
        '🏰 GUILD\nNeed 5,000g',
        () => handleGuildClick(),
        {
            fontSize: 16,
            backgroundColor: '#696969',
            borderColor: '#4A4A4A',
            textColor: '#F0F0F0',
            hoverBgColor: '#8B7355',
            hoverBorderColor: '#FFD700',
            disabledBgColor: '#5A4A3A',
            disabledTextColor: '#888888'
        }
    );
    
    // Always keep button enabled so it can be clicked to open modal
    // The modal will handle the purchase logic based on gold amount
    guildButton.enabled = true;
    
    // Update button text based on gold amount
    if (game.gold >= 5000) {
        guildButton.text = '🏰 GUILD\nReady to build!';
        guildButton.style.backgroundColor = '#4A7C4A'; // Green when affordable
    } else {
        guildButton.text = `🏰 GUILD\nNeed ${formatNumber(5000 - game.gold)} more`;
        guildButton.style.backgroundColor = '#696969'; // Gray when not affordable
    }
    
    game.uiManager.addComponent(guildButton);
    game.guildCanvasButton = guildButton;
}

function createFloorControls() {
    // Create seamlessly integrated floor control buttons
    console.log('🏭 Creating floor control buttons...');
    
    // Clear existing generator buttons first to avoid duplicates
    game.generators.forEach(generator => {
        if (generator.canvasButton && game.uiManager) {
            game.uiManager.removeComponent(generator.canvasButton);
            generator.canvasButton = null;
        }
    });
    
    // Surface miner button (dynamic positioning based on screen height)
    const surfaceGenerator = game.generators.find(g => g.id === 'surface_miner');
    if (surfaceGenerator) {
        const surfaceButtonY = getUpgradesPanelY() + Math.floor(game.canvas.height * 0.12) + 10; // Below upgrades panel
        const screenY = surfaceButtonY - game.camera.y;
        createGeneratorButton(surfaceGenerator, screenY, '#FFD700');
    }
    
    // Underground generator buttons (dynamic positioning)
    const undergroundStart = getUndergroundStartY();
    const floorHeight = getFloorHeight();
    
    const undergroundGenerators = game.generators.filter(g => g.floor > 0);
    undergroundGenerators.forEach((generator, index) => {
        const worldY = undergroundStart + (generator.floor - 1) * floorHeight + 10;
        const screenY = worldY - game.camera.y; // Convert world Y to screen Y
        const borderColors = {
            'drill_operator': '#8B4513',
            'blast_engineer': '#FF4500', 
            'crystal_harvester': '#9370DB'
        };
        
        createGeneratorButton(generator, screenY, borderColors[generator.id] || '#4A4A4A');
    });
}

function createGeneratorButton(generator, yPosition, borderColor) {
    const button = new UIButton(
        10, yPosition, scaledSize(180), scaledSize(60),
        getGeneratorButtonText(generator),
        () => {
            if (generator.purchase(game)) {
                // Canvas UI updates automatically
                console.log(`Purchased ${generator.name}! Now own ${generator.owned}`);
            }
        },
        {
            fontSize: 14,
            backgroundColor: generator.canAfford(game.gold) ? '#2C2C2C' : '#1A1A1A',
            borderColor: generator.canAfford(game.gold) ? borderColor : '#666666',
            textColor: generator.canAfford(game.gold) ? '#F0F0F0' : '#888888',
            hoverBgColor: '#4A4A4A',
            hoverBorderColor: borderColor
        }
    );
    
    button.enabled = generator.canAfford(game.gold);
    game.uiManager.addComponent(button);
    generator.canvasButton = button;
}

function getGeneratorButtonText(generator) {
    const cost = formatNumber(generator.getCost());
    const income = formatNumber(generator.getIncome());
    const generatorNames = {
        'surface_miner': '⛏️ Surface Miners',
        'drill_operator': '🔧 Drill Operators',
        'blast_engineer': '💥 Blast Engineers',
        'crystal_harvester': '💎 Crystal Harvesters'
    };
    
    const displayName = generatorNames[generator.id] || generator.name;
    return `${displayName} (${generator.owned})\nIncome: ${income}/s\nCost: ${cost}g`;
}

function updateAllGeneratorButtons() {
    // COOKIE CLICKER APPROACH: Update button states, not structure
    game.generators.forEach(generator => {
        if (generator.canvasButton) {
            const isAvailable = isGeneratorAvailable(generator);
            const canAfford = generator.canAfford(game.gold);

            // Update visibility (key improvement - newly available generators become visible)
            generator.canvasButton.visible = isAvailable;

            // Update interactivity and appearance
            generator.canvasButton.enabled = isAvailable && canAfford;
            generator.canvasButton.setText(getGeneratorButtonText(generator));

            const style = generator.canvasButton.style;
            style.backgroundColor = canAfford ? '#2C2C2C' : '#1A1A1A';
            style.borderColor = canAfford ? '#8B7355' : '#666666';
            style.textColor = canAfford ? '#F0F0F0' : '#888888';
        }
    });
}

// REMOVED: Old auto-refresh system that caused lockups
// Now using Cookie Clicker approach - all buttons created upfront, only state updates during gameplay

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
    
    // Store mouse position for hover effects
    game.mouseX = mouseX;
    game.mouseY = mouseY;
    
    // Check if mouse is over mountain
    if (isPointInMountain(mouseX, mouseY)) {
        game.canvas.style.cursor = 'pointer';
        return;
    }
    
    // Floor clicking removed - using sidebar instead
    
    // Default cursor
    game.canvas.style.cursor = 'default';
    game.hoveredFloor = null;
}

// Handle canvas clicks (this function is no longer used - keeping for reference)
function handleCanvasClick(event) {
    // This function is not called anymore - click handling moved to handleGameClick
    console.log('⚠️ handleCanvasClick called - this should not happen!');
}

// Handle game clicks (mountain clicking, etc.) - called by UI manager if no UI element handled the click
function handleGameClick(clickX, clickY) {
    
    // Check if click is on guild building (if it exists)
    if (game.guildBuildingArea && isPointInRectangle(clickX, clickY, game.guildBuildingArea)) {
        openGuildModal();
        return;
    }
    
    // Check if click is on mountain
    if (isPointInMountain(clickX, clickY)) {
        console.log(`⛰️ Mountain clicked! Screen(${clickX},${clickY}) -> World(${clickX},${clickY + game.camera.y}) | Camera: ${game.camera.y}`);
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
        
        console.log(`Mountain clicked! Streak: ${game.clickStreak}, Gold: ${formatNumber(game.gold)}`);
        return;
    }
    
    // Check if click is on a floor area (convert click to world coordinates)
    const worldY = clickY + game.camera.y; // Convert screen Y to world Y
    for (const floorArea of game.floorAreas) {
        if (clickX >= floorArea.x && clickX <= floorArea.x + floorArea.width &&
            worldY >= floorArea.y && worldY <= floorArea.y + floorArea.height) {
            handleFloorClick(floorArea);
            return;
        }
    }
}

// Handle floor click for generator purchasing
function handleFloorClick(floorArea) {
    const generator = floorArea.generator;
    
    if (generator.owned > 0) {
        // Already owned - just show info
        spawnFloatingText(floorArea.x + floorArea.width/2, floorArea.y - game.camera.y + 20, 
                         `${generator.name} Active!`, '#90EE90');
        return;
    }
    
    if (generator.canAfford(game.gold)) {
        // Purchase the generator
        if (generator.purchase(game)) {
            // Success! Show purchase effects
            addScreenShake(5);
            spawnFloatingText(floorArea.x + floorArea.width/2, floorArea.y - game.camera.y + 20, 
                             `${generator.name} Built!`, '#90EE90');
            spawnParticles(floorArea.x + floorArea.width/2, floorArea.y - game.camera.y + floorArea.height/2, 
                          10, '#90EE90');
            console.log(`🏗️ Built ${generator.name} on Floor ${floorArea.floor}!`);
        }
    } else {
        // Can't afford - show what's needed
        const needed = generator.getCost() - game.gold;
        spawnFloatingText(floorArea.x + floorArea.width/2, floorArea.y - game.camera.y + 20, 
                         `Need ${formatNumber(needed)} more!`, '#FF6B6B');
        addScreenShake(1);
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
    console.log('🏰 Guild button clicked! Gold:', game.gold);
    openGuildModal(); // Always open modal - it handles purchase logic internally
}

// Open guild modal
function openGuildModal() {
    const modalContainer = document.getElementById('modalContainer');
    const guildContent = document.getElementById('guildContent');
    
    // Populate modal content based on guild status
    if (game.guildLevel === 0) {
        // Guild not yet purchased - show purchase interface
        guildContent.innerHTML = `
            <div class="guild-purchase">
                <h3>🏰 Establish Adventurer's Guild</h3>
                <p>Build a guild hall to recruit heroes who will fight through the dungeons and battle bosses to unlock new generators!</p>
                
                <div class="guild-stats">
                    <div class="stat-row">
                        <span class="stat-label">Cost:</span>
                        <span class="stat-value gold-cost">5,000 Gold</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Unlocks:</span>
                        <span class="stat-value">Hero spawning, Combat system</span>
                    </div>
                </div>
                
                <div class="guild-purchase-buttons">
                    ${game.gold >= 5000 
                        ? `<button id="purchaseGuild" class="guild-button purchase-btn">🏰 Build Guild (5,000g)</button>`
                        : `<button class="guild-button purchase-btn disabled">🏰 Need 5,000 Gold (Have: ${formatNumber(game.gold)})</button>`
                    }
                </div>
            </div>
        `;
        
        // Add purchase button event listener if player can afford it
        if (game.gold >= 5000) {
            const purchaseBtn = document.getElementById('purchaseGuild');
            purchaseBtn.addEventListener('click', purchaseGuild);
        }
        
    } else {
        // Guild already purchased - show guild management interface
        guildContent.innerHTML = `
            <div class="guild-management">
                <h3>🏰 Guild Management (Level ${game.guildLevel})</h3>
                <p>Your guild is operational! Heroes spawn every ${game.heroSpawnRate} seconds.</p>
                
                <div class="guild-stats">
                    <div class="stat-row">
                        <span class="stat-label">Active Heroes:</span>
                        <span class="stat-value">${game.heroes.length}/${game.maxHeroes}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Total Kills:</span>
                        <span class="stat-value">${game.totalKills || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Bosses Defeated:</span>
                        <span class="stat-value">${game.bossesKilled || 0}</span>
                    </div>
                </div>
                
                <div class="guild-info">
                    <p><em>Advanced guild features coming in future updates...</em></p>
                </div>
            </div>
        `;
    }
    
    modalContainer.classList.remove('hidden');
    game.paused = true;
}

// Purchase guild function
function purchaseGuild() {
    if (game.gold >= 5000 && game.guildLevel === 0) {
        // Deduct gold and set guild level
        game.gold -= 5000;
        game.guildLevel = 1;
        
        // Initialize guild stats if not already set
        if (!game.totalKills) game.totalKills = 0;
        if (!game.bossesKilled) game.bossesKilled = 0;
        
        // Visual feedback
        console.log('🏰 Guild purchased! Building constructed on surface.');
        
        // Update guild button text to show it's now purchased
        if (game.guildCanvasButton) {
            game.guildCanvasButton.text = '🏰 GUILD\nManage';
            game.guildCanvasButton.enabled = true;
        }
        
        // Refresh modal content to show management interface
        closeGuildModal();
        setTimeout(() => openGuildModal(), 100); // Brief delay to show the change
        
        // Auto-save the purchase
        SaveSystem.save();
        
        console.log('✅ Guild established! Heroes will now spawn to fight monsters.');
    }
}

// Close guild modal
function closeGuildModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.classList.add('hidden');
    game.paused = false;
}

// Open settings modal
function openSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.classList.remove('hidden');
    game.paused = true;
}

// Close settings modal
function closeSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.classList.add('hidden');
    game.paused = false;
}

// Update UI displays
function updateGoldDisplay() {
    // Gold display now handled by canvas UI only
    
    // Guild button now handled by canvas UI only
    
    // Update canvas guild button
    if (game.guildCanvasButton) {
        if (game.gold >= 5000) {
            game.guildCanvasButton.enabled = true;
            if (game.breachTriggered) {
                game.guildCanvasButton.setText('⚔️ GUILD\n🚨 URGENT! 🚨');
                // Make button flash red when monsters are active
                const flash = Math.sin(Date.now() / 200) > 0;
                game.guildCanvasButton.style.borderColor = flash ? '#DC143C' : '#FFD700';
            } else {
                game.guildCanvasButton.setText('🏰 GUILD\nClick to Build');
                game.guildCanvasButton.style.borderColor = '#FFD700';
            }
        } else {
            game.guildCanvasButton.enabled = false;
            const needed = 5000 - game.gold;
            if (game.breachTriggered) {
                game.guildCanvasButton.setText(`⚔️ GUILD\n🚨 Need ${formatNumber(needed)}g 🚨`);
                // Make button flash even when unaffordable
                const flash = Math.sin(Date.now() / 200) > 0;
                game.guildCanvasButton.style.borderColor = flash ? '#DC143C' : '#666666';
            } else {
                game.guildCanvasButton.setText(`🏰 GUILD\nNeed ${formatNumber(needed)}g`);
                game.guildCanvasButton.style.borderColor = '#666666';
            }
        }
    }
    
    // Update canvas upgrade and generator buttons
    if (typeof updateAllUpgradeButtons === 'function') {
        // Canvas UI updates automatically
    }
    if (typeof updateAllGeneratorButtons === 'function') {
        // Canvas UI updates automatically
    }
}

function updateGPSDisplay() {
    // GPS display now handled by canvas UI only
}

function updateClickPowerDisplay() {
    // Click power display now handled by canvas UI only
}

function updateFPSDisplay() {
    // FPS display now handled by canvas UI only
}

// Generator displays now handled purely by canvas UI system - HTML buttons removed

// Get icon for each generator type
function getGeneratorIcon(generatorId) {
    const icons = {
        'surface_miner': '⛏️',
        'drill_operator': '🔧',
        'blast_engineer': '💥',
        'crystal_harvester': '💎'
    };
    return icons[generatorId] || '🏭';
}

// Upgrade displays now handled purely by canvas UI system - HTML buttons removed

// Game stats now shown in console or debug only (no bottom panel)
function updateGameStats() {
    // Game stats removed from UI - bottom panel eliminated
    // Stats available via debug.getStats() in console
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

// Check if point is within mountain click area (convert screen coordinates to world coordinates)
function isPointInMountain(x, y) {
    const mountain = game.mountainArea;
    const worldY = y + game.camera.y; // Convert screen Y to world Y
    return x >= mountain.x && x <= mountain.x + mountain.width &&
           worldY >= mountain.y && worldY <= mountain.y + mountain.height;
}

// Check if point is inside a rectangle area
function isPointInRectangle(x, y, rect) {
    const worldY = y + game.camera.y; // Convert screen Y to world Y
    return x >= rect.x && x <= rect.x + rect.width &&
           worldY >= rect.y && worldY <= rect.y + rect.height;
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
    
    // Draw sky gradient background (only in game world area, not over left column)
    const gradient = ctx.createLinearGradient(getGameWorldStartX(), 0, game.canvas.width, game.canvas.height / 2);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#E0F6FF'); // Light blue
    ctx.fillStyle = gradient;
    ctx.fillRect(getGameWorldStartX(), 0, game.canvas.width - getGameWorldStartX(), game.canvas.height);
    
    // Draw distant mountains for depth (only in game world area)
    const gameWorldStartX = getGameWorldStartX();
    ctx.fillStyle = '#B0B0B0';
    ctx.beginPath();
    ctx.moveTo(gameWorldStartX, 350);
    ctx.lineTo(gameWorldStartX + 100, 300);
    ctx.lineTo(gameWorldStartX + 200, 320);
    ctx.lineTo(gameWorldStartX + 300, 280);
    ctx.lineTo(gameWorldStartX + 400, 300);
    ctx.lineTo(gameWorldStartX + 500, 270);
    ctx.lineTo(gameWorldStartX + 600, 290);
    ctx.lineTo(gameWorldStartX + 700, 260);
    ctx.lineTo(game.canvas.width, 280);
    ctx.lineTo(game.canvas.width, 300);
    ctx.lineTo(game.canvas.width, 400);
    ctx.lineTo(gameWorldStartX, 400);
    ctx.closePath();
    ctx.fill();
    
    // Draw main ground (only in game world area)
    ctx.fillStyle = '#8B4513'; // Mountain brown
    ctx.fillRect(gameWorldStartX, 400, game.canvas.width - gameWorldStartX, game.canvas.height - 400);
    
    // Draw main mountain shape (more detailed) - centered in game world area
    const gameWorldWidth = game.canvas.width - getGameWorldStartX();
    const centerX = getGameWorldStartX() + gameWorldWidth / 2;
    const mountainWidth = 360; // Total mountain width
    const mountainLeft = centerX - mountainWidth / 2;
    const mountainRight = centerX + mountainWidth / 2;
    
    ctx.fillStyle = '#696969'; // Stone gray
    ctx.beginPath();
    ctx.moveTo(mountainLeft, 400);
    ctx.lineTo(mountainLeft + 80, 280);
    ctx.lineTo(mountainLeft + 120, 200);
    ctx.lineTo(centerX, 150); // Peak at center
    ctx.lineTo(mountainLeft + 240, 200);
    ctx.lineTo(mountainLeft + 280, 280);
    ctx.lineTo(mountainRight, 400);
    ctx.closePath();
    ctx.fill();
    
    // Add mountain shadow/depth
    ctx.fillStyle = '#5A5A5A';
    ctx.beginPath();
    ctx.moveTo(centerX, 150);
    ctx.lineTo(mountainLeft + 240, 200);
    ctx.lineTo(mountainLeft + 280, 280);
    ctx.lineTo(mountainRight, 400);
    ctx.lineTo(mountainLeft + 280, 400);
    ctx.lineTo(mountainLeft + 220, 250);
    ctx.closePath();
    ctx.fill();
    
    // Add mountain peak highlight
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.moveTo(mountainLeft, 400);
    ctx.lineTo(mountainLeft + 80, 280);
    ctx.lineTo(mountainLeft + 120, 200);
    ctx.lineTo(centerX, 150);
    ctx.lineTo(centerX - 20, 180);
    ctx.lineTo(mountainLeft + 100, 250);
    ctx.lineTo(mountainLeft + 50, 400);
    ctx.closePath();
    ctx.fill();
    
    // Draw mining camp area (only when miners exist)
    if (game.miners.length > 0) {
        drawMiningCamp(ctx);
    }
    
    // Draw guild building (only when guild is purchased)
    if (game.guildLevel > 0) {
        drawGuildBuilding(ctx);
    }
    
    // Draw instruction text (centered in game world area)
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.font = `${scaledSize(20)}px "Arial"`;
    ctx.textAlign = 'center';
    ctx.fillText('Click the mountain for gold!', centerX, getMountainY() - 50);
    
    // Draw grass line with texture (only in game world area)
    const grassY = getSurfaceY();
    const grassGradient = ctx.createLinearGradient(getGameWorldStartX(), grassY, game.canvas.width, grassY + 20);
    grassGradient.addColorStop(0, '#32CD32'); // Lime green
    grassGradient.addColorStop(1, '#228B22'); // Forest green
    ctx.fillStyle = grassGradient;
    ctx.fillRect(getGameWorldStartX(), grassY, game.canvas.width - getGameWorldStartX(), 20);
    
    // Add grass details (only in game world area)
    ctx.fillStyle = '#90EE90';
    for (let x = getGameWorldStartX(); x < game.canvas.width; x += 20) {
        const height = 2 + Math.sin((game.animationTime / 1000 + x / 100)) * 1;
        ctx.fillRect(x, grassY - height, 2, height);
    }
    
    // Add decorative trees (positioned in game world)
    const gameStartX = getGameWorldStartX();
    drawTree(gameStartX + 50, 480);
    drawTree(gameStartX + 120, 480);
    drawTree(gameStartX + 450, 480);
    drawTree(gameStartX + 500, 480);
    drawTree(gameStartX + 550, 480);
}

// Draw mining camp with structures and details
function drawMiningCamp(ctx) {
    // Dynamic positioning for mining camp (relative to game world)
    const campY = getCampY();
    const campHeight = Math.floor(game.canvas.height * 0.05); // 5% of screen height
    const gameStartX = getGameWorldStartX();
    
    // Camp area background
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(gameStartX + 100, campY, 300, campHeight);
    
    // Mining camp tent
    ctx.fillStyle = '#654321';
    ctx.fillRect(gameStartX + 120, campY + 10, 40, campHeight - 20);
    // Tent roof
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(gameStartX + 115, campY + 10);
    ctx.lineTo(gameStartX + 140, campY - 5);
    ctx.lineTo(gameStartX + 165, campY + 10);
    ctx.closePath();
    ctx.fill();
    
    // Storage boxes
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(gameStartX + 180, campY + 20, 20, 15);
    ctx.fillRect(gameStartX + 210, campY + 25, 15, 10);
    ctx.fillRect(gameStartX + 240, campY + 18, 25, 18);
    
    // Mining equipment
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gameStartX + 280, 485);
    ctx.lineTo(gameStartX + 285, 475);
    ctx.stroke();
    // Pickaxe head
    ctx.fillStyle = '#696969';
    ctx.fillRect(gameStartX + 283, 473, 4, 4);
    
    // Camp fire (if miners > 3) - Dynamic positioning
    if (game.miners.length > 3) {
        const fireFlicker = Math.sin(game.animationTime / 100) * 0.3 + 0.7;
        const fireY = campY + campHeight - 10;
        ctx.fillStyle = `rgba(255, ${Math.floor(69 * fireFlicker)}, 0, ${fireFlicker})`;
        ctx.fillRect(gameStartX + 320, fireY, 8, 12);
        ctx.fillStyle = `rgba(255, ${Math.floor(165 * fireFlicker)}, 0, ${fireFlicker * 0.8})`;
        ctx.fillRect(gameStartX + 322, fireY + 2, 4, 8);
    }
    
    // Draw mining cart (if active)
    if (game.miningCart.active) {
        drawMiningCart(ctx);
    }
}

// Draw animated mining cart
function drawMiningCart(ctx) {
    const cart = game.miningCart;
    
    ctx.save();
    ctx.translate(cart.x, 485);
    
    // Cart body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-10, -8, 20, 8);
    
    // Cart contents (gold ore)
    if (Math.sin(game.animationTime / 200) > 0.5) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-8, -12, 6, 4);
        ctx.fillRect(-2, -10, 4, 3);
        ctx.fillRect(2, -11, 5, 3);
    }
    
    // Wheels
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(-6, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wheel spokes (rotating)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    const wheelRotation = (game.animationTime / 100) % (Math.PI * 2);
    for (let wheel of [-6, 6]) {
        ctx.save();
        ctx.translate(wheel, 0);
        ctx.rotate(wheelRotation);
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(2, 0);
        ctx.moveTo(0, -2);
        ctx.lineTo(0, 2);
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.restore();
}

// Draw guild building on surface level (to the right of mountain)
function drawGuildBuilding(ctx) {
    const gameStartX = getGameWorldStartX();
    const gameWorldWidth = game.canvas.width - gameStartX;
    const centerX = gameStartX + gameWorldWidth / 2;
    const mountainWidth = 360;
    const mountainRight = centerX + mountainWidth / 2;

    // Position guild to the right of mountain with some spacing
    const guildX = mountainRight + 60; // 60px spacing from mountain
    const guildY = getSurfaceY() - 50; // Position on ground level
    const guildWidth = 80;
    const guildHeight = 60;

    // Store guild building area for hero spawning
    game.guildBuildingArea = {
        centerX: guildX + guildWidth/2,
        y: guildY,
        height: guildHeight,
        x: guildX,
        width: guildWidth
    };

    // Main building structure (stone)
    ctx.fillStyle = '#8B7355'; // Stone brown
    ctx.fillRect(guildX, guildY, guildWidth, guildHeight);

    // Building border
    ctx.strokeStyle = '#4A3A2A'; // Dark brown
    ctx.lineWidth = 2;
    ctx.strokeRect(guildX, guildY, guildWidth, guildHeight);

    // Roof (triangular)
    ctx.fillStyle = '#654321'; // Dark brown roof
    ctx.beginPath();
    ctx.moveTo(guildX - 5, guildY);
    ctx.lineTo(guildX + guildWidth/2, guildY - 20);
    ctx.lineTo(guildX + guildWidth + 5, guildY);
    ctx.closePath();
    ctx.fill();

    // Roof border
    ctx.strokeStyle = '#3A2A1A';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Door
    ctx.fillStyle = '#654321'; // Dark brown door
    ctx.fillRect(guildX + 25, guildY + 30, 20, 30);

    // Door handle
    ctx.fillStyle = '#FFD700'; // Gold handle
    ctx.fillRect(guildX + 40, guildY + 45, 3, 3);

    // Windows
    ctx.fillStyle = '#87CEEB'; // Light blue windows
    ctx.fillRect(guildX + 10, guildY + 15, 12, 10);
    ctx.fillRect(guildX + 58, guildY + 15, 12, 10);

    // Window frames
    ctx.strokeStyle = '#4A3A2A';
    ctx.lineWidth = 1;
    ctx.strokeRect(guildX + 10, guildY + 15, 12, 10);
    ctx.strokeRect(guildX + 58, guildY + 15, 12, 10);

    // Guild sign
    ctx.fillStyle = '#8B4513'; // Sign background
    ctx.fillRect(guildX + 20, guildY - 15, 40, 12);

    // Sign text
    ctx.fillStyle = '#FFD700'; // Gold text
    ctx.font = `${scaledSize(8)}px "Arial"`;
    ctx.textAlign = 'center';
    ctx.fillText('GUILD', guildX + 40, guildY - 7);

    // Flag on roof (if active)
    if (game.breachTriggered) {
        // Red war flag
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(guildX + guildWidth/2 + 5, guildY - 35, 15, 10);

        // Flag pole
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(guildX + guildWidth/2 + 5, guildY - 20);
        ctx.lineTo(guildX + guildWidth/2 + 5, guildY - 35);
        ctx.stroke();
    }
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
        ctx.font = `${scaledSize(16)}px "Arial"`;
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

// Miner sprite class for visual representation
class Miner {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.direction = Math.random() > 0.5 ? 1 : -1; // Random initial direction
        this.walkSpeed = 10 + Math.random() * 20; // pixels per second
        this.idleTime = 0;
        this.maxIdleTime = 2 + Math.random() * 3; // 2-5 seconds
        this.state = 'walking'; // walking, idle, mining
        this.minX = x - 50;
        this.maxX = x + 50;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000;
        this.animationFrame += this.animationSpeed;
        
        if (this.state === 'walking') {
            // Move miner
            this.x += this.direction * this.walkSpeed * dt;
            
            // Bounce off boundaries
            if (this.x <= this.minX || this.x >= this.maxX) {
                this.direction *= -1;
                this.idleTime = 0;
                this.state = 'idle';
            }
        } else if (this.state === 'idle') {
            this.idleTime += dt;
            if (this.idleTime >= this.maxIdleTime) {
                this.state = 'walking';
                this.idleTime = 0;
            }
        }
    }
    
    draw(ctx) {
        // Simple 8x8 miner sprite representation
        const size = 8;
        const frame = Math.floor(this.animationFrame) % 2;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Flip sprite based on direction
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }
        
        // Draw miner body (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/2, -size, size, size);
        
        // Draw miner head (light brown)
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(-size/2 + 1, -size, size - 2, 3);
        
        // Draw pickaxe (only when walking)
        if (this.state === 'walking') {
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const pickaxeOffset = frame === 0 ? -2 : 2;
            ctx.moveTo(0, -size/2);
            ctx.lineTo(pickaxeOffset, -size + 2);
            ctx.stroke();
            
            // Pickaxe head
            ctx.fillStyle = '#696969';
            ctx.fillRect(pickaxeOffset - 1, -size + 1, 2, 2);
        }
        
        // Add helmet (yellow)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-size/2 + 1, -size, size - 2, 2);
        
        ctx.restore();
    }
}

// Draw guild building on surface (center-right position)
function drawGuildBuilding(ctx) {
    // Position in center-right of surface level in game world
    const gameWorldStartX = getGameWorldStartX();
    const gameWorldWidth = game.canvas.width - gameWorldStartX;
    const guildX = gameWorldStartX + gameWorldWidth * 0.75; // 75% across game world (center-right)
    const guildY = getSurfaceY() - 60; // Above ground level
    
    // Simple building - keep it MVP
    const buildingWidth = 80;
    const buildingHeight = 60;
    
    // Main building structure
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(guildX - buildingWidth/2, guildY, buildingWidth, buildingHeight);
    
    // Building border
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(guildX - buildingWidth/2, guildY, buildingWidth, buildingHeight);
    
    // Roof
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(guildX - buildingWidth/2 - 5, guildY);
    ctx.lineTo(guildX, guildY - 20);
    ctx.lineTo(guildX + buildingWidth/2 + 5, guildY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Guild flag
    ctx.fillStyle = '#DC143C'; // Red flag
    ctx.fillRect(guildX - 10, guildY - 15, 20, 12);
    
    // Simple guild text
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GUILD', guildX, guildY + 35);
    
    // Store guild building position for click detection
    game.guildBuildingArea = {
        x: guildX - buildingWidth/2,
        y: guildY,
        width: buildingWidth,
        height: buildingHeight,
        centerX: guildX,
        centerY: guildY + buildingHeight/2
    };
}

// Responsive Dungeon Layout System
// Helper functions to get dungeon positions relative to game world area
function getDungeonStartRatio() {
    // Dungeon starts at 2% of game world width (just inside the border)
    return 0.02;
}

function getDungeonEndRatio() {
    // Dungeon ends at 98% of game world width (leaving space for border)
    return 0.98;
}

function gameWorldRatioToCanvasX(ratio) {
    // Convert game world ratio to canvas X coordinate
    const gameWorldStartX = getGameWorldStartX();
    const gameWorldWidth = game.canvas.width - gameWorldStartX;
    return gameWorldStartX + (gameWorldWidth * ratio);
}

// Dungeon layout constants for pathfinding (now responsive)
const DUNGEON_LAYOUT = {
    // Dynamic split-screen layout
    getDynamicLayout() {
        const gameWorldStartX = getGameWorldStartX();
        const gameWorldWidth = game.canvas.width - gameWorldStartX;
        return {
            leftSide: {
                x: 0,
                width: getLeftColumnWidth()
            },
            rightSide: {
                x: gameWorldStartX,
                width: gameWorldWidth
            }
        };
    },
    
    // Floor traversal points (zig-zag pattern) - relative to game world
    floors: {
        // Floor 4 (monsters start here): Move RIGHT (left-to-right as requested)
        4: { 
            startX: getDungeonStartRatio(), // Start at left edge of game world
            endX: getDungeonEndRatio(),     // End at right edge of game world
            direction: 1                    // Move RIGHT (left-to-right)
        },
        // Floor 3: Move LEFT (right-to-left)  
        3: {
            startX: getDungeonEndRatio(),   // Start where Floor 4 ladder deposits
            endX: getDungeonStartRatio(),   // End at left edge of game world
            direction: -1                   // Move LEFT (right-to-left)
        },
        // Floor 2: Move RIGHT (left-to-right)
        2: {
            startX: getDungeonStartRatio(), // Start where Floor 3 ladder deposits
            endX: getDungeonEndRatio(),     // End at right edge of game world
            direction: 1                    // Move RIGHT (left-to-right)
        },
        // Floor 1: Move LEFT (right-to-left)
        1: {
            startX: getDungeonEndRatio(),   // Start where Floor 2 ladder deposits  
            endX: getDungeonStartRatio(),   // End at left edge of game world
            direction: -1                   // Move LEFT (right-to-left)
        },
        // Surface: Move RIGHT toward victory (change as needed)
        0: {
            startX: getDungeonStartRatio(), // Start where Floor 1 ladder deposits
            endX: getDungeonEndRatio(),     // Move toward right edge of game world
            direction: 1                    // Move RIGHT
        }
    },
    
    // Ladder positions (where floor transitions happen) - relative to game world
    ladders: {
        left: getDungeonStartRatio(),   // Left edge of game world
        right: getDungeonEndRatio()     // Right edge of game world
    }
};

// Monster class for combat system
class Monster {
    constructor(x, y, type = 'goblin') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = this.getMaxHealth();
        this.maxHealth = this.getMaxHealth();
        this.speed = this.getSpeed();
        this.damage = this.getDamage();
        this.state = 'moving'; // moving, fighting, dead
        this.direction = 1; // 1 = right (toward surface), -1 = left
        this.animationTime = Math.random() * 1000;
        this.floor = 4; // Start at Floor 4
    }
    
    getMaxHealth() {
        const baseHealth = {
            'goblin': 20,
            'orc': 40,
            'skeleton': 15
        };
        return baseHealth[this.type] || 20;
    }
    
    getSpeed() {
        const baseSpeed = {
            'goblin': 15, // pixels per second
            'orc': 10,
            'skeleton': 20
        };
        return baseSpeed[this.type] || 15;
    }
    
    getDamage() {
        const baseDamage = {
            'goblin': 5,
            'orc': 10,
            'skeleton': 3
        };
        return baseDamage[this.type] || 5;
    }
    
    update(deltaTime) {
        if (this.state === 'dead') return;
        
        this.animationTime += deltaTime;
        
        if (this.state === 'moving') {
            // Check for heroes on current floor first
            const heroOnFloor = game.heroes.find(hero => 
                hero.state !== 'dead' && hero.floor === this.floor
            );
            
            if (heroOnFloor) {
                // Move toward hero on same floor for combat
                const dx = heroOnFloor.x - this.x;
                const distance = Math.abs(dx);
                
                if (distance > 30) {
                    this.x += Math.sign(dx) * this.speed * (deltaTime / 1000);
                } else {
                    // Close enough - combat handled in hero update
                    this.state = 'fighting';
                }
            } else {
                // No hero on current floor - follow zig-zag pathfinding pattern
                // This will traverse the floor completely before moving to next floor
                this.moveToNextFloor(deltaTime);
            }
        }
    }
    
    moveToNextFloor(deltaTime) {
        // Get current floor layout for zig-zag pathfinding
        const floorLayout = DUNGEON_LAYOUT.floors[this.floor];
        if (!floorLayout) {
            console.warn(`No layout defined for floor ${this.floor}`);
            return;
        }
        
        // Convert game world ratios to actual pixel positions
        const targetX = gameWorldRatioToCanvasX(floorLayout.endX);
        const dx = targetX - this.x;
        const distanceToTarget = Math.abs(dx);
        
        // Debug logging for first few movements
        if (Math.random() < 0.01) { // Log occasionally to avoid spam
            // Monster tracking debug removed to reduce console spam
        }
        
        // Check if we've reached the end of this floor
        if (distanceToTarget < 10) { // Within 10 pixels of target
            // 🚫 DISABLED: Monsters can no longer change floors - they stay on their spawn floor
            // This prevents monsters from appearing on wrong floors

            // Instead of climbing floors, monsters will patrol their current floor
            // Reverse direction and move back across the floor
            this.direction *= -1;
            console.log(`🔄 ${this.type} reached end of Floor ${this.floor}, reversing direction to ${this.direction > 0 ? 'RIGHT' : 'LEFT'}`);

            /* ORIGINAL FLOOR-CHANGING CODE (DISABLED):
            // Move to next floor (up the ladder)
            if (this.floor > 0) {
                this.floor--;

                // Get the new floor's starting position
                const newFloorLayout = DUNGEON_LAYOUT.floors[this.floor];
                if (newFloorLayout) {
                    this.x = gameWorldRatioToCanvasX(newFloorLayout.startX);
                    this.y = this.getFloorY(this.floor);

                    // ✅ FIXED: Update monster direction to match floor's intended direction
                    this.direction = newFloorLayout.direction;

                    console.log(`⬆️ ${this.type} climbed to Floor ${this.floor}, starting at ${Math.round(this.x)}px, moving ${this.direction > 0 ? 'RIGHT' : 'LEFT'}`);

                    // Check if reached surface
                    if (this.floor === 0) {
                        console.log(`🚨 ${this.type} REACHED THE SURFACE! Threatening miners!`);
                    }
                }
            */
        } else {
            // Not at end of floor yet - continue moving across current floor
            // ✅ FIXED: Use consistent direction system
            this.x += this.direction * this.speed * (deltaTime / 1000);
        }
    }
    
    getFloorY(floor) {
        return getFloorY(floor); // Use the global dynamic positioning function
    }
    
    draw(ctx) {
        if (this.state === 'dead') return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw monster based on type - positioned to sit ON the floor rather than above it
        this.drawMonster(ctx);

        // Draw health bar
        this.drawHealthBar(ctx);

        ctx.restore();
    }
    
    drawMonster(ctx) {
        const size = scaledSize(12);
        const frame = Math.floor(this.animationTime / 200) % 2; // Animation frame
        
        switch(this.type) {
            case 'goblin':
                // Green goblin
                ctx.fillStyle = '#228B22';
                ctx.fillRect(-size/2, -size, size, size);
                
                // Eyes (red)
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(-size/2 + 2, -size + 2, 2, 2);
                ctx.fillRect(-size/2 + size - 4, -size + 2, 2, 2);
                
                // Simple weapon
                ctx.fillStyle = '#654321';
                ctx.fillRect(-size/2 - 3, -size + 4, 6, 2);
                break;
                
            case 'orc':
                // Brown orc (larger)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-size/2, -size * 1.2, size, size * 1.2);
                
                // Red eyes
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(-size/2 + 2, -size + 2, 3, 3);
                ctx.fillRect(-size/2 + size - 5, -size + 2, 3, 3);
                break;
                
            case 'skeleton':
                // White skeleton
                ctx.fillStyle = '#F0F0F0';
                ctx.fillRect(-size/2, -size, size, size);
                
                // Dark eye sockets
                ctx.fillStyle = '#000000';
                ctx.fillRect(-size/2 + 2, -size + 2, 2, 2);
                ctx.fillRect(-size/2 + size - 4, -size + 2, 2, 2);
                break;
        }
    }
    
    drawHealthBar(ctx) {
        const barWidth = scaledSize(16);
        const barHeight = scaledSize(3);
        const x = -barWidth / 2;
        const y = -scaledSize(18);
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#90EE90' : (healthPercent > 0.25 ? '#FFD700' : '#DC143C');
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Visual feedback
        spawnFloatingText(this.x, this.y - 20, `-${damage}`, '#DC143C');
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.state = 'dead';
        // Add death effects
        spawnParticles(this.x, this.y, 5, '#DC143C');
        console.log(`💀 ${this.type} killed!`);
    }
}

// Boss class extends Monster with enhanced stats and abilities
class Boss extends Monster {
    constructor(x, y, type = 'goblin_chief') {
        super(x, y, type);
        this.isBoss = true;
        this.summonTimer = 0;
        this.summonInterval = 10000; // Summon minion every 10 seconds
        this.isAlive = true;
        
        // Override health, damage for boss
        this.health = this.getMaxHealth();
        this.maxHealth = this.getMaxHealth();
    }
    
    getMaxHealth() {
        const bossHealth = {
            'goblin_chief': 500
        };
        return bossHealth[this.type] || 500;
    }
    
    getSpeed() {
        // Bosses move slower than regular monsters
        const bossSpeed = {
            'goblin_chief': 8
        };
        return bossSpeed[this.type] || 8;
    }
    
    getDamage() {
        const bossDamage = {
            'goblin_chief': 20
        };
        return bossDamage[this.type] || 20;
    }
    
    update(deltaTime) {
        // Call parent update method
        super.update(deltaTime);
        
        if (this.state === 'dead' || !this.isAlive) return;
        
        // Boss special ability: summon minions
        this.summonTimer += deltaTime;
        if (this.summonTimer >= this.summonInterval) {
            this.summonMinion();
            this.summonTimer = 0;
        }
    }
    
    summonMinion() {
        // Summon a regular monster near the boss
        const minionTypes = ['goblin', 'skeleton'];
        const randomType = minionTypes[Math.floor(Math.random() * minionTypes.length)];
        
        // Spawn near boss position
        const offsetX = (Math.random() - 0.5) * 100; // Random offset ±50px
        const minion = new Monster(this.x + offsetX, this.y, randomType);
        minion.floor = this.floor;
        
        // Set direction same as dungeon layout for this floor
        const floorLayout = DUNGEON_LAYOUT.floors[this.floor];
        if (floorLayout) {
            minion.direction = floorLayout.direction;
        }
        
        game.monsters.push(minion);
        
        // Visual effects for summoning
        spawnParticles(this.x, this.y - 10, 8, '#800080'); // Purple particles
        console.log(`👑 ${this.type} summoned a ${randomType}!`);
    }
    
    drawBoss(ctx) {
        // Larger sprite for boss (32x32 instead of 12x12)
        const size = scaledSize(24); // Larger than regular monsters
        const frame = Math.floor(this.animationTime / 400) % 2; // Slower animation
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Boss glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        
        if (this.type === 'goblin_chief') {
            // Goblin Chief - larger, with crown
            ctx.fillStyle = frame === 0 ? '#4A5D3A' : '#5A6D4A';
            ctx.fillRect(-size/2, -size/2, size, size * 0.8);
            
            // Crown
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-size/3, -size/2 - 4, size * 0.66, 6);
            
            // Eyes (angry red)
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(-size/4, -size/3, 3, 3);
            ctx.fillRect(size/4 - 3, -size/3, 3, 3);
        }
        
        ctx.restore();
    }
    
    drawHealthBar(ctx) {
        if (this.health >= this.maxHealth) return;
        
        // Larger health bar for boss
        const barWidth = scaledSize(32);
        const barHeight = scaledSize(4);
        const x = -barWidth / 2;
        const y = -scaledSize(22);
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#FF4500' : '#DC143C'; // Boss health is orange/red
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Health text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${scaledSize(10)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(this.health)}/${this.maxHealth}`, 0, y - 2);
    }
    
    draw(ctx) {
        if (this.state === 'dead') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        this.drawBoss(ctx);
        this.drawHealthBar(ctx);
        
        ctx.restore();
    }
    
    die() {
        super.die();
        this.isAlive = false;
        
        // Boss death effects
        spawnParticles(this.x, this.y, 15, '#FFD700'); // Golden particles
        addScreenShake(8); // Strong screen shake
        
        // Trigger floor sealing
        this.sealFloor();
        
        console.log(`👑💀 BOSS DEFEATED: ${this.type}!`);
    }
    
    sealFloor() {
        // Remove all monsters from this floor
        game.monsters = game.monsters.filter(monster => 
            monster.floor !== this.floor || monster === this
        );
        
        // Mark floor as secured
        game.securedFloors = game.securedFloors || [];
        if (!game.securedFloors.includes(this.floor)) {
            game.securedFloors.push(this.floor);
        }
        
        // Enable generator for this floor
        const floorGenerator = game.generators.find(g => g.floor === this.floor);
        if (floorGenerator) {
            floorGenerator.enabled = true;
            console.log(`🔓 Floor ${this.floor} secured! ${floorGenerator.name} enabled!`);
        }
        
        // Victory message
        spawnFloatingText(this.x, this.y - 30, `FLOOR ${this.floor} SECURED!`, '#32CD32');
        
        // If this is Floor 4, unlock Floor 5 progression
        if (this.floor === 4) {
            console.log('🎉 Floor 4 secured! Floor 5 progression unlocked!');
            game.maxFloor = Math.max(game.maxFloor || 4, 5);
        }
    }
}

// Hero class for combat system
class Hero {
    constructor(x, y, type = 'warrior') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = this.getMaxHealth();
        this.maxHealth = this.getMaxHealth();
        this.speed = this.getSpeed();
        this.damage = this.getDamage();
        this.state = 'moving'; // moving, fighting, dead, returning
        this.direction = -1; // -1 = left (toward monsters), 1 = right (returning)
        this.animationTime = Math.random() * 1000;
        this.floor = 0; // Start at surface level
        this.target = null; // Current target monster
        this.attackTimer = 0; // Timer for attack rate
        this.attackRate = 1000; // Attack every 1 second (milliseconds)
        this.deathTimer = 0; // Timer for respawn
        this.respawnTime = 10000; // Respawn after 10 seconds
    }
    
    getMaxHealth() {
        const baseHealth = {
            'warrior': 50
        };
        return baseHealth[this.type] || 50;
    }
    
    getSpeed() {
        const baseSpeed = {
            'warrior': 20 // pixels per second
        };
        return baseSpeed[this.type] || 20;
    }
    
    getDamage() {
        const baseDamage = {
            'warrior': 15
        };
        return baseDamage[this.type] || 15;
    }
    
    update(deltaTime) {
        if (this.state === 'dead') {
            this.deathTimer += deltaTime;
            if (this.deathTimer >= this.respawnTime) {
                this.respawn();
            }
            return;
        }
        
        this.animationTime += deltaTime;
        this.attackTimer += deltaTime;
        
        if (this.state === 'moving') {
            // Check for monsters on current floor first
            this.findTarget();
            
            if (this.target && this.target.floor === this.floor) {
                // Move toward target on same floor
                const dx = this.target.x - this.x;
                const distance = Math.abs(dx);
                
                if (distance > 30) { // Not adjacent yet
                    this.x += Math.sign(dx) * this.speed * (deltaTime / 1000);
                } else {
                    // Close enough to attack
                    this.state = 'fighting';
                }
            } else {
                // No target on current floor - move down to next floor
                this.moveToNextFloor(deltaTime);
            }
        } else if (this.state === 'fighting') {
            this.attack();
        }
    }
    
    findTarget() {
        // Find closest living monster on the same floor, prioritizing bosses
        let closestMonster = null;
        let closestDistance = Infinity;
        let boss = null;
        
        game.monsters.forEach(monster => {
            if (monster.state !== 'dead' && monster.floor === this.floor) {
                const distance = Math.abs(monster.x - this.x);
                
                // Prioritize bosses
                if (monster.isBoss) {
                    boss = monster;
                } else if (!boss && distance < closestDistance) {
                    closestDistance = distance;
                    closestMonster = monster;
                }
            }
        });
        
        // Target boss if available, otherwise closest monster
        this.target = boss || closestMonster;
        
        if (!this.target && this.state === 'fighting') {
            this.state = 'moving'; // Resume moving if target died
        }
    }
    
    moveToNextFloor(deltaTime) {
        // Heroes follow REVERSE zig-zag pattern (opposite of monsters)
        // Heroes descend DOWN through floors (0 → 1 → 2 → 3 → 4) to chase monsters
        
        const maxFloor = 4;
        
        // Special case: Surface level (Floor 0) - move to first underground entrance
        if (this.floor === 0) {
            // Move to entrance of Floor 1 (heroes start their zig-zag from Floor 1 layout)
            const floor1Layout = DUNGEON_LAYOUT.floors[1];
            const entranceX = floor1Layout ? gameWorldRatioToCanvasX(floor1Layout.startX) : gameWorldRatioToCanvasX(0.02);
            const dx = entranceX - this.x;
            
            if (Math.abs(dx) > 10) {
                // Still moving toward entrance
                this.x += Math.sign(dx) * this.speed * (deltaTime / 1000);
            } else {
                // Reached entrance - descend to Floor 1
                this.floor = 1;
                this.x = entranceX;
                this.y = this.getFloorY(this.floor);
                
                // ✅ FIXED: Set initial direction for Floor 1 (opposite to monsters)
                const floor1Layout = DUNGEON_LAYOUT.floors[1];
                if (floor1Layout) {
                    this.direction = -floor1Layout.direction; // Heroes move opposite to monsters
                    // Heroes start at monster END point
                    this.x = gameWorldRatioToCanvasX(floor1Layout.endX);
                }
                
                console.log(`⬇️ Hero descended to Floor ${this.floor}, starting zig-zag pattern, moving ${this.direction > 0 ? 'RIGHT' : 'LEFT'} (opposite to monsters)`);
            }
            return;
        }
        
        // Underground floors - heroes move OPPOSITE direction to monsters
        const currentFloorLayout = DUNGEON_LAYOUT.floors[this.floor];
        if (!currentFloorLayout) {
            console.warn(`No layout defined for hero on floor ${this.floor}`);
            return;
        }
        
        // Heroes move in OPPOSITE direction to monsters on each floor
        const heroDirection = -currentFloorLayout.direction; // Opposite of monster direction
        
        // Convert percentages to actual pixel positions
        // Heroes target the OPPOSITE end from monsters
        const targetX = gameWorldRatioToCanvasX(currentFloorLayout.startX); // Heroes go to monster start point
        const dx = targetX - this.x;
        const distanceToTarget = Math.abs(dx);
        
        // Check if we've reached the end of this floor
        if (distanceToTarget < 10) { // Within 10 pixels of target
            // Move to next floor (down the ladder) if not at maximum depth
            if (this.floor < maxFloor) {
                this.floor++;
                
                // Get the new floor's layout
                const newFloorLayout = DUNGEON_LAYOUT.floors[this.floor];
                if (newFloorLayout) {
                    // Heroes start at the END point of monster path (opposite end)
                    this.x = gameWorldRatioToCanvasX(newFloorLayout.endX);
                    this.y = this.getFloorY(this.floor);
                    
                    // Heroes move opposite direction to monsters
                    this.direction = -newFloorLayout.direction;
                    
                    console.log(`⬇️ Hero descended to Floor ${this.floor}, starting at ${Math.round(this.x)}px, moving ${this.direction > 0 ? 'RIGHT' : 'LEFT'} (opposite to monsters)`);
                }
            } else {
                // At maximum depth (Floor 4) - patrol current floor waiting for monsters
                this.x += heroDirection * this.speed * (deltaTime / 1000);
                
                // Stay within floor bounds
                const minX = Math.min(currentFloorLayout.startX, currentFloorLayout.endX) * canvasWidth;
                const maxX = Math.max(currentFloorLayout.startX, currentFloorLayout.endX) * canvasWidth;
                
                if (this.x <= minX + 10 || this.x >= maxX - 10) {
                    // Reverse direction when hitting bounds
                    this.direction *= -1;
                }
            }
        } else {
            // Continue moving across current floor in the opposite direction to monsters
            this.x += heroDirection * this.speed * (deltaTime / 1000);
        }
    }
    
    getFloorY(floor) {
        return getFloorY(floor); // Use the global dynamic positioning function
    }
    
    attack() {
        if (!this.target || this.target.state === 'dead') {
            this.findTarget();
            return;
        }
        
        // Check if we can attack (cooldown)
        if (this.attackTimer >= this.attackRate) {
            this.attackTimer = 0;
            
            // Deal damage to target
            this.target.takeDamage(this.damage);
            
            // Visual feedback
            spawnFloatingText(this.target.x, this.target.y - 20, 
                             `-${this.damage}`, '#FF4500');
            spawnParticles(this.target.x, this.target.y, 3, '#FF4500');
            
            console.log(`⚔️ ${this.type} attacks ${this.target.type} for ${this.damage} damage!`);
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Visual feedback
        spawnFloatingText(this.x, this.y - 20, `-${damage}`, '#DC143C');
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.state = 'dead';
        this.deathTimer = 0;
        
        // Death visual effects
        spawnParticles(this.x, this.y, 8, '#DC143C');
        console.log(`💀 ${this.type} killed!`);
    }
    
    respawn() {
        // Respawn at guild building if it exists, otherwise use fallback
        if (game.guildBuildingArea) {
            this.x = game.guildBuildingArea.centerX;
            this.y = game.guildBuildingArea.y + game.guildBuildingArea.height;
        } else {
            this.x = game.canvas.width - 100; // Fallback: right edge of screen
            this.y = this.getFloorY(0); // Surface level
        }
        this.floor = 0; // Reset to surface
        this.health = this.getMaxHealth();
        this.state = 'moving';
        this.direction = -1;
        this.target = null;
        
        console.log(`✨ ${this.type} respawned at surface!`);
    }
    
    draw(ctx) {
        if (this.state === 'dead') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw hero based on type
        this.drawHero(ctx);
        
        // Draw health bar
        this.drawHealthBar(ctx);
        
        ctx.restore();
    }
    
    drawHero(ctx) {
        const size = scaledSize(12);
        const frame = Math.floor(this.animationTime / 200) % 2; // Animation frame
        
        switch(this.type) {
            case 'warrior':
                // Blue warrior
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(-size/2, -size, size, size);
                
                // Helmet
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(-size/2, -size, size, 4);
                
                // Sword
                ctx.fillStyle = '#FFD700';
                if (this.state === 'fighting') {
                    // Attacking animation
                    ctx.fillRect(-size/2 - 8, -size + 2, 8, 2);
                } else {
                    // Normal sword position
                    ctx.fillRect(-size/2 - 5, -size + 4, 6, 2);
                }
                
                // Eyes
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(-size/2 + 2, -size + 6, 2, 2);
                ctx.fillRect(-size/2 + size - 4, -size + 6, 2, 2);
                break;
        }
    }
    
    drawHealthBar(ctx) {
        if (this.health >= this.maxHealth) return; // Don't show full health bars
        
        const barWidth = scaledSize(20);
        const barHeight = scaledSize(3);
        const x = -barWidth / 2;
        const y = -scaledSize(18);
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        let healthColor = '#00FF00'; // Green
        if (healthPercent < 0.3) healthColor = '#FF0000'; // Red
        else if (healthPercent < 0.6) healthColor = '#FFFF00'; // Yellow
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}

// Check if breach should be triggered
function checkBreachCondition() {
    if (game.breachTriggered) return;
    
    // Trigger breach when total income reaches a certain threshold (e.g., 500/s)
    const totalIncome = calculateTotalIncome();
    if (totalIncome >= 500) {
        triggerBreach();
    }
}

// Trigger the Floor 4 breach event
function triggerBreach() {
    if (game.breachTriggered) return;
    
    game.breachTriggered = true;
    game.breachTime = Date.now();
    
    console.log('💥 BREACH EVENT TRIGGERED! Monsters have broken through Floor 4!');
    
    // Dramatic visual effects
    addScreenShake(10);
    spawnFloatingText(game.canvas.width / 2, 300, 'FLOOR 4 BREACH!', '#DC143C');
    spawnParticles(game.canvas.width / 2, 400, 20, '#DC143C');
    
    // Spawn the Floor 4 boss and initial monsters
    spawnBoss(4, 'goblin_chief');
    spawnMonster();
    
    // Set up recurring monster spawns (but not boss - only one boss per floor)
    game.monsterSpawnTimer = setInterval(() => {
        if (game.breachTriggered && !isFloorSecured(4)) {
            spawnMonster();
        }
    }, 5000); // Every 5 seconds
}

// Spawn a monster at Floor 4
function spawnMonster() {
    if (!game.breachTriggered) return;
    
    const floor4Y = getFloorY(4) + getFloorHeight() - 5; // Floor 4 ground level (bottom of floor area)
    
    // Use proper Floor 4 starting position from DUNGEON_LAYOUT
    const floor4Layout = DUNGEON_LAYOUT.floors[4];
    const dungeonStartX = floor4Layout ? 
        gameWorldRatioToCanvasX(floor4Layout.startX) : 
        gameWorldRatioToCanvasX(0.02); // Fallback to left edge of game world
    
    const monsterTypes = ['goblin', 'skeleton', 'orc'];
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    const monster = new Monster(dungeonStartX, floor4Y, randomType);
    
    // Set the monster's floor properly
    monster.floor = 4;
    
    // ✅ FIXED: Set initial direction based on Floor 4's layout
    if (floor4Layout) {
        monster.direction = floor4Layout.direction;
    }
    
    game.monsters.push(monster);
    
    console.log(`👹 ${randomType} spawned at Floor 4`);
    console.log(`  📍 Monster Y-coordinate: ${Math.round(monster.y)}px`);
    console.log(`  📍 Calculated Floor 4 Y: ${Math.round(floor4Y)}px`);
    console.log(`  📍 Monster X-coordinate: ${Math.round(monster.x)}px`);
    console.log(`  📍 Monster floor property: ${monster.floor}`);
}

// Spawn a boss at specified floor
function spawnBoss(floor, bossType) {
    // Check if boss already exists on this floor
    const existingBoss = game.monsters.find(m => m.isBoss && m.floor === floor);
    if (existingBoss) {
        console.log(`👑 Boss already exists on Floor ${floor}`);
        return;
    }
    
    const floorY = getFloorY(floor);
    
    // Position boss at leftmost position (far end of dungeon)
    const floorLayout = DUNGEON_LAYOUT.floors[floor];
    const bossX = floorLayout ? 
        gameWorldRatioToCanvasX(floorLayout.endX) : 
        gameWorldRatioToCanvasX(0.98); // Fallback to right edge of game world
    
    const boss = new Boss(bossX, floorY, bossType);
    boss.floor = floor;
    
    // Set initial direction based on floor layout
    if (floorLayout) {
        boss.direction = floorLayout.direction;
    }
    
    game.monsters.push(boss);
    
    console.log(`👑 ${bossType} BOSS spawned at Floor ${floor}, position ${Math.round(bossX)}px!`);
    
    // Boss arrival effects
    spawnParticles(bossX, floorY, 12, '#FFD700'); // Golden particles
    spawnFloatingText(bossX, floorY - 20, 'BOSS APPEARS!', '#FF4500');
    addScreenShake(6);
}

// Check if a floor is secured (boss defeated)
function isFloorSecured(floor) {
    game.securedFloors = game.securedFloors || [];
    return game.securedFloors.includes(floor);
}

// Update monsters
function updateMonsters(deltaTime) {
    game.monsters.forEach(monster => {
        monster.update(deltaTime);
    });
    
    // Remove dead monsters
    game.monsters = game.monsters.filter(monster => monster.state !== 'dead');
}

// Update heroes and handle spawning
function updateHeroes(deltaTime) {
    // Only spawn heroes if guild is built (gold >= 5000 previously spent)
    if (game.gold >= 5000 || game.heroes.length > 0 || game.breachTriggered) {
        // Update hero spawn timer
        game.heroSpawnTimer += deltaTime;
        
        // Spawn new hero if timer elapsed and under max limit
        if (game.heroSpawnTimer >= game.heroSpawnRate && game.heroes.length < game.maxHeroes) {
            spawnHero();
            game.heroSpawnTimer = 0;
        }
    }
    
    // Update all heroes
    game.heroes.forEach(hero => {
        hero.update(deltaTime);
        
        // Make monsters attack heroes back
        game.monsters.forEach(monster => {
            if (monster.state !== 'dead' && hero.state !== 'dead' && 
                monster.floor === hero.floor) { // ✅ FIXED: Only same floor combat
                const distance = Math.abs(monster.x - hero.x);
                if (distance < 30) { // Adjacent
                    // Monster attacks hero
                    monster.attackTimer = (monster.attackTimer || 0) + deltaTime;
                    if (monster.attackTimer >= 1500) { // Slower than hero attacks
                        hero.takeDamage(monster.damage);
                        monster.attackTimer = 0;
                        console.log(`👹 ${monster.type} attacks ${hero.type} for ${monster.damage} damage!`);
                    }
                }
            }
        });
    });
    
    // Remove permanently dead heroes (after respawn system)
    game.heroes = game.heroes.filter(hero => hero.state !== 'permanently_dead');
}

// Spawn a new hero
function spawnHero(type = 'warrior') {
    // Spawn from guild building if it exists, otherwise use fallback position
    let spawnX, spawnY;
    if (game.guildBuildingArea) {
        spawnX = game.guildBuildingArea.centerX;
        spawnY = game.guildBuildingArea.y + game.guildBuildingArea.height; // Ground level at building
    } else {
        spawnX = game.canvas.width - 100; // Fallback: spawn near right edge
        spawnY = getMinerY(); // Dynamic surface level
    }
    
    const hero = new Hero(spawnX, spawnY, type);
    game.heroes.push(hero);
    
    console.log(`✨ ${type} hero spawned at surface! Heroes active: ${game.heroes.length}/${game.maxHeroes}`);
    
    // Visual feedback
    spawnFloatingText(spawnX, spawnY - 30, 'Hero Spawned!', '#4169E1');
    spawnParticles(spawnX, spawnY, 5, '#4169E1');
}

// Update miners based on owned generators
function updateMiners() {
    const surfaceMiner = game.generators.find(g => g.id === 'surface_miner');
    const targetMinerCount = Math.min(surfaceMiner ? surfaceMiner.owned : 0, 10); // Max 10 visual miners
    
    // Add miners if we need more (dynamic positioning in game world area)
    while (game.miners.length < targetMinerCount) {
        const gameWorldStartX = getGameWorldStartX();
        const campX = gameWorldStartX + 50 + Math.random() * 300; // Spread across camp area in game world
        const campY = getMinerY(); // Dynamic Y position based on screen height
        game.miners.push(new Miner(campX, campY, game.miners.length));
    }
    
    // Remove excess miners
    while (game.miners.length > targetMinerCount) {
        game.miners.pop();
    }
    
    // Update cart activity
    game.miningCart.active = targetMinerCount > 0;
}

// Update game state
function update(deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    
    // Update animation time
    game.animationTime += deltaTime;
    
    // Auto-save system
    game.lastSaveTime += deltaTime;
    if (game.lastSaveTime >= game.autoSaveInterval) {
        SaveSystem.save();
        game.lastSaveTime = 0;
    }
    
    // Update playtime tracking
    game.totalPlaytime += deltaTime;
    
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
    
    // Auto-clicker system
    if (game.autoClickRate > 0) {
        game.autoClickTimer = (game.autoClickTimer || 0) + deltaTime;
        const clickInterval = 1000 / game.autoClickRate; // Milliseconds per click
        
        while (game.autoClickTimer >= clickInterval) {
            // Simulate a click on the mountain
            const centerX = game.canvas.width / 2;
            const centerY = 300;
            handleMountainClick(centerX, centerY);
            game.autoClickTimer -= clickInterval;
        }
    }
    
    // Update GPS calculation (now includes passive income)
    game.gpsUpdateTimer += deltaTime;
    if (game.gpsUpdateTimer >= game.gpsUpdateInterval) {
        // console.log('💰 GPS update triggered');
        const goldDiff = game.gold - game.lastGoldAmount;
        game.goldPerSecond = goldDiff;
        game.lastGoldAmount = game.gold;
        game.gpsUpdateTimer = 0;
        updateGPSDisplay();

        // COOKIE CLICKER APPROACH: Update button states, never recreate UI
        updateAllGeneratorButtons(); // Safe state updates only
        updateAllUpgradeButtons(); // Safe state updates only

        updateMiners(); // Update visual miners
    }
    
    // Update camera system
    updateCamera(deltaTime);
    
    // Check breach condition and update combat system
    checkBreachCondition();
    updateMonsters(deltaTime);
    updateHeroes(deltaTime);
    
    // Update miners
    game.miners.forEach(miner => miner.update(deltaTime));
    
    // Update mining cart
    if (game.miningCart.active) {
        game.miningCart.x += game.miningCart.direction * 30 * dt; // 30 pixels per second
        
        // Bounce cart between boundaries
        if (game.miningCart.x <= 100 || game.miningCart.x >= 400) {
            game.miningCart.direction *= -1;
        }
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
    
    // Apply camera transform
    ctx.translate(0, -game.camera.y);
    
    // Debug: Reset frame counter for each render cycle
    window.debugFrameCount = 0;

    // Clear and draw background
    drawBackground();
    
    // Draw underground (if revealed)
    if (game.camera.undergroundRevealed) {
        drawUnderground();
    }
    
    // Draw miners (adjusted for camera)
    game.miners.forEach(miner => miner.draw(ctx));
    
    // Draw monsters (adjusted for camera)
    game.monsters.forEach(monster => monster.draw(ctx));
    
    // Draw heroes (adjusted for camera)
    game.heroes.forEach(hero => hero.draw(ctx));
    
    // Reset camera transform for UI elements
    ctx.translate(0, game.camera.y);
    
    // Draw floating texts
    drawFloatingTexts();
    
    // Draw particles
    drawParticles();
    
    // Render Canvas UI (on top of everything)
    if (game.uiManager) {
        game.uiManager.render();
    }
    
    // Draw tooltips (must be last, on top of everything)
    drawButtonTooltip();
    drawFloorTooltip();
    
    ctx.restore();
}

// Draw tooltip for UIButtons
function drawButtonTooltip() {
    if (!game.mouseX || !game.mouseY) return;
    
    // Find hovered button with tooltip text
    let hoveredButton = null;
    for (const component of game.uiManager.components) {
        if (component instanceof UIButton && component.hovered && component.tooltipText) {
            hoveredButton = component;
            break;
        }
    }
    
    if (!hoveredButton) return;
    
    const ctx = game.ctx;
    const tooltipLines = hoveredButton.tooltipText.split('\n');
    
    // Calculate tooltip size
    const padding = 8;
    const lineHeight = 14;
    const fontSize = 12;
    ctx.font = `${scaledSize(fontSize)}px "Arial"`;
    
    let maxWidth = 0;
    tooltipLines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });
    
    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = tooltipLines.length * lineHeight + padding * 2;
    
    // Position tooltip near mouse, but keep it on screen
    let tooltipX = game.mouseX + 15;
    let tooltipY = game.mouseY - tooltipHeight - 10;
    
    // Keep tooltip on screen
    if (tooltipX + tooltipWidth > game.canvas.width) {
        tooltipX = game.mouseX - tooltipWidth - 15;
    }
    if (tooltipY < 0) {
        tooltipY = game.mouseY + 20;
    }
    if (tooltipY + tooltipHeight > game.canvas.height) {
        tooltipY = game.canvas.height - tooltipHeight - 10;
    }
    
    // Draw tooltip background
    ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip text
    ctx.fillStyle = '#F0F0F0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    tooltipLines.forEach((line, index) => {
        const textX = tooltipX + padding;
        const textY = tooltipY + padding + index * lineHeight;
        
        // Color first line differently (upgrade name)
        if (index === 0) {
            ctx.fillStyle = '#FFD700';
        } else if (line.includes('Cost:')) {
            ctx.fillStyle = line.includes('MAX') ? '#32CD32' : '#90EE90';
        } else {
            ctx.fillStyle = '#CCCCCC';
        }
        
        ctx.fillText(line, textX, textY);
    });
}

// Draw tooltip when hovering over floor areas
function drawFloorTooltip() {
    if (!game.hoveredFloor || !game.mouseX || !game.mouseY) return;
    
    const ctx = game.ctx;
    const floor = game.hoveredFloor;
    const generator = floor.generator;
    
    // Tooltip content
    let tooltipLines = [];
    
    if (generator.owned > 0) {
        // Show info for owned generator
        tooltipLines.push(`${generator.name} (${generator.owned})`);
        tooltipLines.push(`Producing: ${formatNumber(generator.getIncome())}/s`);
        tooltipLines.push(`Next: ${formatNumber(generator.getCost())} gold`);
    } else {
        // Show purchase info for unowned generator
        tooltipLines.push(`Build: ${generator.name}`);
        tooltipLines.push(`Cost: ${formatNumber(generator.getCost())} gold`);
        tooltipLines.push(`Income: +${formatNumber(generator.baseIncome)}/s`);
        
        if (!generator.canAfford(game.gold)) {
            const needed = generator.getCost() - game.gold;
            tooltipLines.push(`Need: ${formatNumber(needed)} more`);
        } else {
            tooltipLines.push('Click to build!');
        }
    }
    
    // Calculate tooltip size
    const padding = 8;
    const lineHeight = 12;
    const fontSize = 14;
    ctx.font = `${scaledSize(fontSize)}px "Arial"`;
    
    let maxWidth = 0;
    tooltipLines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });
    
    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = tooltipLines.length * lineHeight + padding * 2;
    
    // Position tooltip near mouse, but keep it on screen
    let tooltipX = game.mouseX + 10;
    let tooltipY = game.mouseY - tooltipHeight - 10;
    
    // Keep tooltip on screen
    if (tooltipX + tooltipWidth > game.canvas.width) {
        tooltipX = game.mouseX - tooltipWidth - 10;
    }
    if (tooltipY < 0) {
        tooltipY = game.mouseY + 20;
    }
    
    // Draw tooltip background
    ctx.fillStyle = 'rgba(44, 44, 44, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip border
    ctx.strokeStyle = generator.canAfford(game.gold) || generator.owned > 0 ? '#FFD700' : '#FF6B6B';
    ctx.lineWidth = 1;
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip text
    ctx.fillStyle = '#F0F0F0';
    ctx.textAlign = 'left';
    
    tooltipLines.forEach((line, index) => {
        const textX = tooltipX + padding;
        const textY = tooltipY + padding + (index + 1) * lineHeight - 2;
        
        // Color first line differently
        if (index === 0) {
            ctx.fillStyle = generator.owned > 0 ? '#90EE90' : (generator.canAfford(game.gold) ? '#FFD700' : '#FF6B6B');
        } else if (index === tooltipLines.length - 1 && generator.canAfford(game.gold) && generator.owned === 0) {
            ctx.fillStyle = '#90EE90'; // Green for "Click to build!"
        } else {
            ctx.fillStyle = '#F0F0F0';
        }
        
        ctx.fillText(line, textX, textY);
    });
}

// Draw underground cross-section
function drawUnderground() {
    const ctx = game.ctx;

    // Debug tracking removed to reduce console spam
    
    // Dynamic positioning for underground using responsive layout
    const undergroundStart = getUndergroundStartY();
    const floorHeight = getFloorHeight();
    
    // Calculate correct coordinates: leftWidth = middle divider of game world
    const gameWorldStartX = getGameWorldStartX(); // Left edge of game world (after nav)
    const gameWorldWidth = game.canvas.width - gameWorldStartX;
    const leftWidth = gameWorldStartX + gameWorldWidth / 2; // Middle of game world
    
    // Clear floor areas for this frame
    game.floorAreas = [];
    
    // Draw underground background (deeper browns) - only in game world area
    const undergroundGradient = ctx.createLinearGradient(gameWorldStartX, undergroundStart, gameWorldStartX, undergroundStart + floorHeight * 4);
    undergroundGradient.addColorStop(0, '#654321');
    undergroundGradient.addColorStop(1, '#4A3C28');
    ctx.fillStyle = undergroundGradient;
    ctx.fillRect(gameWorldStartX, undergroundStart, gameWorldWidth, floorHeight * 4);
    
    // Draw floors 1-3 + future floors
    for (let floor = 1; floor <= 6; floor++) {
        const y = undergroundStart + (floor - 1) * floorHeight;
        if (floor <= 4) {
            // Floor drawing debug removed to reduce console spam
        }
        drawFloor(ctx, floor, y, leftWidth, floorHeight);
    }
    
    // Draw the central dividing wall (between economy and dungeon sides)
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(leftWidth - 4, undergroundStart, 8, floorHeight * 3);
    
    // Add wall texture
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(leftWidth - 3, undergroundStart + i * 20);
        ctx.lineTo(leftWidth + 3, undergroundStart + i * 20);
        ctx.stroke();
    }
}

// Draw individual floor
function drawFloor(ctx, floorNumber, y, leftWidth, floorHeight) {
    // Left side (Economy) - show generators if owned or available
    const generator = game.generators.find(g => g.floor === floorNumber);
    const controlZoneWidth = 200; // LEFT extension for controls
    
    if (generator) {
        // Draw floor background extending LEFT into control zone
        let floorColor;
        switch(floorNumber) {
            case 1: floorColor = '#8B7355'; break; // Brown dirt for drilling
            case 2: floorColor = '#654321'; break; // Darker brown for blasting
            case 3: floorColor = '#2F4F4F'; break; // Dark slate gray for crystals
            case 4: floorColor = '#8B4513'; break; // Brown for shadow miners (breached floor) - visible for debugging
            default: floorColor = '#8B7355'; break;
        }
        
        // Draw floor background in generator area (left half of game world)
        const gameWorldStartX = getGameWorldStartX();
        ctx.fillStyle = floorColor;
        ctx.fillRect(gameWorldStartX, y, leftWidth - gameWorldStartX, floorHeight);
        
        // Add clickable floor area for purchasing (generator area only)
        game.floorAreas.push({
            x: gameWorldStartX,
            y: y,
            width: leftWidth - gameWorldStartX,
            height: floorHeight,
            floor: floorNumber,
            generator: generator
        });
        
        // Draw generator-specific content in main area (if owned)
        if (generator.owned > 0) {
            drawGeneratorArea(ctx, generator, y, leftWidth, floorHeight);
        }
        
        // Floor labels removed - using integrated buttons instead
    } else {
        // Unowned floor - show different states based on availability
        let unownedColor = '#3A3A3A';
        let hintElements = [];
        let showPurchaseHint = false;
        
        if (generator && floorNumber <= 3) {
            const canAfford = generator.canAfford(game.gold);
            const controlZoneWidth = 200;
            showPurchaseHint = true;
            
            // Add clickable floor area for unowned generators
            game.floorAreas.push({
                x: -controlZoneWidth,
                y: y,
                width: leftWidth + controlZoneWidth - 4,
                height: floorHeight,
                floor: floorNumber,
                generator: generator
            });
            
            // Color based on affordability
            if (canAfford) {
                unownedColor = '#4A5A3A'; // Greenish tint when affordable
                // Add subtle glow effect
                ctx.shadowColor = '#90EE90';
                ctx.shadowBlur = 8;
                ctx.fillStyle = unownedColor;
                ctx.fillRect(-controlZoneWidth, y, leftWidth + controlZoneWidth - 4, floorHeight);
                ctx.shadowBlur = 0;
            } else {
                switch(floorNumber) {
                    case 1:
                        unownedColor = '#4A3A2A'; // Brown dirt for drilling
                        break;
                    case 2:
                        unownedColor = '#3A2A2A'; // Darker rock for blasting
                        break;
                    case 3:
                        unownedColor = '#2A2A3A'; // Bluish rock for crystals
                        break;
                }
                ctx.fillStyle = unownedColor;
                ctx.fillRect(-controlZoneWidth, y, leftWidth + controlZoneWidth - 4, floorHeight);
            }
            
            // Hover effects and purchase text removed - using integrated buttons now
            
        } else if (floorNumber <= 3) {
            const controlZoneWidth = 200;
            ctx.fillStyle = unownedColor;
            ctx.fillRect(-controlZoneWidth, y, leftWidth + controlZoneWidth - 4, floorHeight);
        } else {
            // Future floors (4+) - show as mysterious/sealed
            unownedColor = '#1A1A1A';
            ctx.fillStyle = unownedColor;
            ctx.fillRect(0, y, leftWidth - 4, floorHeight);
            
            // Add mysterious elements for floors 4+
            if (floorNumber === 4) {
                // Add red glow for monster floor
                ctx.shadowColor = '#DC143C';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#2A1A1A';
                ctx.fillRect(10, y + 10, leftWidth - 24, floorHeight - 20);
                ctx.shadowBlur = 0;
                
                // Add warning text
                ctx.fillStyle = '#DC143C';
                ctx.font = `${scaledSize(12)}px "Arial"`;
                ctx.textAlign = 'center';
                ctx.fillText('🚫 SEALED', leftWidth / 2, y + floorHeight / 2 - 5);
                ctx.fillText('Monsters Ahead!', leftWidth / 2, y + floorHeight / 2 + 5);
            } else if (floorNumber >= 5) {
                // Show "coming soon" for floors 5+
                ctx.fillStyle = '#444';
                ctx.font = `${scaledSize(12)}px "Arial"`;
                ctx.textAlign = 'center';
                ctx.fillText('🌟 Coming Soon...', leftWidth / 2, y + floorHeight / 2);
            }
        }
        
        // Add floor-specific hints only for available floors
        if (generator && floorNumber <= 3 && !showPurchaseHint) {
            switch(floorNumber) {
                case 1:
                    hintElements = [{ type: 'drill', color: '#696969' }];
                    break;
                case 2:
                    hintElements = [{ type: 'blast', color: '#DC143C' }];
                    break;
                case 3:
                    hintElements = [{ type: 'crystal', color: '#9966CC' }];
                    break;
            }
        }
        
        // Add floor-specific hints
        hintElements.forEach(hint => {
            switch(hint.type) {
                case 'drill':
                    // Show faint drill outline
                    ctx.fillStyle = hint.color + '40'; // Semi-transparent
                    ctx.fillRect(leftWidth/2 - 10, y + floorHeight/2 - 15, 20, 30);
                    break;
                case 'blast':
                    // Show dynamite silhouettes
                    ctx.fillStyle = hint.color + '60';
                    for (let i = 0; i < 3; i++) {
                        ctx.fillRect(leftWidth/2 - 10 + i * 7, y + floorHeight - 20, 3, 12);
                    }
                    break;
                case 'crystal':
                    // Show crystal formations faintly
                    ctx.fillStyle = hint.color + '40';
                    for (let i = 0; i < 3; i++) {
                        const crystalX = leftWidth/2 - 15 + i * 15;
                        const crystalY = y + floorHeight - 15;
                        ctx.beginPath();
                        ctx.moveTo(crystalX, crystalY);
                        ctx.lineTo(crystalX - 3, crystalY - 8);
                        ctx.lineTo(crystalX, crystalY - 12);
                        ctx.lineTo(crystalX + 3, crystalY - 8);
                        ctx.closePath();
                        ctx.fill();
                    }
                    break;
            }
        });
        
        // Add some background rock texture
        ctx.fillStyle = '#2A2A2A';
        for (let i = 0; i < 5; i++) {
            const rockX = Math.sin(i * 2 + floorNumber) * 50 + leftWidth / 2;
            const rockY = y + Math.cos(i * 3 + floorNumber) * 20 + floorHeight / 2;
            ctx.beginPath();
            ctx.arc(rockX, rockY, 3 + Math.sin(i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Right side (Dungeon) - show illuminated dungeon if breached, otherwise sealed
    if (game.breachTriggered && floorNumber === 4) {
        // Illuminated dungeon for Floor 4
        ctx.fillStyle = '#2A2A1A'; // Dark cave color
        ctx.fillRect(leftWidth + 4, y, leftWidth - 4, floorHeight);
        
        // Add flickering torchlight effect
        const flicker = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 140, 0, ${flicker * 0.3})`;
        ctx.fillRect(leftWidth + 20, y + 10, 20, floorHeight - 20);
        
        // Add cave details
        ctx.fillStyle = '#1A1A1A';
        // Stalactites
        for (let i = 0; i < 3; i++) {
            const x = leftWidth + 30 + i * 30;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 5, y + 15);
            ctx.lineTo(x + 5, y + 15);
            ctx.closePath();
            ctx.fill();
        }

        // 🎯 VISUAL DEBUG: Show monster spawn point with bright red X
        const floor4Layout = DUNGEON_LAYOUT.floors[4];
        if (floor4Layout) {
            const spawnX = gameWorldRatioToCanvasX(floor4Layout.startX);
            const spawnY = y + floorHeight / 2; // Center of floor

            ctx.strokeStyle = '#FF0000'; // Bright red
            ctx.lineWidth = 3;
            ctx.beginPath();
            // Draw X
            ctx.moveTo(spawnX - 10, spawnY - 10);
            ctx.lineTo(spawnX + 10, spawnY + 10);
            ctx.moveTo(spawnX + 10, spawnY - 10);
            ctx.lineTo(spawnX - 10, spawnY + 10);
            ctx.stroke();

            // Add text label
            ctx.fillStyle = '#FFFF00'; // Yellow text
            ctx.font = 'bold 12px Arial';
            ctx.fillText('SPAWN', spawnX + 15, spawnY);
        }
        
        // Floor rubble
        ctx.fillStyle = '#333';
        for (let i = 0; i < 5; i++) {
            const rubbleX = leftWidth + 10 + Math.sin(i * 2) * 40 + 40;
            const rubbleY = y + floorHeight - 8;
            ctx.fillRect(rubbleX, rubbleY, 6, 4);
        }
        
        // Breach warning text
        ctx.fillStyle = '#DC143C';
        ctx.font = `${scaledSize(12)}px "Arial"`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ BREACHED', leftWidth + leftWidth / 2, y + floorHeight / 2 - 8);
        ctx.fillText('Monsters Active!', leftWidth + leftWidth / 2, y + floorHeight / 2 + 8);
    } else {
        // Sealed dungeon
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(leftWidth + 4, y, leftWidth - 4, floorHeight);
        
        // Add "SEALED" text for now
        ctx.fillStyle = '#666';
        ctx.font = `${scaledSize(14)}px "Arial"`;
        ctx.textAlign = 'center';
        ctx.fillText('SEALED', leftWidth + leftWidth / 2, y + floorHeight / 2);
    }
    
    // Draw ladders for pathfinding visualization
    if (floorNumber >= 1 && floorNumber <= 4) {
        drawLadders(ctx, floorNumber, y, leftWidth, floorHeight);
    }
    
    // Draw floor separator line
    ctx.strokeStyle = '#2F2F2F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + floorHeight);
    ctx.lineTo(game.canvas.width, y + floorHeight);
    ctx.stroke();
}

// Draw ladder sprites at floor transitions for pathfinding visualization
function drawLadders(ctx, floorNumber, y, leftWidth, floorHeight) {
    const canvasWidth = game.canvas.width;
    const floorLayout = DUNGEON_LAYOUT.floors[floorNumber];
    
    if (!floorLayout) return;
    
    // Determine which ladder position to draw based on floor's END position
    let ladderX;
    let isLeftLadder = false;
    
    if (floorLayout.endX < 0.6) { 
        // Floor ends on left side - draw left ladder
        ladderX = gameWorldRatioToCanvasX(DUNGEON_LAYOUT.ladders.left);
        isLeftLadder = true;
    } else {
        // Floor ends on right side - draw right ladder
        ladderX = gameWorldRatioToCanvasX(DUNGEON_LAYOUT.ladders.right);
        isLeftLadder = false;
    }
    
    // Draw ladder sprite at the calculated position
    // Left ladders should be drawn at the divider between economy and dungeon
    // Right ladders should be drawn at the right edge of dungeon
    if (isLeftLadder) {
        // Draw left ladder at the middle divider (slightly overlapping both sides)
        drawLadderSprite(ctx, leftWidth + 2, y, floorHeight); // Just inside dungeon side
        
        // Add a "connection" showing monsters climb between sides (stay within game world)
        drawLadderConnection(ctx, leftWidth, leftWidth + 14, y, floorHeight);
    } else {
        // Draw right ladder at the specified position
        if (ladderX >= leftWidth) {
            drawLadderSprite(ctx, ladderX, y, floorHeight);
        }
    }
    
    // Add directional arrow to show movement direction
    drawMovementArrow(ctx, floorNumber, y, leftWidth, floorHeight);
}

// Draw individual ladder sprite
function drawLadderSprite(ctx, x, y, height) {
    const ladderWidth = 12;
    const rungSpacing = height / 6;
    
    // Ladder sides (vertical rails)
    ctx.strokeStyle = '#8B4513'; // Brown wood
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - ladderWidth/2, y);
    ctx.lineTo(x - ladderWidth/2, y + height);
    ctx.moveTo(x + ladderWidth/2, y);
    ctx.lineTo(x + ladderWidth/2, y + height);
    ctx.stroke();
    
    // Ladder rungs (horizontal steps)
    ctx.strokeStyle = '#654321'; // Darker brown
    ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
        const rungY = y + (i * rungSpacing);
        ctx.beginPath();
        ctx.moveTo(x - ladderWidth/2, rungY);
        ctx.lineTo(x + ladderWidth/2, rungY);
        ctx.stroke();
    }
    
    // Add small glow effect to make ladders more visible
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'; // Yellow glow
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - ladderWidth/2, y);
    ctx.lineTo(x - ladderWidth/2, y + height);
    ctx.moveTo(x + ladderWidth/2, y);
    ctx.lineTo(x + ladderWidth/2, y + height);
    ctx.stroke();
}

// Draw ladder connection between economy and dungeon sides
function drawLadderConnection(ctx, startX, endX, y, height) {
    // Draw a bridge/platform showing connection between sides
    ctx.fillStyle = '#8B4513'; // Brown wood color
    ctx.fillRect(startX, y + height - 8, endX - startX, 6);
    
    // Add border
    ctx.strokeStyle = '#654321'; // Darker brown
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, y + height - 8, endX - startX, 6);
    
    // Add small "ladder" markings
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let x = startX + 3; x < endX - 3; x += 4) {
        ctx.beginPath();
        ctx.moveTo(x, y + height - 7);
        ctx.lineTo(x, y + height - 3);
        ctx.stroke();
    }
}

// Draw movement direction arrows for clarity
function drawMovementArrow(ctx, floorNumber, y, leftWidth, floorHeight) {
    const floorLayout = DUNGEON_LAYOUT.floors[floorNumber];
    if (!floorLayout) return;
    
    const arrowY = y + floorHeight / 2;
    const arrowSize = 8;
    
    // Position arrow in middle of dungeon area
    const dungeonCenter = leftWidth + (game.canvas.width - leftWidth) / 2;
    
    // Draw arrow based on floor direction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Semi-transparent white
    ctx.strokeStyle = '#FFD700'; // Gold outline
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    if (floorLayout.direction === 1) { // Moving right
        ctx.moveTo(dungeonCenter - arrowSize, arrowY - arrowSize/2);
        ctx.lineTo(dungeonCenter + arrowSize, arrowY);
        ctx.lineTo(dungeonCenter - arrowSize, arrowY + arrowSize/2);
    } else { // Moving left
        ctx.moveTo(dungeonCenter + arrowSize, arrowY - arrowSize/2);
        ctx.lineTo(dungeonCenter - arrowSize, arrowY);
        ctx.lineTo(dungeonCenter + arrowSize, arrowY + arrowSize/2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Draw generator-specific area details
function drawGeneratorArea(ctx, generator, y, leftWidth, floorHeight) {
    // Position generator content in the center of the GENERATOR area (left half of game world)
    const gameWorldStartX = getGameWorldStartX();
    const generatorAreaWidth = leftWidth - gameWorldStartX; // Width of generator area
    const centerX = gameWorldStartX + generatorAreaWidth / 2; // Center of generator area
    const centerY = y + floorHeight / 2;
    
    switch(generator.id) {
        case 'drill_operator':
            // Draw drill rig
            ctx.fillStyle = '#696969';
            ctx.fillRect(centerX - 15, y + 10, 30, 40);
            
            // Animated drill bit
            const drillRotation = (game.animationTime / 100) % (Math.PI * 2);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(drillRotation);
            ctx.fillStyle = '#B8860B';
            ctx.fillRect(-2, -15, 4, 30);
            ctx.restore();
            
            // Add sparks effect
            if (Math.random() > 0.7) {
                for (let i = 0; i < 3; i++) {
                    const sparkX = centerX + (Math.random() - 0.5) * 20;
                    const sparkY = y + floorHeight - 10;
                    ctx.fillStyle = '#FFA500';
                    ctx.fillRect(sparkX, sparkY, 1, 1);
                }
            }
            break;
            
        case 'blast_engineer':
            // Draw blast site with dynamite
            ctx.fillStyle = '#DC143C'; // Red dynamite
            for (let i = 0; i < 3; i++) {
                const dynX = centerX - 20 + i * 20;
                const dynY = y + floorHeight - 25;
                ctx.fillRect(dynX - 2, dynY, 4, 15);
                
                // Fuse wire
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(dynX, dynY);
                ctx.lineTo(dynX + Math.sin(game.animationTime / 200 + i) * 10, dynY - 10);
                ctx.stroke();
            }
            
            // Explosion effects (random)
            if (Math.random() > 0.85) {
                ctx.fillStyle = '#FFA500';
                const explosionSize = Math.random() * 15 + 10;
                ctx.beginPath();
                ctx.arc(centerX, y + floorHeight - 15, explosionSize, 0, Math.PI * 2);
                ctx.fill();
                
                // White flash in center
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(centerX, y + floorHeight - 15, explosionSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Rock debris
            ctx.fillStyle = '#696969';
            for (let i = 0; i < 5; i++) {
                const debrisX = centerX + Math.sin(game.animationTime / 100 + i) * 30;
                const debrisY = y + 20 + Math.cos(game.animationTime / 150 + i) * 10;
                ctx.fillRect(debrisX, debrisY, 2, 2);
            }
            break;
            
        case 'crystal_harvester':
            // Draw crystal formations
            const crystalColors = ['#9966CC', '#4169E1', '#00CED1', '#98FB98'];
            
            for (let i = 0; i < 4; i++) {
                const crystalX = centerX - 30 + i * 20;
                const crystalY = y + floorHeight - 20;
                const height = 15 + Math.sin(game.animationTime / 400 + i) * 3;
                
                // Crystal body
                ctx.fillStyle = crystalColors[i];
                ctx.beginPath();
                ctx.moveTo(crystalX, crystalY);
                ctx.lineTo(crystalX - 4, crystalY - height);
                ctx.lineTo(crystalX, crystalY - height - 5);
                ctx.lineTo(crystalX + 4, crystalY - height);
                ctx.closePath();
                ctx.fill();
                
                // Crystal glow
                const glowIntensity = Math.sin(game.animationTime / 200 + i) * 0.3 + 0.7;
                ctx.shadowColor = crystalColors[i];
                ctx.shadowBlur = 5 * glowIntensity;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            // Harvesting tool
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(centerX + 20, y + 15, 3, 25);
            
            // Tool head (pickaxe style)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(centerX + 18, y + 15, 8, 4);
            
            // Sparkles around crystals
            if (Math.random() > 0.6) {
                for (let i = 0; i < 6; i++) {
                    const sparkleX = centerX + (Math.random() - 0.5) * 60;
                    const sparkleY = y + 10 + Math.random() * (floorHeight - 20);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(sparkleX, sparkleY, 1, 1);
                }
            }
            break;
            
        default:
            // Generic generator representation
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(centerX - 10, centerY - 10, 20, 20);
            break;
    }
    
    // Add some animated elements to show activity
    if (generator.owned > 0) {
        const pulse = Math.sin(game.animationTime / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(centerX - 20, y + 5, 4, 4);
        ctx.globalAlpha = 1.0;
    }
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
        testFloors: () => {
            // Add enough gold to test all floors
            game.gold = 50000;
            updateGoldDisplay();
            // Generators now handled by canvas UI
            console.log('💰 Added 50K gold for testing floors 1-3');
        },
        buyGenerator: (id) => {
            const generator = game.generators.find(g => g.id === id);
            if (generator && generator.purchase(game)) {
                console.log(`✅ Purchased ${generator.name}`);
            } else {
                console.log(`❌ Cannot purchase ${id}`);
            }
        },
        showGenerators: () => {
            console.log('Available generators:');
            game.generators.forEach(g => {
                console.log(`- ${g.id}: ${g.name} (Floor ${g.floor}) - Cost: ${formatNumber(g.getCost())} - Owned: ${g.owned}`);
            });
        },
        buyUpgrade: (id) => {
            const economyUpgrade = game.upgrades.economy.find(u => u.id === id);
            const clickUpgrade = game.upgrades.clicking.find(u => u.id === id);
            const upgrade = economyUpgrade || clickUpgrade;
            if (upgrade && upgrade.purchase()) {
                console.log(`✅ Purchased ${upgrade.name} level ${upgrade.currentLevel}`);
            } else {
                console.log(`❌ Cannot purchase ${id}`);
            }
        },
        showUpgrades: () => {
            console.log('Economy upgrades:');
            game.upgrades.economy.forEach(u => {
                console.log(`- ${u.id}: ${u.name} (${u.currentLevel}/${u.maxLevel}) - Cost: ${formatNumber(u.getCost())}`);
            });
            console.log('Click upgrades:');
            game.upgrades.clicking.forEach(u => {
                console.log(`- ${u.id}: ${u.name} (${u.currentLevel}/${u.maxLevel}) - Cost: ${formatNumber(u.getCost())}`);
            });
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
        },
        
        triggerBreach: () => {
            console.log('🔥 Manually triggering Floor 4 breach...');
            triggerBreach();
        },
        spawnHero: (type = 'warrior') => {
            spawnHero(type);
            console.log(`✨ Spawned ${type} hero manually`);
        },
        killAllMonsters: () => {
            game.monsters.forEach(monster => monster.die());
            game.monsters = [];
            console.log('💀 All monsters killed');
        },
        killAllHeroes: () => {
            game.heroes.forEach(hero => hero.die());
            game.heroes = game.heroes.filter(hero => hero.state !== 'dead');
            console.log('💀 All heroes killed');
        },
        save: () => {
            SaveSystem.save();
        },
        load: () => {
            const saveData = SaveSystem.load();
            if (saveData) {
                SaveSystem.applySaveData(saveData);
                console.log('Save loaded successfully');
            } else {
                console.log('No save data found');
            }
        },
        reset: () => {
            SaveSystem.reset();
        },
        testOffline: (minutes = 5) => {
            // Simulate being offline by backdating the save
            const saveData = SaveSystem.load();
            if (saveData) {
                saveData.timestamp = Date.now() - (minutes * 60 * 1000);
                localStorage.setItem('dungeonDelverSave', JSON.stringify(saveData));
                location.reload();
            } else {
                console.log('No save data to test offline with');
            }
        },
        buyDrillOperator: () => {
            const drill = game.generators.find(g => g.id === 'drill_operator');
            if (drill) {
                drill.purchase(game);
            }
        },
        testUndergroundReveal: () => {
            if (!game.camera.undergroundRevealed) {
                triggerUndergroundReveal();
            } else {
                console.log('Underground already revealed');
            }
        },
        resetCamera: () => {
            game.camera.y = 0;
            game.camera.targetY = 0;
            game.camera.transitioning = false;
            game.camera.undergroundRevealed = false;
            console.log('Camera reset to surface');
        },
        spawnMonster: () => {
            spawnMonster();
            console.log('👹 Spawned monster manually for testing');
        },
        debugMonsterPositions: () => {
            // Monster position debug removed to reduce console spam
            game.monsters.forEach((monster, i) => {
                const layout = DUNGEON_LAYOUT.floors[monster.floor];
                const targetX = layout ? gameWorldRatioToCanvasX(layout.endX) : 'NO LAYOUT';
                // Individual monster position logging removed to reduce spam
            });
        },
        testLadderPositions: () => {
            console.log('🪜 Responsive layout positions:');
            console.log(`  Canvas: ${game.canvas.width}x${game.canvas.height}px`);
            console.log(`  Left column: ${getLeftColumnWidth()}px`);
            console.log(`  Game world starts at: ${getGameWorldStartX()}px`);
            console.log(`  Left ladder: ${Math.round(gameWorldRatioToCanvasX(DUNGEON_LAYOUT.ladders.left))}px`);
            console.log(`  Right ladder: ${Math.round(gameWorldRatioToCanvasX(DUNGEON_LAYOUT.ladders.right))}px`);
            console.log('🎯 Floor targets:');
            Object.entries(DUNGEON_LAYOUT.floors).forEach(([floor, layout]) => {
                console.log(`  Floor ${floor}: ${Math.round(gameWorldRatioToCanvasX(layout.startX))}px → ${Math.round(gameWorldRatioToCanvasX(layout.endX))}px (${layout.direction > 0 ? 'RIGHT' : 'LEFT'})`);
            });
        },
        showFloorYCoordinates: () => {
            console.log('📐 Floor Y-coordinates:');
            for (let floor = 1; floor <= 6; floor++) {
                const y = getFloorY(floor);
                console.log(`  Floor ${floor}: ${Math.round(y)}px`);
            }
        },
        debugFloor4Position: () => {
            const floor4Y = getFloorY(4);
            const floor3Y = getFloorY(3);
            const floorHeight = getFloorHeight();
            console.log('🔍 Floor 4 Debug Analysis:');
            console.log(`  Floor 3 Y: ${Math.round(floor3Y)}px`);
            console.log(`  Floor 4 Y: ${Math.round(floor4Y)}px`);
            console.log(`  Floor height: ${floorHeight}px`);
            console.log(`  Difference: ${Math.round(floor4Y - floor3Y)}px`);

            // Check if any monster exists and where it is
            if (game.monsters.length > 0) {
                const monster = game.monsters[0];
                console.log(`  Monster Y: ${Math.round(monster.y)}px`);
                console.log(`  Monster floor: ${monster.floor}`);
                console.log(`  Offset from Floor 4: ${Math.round(monster.y - floor4Y)}px`);

                // Check rendering offset
                const size = scaledSize(12);
                console.log(`  Scaled size: ${size}px`);
                console.log(`  Sprite renders at: ${Math.round(monster.y - size)}px (${size}px above monster Y)`);
                console.log(`  Scale factor: ${game.scaleFactor}`);
            }
        },
        spawnBoss: (floor = 4, type = 'goblin_chief') => {
            spawnBoss(floor, type);
            console.log(`👑 Spawned ${type} boss on Floor ${floor}`);
        },
        killBoss: () => {
            const boss = game.monsters.find(m => m.isBoss);
            if (boss) {
                boss.die();
                console.log(`👑💀 Boss killed manually`);
            } else {
                console.log('No boss found');
            }
        },
        sealFloor: (floor) => {
            game.securedFloors = game.securedFloors || [];
            if (!game.securedFloors.includes(floor)) {
                game.securedFloors.push(floor);
            }
            const floorGenerator = game.generators.find(g => g.floor === floor);
            if (floorGenerator) {
                floorGenerator.enabled = true;
                console.log(`🔓 Floor ${floor} manually secured! ${floorGenerator.name} enabled!`);
            }
        },
        listBosses: () => {
            const bosses = game.monsters.filter(m => m.isBoss);
            console.log(`👑 Found ${bosses.length} bosses:`);
            bosses.forEach(boss => {
                console.log(`  ${boss.type} on Floor ${boss.floor}, HP: ${boss.health}/${boss.maxHealth}`);
            });
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
    console.log('  debug.save() - Manually save the game');
    console.log('  debug.load() - Manually load the game');
    console.log('  debug.reset() - Reset all progress');
    console.log('  debug.testOffline(minutes) - Simulate offline progress');
    console.log('  debug.buyDrillOperator() - Purchase drill operator (triggers underground)');
    console.log('  debug.testUndergroundReveal() - Manually trigger underground reveal');
    console.log('  debug.resetCamera() - Reset camera to surface view');
    console.log('  debug.triggerBreach() - Manually trigger Floor 4 breach');
    console.log('  debug.spawnHero(type) - Spawn hero manually (default: warrior)');
    console.log('  debug.killAllMonsters() - Kill all monsters');
    console.log('  debug.spawnMonster() - Spawn monster manually for testing');
    console.log('  debug.debugMonsterPositions() - Show monster positions and targets');
    console.log('  debug.testLadderPositions() - Show ladder positions and floor targets');
    console.log('  debug.killAllHeroes() - Kill all heroes');
    console.log('  debug.spawnBoss(floor, type) - Spawn boss manually (default: Floor 4, goblin_chief)');
    console.log('  debug.killBoss() - Kill the current boss');
    console.log('  debug.sealFloor(floor) - Manually seal a floor and enable its generator');
    console.log('  debug.listBosses() - Show all active bosses');
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