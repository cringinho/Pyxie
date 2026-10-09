/**
 * Utilitário central de SEO Multilíngue (PT & EN) para páginas da Pyxie
 * Garante paridade de SEO e entrega imediata de HTML localizado para crawlers e usuários.
 */
const fs = require('fs');
const path = require('path');

const SEO_CONFIG = {
  index: {
    file: 'index.html',
    canonical: 'https://pyxie.com.br/',
    pt: {
      title: 'Pyxie • Bot Mágico de Economia, Tarot & Comunidade no Discord',
      description: 'Pyxie é uma fada mágica para o Discord com Economia Viva (moedinhas e feijões mágicos), 16 Carreiras e Profissões com minigames práticos, Tarot dos 78 Arcanos em Canvas e Diversão comunitária.',
      ogTitle: 'Pyxie • Bot Mágico de RPG, Economia & Comunidade no Discord',
      ogDesc: 'Economia Viva com moedinhas e feijões mágicos, 16 carreiras com minigames interativos, Tarot dos 78 arcanos em Canvas e Entretenimento completo para seu Discord.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Pyxie • Magical Discord Bot for Economy, Tarot & Community',
      description: 'Pyxie is a magical fairy Discord bot featuring a Living Economy, 16 Careers & interactive jobs, 78 Tarot Cards with dynamic Canvas rendering, and vibrant community games.',
      ogTitle: 'Pyxie • Magical RPG, Economy & Community Discord Bot',
      ogDesc: 'Living Economy with magic coins and beans, 16 interactive job careers, 78 Tarot cards with dynamic Canvas art, and rich community games for your Discord server.',
      locale: 'en_US'
    }
  },
  tarot: {
    file: 'tarot.html',
    canonical: 'https://pyxie.com.br/tarot',
    pt: {
      title: 'Tirar Carta de Tarot Online Grátis • Oráculo Mágico da Pyxie',
      description: 'Tire sua Carta do Dia de Tarot online gratuitamente com a Pyxie. Conheça as mensagens dos 78 arcanos, conselhos místicos e compartilhe seu destino no Pinterest e redes sociais.',
      ogTitle: 'Tirar Carta de Tarot Online Grátis • Oráculo da Pyxie',
      ogDesc: 'Tire sua carta do dia no Tarot dos 78 arcanos com conselhos místicos e interpretação mágica personalizada.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Free Daily Tarot Card Reading Online • Pyxie Oracle',
      description: 'Draw your free daily Tarot card online with Pyxie. Discover mystical messages of all 78 arcana cards, spiritual advice, and save pins directly to Pinterest.',
      ogTitle: 'Free Daily Tarot Card Reading Online • Pyxie Oracle',
      ogDesc: 'Draw your daily Tarot card from all 78 arcana with mystical advice and personalized magical readings.',
      locale: 'en_US'
    }
  },
  wiki: {
    file: 'wiki.html',
    canonical: 'https://pyxie.com.br/wiki',
    pt: {
      title: 'Wiki & Enciclopédia Oficial • Pyxie & Cringelândia',
      description: 'Enciclopédia e Guia da Comunidade da Pyxie e Cringelândia. Conheça o santuário para mentes neurodivergentes, economia viva, 78 cartas de tarot, 16 carreiras e minigames.',
      ogTitle: 'Wiki & Enciclopédia Oficial • Pyxie & Cringelândia',
      ogDesc: 'Enciclopédia e Guia da Comunidade da Pyxie e Cringelândia. Conheça o santuário para mentes neurodivergentes, economia viva, 78 cartas de tarot, 16 carreiras e minigames.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Official Wiki & Encyclopedia • Pyxie & Cringelândia',
      description: 'Official documentation and community guide for Pyxie Discord Bot. Explore the neurodivergent sanctuary, dynamic economy, 78 tarot cards, 16 careers, and minigames.',
      ogTitle: 'Official Wiki & Documentation • Pyxie & Cringelândia',
      ogDesc: 'Complete guide for Pyxie Discord Bot features, live economy, 78 tarot cards, 16 careers, and interactive community minigames.',
      locale: 'en_US'
    }
  },
  partnerships: {
    file: 'partnerships.html',
    canonical: 'https://pyxie.com.br/parcerias',
    pt: {
      title: 'Mural das Alianças • Pyxie & Astaroth',
      description: 'Conheça as comunidades parceiras, criadores e projetos aliados da Cringelândia e Pyxie sob a guarda de Astaroth.',
      ogTitle: 'Mural das Alianças • Pyxie & Astaroth',
      ogDesc: 'Conheça as comunidades parceiras, criadores e projetos aliados da Cringelândia e Pyxie sob a guarda de Astaroth.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Alliance & Partnerships Board • Pyxie & Astaroth',
      description: 'Discover partner Discord communities, creators, and allied projects of Pyxie and Cringelândia protected by Astaroth.',
      ogTitle: 'Alliance & Partnerships Board • Pyxie & Astaroth',
      ogDesc: 'Discover partner Discord communities, creators, and allied projects of Pyxie and Cringelândia protected by Astaroth.',
      locale: 'en_US'
    }
  },
  museum: {
    file: 'museum.html',
    canonical: 'https://pyxie.com.br/museu',
    pt: {
      title: 'Museu da Comunidade • Pyxie',
      description: 'Acervo permanente de artes, ilustrações e criações da comunidade da Cringelândia com a Pyxie.',
      ogTitle: 'Museu da Comunidade • Pyxie',
      ogDesc: 'Acervo permanente de artes, ilustrações e criações da comunidade da Cringelândia com a Pyxie.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Community Museum & Art Gallery • Pyxie',
      description: 'Permanent gallery of artwork, member creations, and visual lore from Pyxie and the Cringelândia community.',
      ogTitle: 'Community Museum & Art Gallery • Pyxie',
      ogDesc: 'Permanent gallery of artwork, member creations, and visual lore from Pyxie and the Cringelândia community.',
      locale: 'en_US'
    }
  },
  bonus: {
    file: 'bonus.html',
    canonical: 'https://pyxie.com.br/bonus',
    pt: {
      title: 'Pyxie • Bônus Mágico Encantado',
      description: 'Resgate moedinhas mágicas gratuitas para sua conta no Discord assistindo 10 segundos no portal oficial da Pyxie.',
      ogTitle: 'Pyxie • Bônus Mágico Encantado',
      ogDesc: 'Resgate moedinhas mágicas gratuitas para sua conta no Discord assistindo 10 segundos no portal oficial da Pyxie.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Pyxie • Enchanted Magic Bonus Portal',
      description: 'Claim free magic coins for your Discord account in 10 seconds on the official Pyxie reward portal.',
      ogTitle: 'Pyxie • Enchanted Magic Bonus Portal',
      ogDesc: 'Claim free magic coins for your Discord account in 10 seconds on the official Pyxie reward portal.',
      locale: 'en_US'
    }
  },
  terms: {
    file: 'terms.html',
    canonical: 'https://pyxie.com.br/termos',
    pt: {
      title: 'Termos de Uso, Proteção a Menores & Segurança • Pyxie & Cringelândia',
      description: 'Diretrizes regulatórias, proteção integral a menores (ECA e Lei 14.811/2024), termo de consentimento, canais protegidos e canais de acolhimento e suporte emocional da Cringelândia e Pyxie.',
      ogTitle: 'Termos de Uso, Proteção a Menores & Segurança • Pyxie & Cringelândia',
      ogDesc: 'Nosso compromisso inegociável com a proteção de menores, acolhimento e suporte a pessoas em sofrimento psíquico, e licença de uso comunitário.',
      locale: 'pt_BR'
    },
    en: {
      title: 'Terms of Use, Child Safety & Protection • Pyxie & Cringelândia',
      description: 'Regulatory guidelines, child safeguarding framework, consent terms, protected channel architecture, and emotional crisis hotline network for Pyxie and Cringelândia.',
      ogTitle: 'Terms of Use, Child Safety & Protection • Pyxie & Cringelândia',
      ogDesc: 'Our non-negotiable commitment to child protection, mental health crisis support, and community intellectual property licensing.',
      locale: 'en_US'
    }
  }
};

const htmlCache = new Map();

function detectRequestLang(req) {
  if (req && req.query && req.query.lang) {
    const q = String(req.query.lang).toLowerCase();
    if (q === 'en') return 'en';
    if (q === 'pt') return 'pt';
  }
  if (req && req.cookies && (req.cookies.pyxie_lang === 'en' || req.cookies.lang === 'en')) {
    return 'en';
  }
  const acceptLang = req && req.headers ? req.headers['accept-language'] : '';
  if (acceptLang) {
    const primary = acceptLang.split(',')[0].trim().toLowerCase();
    if (primary.startsWith('en')) return 'en';
  }
  return 'pt';
}

function getLocalizedHtml(pageKey, lang, publicDir) {
  const cacheKey = `${pageKey}:${lang}`;
  if (htmlCache.has(cacheKey) && process.env.NODE_ENV === 'production') {
    return htmlCache.get(cacheKey);
  }

  const conf = SEO_CONFIG[pageKey];
  if (!conf) return null;

  const filePath = path.join(publicDir, conf.file);
  if (!fs.existsSync(filePath)) return null;

  let html = fs.readFileSync(filePath, 'utf8');

  if (lang === 'en') {
    const meta = conf.en;
    html = html.replace(/<html\s+lang=["']pt-BR["']>/i, '<html lang="en">');
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
    html = html.replace(/(<meta\s+name=["']description["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.description}$2`);
    html = html.replace(/(<meta\s+property=["']og:title["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.ogTitle}$2`);
    html = html.replace(/(<meta\s+property=["']og:description["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.ogDesc}$2`);
    html = html.replace(/(<meta\s+property=["']og:locale["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.locale}$2`);
    html = html.replace(/(<meta\s+name=["']twitter:title["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.ogTitle}$2`);
    html = html.replace(/(<meta\s+name=["']twitter:description["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${meta.ogDesc}$2`);
  }

  htmlCache.set(cacheKey, html);
  return html;
}

function serveLocalizedPage(pageKey, publicDir) {
  return (req, res) => {
    const lang = detectRequestLang(req);
    const html = getLocalizedHtml(pageKey, lang, publicDir);
    if (!html) {
      return res.status(404).send('Page not found');
    }
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Vary', 'Accept-Language');
    res.send(html);
  };
}

function clearSeoCache() {
  htmlCache.clear();
}

module.exports = {
  SEO_CONFIG,
  detectRequestLang,
  getLocalizedHtml,
  serveLocalizedPage,
  clearSeoCache
};

