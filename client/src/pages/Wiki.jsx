import React, { useEffect, useState } from 'react';
import CommandGrid from '../components/wiki/CommandGrid';
import {
  BookOpen, Sparkles, Terminal, Shield, HelpCircle,
  Coins, Briefcase, Heart, Compass, CheckCircle2,
  Award, Users, AlertCircle, ArrowRight, ExternalLink,
  Zap, Star, TreePine, Vault, Baby, Scroll
} from 'lucide-react';

export default function Wiki({ t, lang }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState(() => {
    const rawHash = (window.location.hash || '').toLowerCase().replace('#', '').trim();
    if (!rawHash) return 'overview';
    if (rawHash.startsWith('py-')) return 'commands';
    if (rawHash === 'comandos' || rawHash === 'commands') return 'commands';
    if (rawHash.includes('eco') || rawHash.includes('moeda')) return 'economy';
    if (rawHash.includes('trabalho') || rawHash.includes('carreira') || rawHash.includes('vocacao')) return 'careers';
    if (rawHash.includes('tarot') || rawHash.includes('album') || rawHash.includes('arcano')) return 'tarot';
    if (rawHash.includes('casamento') || rawHash.includes('social') || rawHash.includes('familia')) return 'marriage';
    if (rawHash.includes('faq') || rawHash.includes('duvida')) return 'faq';
    return 'overview';
  });

  useEffect(() => {
    document.title = isEn
      ? 'Pyxie Official Wiki & Community Guide | Discord Bot'
      : 'Wiki Oficial & Enciclopédia da Pyxie | Discord Bot';
  }, [isEn]);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = (window.location.hash || '').toLowerCase().replace('#', '').trim();
      if (!rawHash) {
        setActiveTab('overview');
        return;
      }
      if (rawHash.startsWith('py-') || rawHash === 'comandos' || rawHash === 'commands') {
        setActiveTab('commands');
      } else if (rawHash.includes('eco') || rawHash.includes('moeda')) {
        setActiveTab('economy');
      } else if (rawHash.includes('trabalho') || rawHash.includes('carreira') || rawHash.includes('vocacao')) {
        setActiveTab('careers');
      } else if (rawHash.includes('tarot') || rawHash.includes('album') || rawHash.includes('arcano')) {
        setActiveTab('tarot');
      } else if (rawHash.includes('casamento') || rawHash.includes('social') || rawHash.includes('familia')) {
        setActiveTab('marriage');
      } else if (rawHash.includes('faq') || rawHash.includes('duvida')) {
        setActiveTab('faq');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs = [
    { id: 'overview', label: isEn ? 'Community & Sanctuary' : 'Comunidade & Santuário', icon: Compass, badge: 'Lore' },
    { id: 'economy', label: isEn ? 'Living Economy' : 'Economia Viva', icon: Coins, badge: 'Coins' },
    { id: 'careers', label: isEn ? '16 Vocations & Work' : '16 Vocações & Trabalho', icon: Briefcase, badge: 'Minigames' },
    { id: 'tarot', label: isEn ? '78 Arcana Tarot' : 'Tarot dos 78 Arcanos', icon: Sparkles, badge: 'HD Canvas' },
    { id: 'marriage', label: isEn ? 'Marriage & Family' : 'Casamento & Família', icon: Heart, badge: 'Social' },
    { id: 'commands', label: isEn ? 'Commands Catalog' : 'Catálogo de Comandos', icon: Terminal, badge: 'Ctrl+K' },
    { id: 'faq', label: isEn ? 'FAQ & Help' : 'Dúvidas & FAQ', icon: HelpCircle, badge: 'Guia' },
  ];

  const faqs = isEn ? [
    {
      q: 'How do I add Pyxie to my Discord server?',
      a: 'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands and message attachments permissions.',
    },
    {
      q: 'Do slash commands work in all channels?',
      a: 'Yes, unless server administrators restrict command permissions in Server Settings > Integrations.',
    },
    {
      q: 'What is the daily economy reset time?',
      a: 'Daily rewards (/py-daily) reset every 24 hours per user. Daily streaks have a 48h grace window.',
    },
    {
      q: 'Are all 78 Tarot cards available in the Album?',
      a: 'Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared in HD via /py-album.',
    },
    {
      q: 'How does the Marriage Tree of Life work?',
      a: 'Married partners can water the Tree of Life every 12h, granting +10% love and unlocking permanent rewards.',
    },
    {
      q: 'Is Pyxie completely free to use?',
      a: '100% free! All economic commands, minigames, tarot cards, and careers are accessible without any paywalls.',
    },
  ] : [
    {
      q: 'Como adiciono a Pyxie ao meu servidor?',
      a: 'Basta clicar no botão "Adicionar Pyxie" no topo da página ou acessar /invite para conceder permissões de comandos slash.',
    },
    {
      q: 'Os comandos funcionam por barra (/) e prefixo (py!)?',
      a: 'Sim! Todos os comandos possuem registro oficial por barra no Discord e aliases por prefixo py! correspondentes.',
    },
    {
      q: 'Como funciona o Álbum de Tarot dos 78 Arcanos?',
      a: 'Ao tirar sua carta do dia (/py-tarot), você pode colá-la no seu álbum (/py-album). Colecionar cartas desbloqueia conquistas e moedinhas!',
    },
    {
      q: 'Como evoluir o casamento no bot?',
      a: 'Após casar (/py-casamento), você e seu cônjuge podem regar a Árvore da Vida a cada 12h, depositar no Cofre do Casal e ter encontros românticos!',
    },
    {
      q: 'Com que frequência posso trabalhar?',
      a: 'O expediente (/py-work) tem recarga de 3 horas. Cada profissão possui minigames técnicos com perguntas interativas de 45 segundos.',
    },
    {
      q: 'A Pyxie é totalmente gratuita?',
      a: 'Sim! Todos os 37 comandos, sistemas de economia, minigames, tarot e casamento são 100% acessíveis e gratuitos.',
    },
  ];

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span>{isEn ? 'Official Documentation • Pyxie & Cringelândia' : 'Enciclopédia Oficial • Pyxie & Cringelândia'}</span>
        </div>
        <h1 className="font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
          {isEn ? 'Official Guide & Interactive Wiki' : 'Guia Oficial & Enciclopédia Interativa'}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {isEn
            ? 'Explore deep documentation for Pyxie: live economy, 16 careers, 78 Tarot Arcana, marriage dynamics and command catalog.'
            : 'Explore explicações detalhadas sobre a economia mágica, 16 vocações profissionais, o oráculo de tarot dos 78 arcanos, matrimônio e comandos oficiais.'}
        </p>

        {/* Quick Highlights Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-pink-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> 78 Arcanos em HD
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" /> 16 Vocações Únicas
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> 100% Gratuita & Segura
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Bilíngue PT-BR & EN
          </span>
        </div>
      </div>

      {/* Modern Documentation Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-purple-500/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.location.hash = tab.id === 'commands' ? 'comandos' : tab.id;
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50 shadow-neon-pink'
                  : 'bg-white/5 border-purple-500/15 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/30 text-pink-200' : 'bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW / COMMUNITY */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
                  {isEn ? 'A Welcoming Sanctuary for Neurodivergent Minds' : 'Um Santuário para Mentes Neurodivergentes'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {isEn ? 'Compassionate community culture & safe haven on Discord' : 'Cultura comunitária, empatia e ambiente acolhedor'}
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'The official Pyxie community (Cringelândia) was created to be a warm, gentle, and judgment-free home. We proudly embrace neurodivergent individuals — autistic people (ASD), ADHD, bipolarity, depression, anxiety, and unique perception styles. Special interests (hyperfocus), creative minds, and honest conversations are celebrated.'
                : 'A comunidade oficial da Pyxie (Cringelândia) nasceu com um propósito genuíno: ser um porto seguro, caloroso e livre de julgamentos. Abrigamos com orgulho mentes neurodivergentes — pessoas no espectro autista (TEA), TDAH, bipolaridade, depressão, ansiedade e hiperfocos. Acreditamos que quem enxerga o mundo por ângulos singulares enriquece profundamente a nossa vivência.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2">
                <div className="flex items-center gap-2 text-pink-300 font-title font-bold text-sm">
                  <Shield className="w-4 h-4 text-pink-400" />
                  <span>{isEn ? 'Zero Tolerance for Ableism' : 'Tolerância Zero contra Capacitismo'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Hostility, harassment, mockery, or disrespect towards neurodivergent traits result in swift and irrevocable removal.'
                    : 'Preconceito, piadas de mau gosto ou qualquer hostilidade contra características neurodivergentes resultam em banimento imediato.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-title font-bold text-sm">
                  <Heart className="w-4 h-4 text-purple-400" />
                  <span>{isEn ? 'Respect for Autistic Creators' : 'Proteção à Arte e Expressão'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Member artwork in the Museum is protected by community copyright. Creative projects and personal boundaries are safeguarded.'
                    : 'Obras compartilhadas no Museu possuem proteção visual contra cópia indevida. Respeitamos a autoria e os limites de cada criador.'}
                </p>
              </div>
            </div>

            {/* Concise Roles Table */}
            <div className="space-y-3 pt-4">
              <h3 className="font-title font-bold text-lg text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" />
                <span>{isEn ? 'One-Word Identity Roles' : 'Cargos Concisos de Uma Palavra'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'In our guild, community roles honor individuality without bureaucratic titles:'
                  : 'Nossos cargos comunitários adotam títulos elegantes e poéticos que traduzem a energia de cada membro:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="font-mono font-bold text-pink-400 text-sm">Peculiar</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {isEn ? 'For minds with authentic and unique perspectives.' : 'Para mentes que enxergam a vida com autenticidade única.'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="font-mono font-bold text-purple-400 text-sm">Mágico</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {isEn ? 'For those who bring creativity and joy to daily talks.' : 'Para quem traz encantamento, ideias e boas energias.'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="font-mono font-bold text-amber-400 text-sm">Travesso</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {isEn ? 'Playful spirit reflecting Pyxie’s rebel energy.' : 'O espírito rebelde e divertido da própria Pyxie.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Encyclopedia Chapters Hub */}
            <div className="space-y-4 pt-4 border-t border-purple-500/15">
              <h3 className="font-title font-bold text-lg text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>{isEn ? 'Explore the 6 System Guides & Chapters' : 'Explore os 6 Capítulos da Enciclopédia'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'Select any chapter below to explore deep mechanics, rules, and live commands:'
                  : 'Navegue pelos capítulos completos com explicações detalhadas, regras, fórmulas e atalhos:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* 1. Economia */}
                <div
                  onClick={() => {
                    setActiveTab('economy');
                    window.location.hash = 'economy';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">🪙</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Capítulo 02</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                    {isEn ? 'Living Economy' : 'Economia Mágica'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Dual-currency mechanics, daily rewards, streaks, and the 10s web bonus portal.' : 'Moedinhas, Feijões Mágicos raros, bônus diários, streaks e portal web.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Read Chapter ➔' : 'Ler Capítulo ➔'}</span>
                  </div>
                </div>

                {/* 2. Carreiras */}
                <div
                  onClick={() => {
                    setActiveTab('careers');
                    window.location.hash = 'careers';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">💼</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Capítulo 03</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                    {isEn ? '16 Vocations & Work' : '16 Vocações & Trabalho'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Clock in every 3h, solve 45s thematic challenges, earn XP and senior promotions.' : 'Turnos de 3 horas com minigames técnicos de 45 segundos, XP e promoções.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Read Chapter ➔' : 'Ler Capítulo ➔'}</span>
                  </div>
                </div>

                {/* 3. Tarot */}
                <div
                  onClick={() => {
                    setActiveTab('tarot');
                    window.location.hash = 'tarot';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-pink-500/20 hover:border-pink-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">🔮</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">Capítulo 04</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-pink-300 transition-colors">
                    {isEn ? '78 Arcana Tarot Oracle' : 'Tarot dos 78 Arcanos'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Daily card reading in HD canvas, collectible album, arcane bribes, and achievements.' : 'Tiragem diária em tela HD, álbum colecionável de cartas e suborno arcano.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Read Chapter ➔' : 'Ler Capítulo ➔'}</span>
                  </div>
                </div>

                {/* 4. Casamento */}
                <div
                  onClick={() => {
                    setActiveTab('marriage');
                    window.location.hash = 'marriage';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">💍</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">Capítulo 05</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                    {isEn ? 'Marriage & Family' : 'Casamento & Família'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Tree of life watering every 12h, shared Love Vault with 5% daily interest, and children.' : 'Árvore da Vida a cada 12h, cofre do casal com rendimento diário e filhos.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Read Chapter ➔' : 'Ler Capítulo ➔'}</span>
                  </div>
                </div>

                {/* 5. Comandos */}
                <div
                  onClick={() => {
                    setActiveTab('commands');
                    window.location.hash = 'comandos';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">⚙️</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">Capítulo 06</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {isEn ? 'Commands Catalog' : 'Catálogo de Comandos'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Interactive documentation with fuzzy search (Ctrl+K), category filters and live discord embeds.' : 'Documentação completa com busca fuzzy (Ctrl+K), filtros e embeds ao vivo.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Explore Commands ➔' : 'Explorar Comandos ➔'}</span>
                  </div>
                </div>

                {/* 6. FAQ */}
                <div
                  onClick={() => {
                    setActiveTab('faq');
                    window.location.hash = 'faq';
                  }}
                  className="p-5 rounded-2xl glass-panel border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">❓</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Capítulo 07</span>
                  </div>
                  <h4 className="font-title font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    {isEn ? 'FAQ & Community Help' : 'Dúvidas & FAQ'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEn ? 'Frequently asked questions, cooldowns, invite guide and server settings.' : 'Perguntas frequentes, permissões, recargas e suporte do bot.'}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>{isEn ? 'Open FAQ ➔' : 'Ver Perguntas ➔'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. ECONOMY */}
      {activeTab === 'economy' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
                  {isEn ? 'Living Economy: Coins, Magic Beans & Vaults' : 'Economia Viva: Moedinhas, Feijões e Cofres'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {isEn ? 'Dual-currency mechanics, daily earnings, and rewards' : 'Duas moedas, rendimentos diários e recompensas'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-title font-bold text-base">
                  <span>🪙</span>
                  <span>{isEn ? 'Moedinhas (Gold Coins)' : 'Moedinhas Mágicas'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn
                    ? 'The primary currency used for social dynamics, career shifts, wedding rings, gifts, and games. Earned via /py-daily, /py-work shifts, and Tarot album milestones.'
                    : 'A moeda principal para salários de profissão, alianças de casamento, minigames, bônus e presentes. Obtida no /py-daily, nos turnos de /py-work e no portal de bônus web.'}
                </p>
                <div className="font-mono text-[11px] text-pink-300 bg-black/40 px-3 py-1.5 rounded-lg border border-pink-500/20">
                  /py-carteira • /py-daily • /py-bonus
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-title font-bold text-base">
                  <span>🫘</span>
                  <span>{isEn ? 'Feijões Mágicos (Rare Beans)' : 'Feijões Mágicos Raros'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Rare, precious mystical beans required for advanced career promotions, Arcane Bribes in the Tarot Album, and special relics.'
                    : 'A moeda sagrada e rara necessária para promoções nos escalões mais altos de carreira, subornos arcanos de cartas no Álbum de Tarot e artefatos lendários.'}
                </p>
                <div className="font-mono text-[11px] text-emerald-300 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  /py-work • /py-suborno • Recompensas de Streaks
                </div>
              </div>
            </div>

            {/* Web Bonus Info Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h4 className="font-title font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>{isEn ? 'Daily 10-Second Web Reward Portal' : 'Bônus Mágico Web de 10 Segundos'}</span>
                </h4>
                <p className="text-xs text-slate-300">
                  {isEn
                    ? 'Claim extra coins daily through the secure waiting portal in 10 seconds!'
                    : 'Ganhe moedinhas adicionais todos os dias aguardando 10 segundos no portal oficial de recompensas!'}
                </p>
              </div>
              <a
                href="/bonus"
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-neon-pink whitespace-nowrap transition-all"
              >
                {isEn ? 'Claim 10s Bonus ➔' : 'Resgatar Bônus 10s ➔'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CAREERS & WORK */}
      {activeTab === 'careers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
                  {isEn ? '16 Unique Vocations & 45s Technical Minigames' : '16 Carreiras Únicas & Minigames de 45s'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {isEn ? 'Interactive questions every 3 hours, career promotions and XP' : 'Perguntas técnicas a cada 3h, hierarquia salarial e XP'}
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Every 3 hours, you can clock in with /py-work. Each of the 16 careers features a custom thematic challenge with 45-second timer. Correct choices grant bonuses, XP, and unlock senior promotions with higher salaries!'
                : 'A cada 3 horas você pode bater ponto com o comando /py-work. Cada uma das 16 vocações possui desafios técnicos imersivos com cronômetro de 45 segundos. Acertos perfeitos garantem bônus salariais, XP de carreira e abrem caminho para promoções de alto nível!'}
            </p>

            {/* List of Careers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { name: 'Alquimista Místico', icon: '🧪', desc: 'Poções & Transmutação' },
                { name: 'Guarda da Penumbra', icon: '🛡️', desc: 'Defesa & Sentinela' },
                { name: 'Bibliotecário Astral', icon: '📜', desc: 'Grimórios & Histórias' },
                { name: 'Ferreiro Rúnico', icon: '⚒️', desc: 'Forja & Runas Arcanas' },
                { name: 'Chef Confeiteiro', icon: '🧁', desc: 'Doces & Encantamentos' },
                { name: 'Herbalista Fada', icon: '🌿', desc: 'Plantas Raras & Ervas' },
                { name: 'Astrólogo Cósmico', icon: '🔭', desc: 'Constelações & Mapas' },
                { name: 'Detetive Arcano', icon: '🔍', desc: 'Enigmas & Mistérios' },
                { name: 'Domador de Sombras', icon: '🦇', desc: 'Familires & Morcegos' },
                { name: 'Bardo Encantado', icon: '🪕', desc: 'Canções & Lendas' },
                { name: 'Necromante Amigável', icon: '💀', desc: 'Almas & Crânios Fofos' },
                { name: 'Navegador Estelar', icon: '🌌', desc: 'Rotas pelo Espaço' },
                { name: 'Costureiro Gótico', icon: '🧵', desc: 'Roupas Punk & Fitas' },
                { name: 'Mercador Nômade', icon: '🪙', desc: 'Trocas & Negócios' },
                { name: 'Cultivador de Cristais', icon: '💎', desc: 'Gemas de Mana' },
                { name: 'Guardião de Portais', icon: '🌀', desc: 'Fendas Dimensionais' },
              ].map((job, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-purple-500/15 hover:border-pink-500/30 transition-all">
                  <span className="text-xl">{job.icon}</span>
                  <div className="font-title font-bold text-xs text-white mt-1">{job.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{job.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="text-xs font-mono text-purple-300">
                {isEn ? 'Commands: /py-profissao • /py-work' : 'Comandos: /py-profissao (escolher) • /py-work (trabalhar)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. TAROT */}
      {activeTab === 'tarot' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
                  {isEn ? 'The 78 Tarot Arcana & Collector’s Album' : 'Tarot dos 78 Arcanos & Álbum Colecionável'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {isEn ? 'Daily oracle readings, HD canvas generation, achievements and bribes' : 'Tiragens diárias, renderização em canvas HD e álbum com suborno'}
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Draw your daily guidance with /py-tarot! Each card is generated dynamically in HD canvas with mystical interpretations. Stick your card into your personal album (/py-album) to build your collection, unlock achievements, and use Arcane Bribes for missing cards.'
                : 'Consulte a sabedoria do oráculo com /py-tarot! Cada tiragem gera uma carta em alta resolução com reflexões para o seu dia. Cole sua carta no seu Álbum Colecionável (/py-album) para completar os 22 Arcanos Maiores e 56 Menores, ganhando conquistas exclusivas e moedinhas!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2">
                <div className="text-pink-400 font-title font-bold text-sm">🔮 Tiragem Diária</div>
                <p className="text-xs text-slate-300">
                  {isEn ? '1 free card draw every 24h with personalized insight.' : '1 tiragem gratuita por dia com reflexão inspiradora.'}
                </p>
                <div className="font-mono text-[10px] text-purple-300">/py-tarot</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2">
                <div className="text-purple-400 font-title font-bold text-sm">📖 Álbum de Coleção</div>
                <p className="text-xs text-slate-300">
                  {isEn ? 'Organize your cards and showcase your public web deck.' : 'Cole suas cartas, consulte estatísticas e exiba seu perfil web.'}
                </p>
                <div className="font-mono text-[10px] text-purple-300">/py-album</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2">
                <div className="text-amber-400 font-title font-bold text-sm">💰 Suborno Arcano</div>
                <p className="text-xs text-slate-300">
                  {isEn ? 'Spend magic beans to summon a guaranteed missing card!' : 'Gaste Feijões Mágicos para invocar cartas faltantes no álbum!'}
                </p>
                <div className="font-mono text-[10px] text-purple-300">/py-suborno</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. MARRIAGE & SOCIAL */}
      {activeTab === 'marriage' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
                  {isEn ? 'Marriage, Family & Social Dynamics' : 'Matrimônio, Família & Dinâmica Social'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {isEn ? 'Tree of life, shared bank vault, romantic dates and children' : 'Árvore da vida, cofre conjunto, encontros românticos e filhos'}
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Form an eternal bond with another member! Once married, couples nurture an active Love Gauge that decays lazily if neglected. Together you water the Tree of Life every 12h, invest in the Family Vault with daily interest, enjoy Date Nights, and adopt children who work internships for family income!'
                : 'Celebre um vínculo eterno com outro membro do Discord! Casais nutrem uma Barra do Amor que exige carinho diário. Vocês podem regar a Árvore da Vida a cada 12h, acumular economias no Cofre do Casal com juros diários, ter encontros românticos e adotar filhos que fazem estágios e trazem moedas para o lar!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5">
                <TreePine className="w-5 h-5 text-emerald-400" />
                <div className="font-title font-bold text-white text-sm">Árvore da Vida</div>
                <p className="text-[11px] text-slate-300">
                  {isEn ? 'Water every 12h to gain +10% Love and tree levels.' : 'Rega a cada 12h rende +10% de amor e sobe o nível da árvore.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5">
                <Vault className="w-5 h-5 text-amber-400" />
                <div className="font-title font-bold text-white text-sm">Cofre do Casal</div>
                <p className="text-[11px] text-slate-300">
                  {isEn ? 'Deposit shared coins with up to 5%/day interest.' : 'Depósitos conjuntos com rendimento diário de até 5% ao dia.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5">
                <Heart className="w-5 h-5 text-rose-400" />
                <div className="font-title font-bold text-white text-sm">Date Night</div>
                <p className="text-[11px] text-slate-300">
                  {isEn ? 'Answer 3 date questions together for love boosts.' : 'Encontros com 3 perguntas de sintonia a dois com prêmios.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5">
                <Baby className="w-5 h-5 text-pink-400" />
                <div className="font-title font-bold text-white text-sm">Filhos & Estágio</div>
                <p className="text-[11px] text-slate-300">
                  {isEn ? 'Adopt up to 5 children who work 24h internships.' : 'Adote até 5 filhos que fazem estágio remunerado para a família.'}
                </p>
              </div>
            </div>

            <div className="pt-2 text-center font-mono text-xs text-pink-300">
              /py-casamento • /py-filho • /py-divorcio • /py-ship
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. COMMAND CATALOG */}
      {activeTab === 'commands' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Notice Header */}
          <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'Showing all registered commands. Press Ctrl+K anytime to open the instant search command palette.'
                  : 'Catálogo oficial de todos os comandos registrados. Pressione Ctrl+K a qualquer momento para abrir o buscador rápido.'}
              </span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-purple-300">
              <span>Ctrl</span> + <span>K</span>
            </div>
          </div>

          {/* Full Interactive Command Grid */}
          <CommandGrid t={t} lang={lang} />
        </div>
      )}

      {/* TAB CONTENT: 7. FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center mb-6">
            <h3 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
              {isEn ? 'Frequently Asked Questions & Guidelines' : 'Perguntas Frequentes & Diretrizes'}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {isEn ? 'Quick answers to common questions about Pyxie' : 'Respostas rápidas sobre comandos, permissões e economia'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2 hover:border-pink-500/40 transition-colors"
              >
                <h4 className="font-title font-bold text-base text-white flex items-center gap-2">
                  <span className="text-pink-400">Q.</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
