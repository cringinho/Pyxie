import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  Sparkle, DownloadSimple, CalendarHeart, Heart, Images,
  ShareNetwork, Smiley, Trophy, Cards, FilmStrip, PresentationChart
} from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';

const TEMPLATES = [
  { id: 'polaroid-grid', label: 'Grid Polaroid', icon: Cards },
  { id: 'photobooth-strip', label: 'Tira Photobooth', icon: FilmStrip },
  { id: 'story-wrapped', label: 'Story Wrapped', icon: PresentationChart }
];

export default function MonthlyRecapView({ onGoToMemory }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState('polaroid-grid');
  const [exporting, setExporting] = useState(false);

  const posterRef = useRef(null);

  // Carrega lista de meses disponíveis
  useEffect(() => {
    async function loadMonths() {
      try {
        const res = await fetch('/api/recap/months', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMonths(data.months || []);
          if (data.months && data.months.length > 0) {
            setSelectedMonth(data.months[0].id);
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar meses de recap:', err);
      }
    }
    loadMonths();
  }, []);

  // Carrega dados do mês selecionado
  useEffect(() => {
    if (!selectedMonth) return;

    async function loadRecapData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/recap/${selectedMonth}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setRecap(data.recap);
        }
      } catch (err) {
        console.warn('Erro ao carregar recap do mês:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecapData();
  }, [selectedMonth]);

  // Exportar imagem PNG em alta resolução com html-to-image
  async function handleDownloadPoster() {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: { transform: 'scale(1)' }
      });
      const link = document.createElement('a');
      link.download = `recap-mary-e-leh-${selectedMonth}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao exportar montagem:', err);
      alert('Não foi possível exportar a montagem. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Seletor de Mês */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-pink-400">
            <CalendarHeart weight="duotone" className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold font-display text-white">Recap Mensal do Casal</h2>
              <p className="text-[11px] text-pink-300/70 font-sans">
                Retrospectiva afetiva • Mary & Leh
              </p>
            </div>
          </div>

          {/* Seletor de Mês */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10 shrink-0">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none font-display font-semibold"
            >
              {months.map(m => (
                <option key={m.id} value={m.id} className="bg-[#140e20]">{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seletor de Template de Montagem */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-white/5 pt-3">
          <span className="text-[11px] font-sans text-gray-400 shrink-0">Estilo da Montagem:</span>
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            const isActive = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 border transition-all ${
                  isActive
                    ? 'bg-pink-500/25 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon weight={isActive ? 'fill' : 'duotone'} className="w-3.5 h-3.5 text-pink-400" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 font-sans flex items-center justify-center gap-2">
          <Sparkle weight="fill" className="w-4 h-4 text-pink-400 animate-spin" />
          <span>Calculando os momentos mais fofos do mês...</span>
        </div>
      ) : recap ? (
        <div className="space-y-6">
          {/* Grade de Estatísticas do Mês */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xl font-bold font-display text-white">{recap.totalMemories}</span>
              <p className="text-[10px] text-pink-300 font-sans">Memórias Vivas</p>
              <div className="text-[9px] text-gray-400 font-sans">
                Mary: {recap.maryMemories} • Leh: {recap.lehMemories}
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xl font-bold font-display text-white">{recap.totalPhotos}</span>
              <p className="text-[10px] text-pink-300 font-sans">Fotos no Acervo</p>
              <div className="text-[9px] text-gray-400 font-sans">Relatos + Galeria</div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xl font-bold font-display text-white">{recap.totalLikes}</span>
              <p className="text-[10px] text-pink-300 font-sans">Corações & Reações</p>
              <div className="text-[9px] text-gray-400 font-sans">Amor compartilhado</div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-sm font-bold font-display text-pink-400 truncate block">
                {recap.topWords[0]?.word || 'Amor'}
              </span>
              <p className="text-[10px] text-pink-300 font-sans">Palavra do Mês</p>
              <div className="text-[9px] text-gray-400 font-sans">No grafo afetivo</div>
            </div>
          </div>

          {/* ÁREA DA MONTAGEM EXPORTÁVEL (Capturada com html-to-image) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkle weight="fill" className="w-3.5 h-3.5 text-pink-400" />
                <span>Pôster Oficial • {recap.monthName}</span>
              </h3>

              <button
                onClick={handleDownloadPoster}
                disabled={exporting}
                className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-pink-600/30 font-display transition-all disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadSimple weight="bold" className="w-3.5 h-3.5" />}
                <span>Baixar Pôster em PNG</span>
              </button>
            </div>

            {/* CONTAINER DO PÔSTER */}
            <div className="flex justify-center overflow-x-auto pb-4">
              <div
                ref={posterRef}
                className="w-full max-w-md p-6 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 text-gray-900"
                style={{
                  background: activeTemplate === 'story-wrapped'
                    ? 'linear-gradient(145deg, #180d26 0%, #290d2e 50%, #0d0714 100%)'
                    : '#FAF7F2',
                  color: activeTemplate === 'story-wrapped' ? '#FFFFFF' : '#1F2937'
                }}
              >
                {/* TEMPLATE 1: GRID POLAROID ROMÂNTICO */}
                {activeTemplate === 'polaroid-grid' && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1 border-b border-gray-300/60 pb-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-pink-600 font-bold block">
                        NOSSO RECAP DO MÊS
                      </span>
                      <h2 className="text-xl font-bold font-serif text-gray-900 tracking-tight">
                        {recap.monthName}
                      </h2>
                      <p className="text-xs font-serif italic text-gray-600">
                        Mary & Leandro • Nosso Universo
                      </p>
                    </div>

                    {/* Mosaico de Polaroids com Fotos */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {recap.collagePhotos.slice(0, 4).map((photo, i) => (
                        <div
                          key={photo.id || i}
                          className="bg-white p-2 pb-3.5 rounded-lg shadow-md border border-gray-200/60 space-y-1.5 transform hover:rotate-1 transition-transform"
                        >
                          <div className="aspect-square rounded overflow-hidden bg-gray-100">
                            <img src={photo.thumbUrl || photo.fileUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] font-serif italic text-gray-600 text-center truncate px-1">
                            {photo.caption || `Momento #${i + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Badges Fofos */}
                    <div className="bg-pink-50/80 p-3 rounded-2xl border border-pink-200/80 space-y-1.5 text-center">
                      <div className="text-[11px] font-sans font-medium text-gray-800">
                        ✨ <strong>{recap.totalMemories}</strong> memórias • 📸 <strong>{recap.totalPhotos}</strong> fotos • 💖 <strong>{recap.totalLikes}</strong> corações
                      </div>
                      {recap.topWords.length > 0 && (
                        <div className="text-[10px] font-sans text-pink-700 font-semibold">
                          Palavra que mais nos marcou: "{recap.topWords[0].word}"
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-serif italic text-center text-gray-600 pt-1 leading-relaxed">
                      "{recap.quote}"
                    </p>
                  </div>
                )}

                {/* TEMPLATE 2: TIRA DE CABINE DE FOTOS (PHOTOBOOT) */}
                {activeTemplate === 'photobooth-strip' && (
                  <div className="max-w-[280px] mx-auto bg-white p-4 rounded-xl shadow-xl border border-gray-300 space-y-3 text-center text-gray-900">
                    <div className="text-[10px] font-mono tracking-widest text-pink-600 uppercase font-bold">
                      ★ MARY & LEH PHOTOBOOTH ★
                    </div>

                    <div className="space-y-2">
                      {recap.collagePhotos.slice(0, 4).map((photo, i) => (
                        <div key={photo.id || i} className="aspect-square rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                          <img src={photo.thumbUrl || photo.fileUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-0.5">
                      <div className="text-xs font-bold font-serif text-gray-900">{recap.monthName}</div>
                      <div className="text-[9px] font-mono text-gray-500">30.01.2026 • NOSSO UNIVERSO</div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 3: STORY ESTILO SPOTIFY WRAPPED */}
                {activeTemplate === 'story-wrapped' && (
                  <div className="space-y-5 text-white py-2">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-widest font-mono">
                        NOSSO RECAP WRAPPED
                      </span>
                      <h2 className="text-2xl font-bold font-display tracking-tight text-white pt-1">
                        {recap.monthName}
                      </h2>
                      <p className="text-xs text-pink-200/70 font-sans">História Oficial de Mary & Leandro</p>
                    </div>

                    {/* Foto Destaque */}
                    {recap.collagePhotos.length > 0 && (
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl relative">
                        <img src={recap.collagePhotos[0].fileUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-sans font-medium text-pink-200">
                          Momento Destaque
                        </div>
                      </div>
                    )}

                    {/* Estatísticas Wrapped */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
                        <span className="text-xl font-bold font-display text-pink-400">{recap.totalMemories}</span>
                        <p className="text-[10px] text-gray-300 font-sans">Capítulos Escritos</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
                        <span className="text-xl font-bold font-display text-purple-400">{recap.totalPhotos}</span>
                        <p className="text-[10px] text-gray-300 font-sans">Retratos Guardados</p>
                      </div>
                    </div>

                    {/* Palavras Marcantes */}
                    {recap.topWords.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-pink-300 font-mono block">
                          Nossas Palavras Favoritas
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recap.topWords.map(w => (
                            <span key={w.word} className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-pink-500/25 text-pink-100 border border-pink-500/40">
                              {w.word} ({w.count}x)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs font-verse italic text-pink-100/90 leading-relaxed border-t border-white/10 pt-3">
                      "{recap.quote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
