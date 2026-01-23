import { create } from 'zustand';
import { AppFlow, GameState, CellType, CellData, HexCoord, HEX_DIRECTIONS, Ownership, LevelDefinition, Character, PowerupDefinition, PowerupKind, WorldDefinition, WeatherType } from './types';
import { audio } from './utils/audio';

export const CHARACTERS: Character[] = [
  { id: 'emerald', name: 'Nova', title: 'The Stellar Scout', color: '#22d3ee', secondaryColor: '#0891b2', trailColor: '#67e8f9', description: 'Faster than light, sharper than a pulsar.' },
  { id: 'ruby', name: 'Ares', title: 'The Star Conqueror', color: '#f43f5e', secondaryColor: '#9f1239', trailColor: '#fb7185', description: 'Fueled by the core of a dying sun.' },
  { id: 'sapphire', name: 'Nebula', title: 'The Void Walker', color: '#8b5cf6', secondaryColor: '#4c1d95', trailColor: '#a78bfa', description: 'Silent as the vacuum, cold as deep space.' },
  { id: 'amber', name: 'Zenith', title: 'The Solar Flare', color: '#f59e0b', secondaryColor: '#b45309', trailColor: '#fbbf24', description: 'Radiating pure photonic energy.' }
];

const WORLD_1_LEVELS: LevelDefinition[] = [
  {
    name: "Stardust Outpost",
    size: 4,
    playerStart: { q: -3, r: 0 },
    enemyStart: { q: 3, r: 0 },
    rocks: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
    atmosphere: 'night',
    platformColors: { base: '#38bdf8', ring: '#fef08a', underside: '#a78bfa' },
    enemyCleverness: 10,
    difficulty: 'Easy',
    winThreshold: 0.6
  },
  {
    name: "Solar Array",
    size: 4,
    playerStart: { q: -3, r: 1 },
    enemyStart: { q: 3, r: -1 },
    rocks: [{ q: 1, r: -1 }, { q: -1, r: 1 }],
    atmosphere: 'day',
    platformColors: { base: '#38bdf8', ring: '#fef08a', underside: '#a78bfa' },
    enemyCleverness: 20,
    difficulty: 'Normal',
    winThreshold: 0.6
  },
  {
    name: "Command Center",
    size: 5,
    playerStart: { q: -4, r: 0 },
    enemyStart: { q: 4, r: 0 },
    rocks: [{ q: 0, r: 0 }, { q: 0, r: -2 }, { q: 0, r: 2 }],
    atmosphere: 'night',
    platformColors: { base: '#38bdf8', ring: '#fef08a', underside: '#a78bfa' },
    enemyCleverness: 30,
    difficulty: 'Hard',
    winThreshold: 0.6
  }
];

const WORLD_2_LEVELS: LevelDefinition[] = [
  {
    name: "Nebula Gate",
    size: 5,
    playerStart: { q: -4, r: 2 },
    enemyStart: { q: 4, r: -2 },
    rocks: [{ q: -1, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 0 }],
    atmosphere: 'sunset',
    platformColors: { base: '#f472b6', ring: '#fde047', underside: '#fb923c' },
    enemyCleverness: 35,
    difficulty: 'Expert',
    winThreshold: 0.6
  },
  {
    name: "Plasma Clouds",
    size: 5,
    playerStart: { q: -3, r: 3 },
    enemyStart: { q: 3, r: -3 },
    rocks: [{ q: 2, r: 0 }, { q: -2, r: 0 }],
    atmosphere: 'sunset',
    platformColors: { base: '#f472b6', ring: '#fde047', underside: '#fb923c' },
    enemyCleverness: 45,
    difficulty: 'Master',
    winThreshold: 0.6
  },
  {
    name: "Void Rift",
    size: 6,
    playerStart: { q: -5, r: 2 },
    enemyStart: { q: 5, r: -2 },
    rocks: [{ q: 0, r: 0 }, { q: 1, r: -1 }, { q: -1, r: 1 }, { q: 2, r: -2 }, { q: -2, r: 2 }],
    atmosphere: 'night',
    platformColors: { base: '#f472b6', ring: '#fde047', underside: '#fb923c' },
    enemyCleverness: 55,
    difficulty: 'Grandmaster',
    winThreshold: 0.6
  }
];

const WORLD_3_LEVELS: LevelDefinition[] = [
  {
    name: "Event Horizon",
    size: 6,
    playerStart: { q: -5, r: 0 },
    enemyStart: { q: 5, r: 0 },
    rocks: [{ q: -2, r: 1 }, { q: 2, r: -1 }],
    atmosphere: 'night',
    platformColors: { base: '#22d3ee', ring: '#facc15', underside: '#f472b6' },
    enemyCleverness: 70,
    difficulty: 'Nightmare',
    winThreshold: 0.55
  },
  {
    name: "Singularity Edge",
    size: 6,
    playerStart: { q: -4, r: 4 },
    enemyStart: { q: 4, r: -4 },
    rocks: [{ q: 0, r: 0 }, { q: 3, r: 0 }, { q: -3, r: 0 }],
    atmosphere: 'night',
    platformColors: { base: '#22d3ee', ring: '#facc15', underside: '#f472b6' },
    enemyCleverness: 80,
    difficulty: 'Hell',
    winThreshold: 0.55
  },
  {
    name: "Time Dilator",
    size: 7,
    playerStart: { q: -6, r: 3 },
    enemyStart: { q: 6, r: -3 },
    rocks: [{ q: 0, r: 0 }, { q: 0, r: 3 }, { q: 0, r: -3 }, { q: 3, r: 0 }, { q: -3, r: 0 }],
    atmosphere: 'night',
    platformColors: { base: '#22d3ee', ring: '#facc15', underside: '#f472b6' },
    enemyCleverness: 90,
    difficulty: 'Impossible',
    winThreshold: 0.55
  }
];

export const WORLDS: WorldDefinition[] = [
  {
    id: 'core-systems',
    name: 'Core Systems',
    description: 'The heart of the galaxy. Standard gravity and resources.',
    galaxyPos: { x: 50, y: 50, size: 40, color: '#38bdf8' },
    levels: WORLD_1_LEVELS
  },
  {
    id: 'nebula-expanse',
    name: 'Nebula Expanse',
    description: 'A colorful but dangerous region filled with gas giants.',
    galaxyPos: { x: 20, y: 30, size: 30, color: '#f472b6' },
    levels: WORLD_2_LEVELS
  },
  {
    id: 'event-horizon',
    name: 'Event Horizon',
    description: 'The edge of known space. Physics breaks down here.',
    galaxyPos: { x: 80, y: 70, size: 35, color: '#22d3ee' },
    levels: WORLD_3_LEVELS
  }
];

// Flat list for backward compatibility or simple access
export const LEVELS: LevelDefinition[] = WORLDS.flatMap(w => w.levels);

export const POWERUPS: PowerupDefinition[] = [
  { id: 'surge', name: 'Pulse Surge', kind: 'positive', description: 'Claim adjacent neutral tiles.' },
  { id: 'overclock', name: 'Overclock', kind: 'positive', description: 'Take another move.' },
  { id: 'aegis', name: 'Aegis', kind: 'positive', description: 'Your next attack succeeds.' },
  { id: 'stasis', name: 'Stasis', kind: 'negative', description: 'Skip your next turn.' },
  { id: 'emp', name: 'EMP Burst', kind: 'negative', description: 'Lose up to two tiles.' },
  { id: 'corrupt', name: 'Corrupt Signal', kind: 'negative', description: 'An adjacent tile flips.' },
  { id: 'corrupt', name: 'Corrupt Signal', kind: 'negative', description: 'An adjacent tile flips.' },
];

export const POWERUP_MAP = POWERUPS.reduce<Record<string, PowerupDefinition>>((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

interface GameStore {
  appFlow: AppFlow;
  gameState: GameState;
  grid: Record<string, CellData>;
  playerPos: HexCoord;
  prevPlayerPos: HexCoord;
  enemyPos: HexCoord;
  prevEnemyPos: HexCoord;
  levelIndex: number;
  selectedWorldId: string;
  selectedCharacterId: string;
  isLevelMenuOpen: boolean;
  atmosphere: 'day' | 'sunset' | 'night';
  isCinematic: boolean;
  playerShield: number;
  enemyShield: number;
  skipPlayerTurn: boolean;
  skipEnemyTurn: boolean;
  powerupEventId: number;
  lastPowerup: { id: string; name: string; description: string; kind: PowerupKind; owner: Ownership; coord: HexCoord; eventId: number } | null;
  
  setAppFlow: (flow: AppFlow) => void;
  setSelectedCharacterId: (id: string) => void;
  setSelectedWorldId: (id: string) => void;
  initLevel: (idx?: number) => void;
  movePlayer: (coord: HexCoord) => void;
  moveEnemy: () => void;
  toggleLevelMenu: () => void;
  setCinematic: (val: boolean) => void;
}

const getCoordKey = (q: number, r: number) => `${q},${r}`;

const getNeighbors = (coord: HexCoord): HexCoord[] => {
  return HEX_DIRECTIONS.map(d => ({ q: coord.q + d.q, r: coord.r + d.r }));
};

const isSameCoord = (a: HexCoord, b: HexCoord) => a.q === b.q && a.r === b.r;
const dist = (a: HexCoord, b: HexCoord) => Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));
const getOpponent = (owner: Ownership) => (owner === Ownership.PLAYER ? Ownership.ENEMY : Ownership.PLAYER);

function getOwnershipCounts(grid: Record<string, CellData>) {
  let player = 0, enemy = 0, neutral = 0;
  const values = Object.values(grid);
  values.forEach(c => {
    if (c.owner === Ownership.PLAYER) player++;
    else if (c.owner === Ownership.ENEMY) enemy++;
    else neutral++;
  });
  return { PLAYER: player, ENEMY: enemy, NEUTRAL: neutral, TOTAL: values.length };
}

function performRegionCapture(grid: Record<string, CellData>, owner: Ownership, size: number): Record<string, CellData> {
  const result = { ...grid };
  const keys = Object.keys(grid);
  const canEscape = new Set<string>();
  const queue: string[] = [];

  keys.forEach(key => {
    const cell = grid[key];
    if (cell.owner === owner) return;
    const { q, r } = cell.coord;
    if (Math.abs(q) === size || Math.abs(r) === size || Math.abs(q + r) === size) {
      canEscape.add(key);
      queue.push(key);
    }
  });

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    const current = grid[currentKey];
    getNeighbors(current.coord).forEach(n => {
      const nKey = getCoordKey(n.q, n.r);
      if (grid[nKey] && !canEscape.has(nKey) && grid[nKey].owner !== owner) {
        canEscape.add(nKey);
        queue.push(nKey);
      }
    });
  }

  keys.forEach(key => {
    if (!canEscape.has(key) && grid[key].owner !== owner) {
      result[key] = { ...grid[key], owner };
    }
  });

  return result;
}

function sampleRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function applyPowerup(
  powerupId: string | undefined,
  owner: Ownership,
  target: HexCoord,
  grid: Record<string, CellData>,
  level: LevelDefinition
): { grid: Record<string, CellData>; extraTurn: boolean; grantShield: boolean; skipTurn: boolean } {
  if (!powerupId || !POWERUP_MAP[powerupId]) {
    return { grid, extraTurn: false, grantShield: false, skipTurn: false };
  }

  const opponent = getOpponent(owner);
  const result = { ...grid };
  let extraTurn = false;
  let grantShield = false;
  let skipTurn = false;

  switch (powerupId) {
    case 'surge': {
      const neighbors = getNeighbors(target);
      neighbors.forEach(n => {
        const key = getCoordKey(n.q, n.r);
        const cell = result[key];
        if (cell && cell.type !== CellType.ROCK && cell.owner === Ownership.NEUTRAL) {
          result[key] = { ...cell, owner };
        }
      });
      break;
    }
    case 'overclock':
      extraTurn = true;
      break;
    case 'aegis':
      grantShield = true;
      break;
    case 'stasis':
      skipTurn = true;
      break;
    case 'emp': {
      const owned = Object.values(result).filter(c => c.owner === owner && c.type !== CellType.BASE);
      sampleRandom(owned, Math.min(2, owned.length)).forEach(c => {
        const key = getCoordKey(c.coord.q, c.coord.r);
        result[key] = { ...result[key], owner: Ownership.NEUTRAL };
      });
      break;
    }
    case 'corrupt': {
      const neighbors = getNeighbors(target)
        .map(n => result[getCoordKey(n.q, n.r)])
        .filter(Boolean)
        .filter(c => c.owner === owner && c.type !== CellType.BASE);
      if (neighbors.length > 0) {
        const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
        const key = getCoordKey(chosen.coord.q, chosen.coord.r);
        result[key] = { ...result[key], owner: opponent };
      } else {
        const owned = Object.values(result).filter(c => c.owner === owner && c.type !== CellType.BASE);
        if (owned.length > 0) {
          const chosen = owned[Math.floor(Math.random() * owned.length)];
          const key = getCoordKey(chosen.coord.q, chosen.coord.r);
          result[key] = { ...result[key], owner: Ownership.NEUTRAL };
        }
      }
      break;
    }
    default:
      break;
  }

  return { grid: result, extraTurn, grantShield, skipTurn };
}

function spawnPowerups(grid: Record<string, CellData>, level: LevelDefinition): Record<string, CellData> {
  const eligible = Object.values(grid).filter(c => c.type === CellType.EMPTY && c.owner === Ownership.NEUTRAL);
  const pickupCount = Math.min(4, Math.max(3, Math.floor(level.size)));
  const picks = sampleRandom(eligible, Math.min(pickupCount, eligible.length));
  const result = { ...grid };

  picks.forEach((cell) => {
    const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
    const key = getCoordKey(cell.coord.q, cell.coord.r);
    result[key] = { ...result[key], powerupId: powerup.id };
  });

  return result;
}

function selectEnemyMove(
  neighbors: HexCoord[],
  grid: Record<string, CellData>,
  level: LevelDefinition,
  playerPos: HexCoord,
  enemyPos: HexCoord
): HexCoord {
  const cleverness = Math.max(0, Math.min(100, level.enemyCleverness ?? 10));
  const counts = getOwnershipCounts(grid);

  if (cleverness <= 15) {
    const baseAttack = neighbors.find(n => isSameCoord(n, level.playerStart));
    const neutralAttack = neighbors.find(n => grid[getCoordKey(n.q, n.r)].owner === Ownership.NEUTRAL);
    const aggressive = neighbors.sort((a, b) => dist(a, level.playerStart) - dist(b, level.playerStart))[0];
    return baseAttack || neutralAttack || aggressive;
  }

  const maxDist = level.size * 2;
  const playerNeighbors = getNeighbors(playerPos);

  const scored = neighbors.map(target => {
    const key = getCoordKey(target.q, target.r);
    const cell = grid[key];
    let score = 0;

    if (isSameCoord(target, level.playerStart)) score += 100;

    if (cleverness >= 20 && cell.owner === Ownership.NEUTRAL) score += 6;
    if (cleverness >= 25 && cell.owner === Ownership.PLAYER) score += 4;

    if (cleverness >= 40 && cell.owner === Ownership.PLAYER && counts.ENEMY <= counts.PLAYER) {
      score -= 40;
    }

    if (cleverness >= 50) {
      const d = dist(target, level.playerStart);
      score += (maxDist - d) * 0.6;
    }

    if (cleverness >= 60) {
      const newGrid = { ...grid, [key]: { ...cell, owner: Ownership.ENEMY } };
      const filledGrid = performRegionCapture(newGrid, Ownership.ENEMY, level.size);
      const after = getOwnershipCounts(filledGrid);
      score += (after.ENEMY - counts.ENEMY) * 0.8;
    }

    if (cleverness >= 80) {
      const blocksPlayer = playerNeighbors.some(n => isSameCoord(n, target));
      if (blocksPlayer) score += 4;
    }

    score += Math.random() * 0.25;

    return { target, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].target;
}

export const useGameStore = create<GameStore>((set, get) => ({
  appFlow: AppFlow.SPLASH,
  gameState: GameState.PLAYER_TURN,
  grid: {},
  playerPos: { q: 0, r: 0 },
  prevPlayerPos: { q: 0, r: 0 },
  enemyPos: { q: 0, r: 0 },
  prevEnemyPos: { q: 0, r: 0 },
  levelIndex: 0,
  selectedWorldId: 'core-systems',
  selectedCharacterId: 'emerald',
  isLevelMenuOpen: false,
  atmosphere: 'day',
  isCinematic: false,
  playerShield: 0,
  enemyShield: 0,
  skipPlayerTurn: false,
  skipEnemyTurn: false,
  powerupEventId: 0,
  lastPowerup: null,

  setAppFlow: (flow) => {
    set({ appFlow: flow });
    if (flow === AppFlow.GAME) {
      get().initLevel(get().levelIndex);
    }
  },
  
  setSelectedCharacterId: (id) => set({ selectedCharacterId: id }),
  setSelectedWorldId: (id) => set({ selectedWorldId: id }),
  toggleLevelMenu: () => set(s => ({ isLevelMenuOpen: !s.isLevelMenuOpen })),
  setCinematic: (val) => set({ isCinematic: val }),

  initLevel: (idx = 0) => {
    const { selectedWorldId } = get();
    const world = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
    const safeIdx = idx % world.levels.length;
    const level = world.levels[safeIdx];
    const newGrid: Record<string, CellData> = {};
    const size = level.size;

    for (let q = -size; q <= size; q++) {
      for (let r = Math.max(-size, -q - size); r <= Math.min(size, -q + size); r++) {
        const coord = { q, r };
        newGrid[getCoordKey(q, r)] = { coord, type: CellType.EMPTY, owner: Ownership.NEUTRAL };
      }
    }

    newGrid[getCoordKey(level.playerStart.q, level.playerStart.r)] = { coord: level.playerStart, type: CellType.BASE, owner: Ownership.PLAYER };
    newGrid[getCoordKey(level.enemyStart.q, level.enemyStart.r)] = { coord: level.enemyStart, type: CellType.BASE, owner: Ownership.ENEMY };

    level.rocks.forEach(p => {
      const k = getCoordKey(p.q, p.r);
      if (newGrid[k]) {
        newGrid[k].type = CellType.ROCK;
      }
    });

    const gridWithPowerups = spawnPowerups(newGrid, level);

    set({
      grid: gridWithPowerups,
      levelIndex: safeIdx,
      playerPos: level.playerStart,
      prevPlayerPos: level.playerStart,
      enemyPos: level.enemyStart,
      prevEnemyPos: level.enemyStart,
      gameState: GameState.PLAYER_TURN,
      atmosphere: level.atmosphere || 'day',
      isLevelMenuOpen: false,
      isCinematic: true,
      playerShield: 0,
      enemyShield: 0,
      skipPlayerTurn: false,
      skipEnemyTurn: false,
      powerupEventId: 0,
      lastPowerup: null
    });
  },

  movePlayer: (target) => {
    const { gameState, playerPos, grid, levelIndex, isCinematic, playerShield, skipEnemyTurn, selectedWorldId } = get();
    if (gameState !== GameState.PLAYER_TURN || isCinematic) return;
    
    const world = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
    const level = world.levels[levelIndex];
    
    let nextPlayerShield = playerShield;

    const neighbors = getNeighbors(playerPos);
    const isAdjacent = neighbors.some(n => isSameCoord(n, target));
    if (!isAdjacent) return;

    const key = getCoordKey(target.q, target.r);
    const cell = grid[key];
    if (!cell || cell.type === CellType.ROCK) return;
    const pickedPowerup = cell.powerupId ? POWERUP_MAP[cell.powerupId] : null;
    const nextEventId = pickedPowerup ? get().powerupEventId + 1 : get().powerupEventId;

    if (cell.owner === Ownership.ENEMY) {
      const counts = getOwnershipCounts(grid);
      if (counts.PLAYER <= counts.ENEMY && !isSameCoord(target, level.enemyStart)) {
        if (nextPlayerShield > 0) {
          nextPlayerShield = Math.max(0, nextPlayerShield - 1);
        } else {
          audio.playLose();
          return;
        }
      }
    }

    const newGrid = { ...grid };
    newGrid[key] = { ...cell, owner: Ownership.PLAYER, powerupId: undefined };
    const pickupResult = applyPowerup(cell.powerupId, Ownership.PLAYER, target, newGrid, level);
    const filledGrid = performRegionCapture(pickupResult.grid, Ownership.PLAYER, level.size);
    
    audio.playMove();
    set({
      grid: filledGrid,
      prevPlayerPos: playerPos,
      playerPos: target,
      gameState: GameState.ENEMY_TURN,
      playerShield: nextPlayerShield + (pickupResult.grantShield ? 1 : 0),
      skipPlayerTurn: get().skipPlayerTurn || pickupResult.skipTurn,
      powerupEventId: nextEventId,
      lastPowerup: pickedPowerup
        ? { ...pickedPowerup, owner: Ownership.PLAYER, coord: target, eventId: nextEventId }
        : get().lastPowerup
    });

    if (isSameCoord(target, level.enemyStart)) {
      set({ gameState: GameState.WON });
      audio.playWin();
      return;
    }

    const counts = getOwnershipCounts(filledGrid);
    if (counts.PLAYER / counts.TOTAL >= level.winThreshold) {
      set({ gameState: GameState.WON });
      audio.playWin();
    } else {
      if (pickupResult.extraTurn || skipEnemyTurn) {
        set({ gameState: GameState.PLAYER_TURN, skipEnemyTurn: false });
      } else {
        setTimeout(() => get().moveEnemy(), 600);
      }
    }
  },

  moveEnemy: () => {
    const { gameState, enemyPos, grid, levelIndex, playerPos, enemyShield, skipPlayerTurn, selectedWorldId } = get();
    if (gameState !== GameState.ENEMY_TURN) return;

    const world = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
    const level = world.levels[levelIndex];
    
    let nextEnemyShield = enemyShield;
    const neighbors = getNeighbors(enemyPos).filter(n => {
      const cell = grid[getCoordKey(n.q, n.r)];
      return cell && cell.type !== CellType.ROCK;
    });

    if (neighbors.length === 0) {
      if (skipPlayerTurn) {
        set({ gameState: GameState.PLAYER_TURN, skipPlayerTurn: false });
      } else {
        set({ gameState: GameState.PLAYER_TURN });
      }
      return;
    }

    const target = selectEnemyMove(neighbors, grid, level, playerPos, enemyPos);
    const key = getCoordKey(target.q, target.r);
    const pickedPowerup = grid[key]?.powerupId ? POWERUP_MAP[grid[key].powerupId as string] : null;
    const nextEventId = pickedPowerup ? get().powerupEventId + 1 : get().powerupEventId;
    
    const counts = getOwnershipCounts(grid);
    if (grid[key].owner === Ownership.PLAYER && counts.ENEMY <= counts.PLAYER && !isSameCoord(target, level.playerStart)) {
      if (nextEnemyShield > 0) {
        nextEnemyShield = Math.max(0, nextEnemyShield - 1);
      } else {
        if (skipPlayerTurn) {
          set({ gameState: GameState.ENEMY_TURN, skipPlayerTurn: false });
          setTimeout(() => get().moveEnemy(), 600);
        } else {
          set({ gameState: GameState.PLAYER_TURN });
        }
        return;
      }
    }

    const newGrid = { ...grid };
    const landedCell = newGrid[key];
    newGrid[key] = { ...newGrid[key], owner: Ownership.ENEMY, powerupId: undefined };
    const pickupResult = applyPowerup(landedCell.powerupId, Ownership.ENEMY, target, newGrid, level);
    const filledGrid = performRegionCapture(pickupResult.grid, Ownership.ENEMY, level.size);

    audio.playMove();
    set({
      grid: filledGrid,
      prevEnemyPos: enemyPos,
      enemyPos: target,
      gameState: GameState.PLAYER_TURN,
      enemyShield: nextEnemyShield + (pickupResult.grantShield ? 1 : 0),
      skipEnemyTurn: get().skipEnemyTurn || pickupResult.skipTurn,
      powerupEventId: nextEventId,
      lastPowerup: pickedPowerup
        ? { ...pickedPowerup, owner: Ownership.ENEMY, coord: target, eventId: nextEventId }
        : get().lastPowerup
    });

    if (isSameCoord(target, level.playerStart)) {
      set({ gameState: GameState.LOST });
      audio.playLose();
      return;
    }

    const finalCounts = getOwnershipCounts(filledGrid);
    if (finalCounts.ENEMY / finalCounts.TOTAL >= level.winThreshold) {
      set({ gameState: GameState.LOST });
      audio.playLose();
      return;
    }

    if (pickupResult.extraTurn || skipPlayerTurn) {
      set({ gameState: GameState.ENEMY_TURN, skipPlayerTurn: false });
      setTimeout(() => get().moveEnemy(), 600);
    }
  }
}));
