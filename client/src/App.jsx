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
import { langFromPath } from './utils/localePath';

export default function App() {
  // Idioma: a URL manda (/en/... = inglês; páginas localizadas em PT = português), igual ao
  // servidor (seoRenderer). Só nas páginas sem versão por URL vale ?lang > salvo > navegador.
  const [lang, setLang] = useState(() => {
    const fromPath = langFromPath(window.location.pathname);
    if (fromPath) return fromPath;
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang');
    if (queryLang === 'pt' || queryLang === 'en') return queryLang;
    let stored = null;
    try {
      stored = localStorage.getItem('pyxie_lang');
    } catch (_) {}
    if (stored === 'pt' || stored === 'en') return stored;
    if (navigator.language && navigator.language.startsWith('en')) return 'en';
    return 'pt';
  });

  // Status real do bot (/api/stats). `online: null` = ainda não sabemos; nada de número fixo.
  const [stats, setStats] = useState({ online: null, uptimeMs: 0 });

  // Translation function (aceita {placeholders})
  const t = (key, vars) => {
    const raw = I18N[lang]?.[key] || I18N.pt?.[key] || key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
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

  // Status real do bot: só agregados públicos (online e tempo no ar).
  useEffect(() => {
    let alive = true;
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive) return;
        if (data && data.success) {
          setStats({ online: Boolean(data.online), uptimeMs: Number(data.uptime) || 0 });
        } else {
          setStats({ online: false, uptimeMs: 0 });
        }
      })
      .catch(() => {
        if (alive) setStats({ online: false, uptimeMs: 0 });
      });
    return () => {
      alive = false;
    };
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
        <Navbar lang={lang} setLang={setLang} t={t} stats={stats} />
        <main className="flex-1">
          <CurrentPage t={t} lang={lang} stats={stats} userId={pageUserId} />
        </main>
        <Footer t={t} lang={lang} />
      </div>
    </div>
  );
}

