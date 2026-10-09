import { useEffect, useRef } from 'react';

/**
 * Céu de fundo: estrelas de 0.2–1.1px piscando devagar, na cor `sky`.
 * Semente fixa, então o céu é o mesmo a cada visita. Parado com
 * prefers-reduced-motion. A opacidade (18% na página do nó) é do CSS.
 */
export function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sky = getComputedStyle(document.documentElement).getPropertyValue('--color-sky').trim();
    let points: { x: number; y: number; r: number; a: number; p: number; s: number }[] = [];
    let w = 0;
    let h = 0;
    let frameId = 0;

    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      points = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
        x: rnd() * w,
        y: rnd() * h,
        r: rnd() * 0.9 + 0.2,
        a: rnd() * 0.5 + 0.1,
        p: rnd() * 6.28,
        s: rnd() * 0.6 + 0.2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const pt of points) {
        const alpha = reduce ? pt.a : pt.a * (0.65 + 0.35 * Math.sin((t / 1000) * pt.s + pt.p));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sky;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, 6.283);
        ctx.fill();
      }
      if (!reduce) frameId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      size();
      if (reduce) draw(0);
    };

    size();
    frameId = requestAnimationFrame(draw);
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frameId);
      removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="star-field" aria-hidden="true" />;
}
