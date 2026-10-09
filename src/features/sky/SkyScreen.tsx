import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTop } from '../../app/AppShell';
import { useReady } from '../../store/useTree';
import { AreaOrb } from '../../ui/AreaOrb';
import { Icon } from '../../ui/Icon';

/** Raio do círculo de orbes, em % do palco, e quanto da linha fica de fora do núcleo e da orbe. */
const RADIUS = 39;
const SPOKE_FROM = 0.3;
const SPOKE_TO = 0.84;
/** Tempo da orbe viajando ao centro antes de abrir a área (t-med). */
const ZOOM_MS = 360;

/**
 * Céu: as áreas em volta de "Computação". Abaixo de 640px vira lista.
 * Clicar numa orbe faz ela viajar ao centro e crescer, e então abre a área.
 */
export function SkyScreen() {
  const { index, state } = useReady();
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const areas = index.catalog.areas;
  const points = areas.map((area, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / areas.length;
    return { area, x: 50 + RADIUS * Math.cos(angle), y: 50 + RADIUS * Math.sin(angle) };
  });
  const canOpen = (slug: string) => (index.branchesByArea.get(slug)?.length ?? 0) > 0;

  const open = (slug: string, animate: boolean) => {
    if (picked) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce) return navigate(`/a/${slug}`);
    setPicked(slug);
    timer.current = setTimeout(() => navigate(`/a/${slug}`), ZOOM_MS);
  };

  return (
    <>
      <PageTop />
      <main className="view sky">
        <div className="sky-inner">
          <div className={`stage ${picked ? 'zoom' : ''}`}>
            <svg className="links" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring" cx="50" cy="50" r={RADIUS} vectorEffect="non-scaling-stroke" />
              <circle className="ring" cx="50" cy="50" r="47" vectorEffect="non-scaling-stroke" strokeDasharray="1 5" />
              {points.map((p) => (
                <line
                  key={p.area.slug}
                  className={`spoke ${hover === p.area.slug ? 'on' : ''}`}
                  style={{ '--sc': p.area.color } as CSSProperties}
                  x1={50 + (p.x - 50) * SPOKE_FROM}
                  y1={50 + (p.y - 50) * SPOKE_FROM}
                  x2={50 + (p.x - 50) * SPOKE_TO}
                  y2={50 + (p.y - 50) * SPOKE_TO}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="core">
              <div>
                <div className="name">Computação</div>
                <div className="count mono">
                  {state.totals.done} / {state.totals.total} nós
                </div>
              </div>
            </div>
            {points.map((p, i) => {
              const count = state.areas[p.area.slug] ?? { done: 0, total: 0 };
              return (
                <AreaOrb
                  key={p.area.slug}
                  name={p.area.name}
                  icon={p.area.icon}
                  color={p.area.color}
                  x={p.x}
                  y={p.y}
                  i={i}
                  done={count.done}
                  total={count.total}
                  open={canOpen(p.area.slug)}
                  picked={picked === p.area.slug}
                  onOpen={() => open(p.area.slug, true)}
                  onHover={(on) => setHover(on ? p.area.slug : null)}
                />
              );
            })}
          </div>
          <div className="sky-hint">Selecione uma área</div>

          <div className="area-list">
            {areas.map((area) => {
              const count = state.areas[area.slug] ?? { done: 0, total: 0 };
              const content = (
                <>
                  <span className="ic">
                    <Icon name={area.icon} />
                  </span>
                  <span>
                    <b>{area.name}</b>
                    <small>{canOpen(area.slug) ? area.sub : 'Em breve'}</small>
                  </span>
                  <span className="mono">{count.total > 0 ? `${count.done}/${count.total}` : '—'}</span>
                </>
              );
              const style = { '--c': area.color } as CSSProperties;
              return canOpen(area.slug) ? (
                <button key={area.slug} type="button" className="area-row open" style={style} onClick={() => open(area.slug, false)}>
                  {content}
                </button>
              ) : (
                <div key={area.slug} className="area-row" style={style}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
