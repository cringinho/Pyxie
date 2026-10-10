import React, { useEffect } from 'react';
import CommandGrid from '../components/wiki/CommandGrid';
import { BookOpen, Sparkles, Terminal, Shield, HelpCircle } from 'lucide-react';

export default function Wiki({ t, lang }) {
  const isEn = lang === 'en';

  useEffect(() => {
    document.title = isEn
      ? 'Pyxie Commands • Complete Guide & Official Documentation | Discord Bot'
      : 'Comandos da Pyxie • Guia Completo e Documentação Oficial | Discord Bot';
  }, [isEn]);

  const faqs = isEn ? [
    {
      q: 'How do I add Pyxie to my Discord server?',
      a: 'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands permissions.',
    },
    {
      q: 'Do slash commands work in all channels?',
      a: 'Yes, unless server administrators restrict command permissions in Server Settings > Integrations.',
    },
    {
      q: 'What is the daily economy reset time?',
      a: 'Daily rewards (/py-daily) reset every 24 hours per user. Streaks have a 48h grace period.',
    },
    {
      q: 'Are all 78 Tarot cards available in the Album?',
      a: 'Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared via /py-album.',
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
  ];

  return (
    <div className="min-h-screen py-8 space-y-16">
      {/* Interactive Command Catalog */}
      <CommandGrid t={t} lang={lang} />

      {/* Structured FAQ & Documentation Section for SEO & UX */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-purple-500/15">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Perguntas Frequentes & Diretrizes</span>
          </div>
          <h3 className="font-title font-extrabold text-2xl sm:text-3xl text-white">
            {isEn ? 'Frequently Asked Questions' : 'Perguntas Frequentes sobre a Pyxie'}
          </h3>
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
      </section>
    </div>
  );
}
