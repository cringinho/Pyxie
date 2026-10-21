const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { resolveEmoji } = require('./emojiResolver');

const THEME_PATH = path.join(__dirname, '..', 'data', 'embedTheme.json');

const DEFAULT_THEME = {
  colors: {
    primary: '#E60067',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#111214',
  },
  footer: {
    appName: 'Pyxie',
    defaultIcon: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif',
  },
};

function getEmbedTheme() {
  try {
    if (fs.existsSync(THEME_PATH)) {
      const data = JSON.parse(fs.readFileSync(THEME_PATH, 'utf8'));
      return {
        ...DEFAULT_THEME,
        ...data,
        colors: { ...DEFAULT_THEME.colors, ...(data.colors || {}) },
        footer: { ...DEFAULT_THEME.footer, ...(data.footer || {}) },
      };
    }
  } catch (_) {}
  return DEFAULT_THEME;
}

/**
 * Valida e formata título respeitando o teto de 8 palavras e âncora visual
 * @param {string} title
 * @param {string} anchorEmoji
 * @returns {string}
 */
function formatEmbedTitle(title = '', anchorEmoji = '') {
  let cleanTitle = String(title || '').trim();
  if (anchorEmoji && !cleanTitle.startsWith(anchorEmoji)) {
    cleanTitle = `${anchorEmoji} ${cleanTitle}`.trim();
  }

  // Verifica palavras (ignorando emoji inicial se houver)
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  if (words.length > 8) {
    cleanTitle = words.slice(0, 8).join(' ');
  }
  return cleanTitle;
}

/**
 * Constrói um Embed padronizado seguindo a identidade Dark Kawaii e regras de interface
 * @param {Object} options
 * @param {import('discord.js').Client} [options.client]
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'info'|string} [options.variant='primary']
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.slot] - Slot de emoji para resolução dinâmica
 * @param {string} [options.anchorEmoji] - Emoji funcional explícito
 * @param {import('discord.js').Guild|null} [options.guild]
 * @param {string} [options.footerText]
 * @param {Array<{ name: string, value: string, inline?: boolean }>} [options.fields]
 * @param {boolean} [options.timestamp=false]
 * @returns {EmbedBuilder}
 */
function buildStandardEmbed(options = {}) {
  const {
    client = null,
    variant = 'primary',
    title = '',
    description = '',
    slot = null,
    anchorEmoji = null,
    guild = null,
    footerText = null,
    fields = [],
    timestamp = false,
  } = options;

  const theme = getEmbedTheme();
  const embed = new EmbedBuilder();

  // 1. Resolução de Cor Dark Kawaii
  const colorHex = theme.colors[variant] || (variant.startsWith('#') ? variant : theme.colors.primary);
  embed.setColor(colorHex);

  // 2. Âncora visual e título (máximo 8 palavras)
  let resolvedAnchor = anchorEmoji;
  if (!resolvedAnchor && slot) {
    resolvedAnchor = resolveEmoji(client, slot, 'discord');
  }
  if (!resolvedAnchor) {
    const fallbackAnchors = {
      primary: '✨',
      secondary: '🔮',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
    };
    resolvedAnchor = fallbackAnchors[variant] || '✨';
  }

  if (title) {
    embed.setTitle(formatEmbedTitle(title, resolvedAnchor));
  }

  // 3. Descrição
  if (description) {
    embed.setDescription(String(description));
  }

  // 4. Fields
  if (Array.isArray(fields) && fields.length > 0) {
    for (const f of fields) {
      if (f && f.name && f.value) {
        embed.addFields({
          name: String(f.name),
          value: String(f.value),
          inline: Boolean(f.inline),
        });
      }
    }
  }

  // 5. Rodapé contextual obrigatório { text: string }
  const appName = theme.footer.appName || 'Pyxie';
  const guildName = guild?.name ? ` • ${guild.name}` : '';
  const tipOrContext = footerText ? ` • ${footerText}` : '';
  embed.setFooter({ text: `${appName}${guildName}${tipOrContext}` });

  // 6. Timestamp opcional para ações com temporalidade
  if (timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

module.exports = {
  getEmbedTheme,
  formatEmbedTitle,
  buildStandardEmbed,
};

