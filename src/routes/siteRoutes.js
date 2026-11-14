const express = require('express');
const { renderDevsPage, LANGS } = require('../site/devsPage');

/**
 * Pyxie Devs: página em /devs (inglês, idioma principal), /devs/es e /devs/pt,
 * e as saídas para o grupo no Roblox e o Discord dos Devs.
 * Os endereços oficiais ficam aqui; o .env pode trocar (só vale no domínio esperado).
 * Sem endereço válido, o botão aparece como "em breve" e a rota volta para a página.
 */
const LINKS = {
  discord: {
    env: 'PYXIE_DEVS_DISCORD_INVITE',
    // Convite oficial do Discord da Pyxie Devs (passado pelo dono); o .env pode trocar.
    fallback: 'https://discord.gg/veaRCgvZCT',
    hosts: ['discord.gg', 'discord.com', 'www.discord.com'],
  },
  roblox: {
    env: 'PYXIE_DEVS_ROBLOX_URL',
    // Grupo oficial da Pyxie Devs (confirmado pelo dono); o .env pode trocar.
    fallback: 'https://www.roblox.com/share/g/35473881',
    hosts: ['www.roblox.com', 'roblox.com'],
  },
};

function linkFor(key, env = process.env) {
  const conf = LINKS[key];
  if (!conf) return null;
  const raw = String(env[conf.env] || conf.fallback || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || !conf.hosts.includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch (_) {
    return null;
  }
}

function currentLinks(env = process.env) {
  return { discord: linkFor('discord', env), roblox: linkFor('roblox', env) };
}

function createSiteRouter() {
  const router = express.Router();

  const servePage = (lang) => (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(renderDevsPage({ lang, links: currentLinks() }));
  };
  router.get('/devs', servePage('en'));
  router.get('/devs/es', servePage('es'));
  router.get('/devs/pt', servePage('pt'));

  const redirectTo = (key) => (req, res) => {
    const from = String(req.query?.from || '');
    const back = LANGS[from] ? LANGS[from].path : '/devs';
    res.redirect(linkFor(key) || `${back}#join`);
  };
  router.get('/devs/discord', redirectTo('discord'));
  router.get('/devs/roblox', redirectTo('roblox'));

  return router;
}

module.exports = { createSiteRouter, linkFor, currentLinks, LINKS };
