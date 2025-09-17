
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

## ✅ LATEST SESSION UPDATE: UI System Stabilization Complete
**Major Achievement**: Cookie Clicker UI Architecture Successfully Implemented
**Critical Issues Resolved**: Button responsiveness, text overlay, game stability

### 🎆 Session Accomplishments:
1. **Cookie Clicker Architecture**: All UI elements pre-created, only states updated
2. **Generator Availability System**: Proper threshold logic (100g→Drill, 1K→Blast, etc.)
3. **Text Overlay Fix**: Clean icon display with hover tooltips
4. **Auto-Refresh System**: New buttons work immediately without resize
5. **Performance Stability**: Eliminated game lockups during clicking

### 🔧 Technical Fixes Implemented:
- **isGeneratorAvailable(generator)**: Dedicated availability function replacing missing method
- **State-only UI updates**: No more expensive UI recreation during gameplay
- **Icon-only button display**: Upgrade buttons show ⛏️💰 icons with detailed hover tooltips
- **Safe update patterns**: 60 FPS maintained with stable state management

## Current Status: Ready for Milestone 12 (Guild Popup UI)
**Foundation**: Bulletproof Canvas UI system with professional responsiveness
**Next Goal**: Implement guild management interface with upgrade trees
**Game Flow**: Economy → Breach → Boss Battle → Floor Sealing → Guild Upgrades