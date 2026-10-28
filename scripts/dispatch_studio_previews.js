#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do estúdio de mensagens no canal 1461937203214024891:
 * uma mensagem clássica e uma no formato novo (Components V2), mais as respostas do bot aos cliques
 * e o embed das respostas de formulário. Dados temporários. Uso: node scripts/dispatch_studio_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-studio-preview-'));

const store = require('../src/services/messageStudioStore');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { CRINGELANDIA_GUILD_ID } = require('../src/config/scopes');
const { t } = require('../src/utils/i18n');

const pt = lang === 'pt';
const ROLE_ID = '1461925047378645154';

const classic = {
  id: `preview-classico-${lang}`,
  name: 'Prévia clássica',
  envelope: { content: pt ? '-# 🌷 Prévia do estúdio de mensagens' : '-# 🌷 Message studio preview', silent: true },
  embeds: [
    {
      color: '#e60067',
      title: pt ? '{emoji:map} Bem-vinda a {server}!' : '{emoji:map} Welcome to {server}!',
      description: pt
        ? '### 📜 Antes de tudo\n\n> *Leia as regras e escolha seus cargos com calma.*\n\n• **Respeito:** aqui ninguém é zoado pelo jeito que é.\n\n• **Ritmo:** vá no seu tempo, sem pressa.'
        : '### 📜 First things first\n\n> *Read the rules and pick your roles calmly.*\n\n• **Respect:** nobody gets mocked for who they are.\n\n• **Pace:** go at your own speed, no rush.',
      fields: [
        { name: pt ? 'Membros' : 'Members', value: '`512`', inline: true },
        { name: pt ? 'Idioma' : 'Language', value: pt ? '`Português`' : '`English`', inline: true },
      ],
      thumbnailUrl: '{server.icon}',
      footer: { text: 'Pyxie • Cringelândia' },
      timestamp: true,
    },
  ],
  tabs: [{ id: 'regras', label: pt ? 'Regras' : 'Rules', content: pt ? 'Aba de regras' : 'Rules tab', embeds: [] }],
  buttons: [
    { id: 'cargo', label: pt ? 'Quero o cargo' : 'Give me the role', emoji: '✨', style: 'success', action: { type: 'role', roleId: ROLE_ID } },
    { id: 'form', label: pt ? 'Falar com a staff' : 'Talk to staff', emoji: '📝', style: 'primary', action: { type: 'modal', title: pt ? 'Fale com a staff' : 'Talk to staff', targetChannelId: '1461937203214024891', fields: [{ label: pt ? 'Sua mensagem' : 'Your message', style: 'paragraph' }] } },
    { id: 'regras', label: pt ? 'Regras' : 'Rules', style: 'secondary', action: { type: 'tab', tabId: 'regras' } },
    { id: 'silencio', label: pt ? 'Marcação silenciosa' : 'Silent mentions', emoji: '🔕', style: 'secondary', action: { type: 'silent' } },
    { id: 'site', label: 'Site', action: { type: 'link', url: 'https://pyxie.com.br/cringelandia' } },
  ],
};

const v2 = {
  id: `preview-v2-${lang}`,
  name: 'Prévia V2',
  mode: 'v2',
  envelope: { silent: true },
  v2: {
    accentColor: '#8b5cf6',
    blocks: [
      { type: 'text', content: pt ? '## 🎨 Escolha seus setores\n-# Formato novo do Discord (Components V2)' : '## 🎨 Pick your sections\n-# New Discord layout (Components V2)' },
      { type: 'separator', spacing: 'small', divider: true },
      { type: 'section', text: pt ? '**Arte e Escrita**\nDesenhos, contos e o Museu.' : '**Art and Writing**\nDrawings, stories and the Museum.', accessory: { type: 'button', buttonId: 'arte' } },
      { type: 'section', text: pt ? '**Estudos e Superação**\nFoco junto, sem julgamento.' : '**Study and Growth**\nFocus together, no judgment.', accessory: { type: 'button', buttonId: 'estudos' } },
      { type: 'gallery', images: [{ url: 'https://cdn.discordapp.com/emojis/1551355962974273546.png', description: 'Pyxie' }] },
    ],
  },
  buttons: [
    { id: 'arte', label: pt ? 'Entrar' : 'Join', style: 'primary', action: { type: 'role', roleId: ROLE_ID } },
    { id: 'estudos', label: pt ? 'Entrar' : 'Join', style: 'primary', action: { type: 'role', roleId: ROLE_ID } },
  ],
};

async function main() {
  for (const doc of [classic, v2]) {
    const saved = store.saveMessage(CRINGELANDIA_GUILD_ID, doc);
    if (!saved.ok) throw new Error(`Mensagem inválida: ${JSON.stringify(saved.errors)}`);
    const sent = await store.sendHomologationPreview(CRINGELANDIA_GUILD_ID, saved.doc.id);
    console.log(`[StudioPreview] ${doc.name} (${lang}): enviado (${sent.messageId})`);
  }

  const source = { lang };
  const replies = ['role_added', 'role_removed', 'role_error', 'modal_sent', 'silent_on', 'silent_off', 'not_found']
    .map((k) => `• **${k}:** ${t(`messageStudio.${k}`, source, { role: 'Heliotrope' })}`)
    .join('\n\n');
  const result = await dispatchHomologationPreview({
    commandName: pt ? 'Estúdio de mensagens' : 'Message studio',
    context: pt ? `Respostas aos cliques e formulário (${lang})` : `Click replies and form (${lang})`,
    embeds: [
      { color: 0x8b5cf6, title: pt ? '💬 Respostas privadas dos botões' : '💬 Private button replies', description: replies },
      {
        color: 0x8b5cf6,
        title: `📝 ${pt ? 'Fale com a staff' : 'Talk to staff'}`,
        description: t('messageStudio.modal_entry_by', source, { user: '`<@214153735281180673>`' }),
        fields: [{ name: pt ? 'Sua mensagem' : 'Your message', value: pt ? 'Oi! Queria tirar uma dúvida sobre os cargos.' : 'Hi! I had a question about the roles.' }],
        timestamp: new Date().toISOString(),
      },
    ],
    includeHeader: true,
  });
  console.log('[StudioPreview] Respostas:', result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

main()
  .catch((err) => {
    console.error('[StudioPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
