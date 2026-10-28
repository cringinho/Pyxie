// Esquemas das automações (seção Automações do painel). Cada campo vira um controle na tela
// e é validado no servidor. Textos em client/src/dashboard/i18n.js (auto.<chave>.*).
module.exports = {
  animator: {
    group: 'community',
    icon: 'PartyPopper',
    needs: [
      { perm: 'SendMessages', why: 'perm.why.animatorSend' },
      { perm: 'SendPolls', why: 'perm.why.animatorPolls' },
    ],
    fields: [
      { key: 'channelIds', type: 'channels', default: [], max: 10 },
      { key: 'silenceMinutes', type: 'number', min: 30, max: 480, default: 90 },
      { key: 'hourStart', type: 'hour', default: 10 },
      { key: 'hourEnd', type: 'hour', default: 23 },
      { key: 'maxPerDay', type: 'number', min: 1, max: 6, default: 2 },
      { key: 'types', type: 'multi', options: ['question', 'thisOrThat', 'poll', 'creative', 'fact', 'scramble', 'house'], default: ['question', 'thisOrThat', 'poll', 'creative', 'fact', 'scramble'] },
      { key: 'tone', type: 'select', options: ['cute', 'neutral', 'tsundere'], default: 'cute' },
      { key: 'autoDeleteMinutes', type: 'number', min: 0, max: 240, default: 60 },
      { key: 'houseLines', type: 'lines', max: 50, maxLength: 200, default: [] },
    ],
  },

  // ---------- Segurança ----------
  newAccountGate: {
    group: 'safety',
    icon: 'UserRoundX',
    needs: [{ perm: 'ManageRoles', why: 'perm.why.quarantineRole' }],
    fields: [
      { key: 'minAgeDays', type: 'number', min: 1, max: 60, default: 7 },
      { key: 'roleId', type: 'role', default: '' },
      { key: 'alert', type: 'toggle', default: true },
    ],
  },
  nameSanitizer: {
    group: 'safety',
    icon: 'SpellCheck',
    needs: [{ perm: 'ManageNicknames', why: 'perm.why.nicknames' }],
    fields: [
      { key: 'zalgo', type: 'toggle', default: true },
      { key: 'links', type: 'toggle', default: true },
      { key: 'hoist', type: 'toggle', default: false },
    ],
  },
  staffImpersonation: {
    group: 'safety',
    icon: 'VenetianMask',
    needs: [],
    fields: [{ key: 'staffRoleIds', type: 'roles', default: [], max: 10 }],
  },
  crossChannelSpam: {
    group: 'safety',
    icon: 'Copy',
    needs: [
      { perm: 'ManageMessages', why: 'perm.why.deleteSpam' },
      { perm: 'ModerateMembers', why: 'perm.why.timeout' },
    ],
    fields: [
      { key: 'channels', type: 'number', min: 2, max: 6, default: 3 },
      { key: 'timeoutMinutes', type: 'number', min: 0, max: 1440, default: 60 },
    ],
  },
  massMention: {
    group: 'safety',
    icon: 'AtSign',
    needs: [
      { perm: 'ManageMessages', why: 'perm.why.deleteSpam' },
      { perm: 'ModerateMembers', why: 'perm.why.timeout' },
    ],
    fields: [
      { key: 'maxMentions', type: 'number', min: 3, max: 30, default: 8 },
      { key: 'timeoutMinutes', type: 'number', min: 0, max: 1440, default: 10 },
    ],
  },
  inviteFilter: {
    group: 'safety',
    icon: 'Unlink',
    needs: [{ perm: 'ManageMessages', why: 'perm.why.deleteSpam' }],
    fields: [
      { key: 'exemptRoleIds', type: 'roles', default: [], max: 10 },
      { key: 'exemptChannelIds', type: 'channels', default: [], max: 10 },
    ],
  },
  automodPresets: {
    group: 'safety',
    icon: 'Bot',
    needs: [{ perm: 'ManageGuild', why: 'perm.why.automod' }],
    fields: [
      { key: 'presets', type: 'multi', options: ['profanity', 'sexual', 'slurs'], default: ['slurs'] },
      { key: 'mentionLimit', type: 'number', min: 0, max: 50, default: 0 },
      { key: 'exemptChannelIds', type: 'channels', default: [], max: 10 },
    ],
  },
  modCanary: {
    group: 'safety',
    icon: 'Siren',
    needs: [
      { perm: 'ViewAuditLog', why: 'perm.why.auditLog' },
      { perm: 'ManageRoles', why: 'perm.why.stripRoles' },
    ],
    fields: [
      { key: 'maxActions', type: 'number', min: 3, max: 30, default: 5 },
      { key: 'windowMinutes', type: 'number', min: 1, max: 15, default: 3 },
      { key: 'action', type: 'select', options: ['alert', 'strip'], default: 'alert' },
    ],
  },
  // ---------- Moderação ----------
  modLog: {
    group: 'moderation',
    icon: 'ScrollText',
    needs: [{ perm: 'SendMessages', why: 'perm.why.modLog' }],
    fields: [
      { key: 'channelId', type: 'channel', default: '' },
      { key: 'events', type: 'multi', options: ['delete', 'edit', 'join', 'leave', 'nick', 'roles'], default: ['delete', 'edit', 'join', 'leave'] },
    ],
  },
  autoSlowmode: {
    group: 'moderation',
    icon: 'Gauge',
    needs: [{ perm: 'ManageChannels', why: 'perm.why.slowmode' }],
    fields: [
      { key: 'channelIds', type: 'channels', default: [], max: 15 },
      { key: 'perMinute', type: 'number', min: 10, max: 200, default: 40 },
      { key: 'seconds', type: 'number', min: 2, max: 60, default: 5 },
    ],
  },
  roleContrast: {
    group: 'moderation',
    icon: 'Contrast',
    needs: [],
    fields: [{ key: 'minRatio', type: 'select', options: ['3', '4.5'], default: '3' }],
  },
  channelCleanup: {
    group: 'moderation',
    icon: 'Eraser',
    needs: [
      { perm: 'ManageMessages', why: 'perm.why.cleanup' },
      { perm: 'ReadMessageHistory', why: 'perm.why.history' },
    ],
    fields: [
      { key: 'channelIds', type: 'channels', default: [], max: 5 },
      { key: 'hours', type: 'number', min: 1, max: 168, default: 24 },
      { key: 'keepPinned', type: 'toggle', default: true },
    ],
  },
  // ---------- Utilidade ----------
  starboard: {
    group: 'utility',
    icon: 'Star',
    needs: [{ perm: 'EmbedLinks', why: 'perm.why.starboard' }],
    fields: [
      { key: 'channelId', type: 'channel', default: '' },
      { key: 'threshold', type: 'number', min: 2, max: 50, default: 5 },
      { key: 'emoji', type: 'text', maxLength: 32, default: '⭐' },
    ],
  },
  autoThread: {
    group: 'utility',
    icon: 'MessagesSquare',
    needs: [{ perm: 'CreatePublicThreads', why: 'perm.why.threads' }],
    fields: [{ key: 'channelIds', type: 'channels', default: [], max: 10 }],
  },
  autoReactions: {
    group: 'utility',
    icon: 'ThumbsUp',
    needs: [{ perm: 'AddReactions', why: 'perm.why.reactions' }],
    fields: [
      { key: 'channelIds', type: 'channels', default: [], max: 10 },
      { key: 'emojis', type: 'text', maxLength: 120, default: '👍 👎' },
    ],
  },
  autoPublish: {
    group: 'utility',
    icon: 'Megaphone',
    needs: [{ perm: 'ManageMessages', why: 'perm.why.publish' }],
    fields: [{ key: 'channelIds', type: 'channels', default: [], max: 10 }],
  },
  stickyMessage: {
    group: 'utility',
    icon: 'Pin',
    needs: [{ perm: 'ManageMessages', why: 'perm.why.sticky' }],
    fields: [
      { key: 'channelId', type: 'channel', default: '' },
      { key: 'text', type: 'text', maxLength: 1500, default: '' },
      { key: 'every', type: 'number', min: 3, max: 50, default: 8 },
    ],
  },
  linkFixer: {
    group: 'utility',
    icon: 'Link2',
    needs: [{ perm: 'ManageMessages', why: 'perm.why.suppressEmbeds' }],
    fields: [{ key: 'sites', type: 'multi', options: ['x', 'instagram', 'tiktok', 'reddit', 'bluesky'], default: ['x', 'instagram', 'tiktok'] }],
  },
  longPaste: {
    group: 'utility',
    icon: 'FileText',
    needs: [
      { perm: 'ManageMessages', why: 'perm.why.cleanup' },
      { perm: 'AttachFiles', why: 'perm.why.attach' },
    ],
    fields: [
      { key: 'maxLines', type: 'number', min: 15, max: 200, default: 40 },
      { key: 'exemptChannelIds', type: 'channels', default: [], max: 10 },
    ],
  },
  discordStatus: {
    group: 'utility',
    icon: 'Activity',
    needs: [{ perm: 'SendMessages', why: 'perm.why.statusPost' }],
    fields: [{ key: 'channelId', type: 'channel', default: '' }],
  },
  voiceRole: {
    group: 'utility',
    icon: 'Headphones',
    needs: [{ perm: 'ManageRoles', why: 'perm.why.voiceRole' }],
    fields: [
      { key: 'roleId', type: 'role', default: '' },
      { key: 'excludeChannelIds', type: 'channels', kind: 'voice', default: [], max: 10 },
    ],
  },
};
