import React from 'react';

const linkClass = 'block py-1.5 text-sm font-medium text-slate-300 hover:text-pink-400 transition-colors';

export default function Footer({ t, lang = 'pt' }) {
  // Grupos de links: 2 colunas no celular, 3 no tablet/desktop.
  const groups = [
    {
      title: t('footer.groupExplore'),
      links: [
        { href: `/wiki?lang=${lang}`, label: t('footer.wiki') },
        { href: `/bonus?lang=${lang}`, label: t('footer.bonus') },
        { href: '/install?ref=site-footer', label: t('footer.install'), external: true },
        { href: '/promo', label: 'Shopee', external: true },
      ],
    },
    {
      title: t('footer.groupCommunity'),
      links: [
        { href: `/hyperfokus?lang=${lang}`, label: t('footer.blog') },
        { href: `/museu?lang=${lang}`, label: t('footer.museum') },
        { href: `/parcerias?lang=${lang}`, label: t('footer.partnerships') },
        { href: '/discord?ref=site-footer', label: t('footer.community'), external: true },
      ],
    },
    {
      title: t('footer.groupTrust'),
      links: [
        { href: `/termos?lang=${lang}`, label: t('footer.terms') },
        { href: `/pais-e-profissionais?lang=${lang}`, label: t('footer.parents') },
        { href: `/transparencia?lang=${lang}`, label: t('footer.transparency') },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#06030c]/95 border-t border-purple-500/15 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/pyxie/sticker/sticker_smile.png"
              alt="Pyxie Mascot Mini"
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
            {group.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={linkClass}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ))}
      </div>

      <p className="max-w-7xl mx-auto mt-10 pt-6 border-t border-purple-500/10 text-xs text-center md:text-left text-slate-500">
        {t('footer.rights')}
      </p>
    </footer>
  );
}
