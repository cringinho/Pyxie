/**
 * truthHydrator.js - Pyxie Dynamic System Truth Hydrator
 * Hidrata automaticamente todos os elementos [data-truth="..."] no DOM com a verdade
 * absoluta da VM e do banco de dados (/api/public/system-truth).
 * Possui suporte a localStorage, revalidação SWR e 3 retentativas com backoff exponencial.
 */

(function () {
  'use strict';

  const TRUTH_API = '/api/public/system-truth';
  const STORAGE_KEY = 'pyxie_system_truth';
  const REVALIDATE_INTERVAL_MS = 60 * 1000; // 60s em segundo plano

  let cachedTruth = null;

  // Recupera cache imediato do localStorage para Zero Layout Shift (CLS)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedTruth = JSON.parse(raw);
    }
  } catch (_) {}

  /**
   * Resolução segura de caminhos em dot-notation (ex: 'milestones.museumArts.badge')
   */
  function resolvePath(obj, pathStr) {
    if (!obj || !pathStr) return undefined;
    return pathStr.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  /**
   * Aplica os valores da Verdade Absoluta nos elementos correspondentes do DOM
   */
  function applyTruthToDOM(truth) {
    if (!truth) return;

    const elements = document.querySelectorAll('[data-truth]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-truth');
      let val = resolvePath(truth, key);

      // Aliases amigáveis comuns
      if (val === undefined) {
        if (key === 'commands.total' || key === 'commands.count') val = truth.commands?.total;
        else if (key === 'professions.total' || key === 'professions.count') val = truth.professions?.total;
        else if (key === 'professions.scenarios' || key === 'work.scenarios') val = truth.professions?.workScenariosCount;
        else if (key === 'museum.badge' || key === 'museum.count') val = truth.milestones?.museumArts?.badge;
        else if (key === 'museum.raw') val = truth.milestones?.museumArts?.raw;
        else if (key === 'quiz.total' || key === 'quiz.count') val = truth.milestones?.quizQuestions?.badge || truth.milestones?.quizQuestions?.raw;
        else if (key === 'tarot.total' || key === 'tarot.cards') val = truth.milestones?.tarotCards || 78;
        else if (key === 'guilds.total' || key === 'guilds.count') val = truth.milestones?.activeGuilds;
        else if (key === 'cringelandia.helped') val = truth.milestones?.cringelandiaHelped;
      }

      if (val !== undefined && val !== null) {
        if (typeof val === 'number') {
          el.innerText = val.toLocaleString('pt-BR');
        } else {
          el.innerText = String(val);
        }
      }
    });

    // Dispara evento customizado para scripts da página que queiram renderizar componentes ricos
    try {
      window.dispatchEvent(new CustomEvent('pyxie:truth_hydrated', { detail: truth }));
    } catch (_) {}
  }

  /**
   * Busca os dados da verdade do servidor com até 3 retentativas e backoff exponencial
   */
  async function fetchSystemTruth(retryCount = 0) {
    const delays = [500, 1500, 3000];
    try {
      const res = await fetch(TRUTH_API, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && (data.commands || data.milestones)) {
        cachedTruth = data;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (_) {}
        applyTruthToDOM(data);
        return data;
      }
    } catch (err) {
      if (retryCount < delays.length) {
        setTimeout(() => fetchSystemTruth(retryCount + 1), delays[retryCount]);
      } else {
        console.warn('[truthHydrator] Erro ao sincronizar system-truth, usando cache:', err.message);
      }
    }
  }

  // Inicialização
  if (cachedTruth) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyTruthToDOM(cachedTruth));
    } else {
      applyTruthToDOM(cachedTruth);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fetchSystemTruth();
      setInterval(() => fetchSystemTruth(), REVALIDATE_INTERVAL_MS);
    });
  } else {
    fetchSystemTruth();
    setInterval(() => fetchSystemTruth(), REVALIDATE_INTERVAL_MS);
  }

  window.PyxieTruth = {
    getTruth: () => cachedTruth,
    revalidate: () => fetchSystemTruth(0),
    apply: () => applyTruthToDOM(cachedTruth),
  };
})();
