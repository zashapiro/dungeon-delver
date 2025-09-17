# UI-LAYOUT.md - Complete UI System Reference
**Single Source of Truth for All UI Positioning**

---

## 🎯 CURRENT CORRECT LAYOUT

### Visual Layout Reference
```
SCREEN LAYOUT (1757x1305px example):
┌───────────────────────────────────────────────────────────────────────┐
│ NAV COLUMN          │                GAME WORLD                        │
│ 0px → 350px         │           360px → 1757px                        │
│ ┌─────────────────┐ │                                                 │
│ │ GOLD: 142K      │ │  ┌─────────────────────────────────────────────┐ │
│ │ GPS: 55.3/s     │ │  │             SURFACE LEVEL                   │ │
│ └─────────────────┘ │  │  🏔️[MOUNTAIN]  🏰[GUILD]  ⛏️[MINERS] 🌲   │ │
│ ┌─────────────────┐ │  │    (Click mountain)  (5000g)               │ │
│ │ ECONOMY UPG     │ │  └─────────────────────────────────────────────┘ │
│ │ • Miner +10%    │ │                                                 │
│ └─────────────────┘ │  ┌──────────────────┬──────────────────────────┐ │
│ ┌─────────────────┐ │  │   GENERATORS     │      FULL DUNGEON        │ │
│ │ CLICK UPGRADES  │ │  │  (LEFT HALF)     │   (RIGHT HALF - ALL)     │ │
│ │ • Click x2      │ │  │ 360px → 1058px   │   1058px → 1757px        │ │
│ └─────────────────┘ │  │                  │                          │ │
│ ┌─────────────────┐ │  │ F1:[DRILL]       │ F1: [Empty/Sealed]       │ │
│ │ GENERATORS      │ │  │ F2:[BLAST]       │ F2: [Empty/Sealed]       │ │
│ │ • Surface Miners│ │  │ F3:[CRYSTAL]     │ F3: [Empty/Sealed]       │ │
│ │ • F1: Drill Ops │ │  │ F4:[SHADOW]👑    │ F4: [👑BOSS][Heroes→]    │ │
│ │ • F2: Blast Eng │ │  │ F5:[LOCKED]      │ F5: [Coming Soon...]     │ │
│ │ • F3: Crystal   │ │  │ F6:[LOCKED]      │ F6: [Coming Soon...]     │ │
│ │ • F4: Shadow    │ │  │ F7:[LOCKED]      │ F7: [Coming Soon...]     │ │
│ └─────────────────┘ │  │ F8:[LOCKED]      │ F8: [Coming Soon...]     │ │
│                     │  └──────────────────┴──────────────────────────┘ │
│                     │                                                 │
│                     │  📏 Key Mechanics:                              │
│                     │  • Guild building on surface (right of mountain)│
│                     │  • Bosses ONLY appear Floor 4+                 │
│                     │  • Full dungeon visible on right side          │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📐 COORDINATE SYSTEM REFERENCE

### Core Layout Functions
```javascript
// PRIMARY LAYOUT FUNCTIONS (main.js)
function getLeftColumnWidth() {
    // Returns: 280px - 350px (responsive, 20% of screen width with limits)
    // Purpose: Width of nav column containing all UI elements
}

function getGameWorldStartX() {
    // Returns: getLeftColumnWidth() + 10px buffer
    // Purpose: LEFT EDGE of game world (where game elements start)
    // Example: 360px on typical screen
}

function getGameWorldMiddleX() {
    // Returns: getGameWorldStartX() + (gameWorldWidth / 2)
    // Purpose: DIVIDER between generator area and dungeon area
    // Example: 360px + (1397px / 2) = 1058px
}

// HELPER CALCULATIONS
const gameWorldStartX = getGameWorldStartX();           // 360px
const gameWorldWidth = game.canvas.width - gameWorldStartX; // 1397px
const gameWorldMiddleX = gameWorldStartX + gameWorldWidth / 2; // 1058px
```

### Zone Boundaries
```javascript
// ZONE DEFINITIONS
NAV_COLUMN = {
    left: 0,
    right: getLeftColumnWidth(),        // ~350px
    purpose: "UI elements ONLY - buttons, stats, controls"
}

GAME_WORLD_SURFACE = {
    left: getGameWorldStartX(),         // ~360px
    right: game.canvas.width,           // ~1757px
    purpose: "Mountain, guild building, miners, surface level (full game world width)"
}

GENERATOR_AREA = {
    left: getGameWorldStartX(),         // ~360px
    right: getGameWorldMiddleX(),       // ~1058px  
    purpose: "Underground left - drill rigs, blast zones, crystal caves, BOSSES"
}

DUNGEON_AREA = {
    left: getGameWorldMiddleX(),        // ~1058px
    right: game.canvas.width,           // ~1757px
    purpose: "Underground right - ALL FLOORS visible, heroes, monsters, combat"
}
```

---

## 🎨 RENDERING FUNCTIONS REFERENCE

### Underground Rendering (`drawUnderground`)
```javascript
function drawUnderground() {
    // CORRECT coordinate setup:
    const gameWorldStartX = getGameWorldStartX();        // 360px
    const gameWorldWidth = game.canvas.width - gameWorldStartX; // 1397px  
    const leftWidth = gameWorldStartX + gameWorldWidth / 2;     // 1058px (MIDDLE DIVIDER)
    
    // Background: Render from game world start to screen edge
    ctx.fillRect(gameWorldStartX, undergroundStart, gameWorldWidth, floorHeight * 4);
    
    // Pass leftWidth to drawFloor (leftWidth = middle divider, NOT nav boundary)
    drawFloor(ctx, floor, y, leftWidth, floorHeight);
}
```

### Floor Rendering (`drawFloor`)  
```javascript
function drawFloor(ctx, floorNumber, y, leftWidth, floorHeight) {
    // leftWidth parameter = MIDDLE DIVIDER of game world (~1058px)
    const gameWorldStartX = getGameWorldStartX(); // 360px
    
    // Generator area background: game world start → middle divider
    ctx.fillRect(gameWorldStartX, y, leftWidth - gameWorldStartX, floorHeight);
    
    // Click area: Generator area only (left half of game world)  
    game.floorAreas.push({
        x: gameWorldStartX,        // 360px
        y: y,
        width: leftWidth - gameWorldStartX, // ~698px wide
        height: floorHeight,
        floor: floorNumber,
        generator: generator
    });
}
```

### Generator Graphics (`drawGeneratorArea`)
```javascript
function drawGeneratorArea(ctx, generator, y, leftWidth, floorHeight) {
    // Position graphics in CENTER of generator area (left half of game world)
    const gameWorldStartX = getGameWorldStartX();        // 360px
    const generatorAreaWidth = leftWidth - gameWorldStartX; // 698px
    const centerX = gameWorldStartX + generatorAreaWidth / 2; // 709px (center of generator area)
    const centerY = y + floorHeight / 2;
    
    // Render drill rigs, blast zones, crystals at centerX, centerY
}
```

---

## 🚫 COMMON LAYOUT MISTAKES & FIXES

### ❌ WRONG: Elements bleeding into nav
```javascript
// BROKEN - renders from 0px (includes nav column)
ctx.fillRect(0, y, someWidth, height);

// BROKEN - uses full screen coordinates  
const centerX = game.canvas.width / 2; // Wrong! Includes nav area

// BROKEN - negative coordinates
ctx.fillRect(-controlZoneWidth, y, width, height);
```

### ✅ CORRECT: Respecting boundaries
```javascript
// CORRECT - renders from game world edge only
const gameWorldStartX = getGameWorldStartX();
ctx.fillRect(gameWorldStartX, y, gameWorldWidth, height);

// CORRECT - centers within game world area
const gameWorldWidth = game.canvas.width - gameWorldStartX;
const centerX = gameWorldStartX + gameWorldWidth / 2;

// CORRECT - stays within designated area
ctx.fillRect(gameWorldStartX, y, leftWidth - gameWorldStartX, height);
```

### Variable Name Confusion
```javascript
// ⚠️  IMPORTANT: What "leftWidth" actually means in different contexts:

// In drawUnderground(): leftWidth = middle divider coordinate (~1058px)
const leftWidth = gameWorldStartX + gameWorldWidth / 2;

// NOT the width of the left column (that's getLeftColumnWidth())
// NOT the left edge of game world (that's getGameWorldStartX())
```

---

## 🧪 LAYOUT TESTING & DEBUGGING

### Debug Commands
```javascript
// Test responsive positioning
debug.testLadderPositions()
// Should show:
//   Canvas: 1757x1305px
//   Left column: 350px  
//   Game world starts at: 360px
//   Left ladder: 388px   (game world left edge + buffer)
//   Right ladder: 1729px (game world right edge - buffer)

// Visual coordinate verification
console.log('Nav boundary:', getLeftColumnWidth());
console.log('Game world start:', getGameWorldStartX()); 
console.log('Game world middle:', getGameWorldStartX() + (game.canvas.width - getGameWorldStartX()) / 2);
```

### Visual Testing Checklist
- [ ] **Nav column**: Only UI elements visible, no game graphics
- [ ] **Surface level**: Mountain and guild building positioned in game world area
- [ ] **Miners**: Walking only in game world area, not nav
- [ ] **Guild**: Building rendered on surface to the right of mountain
- [ ] **Underground generators**: Visible in LEFT half of game world
- [ ] **Underground dungeon**: ALL FLOORS visible in RIGHT half of game world
- [ ] **Floor boundaries**: Generator click areas in left half only
- [ ] **Boss mechanics**: Bosses only appear on Floor 4+
- [ ] **Responsive**: Layout works on different window sizes

### Common Issue Symptoms & Solutions

**"Generators bleeding into nav"**
- Check: `drawFloor()` using correct `gameWorldStartX` not `0`
- Fix: Render from `gameWorldStartX` to `leftWidth`, not full screen

**"Everything on wrong side"**  
- Check: `leftWidth` calculation in `drawUnderground()`
- Fix: `leftWidth = gameWorldStartX + gameWorldWidth / 2` (middle divider)

**"Heroes/monsters in wrong area"**
- Check: Pathfinding using `gameWorldRatioToCanvasX()` function
- Fix: Ensure dungeon coordinates use right half of game world

**"Surface elements mispositioned"**
- Check: Mountain/miner/guild positioning using full game world width
- Fix: Center in full game world: `gameWorldStartX` to `canvas.width`

---

## 🔄 INTEGRATION WITH OTHER FILES

### Relationship to Other Documentation
- **claude.md**: References this file for layout specifications
- **planning.md**: Uses this file for UI milestone planning
- **tasks.md**: References specific sections for layout-related tasks

### Code Integration Points
- **main.js**: All rendering functions must follow these coordinate rules
- **Save system**: UI state restoration must use correct positioning
- **Event handling**: Click detection must respect area boundaries
- **Responsive system**: Window resize must recalculate all coordinates

---

## ✅ LAYOUT VALIDATION RULES

### Before Committing UI Changes
1. **Nav Column Test**: Verify no game elements render in 0px → getLeftColumnWidth()
2. **Game World Test**: All game elements render within gameWorldStartX → canvas.width  
3. **Underground Split Test**: Generators in left half, dungeon in right half
4. **Responsive Test**: Layout works correctly after window resize
5. **Debug Output Test**: `debug.testLadderPositions()` shows expected coordinates

### Emergency Layout Reset
```javascript
// If layout is completely broken, check these functions in order:
1. getLeftColumnWidth() - should return ~350px
2. getGameWorldStartX() - should return leftColumnWidth + 10px  
3. drawUnderground() - should calculate leftWidth as middle divider
4. drawFloor() - should render from gameWorldStartX to leftWidth
5. drawGeneratorArea() - should center in generator area
```

---

*Last Updated: Current session*  
*Status: Layout coordinate system corrected and documented*