import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { detectLang, makeT } from './i18n';
import { go } from './Shell';

// Rede de segurança do painel: um erro de render em qualquer tela virava página branca
// (o React desmonta a árvore inteira). Há duas camadas: uma em volta de cada seção
// (`inline`, com `key` da rota, some ao trocar de tela; o menu continua de pé) e outra no
// topo, para quando o próprio menu quebra.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Fica no console para o dono copiar; nada de conteúdo de usuário aqui.
    console.error('[Painel] tela quebrou:', error, info?.componentStack || '');
  }

  render() {
    if (!this.state.error) return this.props.children;
    const t = makeT(detectLang());
    const detail = String(this.state.error?.message || this.state.error || '');
    // `inline`: dentro do Layout, em volta só do conteúdo da seção (menu e topo seguem de pé).
    const inline = this.props.inline === true;
    return (
      <div className={inline ? 'py-4' : 'flex min-h-screen items-center justify-center px-4 py-10'}>
          <section className="dash-card w-full max-w-lg space-y-3 rounded-3xl p-6" role="alert">
          <p className="flex items-center gap-2 font-title text-xl font-extrabold">
            <AlertTriangle size={20} className="text-amber-300" aria-hidden="true" />
            {t('error.crashTitle')}
          </p>
          <p className="text-sm text-white/70">{t(inline ? 'error.crashBody' : 'error.crashBodyFull')}</p>
          {detail && <code className="block break-words rounded-xl bg-black/40 p-3 text-[11px] text-white/70">{detail}</code>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-pyxie-bright to-mystic-violet px-4 text-sm font-semibold"
            >
              <RotateCcw size={16} aria-hidden="true" />
              {t('error.crashReload')}
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                go('#/');
              }}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold"
            >
              {t('error.crashBack')}
            </button>
          </div>
        </section>
      </div>
    );
  }
}
