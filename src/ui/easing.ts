/**
 * cubic-bezier do CSS como função, para animações feitas em JS (a câmera da
 * constelação anima o viewBox, que o CSS não interpola).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const bez = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t ** 2;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Newton para achar t com bez_x(t) = x; a curva é monótona em x.
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = bez(x1, x2, t) - x;
      const d = slope(x1, x2, t);
      if (Math.abs(dx) < 1e-5 || d === 0) break;
      t -= dx / d;
    }
    return bez(y1, y2, Math.min(1, Math.max(0, t)));
  };
}

/** A curva do design system: rápida no começo, assentando devagar. */
export const EASE_SKY = cubicBezier(0.22, 0.9, 0.24, 1);
/** Aceleração para o mergulho na estrela. */
export const EASE_IN = cubicBezier(0.5, 0, 0.75, 0);
