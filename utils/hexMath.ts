
import { HexCoord, HEX_DIRECTIONS } from '../types';

const HEX_SIZE = 1;

export function hexToWorld(q: number, r: number) {
  // Flat-topped hex math
  const x = HEX_SIZE * (3/2 * q);
  const z = HEX_SIZE * (Math.sqrt(3) * (r + q/2));
  return [x, 0, z] as [number, number, number];
}

/**
 * Maps a direction index (0-5) to a world-space rotation around the Y axis.
 * Returns the angle in radians relative to the positive Z axis (South).
 */
export function dirToRotation(dirIndex: number) {
  const dirVec = HEX_DIRECTIONS[dirIndex % 6];
  const [worldX, , worldZ] = hexToWorld(dirVec.q, dirVec.r);
  // atan2(x, z) gives angle in radians from the positive z-axis.
  // This matches Three.js Y-rotation logic perfectly for objects facing +Z.
  return Math.atan2(worldX, worldZ);
}
