const accountStore = require('./accountStore');

module.exports = {
  name: 'accounts',
  description: 'Sistema unificado de contas e identidades da Pyxie (E-mail, Senha e Discord)',
  author: 'Pyxie Team',
  version: '1.0.0',
  store: accountStore,
  init() {
    // Inicialização silenciosa de contas
    return true;
  },
};

