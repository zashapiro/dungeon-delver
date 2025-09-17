# TASKS.md - Granular Task List for Dungeon Delver

## 🎆 LATEST SESSION SUMMARY
**Major Achievement**: **Guild Building Visibility Enhancement** - Interactive Construction Site Implemented!

### ✅ Key Accomplishments This Session:
1. **Guild Building Always Visible**: Construction site with yellow highlight appears before purchase
2. **Interactive Visual Cues**: Pulsing "CLICK HERE" indicator guides player progression
3. **Professional State Management**: Construction site transforms to full building after purchase
4. **Enhanced Player Guidance**: Clear cost information and call-to-action messaging
5. **Complete UI Polish**: Shadow Miner breach system with dramatic warning modal

### 🎮 ENHANCED VISUAL PROGRESSION:
1. **Guild Construction Site**: Yellow-highlighted area visible from game start with cost info
2. **Interactive Guidance**: Pulsing "CLICK HERE" text draws attention to progression path
3. **State Transformation**: Construction site becomes full building after 5K gold purchase
4. **Shadow Miner Breach**: Manual trigger system with dramatic warning modal
5. **Complete Flow**: Economic growth → breach decision → boss battle → generator unlock

### 🎯 Current Status: **12/20 Milestones Complete + UI System Perfected**
- **✅ Phase 1**: Complete idle economy system (Milestones 0-8)
- **✅ Phase 2**: Complete combat & boss system (Milestones 9-11)
- **✅ UI Foundation**: Bulletproof Canvas UI system ready for complex features
- **🎯 Next**: Milestone 12 - Guild Popup UI (complex upgrade tree system)

---

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

## ✅ Milestone 8.5: Canvas UI System - SUCCESSFULLY IMPLEMENTED ✅
**Goal: Seamless canvas-based UI with perfect visual integration**
**Status**: COMPLETED - Full canvas UI conversion successful 🎆
**Commit**: `ed1a0b2` - Canvas based UI
**Priority**: RESOLVED - Phase 2 development unblocked

### ✅ SUCCESSFUL IMPLEMENTATION: Pure Canvas-Based UI System
- [x] **UIComponent Base Class**: Foundation for all canvas UI elements
- [x] **UIButton Class**: Full-featured buttons with multiline text and hover states
- [x] **CanvasUIManager**: Complete event handling and click detection system
- [x] **Seamless Floor Integration**: Generator controls rendered as natural floor extensions
- [x] **Perfect Visual Alignment**: Zero gaps between UI elements and floor graphics

### ✨ TECHNICAL ACHIEVEMENTS:
- [x] **Canvas-Native Rendering**: All UI elements rendered directly on canvas
- [x] **Event System Integration**: Native canvas click detection replaces HTML events
- [x] **Visual Continuity**: Consistent pixel art aesthetic throughout interface
- [x] **Performance Optimized**: 60 FPS maintained with efficient canvas operations
- [x] **Future-Ready Architecture**: Robust foundation for Phase 2 combat system

### 🎯 IMPLEMENTATION DETAILS:
- [x] Top bar with gold, GPS, click power, and FPS display
- [x] Right-side upgrades panel with economy and click upgrades
- [x] Bottom-center guild button with state management
- [x] Left-side floor controls seamlessly integrated with floor graphics
- [x] Complete removal of HTML overlay elements

### 🚀 IMPACT ON DEVELOPMENT:
- **UNBLOCKED**: Phase 2 combat system ready to proceed
- **User Experience**: Professional-grade visual integration achieved
- **Technical Foundation**: Solid canvas architecture supports future features
- **Performance**: Smooth 60 FPS operation with complex UI interactions

---

## 🎯 READY FOR PHASE 2 DEVELOPMENT 🎯

**Canvas UI Foundation Complete** - All prerequisites for Phase 2 combat system are now satisfied:
- ✅ Seamless visual integration eliminates UI/graphics conflicts
- ✅ Guild button infrastructure ready for activation
- ✅ Floor control system prepared for monster/hero integration
- ✅ 60 FPS performance maintained with complex canvas UI
- ✅ Professional visual polish establishes quality standard

---

## ✅ UI SYSTEM STABILIZATION - COMPLETED ✅
**Goal: Bulletproof UI system with immediate button responsiveness**
**Status**: CRITICAL BUGS RESOLVED - UI system now stable and production-ready

### Cookie Clicker Architecture Implementation ✅ COMPLETED
- [x] ✅ **Pre-create all UI elements**: All generator buttons created at startup regardless of availability
- [x] ✅ **State-only updates**: Button visibility/interactivity updated without recreation
- [x] ✅ **Generator availability logic**: `isGeneratorAvailable()` function with proper thresholds
- [x] ✅ **Eliminated UI recreation**: No more `createGeneratorButtons()` calls during gameplay
- [x] ✅ **Auto-refresh without lockups**: Safe state updates maintain 60 FPS performance

### Critical Bug Fixes ✅ COMPLETED
- [x] ✅ **"generator.isAvailable is not a function"**: Replaced with dedicated availability function
- [x] ✅ **Text covering upgrade buttons**: Fixed `setText()` calls overwriting icons with tooltips
- [x] ✅ **Game lockups during clicking**: Eliminated problematic auto-refresh polling
- [x] ✅ **Manual resize requirement**: New buttons work immediately when unlocked
- [x] ✅ **Canvas coordinate system**: Perfect scaling without button misalignment
- [x] ✅ **Shadow Miner progression**: Implemented manual breach trigger system for story control

### Technical Implementation Details ✅
- [x] ✅ **isGeneratorAvailable(generator)**: Threshold-based logic (surface=always, drill=100g, blast=1Kg, etc.)
- [x] ✅ **updateAllGeneratorButtons()**: Updates visibility and state, never recreates UI structure
- [x] ✅ **Icon-only button display**: Upgrade buttons show clean icons (⛏️, 💰) with hover tooltips
- [x] ✅ **Tooltip system preservation**: Detailed information available on hover without text overlap
- [x] ✅ **Save/load integration**: All UI states properly preserved and restored

### 🎮 Player Experience Improvements
1. **Immediate Responsiveness**: New generator buttons work the moment they become available
2. **Clean Visual Design**: Upgrade buttons display only their icons, detailed info on hover
3. **Stable Performance**: No more game lockups or freezing during mountain clicking
4. **Professional Polish**: Seamless UI updates without any visual glitches or delays
5. **Consistent Behavior**: All buttons work reliably without requiring window resizes

### 🚀 Development Impact
- **Phase 2 Unblocked**: Complex guild popup system now has stable foundation
- **Performance Optimized**: 60 FPS maintained with efficient UI state management
- **Scalability Achieved**: UI architecture supports unlimited additional generators/upgrades
- **Quality Standard**: Professional-grade UI system sets quality bar for remaining features
- **Narrative Innovation**: Generator buttons become story progression tools, not just purchases

### 🔧 GUILD BUILDING IMPLEMENTATION DETAILS ✅
- **Always Visible Logic**: `drawGuildBuilding()` called regardless of `guildLevel` status
- **State-Based Rendering**: Two visual modes (construction site vs full building)
- **Visual Highlights**: Yellow glow, dashed outline, pulsing text indicators
- **Interactive Elements**: Construction sign with cost info and call-to-action
- **Click Detection**: `game.guildBuildingArea` defined for both states
- **Professional Polish**: Smooth state transitions with detailed building graphics

### 🔧 SHADOW MINER BREACH SYSTEM ✅
- **Warning Modal**: Dramatic confirmation popup with breach consequences
- **Manual Trigger**: Player choice replaces automatic income-based trigger
- **Generator Purchase Logic**: Special handling for breach vs purchase actions
- **Visual Feedback**: Pulsing red modal with "DANGER AHEAD" messaging

---

## ✅ Milestone 9: The Breach - Monsters Appear - COMPLETED ✅
**Goal: Monsters block Floor 4, guild unlocked**

### Monster System (45 min) ✅ COMPLETED
- [x] Create Monster class with HP, speed, damage stats
- [x] Add 3 monster types: Goblin, Orc, Skeleton
- [x] Draw pixelated monster sprites with color coding
- [x] Walking animation with frame timing
- [x] Health bars above monsters with color coding
- [x] Death effects with particles

### Visual Changes (30 min) ✅ COMPLETED
- [x] Illuminate right side at Floor 4 with torchlight effects
- [x] Show monsters spawning in dungeon
- [x] Red warning text: "⚠️ BREACHED - Monsters Active!"
- [x] Dramatic screen shake on breach event
- [x] Particle effects and floating text

### Breach Event System ✅ COMPLETED  
- [x] Trigger breach when income ≥ 500g/s
- [x] Transform Floor 4 from sealed to illuminated dungeon
- [x] Spawn monsters every 5 seconds continuously
- [x] Add flickering torchlight and cave details
- [x] Monster AI moves toward surface threatening miners

### Guild Activation (45 min) ✅ COMPLETED
- [x] Enable guild button (5K gold cost)
- [x] Emergency flashing effect when breach occurs
- [x] Urgent messaging: "🚨 URGENT! 🚨"
- [x] Click to purchase guild functionality
- [x] Save/load support for combat system
- [x] Debug command: debug.triggerBreach()
- [x] **TEST**: Reach 500g/s income, see breach, urgent guild UI

---

## ✅ Milestone 10: Basic Heroes - COMPLETED ✅
**Goal: Heroes spawn and move through dungeon**

### Hero Class (45 min) ✅ COMPLETED
- [x] Create Hero class
- [x] Properties: hp, damage, speed, position
- [x] Start with Warrior type only
- [x] 12x12 sprite
- [x] Walk animation (2 frame)

### Spawning System (45 min) ✅ COMPLETED
- [x] Spawn hero every 30 seconds
- [x] Start at top right of dungeon
- [x] Max 1 hero initially
- [x] Show hero count in UI
- [x] Add spawn timer display

### Pathfinding (45 min) ✅ COMPLETED
- [x] Heroes move left automatically
- [x] Move to next floor via stairs
- [x] Speed: 20 pixels/second
- [x] Stop when reaching monster
- [x] Face direction of movement

### Basic Combat (45 min) ✅ COMPLETED
- [x] Attack when adjacent to monster
- [x] Deal damage every second
- [x] Show damage numbers
- [x] Monster attacks back
- [x] Hero death and respawn
- [x] **TEST**: Heroes fight monsters automatically

---

## ✅ Milestone 11: Boss System - COMPLETED ✅
**Goal: Defeat boss to unlock Floor 5**

### Boss Implementation (45 min) ✅ COMPLETED
- [x] ✅ Create Boss class (extends Monster)
- [x] ✅ Goblin Chief: 500 HP, 20 damage
- [x] ✅ 32x32 sprite with golden glow and crown
- [x] ✅ Position at leftmost Floor 4 (dungeon end)
- [x] ✅ Enhanced health bar with HP numbers

### Boss Combat (45 min) ✅ COMPLETED
- [x] ✅ Heroes prioritize bosses over regular monsters
- [x] ✅ Boss fights back with enhanced combat AI
- [x] ✅ Special ability: summon minion every 10 seconds
- [x] ✅ Death animation with golden particle explosion
- [x] ✅ Victory fanfare with screen shake

### Floor Sealing (30 min) ✅ COMPLETED
- [x] ✅ On boss defeat, automatically seal Floor 4
- [x] ✅ Enable Floor 4 Shadow Miner generator (50K cost, 300g/s)
- [x] ✅ Show "FLOOR 4 SECURED!" victory message
- [x] ✅ Remove all monsters from sealed floor
- [x] ✅ Floor progression unlocking system
- [x] ✅ **TESTED**: Boss defeat unlocks Floor 4 generator and Floor 5 access

### Additional Achievements ✅
- [x] ✅ Boss spawning integrated with breach trigger system
- [x] ✅ Debug commands: `debug.spawnBoss()`, `debug.killBoss()`, `debug.listBosses()`
- [x] ✅ Complete save/load integration for boss state
- [x] ✅ Layout fixes - left column no longer overlaps game world
- [x] ✅ Generator enabled/disabled system for floor progression

---

## 🎯 Milestone 12: Guild Popup UI (2.5 hours) - NEXT TARGET
**Goal: Complex upgrade tree in modal - Ready to Implement**

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