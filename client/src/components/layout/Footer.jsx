import React from 'react';
import { localeHref } from '../../utils/localePath';

const linkClass = 'block py-1.5 text-sm font-medium text-slate-300 hover:text-pink-400 transition-colors text-left';

// Mesmos grupos e links do rodapé das páginas estáticas (src/utils/siteChrome.js).
export default function Footer({ t, lang = 'pt' }) {
  const groups = [
    {
      id: 'explore',
      title: t('footer.groupExplore'),
      links: [
        { href: localeHref('/wiki', lang), label: t('footer.wiki') },
        { href: localeHref('/bonus', lang), label: t('footer.bonus') },
        { href: localeHref('/tarot', lang), label: t('footer.tarot') },
      ],
    },
    {
      title: t('footer.groupCommunity'),
      links: [
        { href: localeHref('/hyperfokus', lang), label: t('footer.blog') },
        { href: localeHref('/museu', lang), label: t('footer.museum') },
        { href: localeHref('/parcerias', lang), label: t('footer.partnerships') },
        { href: '/discord?ref=site-footer', label: t('footer.community'), external: true },
      ],
    },
    {
      title: t('footer.groupTrust'),
      links: [
        { href: localeHref('/termos', lang), label: t('footer.terms') },
        { href: localeHref('/privacidade', lang), label: t('footer.privacy') },
        { action: 'cookies', label: t('footer.cookies') },
        { href: localeHref('/pais-e-profissionais', lang), label: t('footer.parents') },
        { href: localeHref('/transparencia', lang), label: t('footer.transparency') },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#06030c]/95 border-t border-purple-500/15 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/pyxie/sticker/sticker_smile-128.webp"
              alt={t('footer.mascotAlt')}
              width="40"
              height="40"
              loading="lazy"
              className="w-10 h-10 object-contain"
            />
            <span className="font-title font-black text-white text-xl">Pyxie</span>
          </div>
          <p className="text-sm text-slate-400 max-w-[16rem]">{t('footer.tagline')}</p>
        </div>

        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300/70">{group.title}</p>
            {group.links.map((link) =>
              link.action === 'cookies' ? (
                <button
                  key="cookies"
                  type="button"
                  onClick={() => window.PyxieConsent && window.PyxieConsent.open()}
                  className={linkClass}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={linkClass}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </a>
              ),
            )}
            {group.id === 'explore' && (
              <a href="/promo" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Shopee
              </a>
            )}
          </nav>
        ))}
      </div>

      <p className="max-w-7xl mx-auto mt-10 pt-6 border-t border-purple-500/10 text-xs text-center md:text-left text-slate-500">
        {t('footer.rights')}
      </p>
    </footer>
  );
}
