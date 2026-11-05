import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Museum from './pages/Museum';
import Bonus from './pages/Bonus';
import Profile from './pages/Profile';
import Partnerships from './pages/Partnerships';
import AmbientBackground from './components/effects/AmbientBackground';
import { I18N } from './utils/i18n';
import { pathLang, switchLangHref } from './utils/langPath';

export default function App() {
  // Idioma: o caminho manda (/en/... = inglês). Navegador e preferência salva não trocam
  // o idioma de uma URL — senão a versão PT seria indexada em inglês (canonical/hreflang).
  const [lang] = useState(pathLang);
  // Trocar de idioma = ir para a URL do outro idioma (o servidor faz o 301 para /en/...).
  const setLang = (next) => {
    if (next === lang) return;
    try {
      localStorage.setItem('pyxie_lang', next);
    } catch (_) {}
    window.location.assign(switchLangHref(next));
  };

  // Números reais da API. `null` = ainda sem resposta ou falhou: a tela esconde o dado
  // em vez de mostrar número inventado (AGENTS §12, zero mock).
  const [stats, setStats] = useState({ online: null, guilds: null, members: null, uptimeMs: null });

  // Translation function
  const t = (key) => {
    return I18N[lang]?.[key] || I18N.pt?.[key] || key;
  };

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Status real do bot (o processo está rodando?) e números do /api/stats.
  useEffect(() => {
    fetch('/api/widget/summary', { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) setStats((prev) => ({ ...prev, online: Boolean(data.online) }));
        else setStats((prev) => ({ ...prev, online: false }));
      })
      .catch(() => setStats((prev) => ({ ...prev, online: false })));
    fetch('/api/stats', { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((data) => {
        if (!data || typeof data !== 'object') return;
        setStats((prev) => ({
          ...prev,
          guilds: Number(data.guildsCount) > 0 ? Number(data.guildsCount) : null,
          members: Number(data.totalMembers) > 0 ? Number(data.totalMembers) : null,
          uptimeMs: Number(data.uptime) > 0 ? Number(data.uptime) : null,
        }));
      })
      .catch(() => {});
  }, []);

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  // Route selection based on pathname
  const path = window.location.pathname.toLowerCase();

  let CurrentPage = Home;
  let pageUserId = '';
  if (path.includes('wiki')) {
    CurrentPage = Wiki;
  } else if (path.includes('museu') || path.includes('museum')) {
    CurrentPage = Museum;
  } else if (path.includes('bonus')) {
    CurrentPage = Bonus;
  } else if (path.includes('parcerias') || path.includes('partnerships')) {
    CurrentPage = Partnerships;
  } else if (path.startsWith('/u/') || path.includes('/u/')) {
    CurrentPage = Profile;
    const parts = window.location.pathname.split(/\/u\/?/i);
    if (parts.length > 1) {
      pageUserId = parts[1].split('/')[0];
    }
  }

  return (
    <div className="bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Camada de ambiente: aurora animada, grade e glifos (CSS puro) */}
      <AmbientBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar lang={lang} setLang={setLang} t={t} online={stats.online} />
        <main className="flex-1">
          <CurrentPage t={t} lang={lang} stats={stats} userId={pageUserId} />
        </main>
        <Footer t={t} lang={lang} />
      </div>
    </div>
  );
}

