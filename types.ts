
export enum AppFlow {
  SPLASH = 'SPLASH',
  LANDING = 'LANDING',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  WORLD_SELECT = 'WORLD_SELECT',
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
  powerupId?: string;
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

export type PowerupKind = 'positive' | 'negative';

export interface PowerupDefinition {
  id: string;
  name: string;
  kind: PowerupKind;
  description: string;
}

export interface LevelDefinition {
  name: string;
  size: number;
  playerStart: HexCoord;
  enemyStart: HexCoord;
  rocks: HexCoord[];
  atmosphere?: 'day' | 'sunset' | 'night';
  platformColors?: {
    base: string;
    ring: string;
    underside: string;
  };
  enemyCleverness?: number; // 0-100 scale
  winThreshold: number; // Percentage like 0.6
}

export interface WorldDefinition {
  id: string;
  name: string;
  description: string;
  galaxyPos: { x: number; y: number; size: number; color: string }; // x,y in percentage (0-100)
  levels: LevelDefinition[];
}

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },   // East
  { q: 0, r: 1 },   // South-East
  { q: -1, r: 1 },  // South-West
  { q: -1, r: 0 },  // West
  { q: 0, r: -1 },  // North-West
  { q: 1, r: -1 }   // North-East
];
