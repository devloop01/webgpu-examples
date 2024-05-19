export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const degToRad = (degrees: number) => degrees * (Math.PI / 180);
export const radToDeg = (radians: number) => radians * (180 / Math.PI);
