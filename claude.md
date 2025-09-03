
#Always read PLANNING.md at the start of every new conversation, check TASKS.md before starting your work, mark completed tasks to TASKS.md immediately, and add newly discovered tasks to TASKS.md when found.

# CLAUDE.md - Dungeon Delver: Idle Empire Development Guide

## Project Overview
Building a browser-based idle/incremental game with auto-battler elements, featuring a mining economy that reveals an underground dungeon filled with monsters. The game combines 1990s adventure game pixel art (King's Quest style) with Cookie Clicker's satisfying feedback mechanics.

## Core Game Concept
- Players start by clicking a mountain to mine gold
- Build a mining economy that expands downward
- At Floor 4, monsters breach the dungeon, requiring heroes to defend
- Balance economic growth with military defense
- Features recurring Blood Moon events that threaten production

## Technical Stack
- **Platform**: Browser-based (HTML5)
- **Rendering**: Canvas with WebGL for effects
- **Art Style**: Pixel art (16x16 tiles, 256-color VGA palette)
- **Resolution**: 320x200 aesthetic upscaled to modern displays
- **Animation**: 8-12 FPS for retro feel
- **Audio**: 8-bit chiptune soundtrack

## Development Phases

### ✅ Phase 1: Core Mining System (COMPLETED)
```javascript
// ✅ IMPLEMENTED FEATURES:
- ✅ Clickable mountain with precise hit detection
- ✅ Gold counter with professional number formatting (K, M, B, T)
- ✅ Surface miners with animated camp and mining cart
- ✅ Dramatic camera pan transition to underground
- ✅ Underground cross-section with Floor 1 drill operators
- ✅ Complete save/load system with offline progress
- ✅ Advanced particle effects with rotation and physics
- ✅ Screen shake and click streak systems
- ✅ 60 FPS performance with object pooling
```

### Phase 2: Combat System
```javascript
// Key features to implement:
- Monster emergence at Floor 4
- Right side dungeon illumination
- Adventurer's Guild building
- Hero spawning and pathfinding
- Simple combat resolution
- Boss fights and floor sealing
```

### Phase 3: Guild Tree & Progression
```javascript
// Key features to implement:
- Branching upgrade tree for guild
- Multiple hero classes
- Power-up collection system
- Floors 5-8 content
- Enhanced visual effects
```

### Phase 4: Blood Moon & Polish
```javascript
// Key features to implement:
- Blood Moon timer system
- Wall breach mechanics
- Floors 9-12 content
- Prestige system
- Full audio implementation
```

## File Structure
```
/project
  /assets
    /sprites
      /heroes (12x12 pixel sprites)
      /monsters (16x16 pixel sprites)
      /bosses (32x32 pixel sprites)
      /generators (animated tiles)
      /ui (buttons, frames, borders)
    /audio
      /sfx (8-bit sound effects)
      /music (chiptune tracks)
  /src
    /core
      game.js (main game loop)
      save.js (save/load system)
    /systems
      economy.js (generators, gold)
      combat.js (hero/monster battles)
      guild.js (upgrade tree)
      bloodmoon.js (event system)
    /ui
      renderer.js (canvas rendering)
      particles.js (effects system)
      animations.js (sprite animations)
    /data
      generators.js (economy config)
      monsters.js (enemy stats)
      heroes.js (hero classes)
      upgrades.js (progression trees)
  index.html
  style.css
```

## Visual Design Specifications

### Color Palette (VGA 256-color)
```css
/* Primary Colors */
--mountain-brown: #8B4513;
--sky-blue: #87CEEB;
--gold-yellow: #FFD700;
--stone-gray: #696969;
--grass-green: #228B22;

/* UI Colors */
--ui-border: #4A4A4A;
--ui-background: #2C2C2C;
--text-light: #F0F0F0;
--text-gold: #FFD700;
--alert-red: #DC143C;
```

### Sprite Specifications
```javascript
const SPRITE_CONFIG = {
  tileSize: 16,
  heroSize: 12,
  monsterSize: 16,
  bossSize: 32,
  animationFPS: 10,
  scaling: 3, // 3x integer scaling for modern displays
};
```

### UI Layout (Split Screen)
```javascript
const LAYOUT = {
  surface: {
    height: 200, // pixels
    showsSky: true,
    showsMountain: true,
    showsCamp: true
  },
  underground: {
    leftWidth: 50, // percentage
    rightWidth: 50, // percentage
    floorHeight: 64, // pixels per floor
    wallThickness: 8 // pixels
  },
  ui: {
    topBar: {
      height: 32, // pixels
      showsGold: true,
      showsGPS: true,
      showsClickPower: true
    },
    bottomPanel: {
      height: 120, // pixels
      leftSection: 'economy', // economy upgrades
      rightSection: 'clicking', // click upgrades
      guildButton: {
        width: 100,
        height: 40,
        position: 'center'
      }
    },
    guildPopup: {
      width: 600,
      height: 400,
      modal: true,
      darkBackground: 0.7 // opacity
    }
  }
};
```

### Detailed UI Layout Mockup
```
FULL GAME VIEW (After Underground Revealed):
┌────────────────────────────────────────────────────────┐
│ GOLD: 142,337 [+55.3/s]    GPS: 55.3    Click: +25    │ <- Top Bar (always visible)
├────────────────────────┬──────────────────────────────┤
│   ECONOMY SIDE (LEFT)  │   DUNGEON SIDE (RIGHT)      │
│                        │                             │
│ F-1: [MINING CAMP]     │   [DECORATIVE ROCK WALL]    │
│  ⛏️ Miners (12)        │   "SURFACE LEVEL"           │
│  Producing: 2.4/s      │                             │
├────────────────────────┤[THICK STONE WALL]───────────┤
│ F1: [DRILL SCENE]      │   [DARK TUNNEL]             │
│  🔧 Drill Op. (5)      │   [Heroes Fighting →]       │
│  Producing: 5.0/s      │   [Goblin] [Hero] [Hero]    │
├────────────────────────┼─────────────────────────────┤
│ F2: [BLAST ZONE]       │   [DARKER TUNNEL]           │
│  💥 Engineers (3)      │   [Boss Room Visible]       │
│  Producing: 30.0/s     │   HP: ████░░░░░░           │
├────────────────────────┼─────────────────────────────┤
│ F3: [CRYSTAL CAVE]     │   [SEALED - SAFE]           │
│  💎 Harvester (2)      │   ✓ Floor Cleared           │
│  Producing: 200.0/s    │                             │
├────────────────────────┴─────────────────────────────┤
│ ECONOMY UPGRADES        │ CLICK UPGRADES              │ <- Bottom Panel
│ ┌─────────────────┐    │ ┌──────────────────┐       │
│ │ Miner Eff. +10% │    │ │ Click Power x2   │       │
│ │ Cost: 1,000g    │    │ │ Cost: 500g       │       │
│ └─────────────────┘    │ └──────────────────┘       │
│ ┌─────────────────┐    │ ┌──────────────────┐       │
│ │ All Prod. +5%   │    │ │ Auto-Click 1/s   │       │
│ │ Cost: 5,000g    │    │ │ Cost: 10,000g    │       │
│ └─────────────────┘    │ └──────────────────┘       │
│         ┌──────────────────────────┐                 │
│         │  ADVENTURER'S GUILD 🏰   │ <- Center Button│
│         │    Click to Manage       │                 │
│         └──────────────────────────┘                 │
└────────────────────────────────────────────────────────┘
```

## UI System Implementation

### Main UI Components
```javascript
class MainUI {
  constructor() {
    this.topBar = new TopBar();
    this.bottomPanel = new BottomPanel();
    this.guildPopup = null; // Created on demand
  }
  
  render(ctx) {
    // Always visible elements
    this.topBar.render(ctx);
    this.bottomPanel.render(ctx);
    
    // Popup overlay if active
    if (this.guildPopup && this.guildPopup.visible) {
      this.renderDarkOverlay(ctx);
      this.guildPopup.render(ctx);
    }
  }
}

class BottomPanel {
  constructor() {
    this.height = 120;
    this.economyUpgrades = [
      {
        id: 'minerEff',
        name: 'Miner Efficiency',
        description: '+10% miner production',
        cost: 1000,
        effect: () => game.generators[0].efficiency *= 1.1,
        icon: '⛏️'
      },
      {
        id: 'globalProd',
        name: 'Global Production',
        description: '+5% all production',
        cost: 5000,
        effect: () => game.globalMultiplier *= 1.05,
        icon: '📈'
      },
      {
        id: 'deeperDrills',
        name: 'Deeper Drills',
        description: '+15% underground production',
        cost: 25000,
        effect: () => game.undergroundBonus *= 1.15,
        icon: '🔧'
      }
    ];
    
    this.clickUpgrades = [
      {
        id: 'clickPower',
        name: 'Click Power',
        description: 'Double click value',
        cost: 500,
        effect: () => game.clickValue *= 2,
        icon: '👆'
      },
      {
        id: 'autoClick',
        name: 'Auto-Clicker',
        description: '1 click per second',
        cost: 10000,
        effect: () => game.autoClickRate += 1,
        icon: '🤖'
      },
      {
        id: 'goldRush',
        name: 'Gold Rush',
        description: '5x clicks for 30s (5min CD)',
        cost: 50000,
        effect: () => game.activateGoldRush(),
        icon: '💰'
      }
    ];
  }
  
  render(ctx) {
    // Left side - Economy upgrades
    this.renderUpgradeSection(ctx, this.economyUpgrades, 'left');
    
    // Right side - Click upgrades  
    this.renderUpgradeSection(ctx, this.clickUpgrades, 'right');
    
    // Center - Guild button
    this.renderGuildButton(ctx);
  }
  
  renderGuildButton(ctx) {
    const button = {
      x: canvas.width / 2 - 50,
      y: canvas.height - 60,
      width: 100,
      height: 40
    };
    
    // Stone button with pixel border
    ctx.fillStyle = game.gold >= 5000 ? '#8B7355' : '#5A4A3A';
    ctx.fillRect(button.x, button.y, button.width, button.height);
    
    // Border
    ctx.strokeStyle = '#4A3A2A';
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);
    
    // Text
    ctx.fillStyle = game.gold >= 5000 ? '#FFD700' : '#888888';
    ctx.font = '12px PixelFont';
    ctx.textAlign = 'center';
    ctx.fillText('🏰 GUILD', button.x + 50, button.y + 25);
    
    if (game.guildLevel === 0 && game.gold >= 5000) {
      // Pulsing glow for first purchase
      this.drawGlow(ctx, button);
    }
  }
}
```

### Guild Popup System
```javascript
class GuildPopup {
  constructor() {
    this.visible = false;
    this.width = 600;
    this.height = 400;
    this.x = (canvas.width - this.width) / 2;
    this.y = (canvas.height - this.height) / 2;
    
    // Tree structure for upgrades
    this.upgradeTree = {
      warriors: {
        name: 'Warrior Path',
        icon: '⚔️',
        branches: [
          {
            id: 'warriorHP',
            name: 'Warrior Health',
            levels: 10,
            costBase: 100,
            effect: (lvl) => `+${lvl * 10}% HP`,
            purchased: 0
          },
          {
            id: 'warriorDmg',
            name: 'Warrior Damage', 
            levels: 10,
            costBase: 150,
            effect: (lvl) => `+${lvl * 10}% DMG`,
            purchased: 0
          },
          {
            id: 'veteranWarrior',
            name: 'Veteran Warriors',
            levels: 1,
            costBase: 5000,
            effect: () => 'Unlock veteran warriors',
            requires: ['warriorHP:5', 'warriorDmg:5'],
            purchased: 0
          }
        ]
      },
      newClasses: {
        name: 'New Classes',
        icon: '📚',
        branches: [
          {
            id: 'unlockArcher',
            name: 'Unlock Archer',
            levels: 1,
            costBase: 10000,
            effect: () => 'Ranged DPS unit',
            purchased: 0
          },
          {
            id: 'unlockRogue',
            name: 'Unlock Rogue',
            levels: 1,
            costBase: 25000,
            effect: () => 'Fast crit unit',
            purchased: 0
          },
          {
            id: 'unlockCleric',
            name: 'Unlock Cleric',
            levels: 1,
            costBase: 50000,
            effect: () => 'Healer unit',
            requires: ['unlockArcher'],
            purchased: 0
          }
        ]
      },
      guildCapacity: {
        name: 'Guild Capacity',
        icon: '🏛️',
        branches: [
          {
            id: 'heroSlots',
            name: 'Hero Slots',
            levels: 10,
            costBase: 500,
            effect: (lvl) => `${lvl + 1} max heroes`,
            purchased: 0
          },
          {
            id: 'spawnRate',
            name: 'Spawn Rate',
            levels: 5,
            costBase: 1000,
            effect: (lvl) => `${30 - lvl * 5}s spawn time`,
            purchased: 0
          },
          {
            id: 'revivalSpeed',
            name: 'Revival Speed',
            levels: 5,
            costBase: 2000,
            effect: (lvl) => `-${lvl * 10}% death timer`,
            purchased: 0
          }
        ]
      }
    };
    
    this.selectedPath = 'warriors';
    this.scrollY = 0;
  }
  
  show() {
    this.visible = true;
    game.paused = true; // Pause game while in menu
  }
  
  hide() {
    this.visible = false;
    game.paused = false;
  }
  
  render(ctx) {
    // Popup background (parchment style)
    ctx.fillStyle = '#F4E8D0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Border (ornate stone frame)
    this.drawOrnateFrame(ctx);
    
    // Title
    ctx.fillStyle = '#4A3A2A';
    ctx.font = 'bold 20px PixelFont';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ ADVENTURER\'S GUILD ⚔️', this.x + this.width/2, this.y + 30);
    
    // Tab buttons for paths
    this.renderPathTabs(ctx);
    
    // Upgrade tree for selected path
    this.renderUpgradeTree(ctx);
    
    // Close button
    this.renderCloseButton(ctx);
    
    // Guild stats sidebar
    this.renderGuildStats(ctx);
  }
  
  renderUpgradeTree(ctx) {
    const path = this.upgradeTree[this.selectedPath];
    let yOffset = 100;
    
    ctx.font = '14px PixelFont';
    ctx.fillStyle = '#2A2A2A';
    
    path.branches.forEach(upgrade => {
      const x = this.x + 50;
      const y = this.y + yOffset;
      
      // Check if requirements met
      const available = this.checkRequirements(upgrade);
      const maxed = upgrade.purchased >= upgrade.levels;
      
      // Draw upgrade box
      ctx.fillStyle = maxed ? '#4A7C4A' : (available ? '#8B7355' : '#5A5A5A');
      ctx.fillRect(x, y, 300, 60);
      
      // Name and level
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px PixelFont';
      ctx.fillText(upgrade.name, x + 10, y + 20);
      ctx.font = '10px PixelFont';
      ctx.fillText(`Level ${upgrade.purchased}/${upgrade.levels}`, x + 10, y + 35);
      
      // Effect description
      const effectText = typeof upgrade.effect === 'function' 
        ? upgrade.effect(upgrade.purchased + 1)
        : upgrade.effect;
      ctx.fillText(effectText, x + 10, y + 50);
      
      // Cost
      if (!maxed) {
        const cost = this.calculateCost(upgrade);
        ctx.fillStyle = game.gold >= cost ? '#FFD700' : '#CC0000';
        ctx.fillText(`Cost: ${formatNumber(cost)}g`, x + 200, y + 30);
      }
      
      // Purchase button
      if (available && !maxed) {
        ctx.fillStyle = '#4A7C4A';
        ctx.fillRect(x + 250, y + 10, 40, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('BUY', x + 270, y + 35);
      }
      
      yOffset += 70;
    });
  }
  
  renderGuildStats(ctx) {
    const statsX = this.x + this.width - 150;
    const statsY = this.y + 100;
    
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(statsX, statsY, 140, 200);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px PixelFont';
    ctx.fillText('Guild Stats', statsX + 10, statsY + 20);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px PixelFont';
    const stats = [
      `Heroes: ${game.heroes.length}/${game.maxHeroes}`,
      `Spawn: ${game.heroSpawnRate}s`,
      `Warriors: ${game.warriorCount}`,
      `Archers: ${game.archerCount}`,
      `Rogues: ${game.rogueCount}`,
      `Clerics: ${game.clericCount}`,
      '',
      `Total Kills: ${game.totalKills}`,
      `Bosses Slain: ${game.bossesKilled}`,
      `Floors Cleared: ${game.floorsCleared}`
    ];
    
    stats.forEach((stat, i) => {
      ctx.fillText(stat, statsX + 10, statsY + 40 + (i * 15));
    });
  }
}
```

### Click Areas and Interactions
```javascript
class UIInteractionHandler {
  constructor() {
    this.clickAreas = [];
    this.registerClickAreas();
  }
  
  registerClickAreas() {
    // Economy upgrades (bottom left)
    this.clickAreas.push({
      id: 'economyUpgrades',
      x: 0,
      y: canvas.height - 120,
      width: canvas.width / 2 - 60,
      height: 120,
      handler: (x, y) => this.handleEconomyClick(x, y)
    });
    
    // Click upgrades (bottom right)
    this.clickAreas.push({
      id: 'clickUpgrades',
      x: canvas.width / 2 + 60,
      y: canvas.height - 120,
      width: canvas.width / 2 - 60,
      height: 120,
      handler: (x, y) => this.handleClickUpgradeClick(x, y)
    });
    
    // Guild button (bottom center)
    this.clickAreas.push({
      id: 'guildButton',
      x: canvas.width / 2 - 50,
      y: canvas.height - 60,
      width: 100,
      height: 40,
      handler: () => this.openGuildPopup()
    });
    
    // Mountain clicking area (when on surface)
    this.clickAreas.push({
      id: 'mountain',
      x: canvas.width / 2 - 100,
      y: 100,
      width: 200,
      height: 150,
      condition: () => game.camera.y === 0, // Only when viewing surface
      handler: (x, y) => game.clickSystem.handleMountainClick(x, y)
    });
  }
  
  handleClick(x, y) {
    // Check if guild popup is open first
    if (game.ui.guildPopup && game.ui.guildPopup.visible) {
      game.ui.guildPopup.handleClick(x, y);
      return;
    }
    
    // Check main UI click areas
    for (const area of this.clickAreas) {
      if (area.condition && !area.condition()) continue;
      
      if (x >= area.x && x <= area.x + area.width &&
          y >= area.y && y <= area.y + area.height) {
        area.handler(x, y);
        return;
      }
    }
  }
  
  openGuildPopup() {
    if (game.gold < 5000 && game.guildLevel === 0) {
      game.ui.showTooltip('Need 5,000 gold to build guild!');
      return;
    }
    
    if (game.guildLevel === 0) {
      // First time building guild
      game.gold -= 5000;
      game.guildLevel = 1;
      game.ui.showNotification('Guild Founded! Hire heroes to fight monsters!');
    }
    
    if (!game.ui.guildPopup) {
      game.ui.guildPopup = new GuildPopup();
    }
    game.ui.guildPopup.show();
  }
}
```

### Click System with Feedback
```javascript
class ClickSystem {
  handleClick(x, y) {
    // Generate gold
    const goldEarned = this.calculateClickValue();
    game.gold += goldEarned;
    
    // Visual feedback
    this.spawnFloatingText(x, y, `+${this.formatNumber(goldEarned)}`);
    this.spawnParticles(x, y, 'gold');
    this.screenShake(2); // pixels
    this.playSound('click');
    
    // Update cursor
    this.setCursor('pickaxe');
  }
}
```

### Hero Pathfinding (Lemming-style)
```javascript
class Hero {
  constructor(type) {
    this.type = type;
    this.floor = 1;
    this.x = DUNGEON_START_X;
    this.y = this.floor * FLOOR_HEIGHT;
    this.target = 'boss';
    this.state = 'moving'; // moving, fighting, returning
  }
  
  update() {
    switch(this.state) {
      case 'moving':
        this.moveTowardTarget();
        this.checkForEnemies();
        break;
      case 'fighting':
        this.attack();
        break;
      case 'returning':
        this.returnToGuild();
        break;
    }
  }
  
  moveTowardTarget() {
    // Always move left toward boss
    this.x -= this.speed;
    
    // Check for stairs/hatches between floors
    if (this.atStairs()) {
      this.floor++;
      this.y = this.floor * FLOOR_HEIGHT;
    }
  }
}
```

### Camera Transition System
```javascript
class Camera {
  constructor() {
    this.y = 0; // Start at surface
    this.targetY = 0;
    this.transitioning = false;
  }
  
  revealUnderground() {
    this.targetY = UNDERGROUND_Y_POSITION;
    this.transitioning = true;
    
    // Dramatic camera pan
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth motion
      const eased = this.easeInOutCubic(progress);
      this.y = this.startY + (this.targetY - this.startY) * eased;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.transitioning = false;
        this.onRevealComplete();
      }
    };
    
    animate();
  }
}
```

### Blood Moon Event System
```javascript
class BloodMoonEvent {
  constructor() {
    this.active = false;
    this.timer = 0;
    this.nextEventTime = this.randomTime(300, 600); // 5-10 minutes
  }
  
  update(deltaTime) {
    if (!this.active) {
      this.timer += deltaTime;
      if (this.timer >= this.nextEventTime) {
        this.trigger();
      }
    } else {
      this.handleEvent(deltaTime);
    }
  }
  
  trigger() {
    this.active = true;
    this.duration = 60 + Math.random() * 30; // 60-90 seconds
    
    // Visual effects
    game.renderer.tintScreen('red', 0.3);
    game.ui.showWarning('BLOOD MOON RISING!');
    
    // Spawn breach attempts
    this.spawnBreachMonsters();
  }
}
```

## Save System
```javascript
const SaveSystem = {
  save() {
    const saveData = {
      version: '1.0.0',
      gold: game.gold,
      generators: game.generators.map(g => ({
        floor: g.floor,
        owned: g.owned,
        level: g.level
      })),
      heroes: game.heroes.map(h => ({
        type: h.type,
        level: h.level
      })),
      unlockedFloor: game.maxFloor,
      playtime: game.totalPlaytime,
      timestamp: Date.now()
    };
    
    localStorage.setItem('dungeonDelverSave', JSON.stringify(saveData));
  },
  
  load() {
    const saveString = localStorage.getItem('dungeonDelverSave');
    if (!saveString) return null;
    
    const saveData = JSON.parse(saveString);
    
    // Calculate offline progress
    const offlineTime = Date.now() - saveData.timestamp;
    const offlineGold = this.calculateOfflineEarnings(offlineTime);
    
    return { ...saveData, offlineGold };
  }
};
```

## Number Formatting
```javascript
function formatNumber(num) {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
  return (num / 1000000000000).toFixed(1) + 'T';
}
```

## Performance Optimization
```javascript
// Object pooling for particles and floating text
class ObjectPool {
  constructor(createFunc, resetFunc, size = 100) {
    this.create = createFunc;
    this.reset = resetFunc;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < size; i++) {
      this.pool.push(this.create());
    }
  }
  
  get() {
    let obj = this.pool.pop() || this.create();
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    this.reset(obj);
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(obj);
    }
  }
}
```

## Balance Constants
```javascript
const BALANCE = {
  // Economy scaling
  generatorCostMultiplier: 1.15,
  incomePerUpgrade: 1.1,
  
  // Combat scaling  
  monsterHPScale: 2, // per floor
  monsterDamageScale: 1.5, // per floor
  bossHPMultiplier: 10, // vs regular monsters
  
  // Progression gates
  guildUnlockFloor: 4,
  bloodMoonUnlockFloor: 9,
  prestigeUnlockFloor: 12,
  
  // Timing
  heroSpawnRate: 30, // seconds
  bloodMoonFrequency: 300, // minimum seconds
  autoSaveInterval: 10, // seconds
};
```

## Testing Checklist
- [ ] Click feedback feels satisfying (particles, sounds, shake)
- [ ] Number formatting works for all ranges
- [ ] Save/load preserves all game state
- [ ] Offline progression calculates correctly
- [ ] Camera pan is smooth and dramatic
- [ ] Heroes pathfind correctly through dungeon
- [ ] Combat resolution is balanced
- [ ] Blood Moon events trigger properly
- [ ] Prestige system resets correctly
- [ ] Performance stays at 60 FPS with many sprites
- [ ] Pixel scaling works on all resolutions
- [ ] Mobile touch controls function properly

## Common Issues & Solutions

### Issue: Floating point precision with large numbers
```javascript
// Use BigNumber library or scientific notation
// Store as mantissa and exponent
class BigNumber {
  constructor(mantissa, exponent) {
    this.m = mantissa;
    this.e = exponent;
    this.normalize();
  }
}
```

### Issue: Performance with many animated sprites
```javascript
// Use sprite batching and only animate visible sprites
// Cull sprites outside viewport
// Use requestAnimationFrame properly
```

### Issue: Save data corruption
```javascript
// Always validate save data
// Keep backup saves
// Version your save format
```

## Debug Commands
```javascript
// Add to console for testing
window.debug = {
  addGold: (amount) => game.gold += amount,
  unlockFloor: (floor) => game.maxFloor = floor,
  triggerBloodMoon: () => game.bloodMoon.trigger(),
  spawnHero: (type) => game.spawnHero(type),
  clearSave: () => localStorage.clear(),
  skipTime: (seconds) => game.processOfflineTime(seconds * 1000)
};
```

## Remember
- Keep the 1990s pixel art aesthetic consistent
- Every purchase should feel impactful (Cookie Clicker feedback)
- The camera pan from surface to underground is a key dramatic moment
- Heroes behave like lemmings - always moving forward
- The breach at Floor 4 is the major gameplay transition
- Blood Moon events should feel chaotic but manageable
- Balance is key - both economy and combat should feel rewarding

## ✅ COMPLETED DEVELOPMENT SESSION SUMMARY

### 🎯 Milestones Completed (6/20)

**✅ Milestone 0: Project Setup** (30 min)
- HTML5 Canvas game foundation (960x640)
- VGA color palette CSS styling
- Pixel-perfect rendering settings
- Basic game loop with requestAnimationFrame

**✅ Milestone 1: Clickable Mountain** (2 hours)  
- Precise mountain click detection with coordinate scaling
- Visual effects: floating text, particles, screen shake
- Click streak system (1-10 streaks with color changes)
- Enhanced cursor interaction with hover states

**✅ Milestone 2: Number System & Polish** (1.5 hours)
- Advanced number formatting (999 → 1K → 1.5M → 1B → 1T → 1Qa)
- GPS (Gold Per Second) calculation and display
- Enhanced particle system with rotation, physics, and glow
- Professional floating text with outlines and scaling

**✅ Milestone 3: First Generator - Surface Miners** (2 hours)
- Complete OOP Generator class system
- Surface Miner: 15g → 1g/s, 1.15x cost scaling
- Passive income engine (100ms smooth updates)
- Dynamic UI with real-time affordability and purchase feedback

**✅ Milestone 4: Visual Mining Camp** (1.5 hours)
- Enhanced mountain graphics with depth and shadows
- Animated miners (up to 10) with AI behavior (walking/idle states)
- Complete mining camp: tent, storage, equipment, campfire
- Animated mining cart with rotating wheels and cargo

**✅ Milestone 5: Save System** (1 hour)
- Complete localStorage save/load with versioning
- Auto-save every 10 seconds with notifications
- Offline progress calculation (8-hour cap)
- Export/import system and professional UI controls

**✅ Milestone 6: Underground Reveal** (2 hours)
- Drill Operator generator (100g → 5g/s) on Floor 1
- Dramatic camera transition system (2-second smooth pan)
- Underground cross-section with split-screen layout
- Animated drill rig with rotating bit and spark effects

**✅ Milestone 7: Multiple Floors** (1.5 hours)
- Blast Engineer generator (Floor 2: 1,000g → 25g/s) with explosion effects
- Crystal Harvester generator (Floor 3: 10,000g → 150g/s) with glowing crystals
- Unique visual themes for each floor with floor-specific backgrounds
- Enhanced generator animations (dynamite explosions, crystal sparkles, drill sparks)

**✅ Milestone 8: UI Bottom Panel** (2 hours)
- Economy upgrades: Miner Efficiency (+10% surface miners), Global Production (+5% all generators)
- Click upgrades: Click Power (2x multiplier), Auto-Clicker (+1 auto-click/sec)
- Complete upgrade system with purchase effects and save integration
- Compact button design fitting 4-6 upgrades in bottom panel

**✅ Milestone 8.5: UI Redesign - Interactive Mine** (2.5 hours)
- Sky-anchored upgrades panel (top-right floating with collapse/expand)
- Direct floor clicking for generator purchasing (intuitive building interface)
- Visual purchase states: green glow when affordable, cost/income tooltips
- Future floor teasers: Floor 4 (red sealed monsters), Floor 5+ ("Coming Soon...")
- Canvas scaling to 1400x900 for more room and content

### 🎮 Current Game State
- **Complete idle game** with interactive mine building
- **4 Generator types** across 3 floors plus surface level
- **Comprehensive upgrade system** with economy and clicking progression
- **Intuitive floor-based building** - click directly where you want to build
- **Sky-based upgrade panel** for clean, accessible progression
- **Future content hints** creating anticipation and progression goals

### 🔧 Technical Achievements
- Object-oriented architecture (Generator class, Upgrade class, Miner class)
- Advanced UI system with floating panels and interactive floors
- Performance optimizations (object pooling, efficient rendering)
- Professional UI/UX with animations and feedback
- Comprehensive save system with upgrade persistence
- Git repository with version control

### 📊 Game Metrics (Updated)
- **Click Phase**: 0-15 gold (mountain clicking, auto-clicker available)
- **Surface Phase**: 15-100 gold (surface miners + miner efficiency upgrades)  
- **Floor 1 Phase**: 100-1,000 gold (drill operators)
- **Floor 2 Phase**: 1,000-10,000 gold (blast engineers)
- **Floor 3 Phase**: 10,000+ gold (crystal harvesters)
- **Income Scaling**: 1g/s → 5g/s → 25g/s → 150g/s with multipliers
- **Visual Progression**: Static → Animated camp → Interactive underground mine

### 🎯 Available Upgrades
- **Miner Efficiency**: 10 levels, +10% surface miner production each
- **Global Production**: 20 levels, +5% all generator production each  
- **Click Power**: 10 levels, double click value each (exponential growth)
- **Auto-Clicker**: 5 levels, +1 automatic click per second each

## ⚠️ CRITICAL ISSUE: GUI Integration Failure

### Problem: Left-Side Generator Controls Not Properly Integrated
**Status**: BLOCKING - Multiple implementation attempts failed
**Priority**: HIGH - Must be resolved before Phase 2 development

#### Issue Summary:
Despite multiple architectural approaches, the left-side generator control buttons remain visually disconnected from the floor graphics. User feedback indicates:
- "The buttons should be an extension of the existing graphical panel. They are still separate and misaligned"  
- "There is a large vertical column of black between them as well"
- Buttons appear as floating overlays rather than seamless floor extensions

#### Failed Approaches:
1. **Separate Left Column**: Created HTML flex layout with dedicated left panel - rejected as too disconnected
2. **Integrated HTML Panels**: Attempted to blend HTML panels with canvas graphics - alignment issues persist
3. **Transparent Canvas Overlays**: Extended floor backgrounds 200px left with transparent HTML buttons - still appears separate with visual gaps

#### Root Cause Analysis:
The fundamental issue is mixing HTML UI elements over canvas graphics creates an inherent visual disconnect. True integration requires:
- Canvas-native button rendering (not HTML overlays)  
- Perfect pixel alignment with floor graphics
- Seamless color matching and visual continuity
- Elimination of all gaps or separation lines

#### Required Solution:
Move to **pure canvas-based UI system** where generator controls are rendered directly on the canvas as part of each floor's graphics, not separate HTML elements.

#### Impact:
- Blocks user satisfaction with core UI experience
- Prevents progression to combat system development
- Current system feels amateur despite technical complexity

## Next Steps
1. **URGENT**: Fix GUI integration using pure canvas-rendered controls
2. → Milestone 9: The Breach (monsters appear at Floor 4, guild unlocked)  
3. → Milestone 10: Basic Heroes (warrior spawning and pathfinding)
4. → Begin Phase 2: Full Combat System implementation