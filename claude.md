
#Always read PLANNING.md at the start of every new conversation, check TASKS.md before starting your work, mark completed tasks to TASKS.md immediately, and add newly discovered tasks to TASKS.md when found.

# CLAUDE.md - Dungeon Delver: Idle Empire Development Guide

## Project Overview
Browser-based idle/incremental game with auto-battler elements. Mining economy reveals underground dungeon with monsters. Combines 1990s pixel art (King's Quest style) with Cookie Clicker feedback mechanics.

## Core Concept
- Click mountain → mine gold → build economy → Floor 4 breach → heroes defend → boss battles → progression

## Technical Stack
- **Platform**: HTML5 Canvas, WebGL effects
- **Art**: 16x16 pixel art, VGA 256-color palette, 3x scaling
- **Performance**: 60 FPS, object pooling

## Development Status

### ✅ Phase 1: Core Mining System (COMPLETED)
- Clickable mountain, gold counter (K/M/B/T formatting)
- Surface miners, animated camp, mining cart
- Camera pan to underground, Floor 1-3 generators
- Complete save/load system with offline progress
- Canvas UI system with seamless integration
- Particle effects, screen shake, click streaks

### ✅ Phase 2: Combat System & Boss Battles (COMPLETED)
- Monster emergence at Floor 4 (Goblin, Orc, Skeleton)
- Adventurer's Guild (5K gold unlock)
- Hero spawning with lemming-style pathfinding
- Boss fights: Goblin Chief (500 HP, minion summoning)
- Floor sealing system, Floor 4 Shadow Miner unlock
- Combat resolution, visual effects, save integration

### 🎯 Milestone Progress: 12/20 Complete
**✅ Phase 1 Complete** (Milestones 0-8): Full idle economy
**✅ Phase 2 Complete** (Milestones 9-11): Combat with boss battles
**🎯 Next Target** (Milestone 12): Guild Popup UI with upgrade trees

### 🎮 Current Gameplay Flow:
1. Economic Growth → 500+ gold/s income
2. Floor 4 Breach → Monsters + Goblin Chief spawn
3. Guild Building → 5K gold investment
4. Boss Battle → Heroes vs boss + minions
5. Victory → Floor sealing + Floor 4 generator (300g/s) + Floor 5 access

### Phase 3: Guild Tree & Progression (READY)
- Guild popup UI (600x400 modal)
- Upgrade trees: Warriors, Classes (archer/rogue/cleric), Capacity
- Hero stat upgrades, multiple classes
- Floors 5-8 content

### Phase 4: Blood Moon & Polish
- Blood Moon events, wall breaches
- Floors 9-12, prestige system, audio

## Layout System
**Current Layout**: Left column (300px UI) + Game world area
- **NAV COLUMN**: UI elements only (buttons, stats, controls)
- **GAME WORLD**: Visual game elements (mountain, generators, combat)
- **UNDERGROUND SPLIT**: Generators left half, dungeon right half
- **RESPONSIVE**: Scales to any screen size

### Coordinate System:
```javascript
const gameWorldStartX = getLeftColumnWidth() + 10; // Buffer from left column
const gameWorldMiddleX = gameWorldStartX + gameWorldWidth / 2; // Generator/dungeon split
// Generator area: gameWorldStartX to gameWorldMiddleX
// Dungeon area: gameWorldMiddleX to canvas.width
```

## Key Systems

### Guild Popup (Next Milestone)
```javascript
// 600x400 modal with upgrade trees:
// - Warriors: HP/Damage upgrades, veteran unlock
// - Classes: Archer/Rogue/Cleric unlocks
// - Capacity: Hero slots, spawn rate, revival speed
```

### Core Classes
```javascript
class Hero { // Lemming-style pathfinding, combat states
class Monster { // 3 types: Goblin/Orc/Skeleton
class Boss extends Monster { // Enhanced stats, minion summoning
class Generator { // Economy buildings with animations
class Camera { // Smooth transitions, underground reveal
```

## Technical Details

### Save System & Performance
- **localStorage save/load** with offline progress calculation
- **Number formatting**: K/M/B/T notation
- **Object pooling** for particles/animations
- **60 FPS performance** with canvas optimization

### Balance Constants
```javascript
const BALANCE = {
  generatorCostMultiplier: 1.15,
  guildUnlockFloor: 4,
  bossHPMultiplier: 10,
  heroSpawnRate: 30, // seconds
  bloodMoonFrequency: 300 // seconds
};
```

### Debug Commands
```javascript
window.debug = {
  addGold: (amount) => game.gold += amount,
  spawnBoss: () => debug.spawnBoss(),
  killBoss: () => debug.killBoss(),
  triggerBreach: () => debug.triggerBreach()
};
```

## ✅ LATEST SESSION UPDATE: Visual Polish & Hero Spawning Fixes
**Major Achievement**: Complete Visual Polish and Hero System Stabilization
**Key Innovation**: Seamless visual integration and proper hero mechanics

### 🎆 Session Accomplishments:
1. **Surface Visual Cleanup**: Removed ugly brown background, extended gray mountains to grass line
2. **Underground Gap Elimination**: Removed unnecessary 60px buffer between grass and underground levels
3. **Hero Spawn Position Fix**: Heroes now spawn at proper ground level from guild building
4. **Save/Load Hero System**: Fixed hero position preservation across game sessions
5. **Visual Debug Tools**: Added spawn markers for precise positioning verification

### 🎮 NEW GAMEPLAY FLOW:
1. **💰 50K Gold Threshold**: Shadow Miner button appears with warning text
2. **⚠️ Breach Decision**: Player clicks "Click to Breach Floor 4" (not purchase)
3. **👹 Danger Emerges**: Boss and monsters spawn, Floor 4 becomes hostile
4. **🏰 Guild Activation**: Emergency guild building unlocked (5K gold)
5. **⚔️ Hero Deployment**: Player recruits heroes to fight the threat
6. **👑 Boss Battle**: Strategic combat to secure the floor
7. **🔓 Victory Reward**: Boss defeat enables Shadow Miner for actual purchase (300g/s)

### 🔧 Technical Implementation:
- **Surface Background Fix**: Changed brown background (`#8B4513`) to gray stone (`#696969`) for visual consistency
- **Underground Buffer Removal**: Set `bufferFromSurface: 0` to eliminate gap between grass and underground
- **Hero Spawn Coordinates**: Use `getFloorY(1)` for proper ground-level positioning at guild building
- **Save System Enhancement**: Include hero `x`, `y`, `targetX`, `targetY`, `targetFloor` in save data
- **Debug Spawn Markers**: Red circle indicators with 5-second timer for position verification

## Current Status: Ready for Milestone 12 (Guild Popup UI)
**Foundation**: Bulletproof Canvas UI system with professional responsiveness
**Next Goal**: Implement guild management interface with upgrade trees
**Game Flow**: Economy → Breach → Boss Battle → Floor Sealing → Guild Upgrades