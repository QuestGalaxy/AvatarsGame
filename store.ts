
import { create } from 'zustand';
import { AppFlow, GameState, CellType, CellData, HexCoord, HEX_DIRECTIONS, Ownership, LevelDefinition, Character } from './types';
import { audio } from './utils/audio';

export const CHARACTERS: Character[] = [
  { id: 'emerald', name: 'Nova', title: 'The Stellar Scout', color: '#22d3ee', secondaryColor: '#0891b2', trailColor: '#67e8f9', description: 'Faster than light, sharper than a pulsar.' },
  { id: 'ruby', name: 'Ares', title: 'The Star Conqueror', color: '#f43f5e', secondaryColor: '#9f1239', trailColor: '#fb7185', description: 'Fueled by the core of a dying sun.' },
  { id: 'sapphire', name: 'Nebula', title: 'The Void Walker', color: '#8b5cf6', secondaryColor: '#4c1d95', trailColor: '#a78bfa', description: 'Silent as the vacuum, cold as deep space.' },
  { id: 'amber', name: 'Zenith', title: 'The Solar Flare', color: '#f59e0b', secondaryColor: '#b45309', trailColor: '#fbbf24', description: 'Radiating pure photonic energy.' }
];

export const LEVELS: LevelDefinition[] = [
  {
    name: "Stardust Outpost",
    size: 4,
    playerStart: { q: -3, r: 0 },
    enemyStart: { q: 3, r: 0 },
    rocks: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
    atmosphere: 'night',
    winThreshold: 0.6
  },
  {
    name: "Nebula Gate",
    size: 5,
    playerStart: { q: -4, r: 2 },
    enemyStart: { q: 4, r: -2 },
    rocks: [{ q: -1, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 0 }],
    atmosphere: 'sunset',
    winThreshold: 0.6
  },
  {
    name: "Event Horizon",
    size: 6,
    playerStart: { q: -5, r: 0 },
    enemyStart: { q: 5, r: 0 },
    rocks: [{ q: -2, r: 1 }, { q: 2, r: -1 }],
    atmosphere: 'night',
    winThreshold: 0.55
  }
];

interface GameStore {
  appFlow: AppFlow;
  gameState: GameState;
  grid: Record<string, CellData>;
  playerPos: HexCoord;
  prevPlayerPos: HexCoord;
  enemyPos: HexCoord;
  prevEnemyPos: HexCoord;
  levelIndex: number;
  selectedCharacterId: string;
  isLevelMenuOpen: boolean;
  atmosphere: 'day' | 'sunset' | 'night';
  isCinematic: boolean;
  
  setAppFlow: (flow: AppFlow) => void;
  setSelectedCharacterId: (id: string) => void;
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

export const useGameStore = create<GameStore>((set, get) => ({
  appFlow: AppFlow.SPLASH,
  gameState: GameState.PLAYER_TURN,
  grid: {},
  playerPos: { q: 0, r: 0 },
  prevPlayerPos: { q: 0, r: 0 },
  enemyPos: { q: 0, r: 0 },
  prevEnemyPos: { q: 0, r: 0 },
  levelIndex: 0,
  selectedCharacterId: 'emerald',
  isLevelMenuOpen: false,
  atmosphere: 'day',
  isCinematic: false,

  setAppFlow: (flow) => {
    set({ appFlow: flow });
    if (flow === AppFlow.GAME) {
      get().initLevel(get().levelIndex);
    }
  },
  
  setSelectedCharacterId: (id) => set({ selectedCharacterId: id }),
  toggleLevelMenu: () => set(s => ({ isLevelMenuOpen: !s.isLevelMenuOpen })),
  setCinematic: (val) => set({ isCinematic: val }),

  initLevel: (idx = 0) => {
    const safeIdx = idx % LEVELS.length;
    const level = LEVELS[safeIdx];
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

    set({
      grid: newGrid,
      levelIndex: safeIdx,
      playerPos: level.playerStart,
      prevPlayerPos: level.playerStart,
      enemyPos: level.enemyStart,
      prevEnemyPos: level.enemyStart,
      gameState: GameState.PLAYER_TURN,
      atmosphere: level.atmosphere || 'day',
      isLevelMenuOpen: false,
      isCinematic: true 
    });
  },

  movePlayer: (target) => {
    const { gameState, playerPos, grid, levelIndex, isCinematic } = get();
    if (gameState !== GameState.PLAYER_TURN || isCinematic) return;

    const neighbors = getNeighbors(playerPos);
    const isAdjacent = neighbors.some(n => isSameCoord(n, target));
    if (!isAdjacent) return;

    const key = getCoordKey(target.q, target.r);
    const cell = grid[key];
    if (!cell || cell.type === CellType.ROCK) return;

    if (cell.owner === Ownership.ENEMY) {
      const counts = getOwnershipCounts(grid);
      if (counts.PLAYER <= counts.ENEMY) {
        audio.playLose(); 
        return;
      }
    }

    const newGrid = { ...grid };
    newGrid[key] = { ...cell, owner: Ownership.PLAYER };
    const filledGrid = performRegionCapture(newGrid, Ownership.PLAYER, LEVELS[levelIndex].size);
    
    audio.playMove();
    set({ grid: filledGrid, prevPlayerPos: playerPos, playerPos: target, gameState: GameState.ENEMY_TURN });

    const level = LEVELS[levelIndex];
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
      setTimeout(() => get().moveEnemy(), 600);
    }
  },

  moveEnemy: () => {
    const { gameState, enemyPos, grid, levelIndex } = get();
    if (gameState !== GameState.ENEMY_TURN) return;

    const neighbors = getNeighbors(enemyPos).filter(n => {
      const cell = grid[getCoordKey(n.q, n.r)];
      return cell && cell.type !== CellType.ROCK;
    });

    if (neighbors.length === 0) {
      set({ gameState: GameState.PLAYER_TURN });
      return;
    }

    const baseAttack = neighbors.find(n => isSameCoord(n, LEVELS[levelIndex].playerStart));
    const neutralAttack = neighbors.find(n => grid[getCoordKey(n.q, n.r)].owner === Ownership.NEUTRAL);
    const dist = (a: HexCoord, b: HexCoord) => Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));
    const aggressive = neighbors.sort((a, b) => dist(a, LEVELS[levelIndex].playerStart) - dist(b, LEVELS[levelIndex].playerStart))[0];

    const target = baseAttack || neutralAttack || aggressive;
    const key = getCoordKey(target.q, target.r);
    
    const counts = getOwnershipCounts(grid);
    if (grid[key].owner === Ownership.PLAYER && counts.ENEMY <= counts.PLAYER) {
      set({ gameState: GameState.PLAYER_TURN });
      return;
    }

    const newGrid = { ...grid };
    newGrid[key] = { ...newGrid[key], owner: Ownership.ENEMY };
    const filledGrid = performRegionCapture(newGrid, Ownership.ENEMY, LEVELS[levelIndex].size);

    audio.playMove();
    set({ grid: filledGrid, prevEnemyPos: enemyPos, enemyPos: target, gameState: GameState.PLAYER_TURN });

    if (isSameCoord(target, LEVELS[levelIndex].playerStart)) {
      set({ gameState: GameState.LOST });
      audio.playLose();
      return;
    }

    const finalCounts = getOwnershipCounts(filledGrid);
    if (finalCounts.ENEMY / finalCounts.TOTAL >= LEVELS[levelIndex].winThreshold) {
      set({ gameState: GameState.LOST });
      audio.playLose();
    }
  }
}));
