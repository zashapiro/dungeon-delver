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

## Milestone 0: Project Setup (30 minutes)
**Goal: Testable HTML page with canvas**

- [ ] Create index.html with basic structure
- [ ] Add canvas element (960x640)
- [ ] Create style.css with basic styling
- [ ] Add main.js and verify it loads
- [ ] Set up canvas context in JavaScript
- [ ] Draw a test rectangle to verify canvas works
- [ ] Add "Hello World" text to canvas
- [ ] **TEST**: Open index.html, see rectangle and text

---

## Milestone 1: Clickable Mountain (2 hours)
**Goal: Click mountain, see gold increase**

### Basic Setup (30 min)
- [ ] Create game object with gold property (start at 0)
- [ ] Create render function using requestAnimationFrame
- [ ] Add FPS counter in corner
- [ ] Draw solid brown triangle as mountain placeholder
- [ ] Draw blue rectangle as sky placeholder

### Click Detection (30 min)
- [ ] Add click event listener to canvas
- [ ] Detect if click is within mountain area
- [ ] Increment gold by 1 on mountain click
- [ ] Console.log gold value on click
- [ ] **TEST**: Click mountain, see gold increase in console

### Gold Display (30 min)
- [ ] Draw gold counter text at top of screen
- [ ] Format: "Gold: 0"
- [ ] Update text every frame
- [ ] Add black background rectangle behind text for readability
- [ ] Change cursor to pointer when over mountain

### Visual Feedback (30 min)
- [ ] Create floating text class
- [ ] Spawn "+1" text at click position
- [ ] Animate text moving up and fading
- [ ] Add array to track active floating texts
- [ ] Remove floating texts when fully faded
- [ ] **TEST**: Click mountain, see gold counter and floating +1

---

## Milestone 2: Number System & Polish (1.5 hours)
**Goal: Formatted numbers, satisfying click feedback**

### Number Formatting (30 min)
- [ ] Create formatNumber function (1K, 1M, 1B)
- [ ] Apply to gold display
- [ ] Test with debug.addGold(1000000)
- [ ] Add GPS (gold per second) counter
- [ ] Calculate GPS every second

### Click Improvements (30 min)
- [ ] Increase click value to 1
- [ ] Create click power variable
- [ ] Add "Click Power: 1" to UI
- [ ] Create screen shake function
- [ ] Add 2-pixel shake on click

### Particles (30 min)
- [ ] Create particle class
- [ ] Spawn 5 gold particles on click
- [ ] Particles move in random directions
- [ ] Particles fade over 1 second
- [ ] Draw particles as small yellow squares
- [ ] **TEST**: Clicking feels satisfying with particles and shake

---

## Milestone 3: First Generator - Surface Miners (2 hours)
**Goal: Buy miners, earn passive income**

### Generator System (45 min)
- [ ] Create Generator class
- [ ] Properties: name, baseCost, baseIncome, owned
- [ ] Method: getCost() with 1.15x scaling
- [ ] Method: getIncome() returns total income
- [ ] Create surface miner generator instance

### Purchase UI (45 min)
- [ ] Draw miner button below mountain
- [ ] Show: "Miners (0) - Cost: 15"
- [ ] Detect clicks on button
- [ ] Check if player can afford
- [ ] Deduct gold and add miner if affordable
- [ ] Update button text after purchase
- [ ] Gray out button if can't afford

### Passive Income (30 min)
- [ ] Create game loop update function
- [ ] Calculate total GPS from all generators
- [ ] Add GPS to gold every second
- [ ] Update GPS display
- [ ] Show income per miner on hover
- [ ] **TEST**: Buy miners, watch gold increase automatically

---

## Milestone 4: Visual Mining Camp (1.5 hours)
**Goal: Animated mining camp on surface**

### Surface Scene (45 min)
- [ ] Draw proper mountain sprite (triangular, brown/gray)
- [ ] Add sky gradient (light blue to white)
- [ ] Draw ground/grass line
- [ ] Add 2-3 tree sprites
- [ ] Draw empty mining camp area

### Miner Animation (45 min)
- [ ] Create simple 8x8 miner sprite
- [ ] Draw miners at camp when owned > 0
- [ ] Animate miners walking left/right (2 frame)
- [ ] Scale miners shown (max 10 visible)
- [ ] Add mining cart sprite
- [ ] Animate cart moving when miners active
- [ ] **TEST**: Buy miners, see camp come alive

---

## Milestone 5: Save System (1 hour)
**Goal: Game persists on refresh**

### Basic Save/Load (30 min)
- [ ] Create save function
- [ ] Save: gold, miners owned, click power
- [ ] Call save every 10 seconds
- [ ] Create load function
- [ ] Load on game start
- [ ] Test refresh preserves progress

### Offline Progress (30 min)
- [ ] Save timestamp with save data
- [ ] Calculate offline time on load
- [ ] Calculate offline gold earned
- [ ] Show popup: "Offline for X, earned Y gold"
- [ ] Add "Reset Game" button
- [ ] Confirm dialog before reset
- [ ] **TEST**: Close game, wait 1 min, reload, see offline gold

---

## Milestone 6: Underground Reveal (2 hours)
**Goal: First underground generator triggers camera pan**

### Underground Generator (30 min)
- [ ] Create Drill Operator generator (Floor 1)
- [ ] Cost: 100 gold
- [ ] Income: 1 gold/sec
- [ ] Add purchase button below miners
- [ ] Same purchase logic as miners

### Camera System (45 min)
- [ ] Add camera Y position variable
- [ ] Create translation for all drawing
- [ ] Detect first drill purchase
- [ ] Trigger camera pan animation
- [ ] Implement easing function

### Underground Visual (45 min)
- [ ] Draw underground cross-section
- [ ] Stone/dirt texture sides
- [ ] Show drill operator area when owned
- [ ] Animate drill spinning
- [ ] Show "Floor 1" label
- [ ] Split screen vertically (economy left, dungeon right)
- [ ] **TEST**: Buy drill, watch dramatic camera pan down

---

## Milestone 7: Multiple Floors (1.5 hours)
**Goal: Floors 1-3 with unique generators**

### Additional Generators (45 min)
- [ ] Create Blast Engineer (Floor 2, 1K cost, 10/sec)
- [ ] Create Crystal Harvester (Floor 3, 10K cost, 100/sec)
- [ ] Add purchase buttons for each
- [ ] Stack buttons vertically
- [ ] Show floor number for each

### Visual Themes (45 min)
- [ ] Floor 1: Brown dirt, drill animation
- [ ] Floor 2: Rocky with TNT boxes
- [ ] Floor 3: Purple crystals glowing
- [ ] Add divider lines between floors
- [ ] Animate each generator when owned
- [ ] Right side remains dark/dimmed
- [ ] **TEST**: Can purchase through Floor 3

---

## Milestone 8: UI Bottom Panel (2 hours)
**Goal: Economy and click upgrades in UI**

### Panel Structure (30 min)
- [ ] Create bottom panel (120px height)
- [ ] Dark background with border
- [ ] Split into 3 sections
- [ ] Left: Economy upgrades
- [ ] Right: Click upgrades
- [ ] Center: Guild button (disabled)

### Economy Upgrades (45 min)
- [ ] Create upgrade: Miner Efficiency (+10%, 1K gold)
- [ ] Create upgrade: All Production (+5%, 5K gold)
- [ ] Draw upgrade buttons with costs
- [ ] Show current level (0/10)
- [ ] Implement purchase logic
- [ ] Apply effects to generators

### Click Upgrades (45 min)
- [ ] Create upgrade: Click Power (x2, 500 gold)
- [ ] Create upgrade: Auto-Clicker (1/sec, 10K gold)
- [ ] Draw upgrade buttons
- [ ] Implement auto-click timer
- [ ] Update click value on upgrade
- [ ] Show "MAX" when fully upgraded
- [ ] **TEST**: Purchase upgrades, see effects

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