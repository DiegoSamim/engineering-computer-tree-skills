import { Link } from 'react-router-dom';
import { SIGNALS } from '../../content/signals';
import { getTopic } from '../../content/roadmap';

/**
 * §04 do roadmap. O objetivo real da prática é reconhecer a estrutura
 * escondida no enunciado — esta tabela é a referência de consulta rápida.
 */
export function SignalsScreen() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[880px] px-8 py-8">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Reconhecimento de sinais</h1>
        <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-muted">
          Entrevistas não anunciam o tópico. O que se treina é ler o enunciado e levantar de 1 a 3
          padrões plausíveis antes de escrever qualquer código.
        </p>

        <table className="mt-7 w-full border-collapse">
          <thead>
            <tr className="border-y border-line">
              <th className="py-2.5 pr-6 text-left font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
                Sinal no problema
              </th>
              <th className="py-2.5 text-left font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
                Suspeite primeiro de
              </th>
            </tr>
          </thead>
          <tbody>
            {SIGNALS.map((s) => {
              const topic = s.topicId ? getTopic(s.topicId) : undefined;
              return (
                <tr key={s.signal} className="border-b border-line">
                  <td className="py-3 pr-6 align-top text-[13px] leading-relaxed text-ink-muted">{s.signal}</td>
                  <td className="py-3 align-top text-[13px] font-medium leading-relaxed">
                    {topic?.route ? (
                      <Link to={topic.route} style={{ color: 'var(--color-accent)' }}>
                        {s.suspect}
                      </Link>
                    ) : (
                      <span className="text-ink">{s.suspect}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
