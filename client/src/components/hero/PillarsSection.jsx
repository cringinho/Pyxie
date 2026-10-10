import React from 'react';
import { Sparkles, Coins, Heart, Brain, Gamepad2 } from 'lucide-react';

export default function PillarsSection({ t }) {
  const pillars = [
    {
      id: 1,
      title: 'Tarot dos 78 Arcanos & Álbum',
      desc: 'Tire cartas dos 78 arcanos ilustrados com arte em Canvas HD, consulte oráculos diários, interpretações diretas e invertidas e complete seu álbum colecionável.',
      icon: Sparkles,
      iconColor: 'text-pink-400',
      podBg: 'bg-pink-500/10 border-pink-500/30',
    },
    {
      id: 2,
      title: 'Economia Viva & 16 Vocações',
      desc: 'Acumule moedinhas e feijões mágicos, escolha entre 16 carreiras dinâmicas com minigames em cada turno de trabalho e escale o ranking de riqueza.',
      icon: Coins,
      iconColor: 'text-amber-400',
      podBg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 3,
      title: 'Matrimônio, Casa & Dinâmica Familiar',
      desc: 'Casamentos bilaterais permanentes, compra de casas, cultivo da Árvore da Vida, cofre de amor com juros e herdeiros que estagiam e trazem moedas.',
      icon: Heart,
      iconColor: 'text-rose-400',
      podBg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 4,
      title: 'Quiz & Desafios da Comunidade',
      desc: 'Desafie seus amigos com centenas de perguntas de cultura pop, conhecimentos gerais e lógica com recompensas automáticas por agilidade e acerto.',
      icon: Brain,
      iconColor: 'text-purple-400',
      podBg: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 5,
      title: 'Minigames & Lazer Social',
      desc: 'Dispute Jokenpô, quebre o Biscoito da Sorte, descubra afinidade no /py-ship, brinque de Quem é Mais Provável e personalize temas visuais no perfil.',
      icon: Gamepad2,
      iconColor: 'text-cyan-400',
      podBg: 'bg-cyan-500/10 border-cyan-500/30',
    },
  ];

  return (
    <section id="pilares" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Pilares Oficiais</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-4xl text-white tracking-tight">
          Explore o Universo da Pyxie
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2">
          Desenvolvida para transformar servidores do Discord em comunidades ativas, divertidas e engajadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className="rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${p.podBg}`}>
                  <Icon className={`w-6 h-6 ${p.iconColor}`} />
                </div>
                <h3 className="font-title font-bold text-lg text-white mb-2">{p.title}</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

