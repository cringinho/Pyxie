import React from 'react';
import HeroSection from '../components/hero/HeroSection';
import MuseumScene from '../components/3d/MuseumScene';
import PillarsSection from '../components/hero/PillarsSection';
import CommandGrid from '../components/wiki/CommandGrid';
import ShopeeBentoGrid from '../components/shopee/ShopeeBentoGrid';

export default function Home({ t, lang, stats }) {
  return (
    <div className="space-y-6">
      {/* 1. Hero Section with 2 CTAs and Live Terminal */}
      <HeroSection t={t} stats={stats} />

      {/* 2. 3D Holographic Community Deck (Three.js WebGL) */}
      <MuseumScene t={t} />

      {/* 3. 5 Official Pillars */}
      <PillarsSection t={t} />

      {/* 4. Interactive Commands Catalog */}
      <CommandGrid t={t} lang={lang} />

      {/* 5. Native Shopee Bento Grid (Curated Setup & Stationery) */}
      <ShopeeBentoGrid t={t} lang={lang} />
    </div>
  );
}

