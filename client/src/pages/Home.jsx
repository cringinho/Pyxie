import React, { useEffect, useState } from 'react';
import HeroSection from '../components/hero/HeroSection';
import PillarsSection from '../components/hero/PillarsSection';
import CringelandiaSection from '../components/hero/CringelandiaSection';
import BlogHighlights from '../components/hero/BlogHighlights';
import CommandGrid from '../components/wiki/CommandGrid';
import ShopeeBentoGrid from '../components/shopee/ShopeeBentoGrid';

export default function Home({ t, lang, stats }) {
  // three.js (~490 KB) pesa no pacote inicial. Carregamos a cena só depois da primeira
  // pintura, via import dinâmico + estado — sem Suspense, para não mexer na árvore do React.
  const [Scene, setScene] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () => {
      import('../components/3d/MuseumScene')
        .then((mod) => {
          if (alive) setScene(() => mod.default);
        })
        .catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 2500 });
    else setTimeout(load, 1200);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Hero Section with 2 CTAs and Live Terminal */}
      <HeroSection t={t} stats={stats} />

      {/* 2. 3D Holographic Community Deck (Three.js WebGL, sob demanda) */}
      {Scene ? <Scene t={t} /> : <div className="h-64" aria-hidden="true" />}

      {/* 3. 5 Official Pillars */}
      <PillarsSection t={t} />

      {/* 4. A outra metade: Cringelândia (50% bot / 50% comunidade) */}
      <CringelandiaSection t={t} />

      {/* 5. Do blog: últimos artigos do Hyperfokus (some se não houver nenhum) */}
      <BlogHighlights t={t} lang={lang} />

      {/* 4. Interactive Commands Catalog */}
      <CommandGrid t={t} lang={lang} />

      {/* 5. Native Shopee Bento Grid (Curated Setup & Stationery) */}
      <ShopeeBentoGrid t={t} lang={lang} />
    </div>
  );
}

