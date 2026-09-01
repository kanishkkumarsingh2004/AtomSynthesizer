import { Vector3D } from '../domain/molecular/MolecularTypes';
import { radiansToDegrees } from './units';

export function distance(v1: Vector3D, v2: Vector3D): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function midpoint(v1: Vector3D, v2: Vector3D): Vector3D {
  return {
    x: (v1.x + v2.x) / 2,
    y: (v1.y + v2.y) / 2,
    z: (v1.z + v2.z) / 2
  };
}

export function add(v1: Vector3D, v2: Vector3D): Vector3D {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

export function subtract(v1: Vector3D, v2: Vector3D): Vector3D {
  return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
}

export function scale(v: Vector3D, factor: number): Vector3D {
  return { x: v.x * factor, y: v.y * factor, z: v.z * factor };
}

export function dot(v1: Vector3D, v2: Vector3D): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function cross(v1: Vector3D, v2: Vector3D): Vector3D {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
}

export function magnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v: Vector3D): Vector3D {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

export function angle(a: Vector3D, vertex: Vector3D, b: Vector3D): number {
  const ba = normalize(subtract(a, vertex));
  const bc = normalize(subtract(b, vertex));
  const cosTheta = Math.max(-1, Math.min(1, dot(ba, bc)));
  return radiansToDegrees(Math.acos(cosTheta));
}

export function dihedralAngle(
  p1: Vector3D,
  p2: Vector3D,
  p3: Vector3D,
  p4: Vector3D
): number {
  const b1 = subtract(p2, p1);
  const b2 = subtract(p3, p2);
  const b3 = subtract(p4, p3);

  const b2Norm = normalize(b2);

  const n1 = cross(b1, b2);
  const n2 = cross(b2, b3);

  const x = dot(n1, n2);
  const y = dot(cross(n1, n2), b2Norm);

  return radiansToDegrees(Math.atan2(y, x));
}
