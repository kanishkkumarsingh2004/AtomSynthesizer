/**
 * Centralized Unit Conversion System
 * 
 * Rules:
 * - Chemical distances in domain: Ångströms (Å)
 * - Three.js scene coordinates: Scene Units
 * - Scale factor default: 1 Å = 1 Scene Unit
 */

export const ANGSTROM_TO_SCENE_SCALE = 1.0;

export function angstromToScene(angstroms: number): number {
  return angstroms * ANGSTROM_TO_SCENE_SCALE;
}

export function sceneToAngstrom(sceneUnits: number): number {
  return sceneUnits / ANGSTROM_TO_SCENE_SCALE;
}

export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
