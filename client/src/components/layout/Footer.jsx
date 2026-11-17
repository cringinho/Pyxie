import React from 'react';
import { localeHref } from '../../utils/localePath';
// Fonte única dos links (a mesma lista que as páginas estáticas usam em src/utils/siteChrome.js).
import NAV from '../../../../src/config/siteNav.json';

const linkClass = 'block py-1.5 text-sm font-medium text-slate-300 hover:text-pink-400 transition-colors text-left';
const groupTitleKey = (id) => `footer.group${id.charAt(0).toUpperCase()}${id.slice(1)}`;

export default function Footer({ t, lang = 'pt' }) {
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

        {NAV.footer.map((group) => (
          <nav key={group.id} aria-label={t(groupTitleKey(group.id))}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300/70">{t(groupTitleKey(group.id))}</p>
            {group.links.map((link) =>
              link.action === 'cookies' ? (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => window.PyxieConsent && window.PyxieConsent.open()}
                  className={linkClass}
                >
                  {t(`footer.${link.id}`)}
                </button>
              ) : (
                <a
                  key={link.id}
                  href={link.external ? link.href : localeHref(link.href, lang)}
                  className={linkClass}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {t(`footer.${link.id}`)}
                </a>
              ),
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
