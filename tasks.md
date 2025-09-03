# TASKS.md - Granular Task List for Dungeon Delver

## Quick Test Instructions
```bash
# To test the game at any point:
1. Save all files to a local folder
2. Open index.html in a web browser
3. Open browser console (F12) for debug info
4. Use debug commands in console: debug.addGold(1000)
```

---

## ✅ Milestone 0: Project Setup (30 minutes) - COMPLETED
**Goal: Testable HTML page with canvas**

- [x] Create index.html with basic structure
- [x] Add canvas element (960x640)
- [x] Create style.css with basic styling
- [x] Add main.js and verify it loads
- [x] Set up canvas context in JavaScript
- [x] Draw a test rectangle to verify canvas works
- [x] Add "Hello World" text to canvas
- [x] **TEST**: Open index.html, see rectangle and text

---

## Milestone 1: Clickable Mountain ✅ COMPLETED
**Goal: Click mountain, see gold increase**

### Basic Setup (30 min)
- [x] Create game object with gold property (start at 0)
- [x] Create render function using requestAnimationFrame
- [x] Add FPS counter in corner
- [x] Draw solid brown triangle as mountain placeholder
- [x] Draw blue rectangle as sky placeholder

### Click Detection (30 min)
- [x] Add click event listener to canvas
- [x] Detect if click is within mountain area
- [x] Increment gold by 1 on mountain click
- [x] Console.log gold value on click
- [x] **TEST**: Click mountain, see gold increase in console

### Gold Display (30 min)
- [x] Draw gold counter text at top of screen
- [x] Format: "Gold: 0"
- [x] Update text every frame
- [x] Add black background rectangle behind text for readability
- [x] Change cursor to pointer when over mountain

### Visual Feedback (30 min)
- [x] Create floating text class
- [x] Spawn "+1" text at click position
- [x] Animate text moving up and fading
- [x] Add array to track active floating texts
- [x] Remove floating texts when fully faded
- [x] **TEST**: Click mountain, see gold counter and floating +1

---

## Milestone 2: Number System & Polish ✅ COMPLETED
**Goal: Formatted numbers, satisfying click feedback**

### Number Formatting (30 min)
- [x] Create formatNumber function (1K, 1M, 1B)
- [x] Apply to gold display
- [x] Test with debug.addGold(1000000)
- [x] Add GPS (gold per second) counter
- [x] Calculate GPS every second

### Click Improvements (30 min)
- [x] Increase click value to 1
- [x] Create click power variable
- [x] Add "Click Power: 1" to UI
- [x] Create screen shake function
- [x] Add 2-pixel shake on click

### Particles (30 min)
- [x] Create particle class
- [x] Spawn 5 gold particles on click
- [x] Particles move in random directions
- [x] Particles fade over 1 second
- [x] Draw particles as small yellow squares
- [x] **TEST**: Clicking feels satisfying with particles and shake

---

## Milestone 3: First Generator - Surface Miners ✅ COMPLETED
**Goal: Buy miners, earn passive income**

### Generator System (45 min)
- [x] Create Generator class
- [x] Properties: name, baseCost, baseIncome, owned
- [x] Method: getCost() with 1.15x scaling
- [x] Method: getIncome() returns total income
- [x] Create surface miner generator instance

### Purchase UI (45 min)
- [x] Draw miner button below mountain
- [x] Show: "Miners (0) - Cost: 15"
- [x] Detect clicks on button
- [x] Check if player can afford
- [x] Deduct gold and add miner if affordable
- [x] Update button text after purchase
- [x] Gray out button if can't afford

### Passive Income (30 min)
- [x] Create game loop update function
- [x] Calculate total GPS from all generators
- [x] Add GPS to gold every second
- [x] Update GPS display
- [x] Show income per miner on hover
- [x] **TEST**: Buy miners, watch gold increase automatically

---

## Milestone 4: Visual Mining Camp ✅ COMPLETED
**Goal: Animated mining camp on surface**

### Surface Scene (45 min)
- [x] Draw proper mountain sprite (triangular, brown/gray)
- [x] Add sky gradient (light blue to white)
- [x] Draw ground/grass line
- [x] Add 2-3 tree sprites
- [x] Draw empty mining camp area

### Miner Animation (45 min)
- [x] Create simple 8x8 miner sprite
- [x] Draw miners at camp when owned > 0
- [x] Animate miners walking left/right (2 frame)
- [x] Scale miners shown (max 10 visible)
- [x] Add mining cart sprite
- [x] Animate cart moving when miners active
- [x] **TEST**: Buy miners, see camp come alive

---

## Milestone 5: Save System ✅ COMPLETED
**Goal: Game persists on refresh**

### Basic Save/Load (30 min)
- [x] Create save function
- [x] Save: gold, miners owned, click power
- [x] Call save every 10 seconds
- [x] Create load function
- [x] Load on game start
- [x] Test refresh preserves progress

### Offline Progress (30 min)
- [x] Save timestamp with save data
- [x] Calculate offline time on load
- [x] Calculate offline gold earned
- [x] Show popup: "Offline for X, earned Y gold"
- [x] Add "Reset Game" button
- [x] Confirm dialog before reset
- [x] **TEST**: Close game, wait 1 min, reload, see offline gold

---

## Milestone 6: Underground Reveal ✅ COMPLETED
**Goal: First underground generator triggers camera pan**

### Underground Generator (30 min)
- [x] Create Drill Operator generator (Floor 1)
- [x] Cost: 100 gold
- [x] Income: 1 gold/sec
- [x] Add purchase button below miners
- [x] Same purchase logic as miners

### Camera System (45 min)
- [x] Add camera Y position variable
- [x] Create translation for all drawing
- [x] Detect first drill purchase
- [x] Trigger camera pan animation
- [x] Implement easing function

### Underground Visual (45 min)
- [x] Draw underground cross-section
- [x] Stone/dirt texture sides
- [x] Show drill operator area when owned
- [x] Animate drill spinning
- [x] Show "Floor 1" label
- [x] Split screen vertically (economy left, dungeon right)
- [x] **TEST**: Buy drill, watch dramatic camera pan down

---

## Milestone 7: Multiple Floors ✅ COMPLETED
**Goal: Floors 1-3 with unique generators**

### Additional Generators (45 min)
- [x] Create Blast Engineer (Floor 2, 1K cost, 25/sec)
- [x] Create Crystal Harvester (Floor 3, 10K cost, 150/sec)
- [x] Add purchase buttons for each
- [x] Stack buttons vertically
- [x] Show floor number for each

### Visual Themes (45 min)
- [x] Floor 1: Brown dirt, drill animation with sparks
- [x] Floor 2: Rocky with explosive TNT animations
- [x] Floor 3: Purple crystals glowing with sparkles
- [x] Add divider lines between floors
- [x] Animate each generator when owned
- [x] Right side remains dark/dimmed
- [x] **TEST**: Can purchase through Floor 3

---

## Milestone 8: UI Bottom Panel ✅ COMPLETED
**Goal: Economy and click upgrades in UI**

### Panel Structure (30 min)
- [x] Create bottom panel (140px height, expandable)
- [x] Dark background with border
- [x] Split into 3 sections
- [x] Left: Economy upgrades
- [x] Right: Click upgrades
- [x] Center: Guild button (disabled)

### Economy Upgrades (45 min)
- [x] Create upgrade: Miner Efficiency (+10% surface miners, 1K gold base)
- [x] Create upgrade: Global Production (+5% all generators, 5K gold base)
- [x] Draw upgrade buttons with costs and levels
- [x] Show current level (0/max) with progress
- [x] Implement purchase logic with 1.5x cost scaling
- [x] Apply effects to generators with multipliers

### Click Upgrades (45 min)
- [x] Create upgrade: Click Power (x2 per level, 500 gold base)
- [x] Create upgrade: Auto-Clicker (+1/sec per level, 10K gold base)
- [x] Draw upgrade buttons with visual feedback
- [x] Implement auto-click timer in update loop
- [x] Update click value on upgrade purchase
- [x] Show "MAX" when fully upgraded
- [x] **TEST**: Purchase upgrades, see effects working

---

## ⚠️ Milestone 8.5: LEFT-SIDE GUI Integration - FAILED MULTIPLE ATTEMPTS ⚠️
**Goal: Seamless left-side generator controls integrated with floor graphics**
**Status**: BLOCKED - Needs complete architectural rework
**Priority**: CRITICAL - Must be resolved before Phase 2

### ❌ FAILED APPROACH 1: Separate HTML Left Column
- [x] Created flex layout with dedicated left panel - REJECTED
- [x] Buttons appeared disconnected from floor graphics
- [x] User feedback: "They are still separate and misaligned"

### ❌ FAILED APPROACH 2: Integrated HTML Panels  
- [x] Attempted to blend HTML panels with canvas - REJECTED
- [x] Alignment issues persist with camera system
- [x] Visual gaps between panels and game graphics

### ❌ FAILED APPROACH 3: Transparent Canvas Overlays
- [x] Extended floor backgrounds 200px LEFT in canvas
- [x] Positioned semi-transparent HTML buttons over extensions - REJECTED
- [x] User feedback: "There is a large vertical column of black between them as well"
- [x] Still appears as floating overlays rather than integrated extensions

### 🚨 ROOT CAUSE IDENTIFIED:
**HTML + Canvas mixing creates inherent visual disconnect**
- HTML overlays will always appear separate from canvas graphics
- Perfect pixel alignment impossible due to different rendering contexts  
- Visual gaps inevitable when mixing rendering systems
- User expects SEAMLESS floor extensions, not overlaid UI elements

### ✅ REQUIRED SOLUTION:
**Pure Canvas-Based UI System**
- [ ] Move all generator controls to canvas rendering
- [ ] Render buttons as part of floor graphics (same render pass)
- [ ] Use canvas click detection instead of HTML events  
- [ ] Perfect pixel alignment with floor backgrounds
- [ ] True visual integration with seamless color matching

### 🎯 Implementation Strategy:
- [ ] Create canvas-native Button class
- [ ] Integrate button rendering into drawFloor() function
- [ ] Add canvas-based click detection system
- [ ] Remove all HTML overlay elements
- [ ] Ensure buttons appear as natural floor extensions

### Impact on Development:
- **BLOCKING**: Cannot proceed to Phase 2 combat system
- **User Experience**: Current system feels amateur despite technical effort
- **Technical Debt**: HTML/Canvas mixing approach fundamentally flawed

---

## Milestone 9: The Breach - Monsters Appear (2 hours)
**Goal: Monsters block Floor 4, guild unlocked**

### Monster System (45 min)
- [ ] Create Monster class
- [ ] Add goblin at Floor 4
- [ ] Draw 16x16 goblin sprite
- [ ] Idle animation (2 frame bob)
- [ ] Block Floor 4 generator purchase

### Visual Changes (30 min)
- [ ] Illuminate right side at Floor 4
- [ ] Show monsters in dungeon
- [ ] Red warning text: "MONSTERS DETECTED!"
- [ ] Shake screen on breach
- [ ] Play alert sound (if available)

### Guild Activation (45 min)
- [ ] Enable guild button (5K gold cost)
- [ ] Glow effect on button when affordable
- [ ] Click to purchase guild
- [ ] Deduct gold
- [ ] Show "Guild Founded!" message
- [ ] Enable guild popup button
- [ ] **TEST**: Reach Floor 4, see monsters, build guild

---

## Milestone 10: Basic Heroes (2.5 hours)
**Goal: Heroes spawn and move through dungeon**

### Hero Class (45 min)
- [ ] Create Hero class
- [ ] Properties: hp, damage, speed, position
- [ ] Start with Warrior type only
- [ ] 12x12 sprite
- [ ] Walk animation (2 frame)

### Spawning System (45 min)
- [ ] Spawn hero every 30 seconds
- [ ] Start at top right of dungeon
- [ ] Max 1 hero initially
- [ ] Show hero count in UI
- [ ] Add spawn timer display

### Pathfinding (45 min)
- [ ] Heroes move left automatically
- [ ] Move to next floor via stairs
- [ ] Speed: 20 pixels/second
- [ ] Stop when reaching monster
- [ ] Face direction of movement

### Basic Combat (45 min)
- [ ] Attack when adjacent to monster
- [ ] Deal damage every second
- [ ] Show damage numbers
- [ ] Monster attacks back
- [ ] Hero death and respawn
- [ ] **TEST**: Heroes fight monsters automatically

---

## Milestone 11: Boss System (2 hours)
**Goal: Defeat boss to unlock Floor 5**

### Boss Implementation (45 min)
- [ ] Create Boss class (extends Monster)
- [ ] Goblin Chief: 500 HP, 20 damage
- [ ] 32x32 sprite
- [ ] Position at leftmost Floor 4
- [ ] Health bar above boss

### Boss Combat (45 min)
- [ ] Heroes path to boss after clearing monsters
- [ ] Boss fights back
- [ ] Special ability: summon minion every 10 sec
- [ ] Death animation
- [ ] Victory fanfare

### Floor Sealing (30 min)
- [ ] On boss defeat, seal Floor 4
- [ ] Enable Floor 4 generator
- [ ] Show "Floor Secured!" message
- [ ] Remove monsters from sealed floor
- [ ] Wall repair animation
- [ ] **TEST**: Defeat boss, unlock Floor 4 generator

---

## Milestone 12: Guild Popup UI (2.5 hours)
**Goal: Complex upgrade tree in modal**

### Popup Structure (45 min)
- [ ] Create modal overlay (dark background)
- [ ] 600x400 popup window
- [ ] Parchment texture background
- [ ] Close button (X)
- [ ] Title: "Adventurer's Guild"

### Tab System (45 min)
- [ ] Create tabs: Warriors, Classes, Capacity
- [ ] Highlight active tab
- [ ] Switch content on tab click
- [ ] Remember last selected tab
- [ ] Tab hover effects

### Warrior Upgrades (45 min)
- [ ] Health upgrade (10 levels, +10% each)
- [ ] Damage upgrade (10 levels, +10% each)
- [ ] Show current level
- [ ] Cost scaling (100 base, x2 per level)
- [ ] Apply effects to warriors

### Stats Display (30 min)
- [ ] Right sidebar with stats
- [ ] Show: Heroes active, spawn rate
- [ ] Show: Total kills, bosses defeated
- [ ] Update in real-time
- [ ] **TEST**: Open guild, purchase upgrades

---

## Milestone 13: Additional Hero Classes (2 hours)
**Goal: Multiple hero types with unique abilities**

### New Classes (45 min)
- [ ] Archer class (ranged, lower HP)
- [ ] Rogue class (fast, high crit)
- [ ] Cleric class (heals others)
- [ ] Unique sprites for each

### Class Unlocks (45 min)
- [ ] Add to Classes tab in guild
- [ ] Archer: 10K gold
- [ ] Rogue: 25K gold  
- [ ] Cleric: 50K gold
- [ ] Require previous unlocks

### Class Behavior (30 min)
- [ ] Archer attacks from 2 tiles away
- [ ] Rogue moves 2x speed
- [ ] Cleric heals nearby heroes
- [ ] Spawn random available class
- [ ] **TEST**: Unlock classes, see different behaviors

---

## Milestone 14: Floors 5-8 (2 hours)
**Goal: Extended progression with scaling difficulty**

### New Generators (45 min)
- [ ] Floor 5: Mushroom Farm (100K cost)
- [ ] Floor 6: Lava Forge (1M cost)
- [ ] Floor 7: Ancient Excavator (10M cost)
- [ ] Floor 8: Mithril Mine (100M cost)

### New Bosses (45 min)
- [ ] Spider Queen (Floor 5): Web slows heroes
- [ ] Lava Elemental (Floor 6): Area damage
- [ ] Ancient Guardian (Floor 7): Shield phases
- [ ] Shadow Lord (Floor 8): Resurrects once

### Scaling Difficulty (30 min)
- [ ] Monster HP doubles each floor
- [ ] Monster damage x1.5 each floor
- [ ] More monsters per floor
- [ ] Boss HP scales exponentially
- [ ] **TEST**: Progress through Floor 8

---

## Milestone 15: Blood Moon Event (2.5 hours)
**Goal: Periodic invasions that threaten production**

### Event Timer (45 min)
- [ ] Timer runs 5-10 minutes (random)
- [ ] Show next event countdown
- [ ] Warning at 10 seconds
- [ ] Screen flashes red
- [ ] Alarm sound effect

### Breach Mechanics (45 min)
- [ ] Walls crack during event
- [ ] Monsters try to break through
- [ ] If breached, production stops
- [ ] Heroes must clear breaches
- [ ] Multiple breaches possible

### Visual Effects (45 min)
- [ ] Red tint overlay
- [ ] Shaking intensifies
- [ ] Crack animations on walls
- [ ] Monster eyes glow
- [ ] Panic animations on generators

### Rewards (30 min)
- [ ] 3x gold from monsters during event
- [ ] Bonus gold on successful defense
- [ ] Achievement for perfect defense
- [ ] **TEST**: Survive Blood Moon event

---

## Milestone 16: Power-Ups & Polish (2 hours)
**Goal: Floating bonuses and quality of life**

### Gold Sacks (45 min)
- [ ] Spawn randomly every 60-120 sec
- [ ] Float across screen
- [ ] Click to collect
- [ ] Give 10% of current GPS
- [ ] Sparkle effect on collection

### Temporary Boosts (45 min)
- [ ] Click Power boost (10x for 30 sec)
- [ ] Production boost (2x for 60 sec)
- [ ] Hero strength boost
- [ ] Visual indicators for active boosts
- [ ] Boost timer display

### UI Polish (30 min)
- [ ] Smooth number transitions
- [ ] Button press animations
- [ ] Hover effects on all buttons
- [ ] Tooltips with descriptions
- [ ] Sound effects for all actions
- [ ] **TEST**: Collect power-ups, see effects

---

## Milestone 17: Prestige System (2 hours)
**Goal: Meta-progression through resets**

### Prestige Unlock (30 min)
- [ ] Unlock at Floor 9 or Floor 12 boss
- [ ] Prestige button in menu
- [ ] Confirmation dialog
- [ ] Calculate souls earned

### Reset Process (30 min)
- [ ] Collapse animation
- [ ] Reset all generators
- [ ] Reset heroes and guild
- [ ] Keep souls and achievements
- [ ] Start with bonuses

### Soul Shop (45 min)
- [ ] Starting gold bonus
- [ ] Click multiplier
- [ ] Production multiplier
- [ ] Hero stat bonuses
- [ ] Permanent upgrades

### Prestige Benefits (15 min)
- [ ] Show total souls
- [ ] Display active bonuses
- [ ] Faster early game
- [ ] **TEST**: Prestige and restart stronger

---

## Milestone 18: Final Polish (2 hours)
**Goal: Game feels complete and professional**

### Audio System (45 min)
- [ ] Background music (8-bit style)
- [ ] Volume sliders
- [ ] Mute buttons
- [ ] Sound effect variations
- [ ] Music changes during Blood Moon

### Achievements (45 min)
- [ ] First miner, first hero, first boss
- [ ] Reach Floor 5, 8, 12
- [ ] Survive Blood Moon
- [ ] First prestige
- [ ] Achievement popup animations

### Settings Menu (30 min)
- [ ] Pause game option
- [ ] Quality settings (particles on/off)
- [ ] Number notation options
- [ ] Export/Import save
- [ ] Discord/Twitter links
- [ ] **TEST**: Complete game loop feels polished

---

## Milestone 19: Balance & Optimization (1.5 hours)
**Goal: Smooth performance and good pacing**

### Performance (45 min)
- [ ] Object pooling for particles
- [ ] Limit floating texts to 10
- [ ] Cull off-screen sprites
- [ ] Optimize render loop
- [ ] Target 60 FPS consistently

### Balance Tuning (45 min)
- [ ] First boss at 20 minutes
- [ ] First prestige at 6-8 hours
- [ ] Smooth cost curves
- [ ] GPS vs click balance
- [ ] Hero success rates
- [ ] **TEST**: Full playthrough with good pacing

---

## Milestone 20: Mobile Support (1 hour)
**Goal: Playable on phone/tablet**

### Touch Controls (30 min)
- [ ] Touch events for clicking
- [ ] Touch-friendly button sizes
- [ ] Prevent zoom on double tap
- [ ] Scroll prevention in game area

### Responsive Layout (30 min)
- [ ] Scale canvas to fit screen
- [ ] Maintain aspect ratio
- [ ] Larger text on small screens
- [ ] Test on various devices
- [ ] **TEST**: Play on phone browser

---

## Debug Commands for Testing
```javascript
// Add to console for testing at any milestone
window.debug = {
  gold: (amount) => game.gold = amount,
  addGold: (amount) => game.gold += amount,
  spawnHero: () => game.spawnHero('warrior'),
  killAllMonsters: () => game.monsters = [],
  unlockFloor: (n) => game.maxFloor = n,
  triggerBloodMoon: () => game.bloodMoon.trigger(),
  maxUpgrades: () => /* max all upgrades */,
  speedUp: (x) => game.speed = x,
  prestige: () => game.prestige()
};
```

---

## MVP Definition
**Milestones 1-11 constitute the MVP (approximately 18 hours of work)**

After MVP, you have:
- ✅ Clicking for gold
- ✅ Passive income from generators
- ✅ Visual underground expansion
- ✅ Heroes fighting monsters
- ✅ Boss battles
- ✅ Save/load system
- ✅ Basic progression loop

This is fully playable and testable!

---

## Testing Checklist After Each Milestone
- [ ] Game loads without errors
- [ ] Can interact with new features
- [ ] Previous features still work
- [ ] Performance acceptable (check FPS)
- [ ] Save and reload works
- [ ] No console errors
- [ ] Visual feedback for all actions

---

## Notes for Implementation
- Start each session by completing one milestone
- Test thoroughly before moving to next milestone
- Each milestone should be playable
- Commit code after each milestone
- Use placeholder art initially (colored rectangles)
- Add polish and art in later milestones
- Keep console open for debugging