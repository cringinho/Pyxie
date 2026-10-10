import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Museum from './pages/Museum';
import Bonus from './pages/Bonus';
import Profile from './pages/Profile';
import { I18N } from './utils/i18n';

export default function App() {
  // Initialize language: query param > localStorage > navigator > 'pt'
  const [lang, setLang] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang');
    if (queryLang === 'pt' || queryLang === 'en') return queryLang;
    const stored = localStorage.getItem('pyxie_lang');
    if (stored === 'pt' || stored === 'en') return stored;
    if (navigator.language && navigator.language.startsWith('en')) return 'en';
    return 'pt';
  });

  const [stats, setStats] = useState({
    guilds: 18,
    users: 2450,
    uptime: '99.9%',
  });

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
  } else if (path.startsWith('/u/') || path.includes('/u/')) {
    CurrentPage = Profile;
    const parts = window.location.pathname.split(/\/u\/?/i);
    if (parts.length > 1) {
      pageUserId = parts[1].split('/')[0];
    }
  }

  return (
    <div className="bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]" />
      </div>

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

