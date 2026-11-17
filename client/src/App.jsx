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
import { resolveInitialLang } from './utils/zone';

export default function App() {
  // Idioma: ?lang= > prefixo /en > escolha salva > padrão da zona (portal = EN, Cringelândia = PT-BR)
  const [lang, setLang] = useState(() => resolveInitialLang(window.location, window.localStorage));

  const [stats, setStats] = useState({
    guilds: 18,
    users: 2450,
    uptime: '99.9%',
  });

  // Translation function
  const t = (key) => {
    return I18N[lang]?.[key] || I18N.en?.[key] || I18N.pt?.[key] || key;
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

  // Fetch bot stats
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setStats({
            guilds: data.guilds || 18,
            users: data.users || 2450,
            uptime: data.uptimeFormatted || '99.9%',
          });
        }
      })
      .catch(() => {
        // Fallback to /api/status if /api/stats fails
        fetch('/api/status')
          .then((res) => res.json())
          .then((st) => {
            if (st && st.online) {
              setStats((prev) => ({
                ...prev,
                guilds: st.guilds || prev.guilds,
              }));
            }
          })
          .catch(() => {});
      });
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

  // overflow-x-clip (e não hidden): hidden quebra o position: sticky do cabeçalho.
  return (
    <div className="bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-clip">
      {/* Camada de ambiente: aurora animada, grade e glifos (CSS puro) */}
      <AmbientBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar lang={lang} setLang={setLang} t={t} />
        <main className="flex-1">
          <CurrentPage t={t} lang={lang} stats={stats} userId={pageUserId} />
        </main>
        <Footer t={t} lang={lang} />
      </div>
    </div>
  );
}

