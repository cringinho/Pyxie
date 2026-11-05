'use strict';

/**
 * Escapa texto antes de colocar dentro de HTML (conteúdo ou atributo).
 * Use sempre que um dado vindo de usuário, URL ou Discord entrar numa página
 * montada no servidor (auditoria Q033/Q099/Q221/Q222).
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Troca o conteúdo de uma tag/atributo usando função (e não string), para que
 * "$1", "$&" etc. digitados por usuários não virem padrões do String.replace.
 */
function replaceKeep(html, regex, value) {
  return html.replace(regex, (_m, open, close) => `${open}${value}${close}`);
}

module.exports = { escapeHtml, replaceKeep };
