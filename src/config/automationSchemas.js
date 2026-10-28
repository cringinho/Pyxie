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
};
