
export enum AppFlow {
  SPLASH = 'SPLASH',
  LANDING = 'LANDING',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  GAME = 'GAME'
}

export enum GameState {
  PLAYER_TURN = 'PLAYER_TURN',
  ENEMY_TURN = 'ENEMY_TURN',
  WON = 'WON',
  LOST = 'LOST'
}

export enum Ownership {
  NEUTRAL = 'NEUTRAL',
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY'
}

export enum CellType {
  EMPTY = 'EMPTY',
  BASE = 'BASE',
  ROCK = 'ROCK'
}

export interface HexCoord {
  q: number;
  r: number;
}

export interface CellData {
  coord: HexCoord;
  type: CellType;
  owner: Ownership;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  trailColor: string;
  description: string;
  title: string;
}

export interface LevelDefinition {
  name: string;
  size: number;
  playerStart: HexCoord;
  enemyStart: HexCoord;
  rocks: HexCoord[];
  atmosphere?: 'day' | 'sunset' | 'night';
  winThreshold: number; // Percentage like 0.6
}

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },   // East
  { q: 0, r: 1 },   // South-East
  { q: -1, r: 1 },  // South-West
  { q: -1, r: 0 },  // West
  { q: 0, r: -1 },  // North-West
  { q: 1, r: -1 }   // North-East
];
