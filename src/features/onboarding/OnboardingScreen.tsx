import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProgress } from '../../store/useProgress';

export function OnboardingScreen() {
  const profile = useProgress((s) => s.snapshot.profile);
  const dispatch = useProgress((s) => s.dispatch);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (profile) return <Navigate to="/roadmap" replace />;

  const trimmed = name.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || saving) return;
    setSaving(true);
    await dispatch({ type: 'PROFILE_SET', displayName: trimmed });
    navigate('/roadmap', { replace: true });
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-surface px-6">
      {/* A single, very restrained glow — the only decorative element in the app. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(240,136,62,0.07) 0%, rgba(240,136,62,0) 70%)',
        }}
      />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[560px]"
      >
        <div className="mb-7 flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center border font-mono-num text-[14px]"
            style={{ borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            aria-hidden="true"
          >
            {'</>'}
          </span>
          <span className="font-mono-num text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Roadmap Live Coding
          </span>
        </div>

        <h1 className="mb-4 text-[34px] font-semibold leading-[1.15] tracking-tight text-ink">
          Bem-vindo à sua trilha de preparação para entrevistas técnicas.
        </h1>

        <p className="mb-3 text-[15px] leading-relaxed text-ink-muted">
          Aprenda padrões, entenda algoritmos visualmente e pratique com mais clareza — seguindo um
          caminho estruturado, do zero à aprovação, sem transformar a preparação em um curso
          enciclopédico.
        </p>

        <p className="mb-9 border-l-2 pl-4 text-[13.5px] leading-relaxed text-ink-faint" style={{ borderColor: 'var(--color-accent-border)' }}>
          Profundidade em 15–20 padrões recorrentes vale mais que exposição superficial a dezenas de
          algoritmos avançados.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="display-name" className="mb-2.5 block text-[13px] font-medium text-ink">
            Como posso te chamar?
          </label>

          <div className="flex flex-wrap gap-2.5">
            <input
              id="display-name"
              autoFocus
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="h-11 min-w-[240px] flex-1 border bg-surface-raised px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint"
              style={{ borderColor: 'var(--border-strong)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            />

            <button
              type="submit"
              disabled={!trimmed || saving}
              className="h-11 px-6 text-[14px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              Começar
            </button>
          </div>

          <p className="mt-3 text-[11.5px] text-ink-faint">
            Seu progresso fica salvo neste navegador. Nada é enviado para lugar nenhum.
          </p>
        </form>
      </motion.main>
    </div>
  );
}
