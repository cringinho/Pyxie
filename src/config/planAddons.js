/**
 * Catálogo de extras vendáveis por servidor (módulos que o plano não inclui).
 *
 * Regra do projeto (AGENTS §5): extra libera MÓDULO, nunca vantagem econômica.
 * Preço em centavos, como em guildPlans.PRICES.
 *
 * Preços pensados para o público brasileiro: R$ 3 é o degrau de entrada (mais barato
 * que qualquer plano) e o anual existe para amortizar a taxa do gateway.
 */
const ADDONS = {
  lojinha: {
    id: 'lojinha',
    // Módulos do bot que este extra libera (referência para o gate e para o catálogo).
    modules: ['mary-studio'],
    // Em quais planos o extra pode ser contratado (inclusive free: é o degrau de entrada).
    availableOn: ['free', 'founder', 'basic', 'premium'],
    priceMonthly: 300, // R$ 3,00
    priceYearly: 3000, // R$ 30,00 (2 meses grátis)
    i18n: {
      'pt-BR': {
        name: 'Estúdio de Loja',
        tagline: 'Sua lojinha pronta, sem montar nada do zero.',
        description:
          'Status da loja, estoque, preço, PIX, tickets de compra, avaliações, calculadora de taxa, conferência de gamepass e recibos — tudo no painel e nos botões da Pyxie.',
      },
      en: {
        name: 'Store Studio',
        tagline: 'Your store ready to go, nothing to build from scratch.',
        description:
          'Store status, stock, price, PIX, purchase tickets, reviews, fee calculator, gamepass check and receipts — all in the panel and in Pyxie buttons.',
      },
    },
  },
};

const CYCLES = ['month', 'year'];

/**
 * Trava de lançamento.
 *
 * O módulo `mary-studio` ainda guarda UM estado global (estoque, PIX, perfil). Enquanto
 * os dados não forem por servidor (fase E1), abrir o extra para outros servidores
 * vazaria os dados da Mary e deixaria qualquer comprador editar a loja dela.
 * Só flipar para `true` quando o E1 estiver concluído e testado.
 */
const READY_FOR_SALE = false;

function isReadyForSale() {
  return READY_FOR_SALE;
}

function listAddons() {
  return Object.values(ADDONS).map((addon) => ({ ...addon }));
}

function getAddon(id) {
  return ADDONS[String(id || '').toLowerCase()] || null;
}

/** Preço em centavos para o ciclo pedido, ou null se o extra não existe. */
function priceOf(id, cycle = 'month') {
  const addon = getAddon(id);
  if (!addon) return null;
  return cycle === 'year' ? addon.priceYearly : addon.priceMonthly;
}

/** Texto localizado (pt/en) do nome do extra. */
function labelOf(id, lang = 'pt') {
  const addon = getAddon(id);
  if (!addon) return String(id);
  return addon.i18n[lang === 'en' ? 'en' : 'pt-BR'].name;
}

module.exports = { ADDONS, CYCLES, listAddons, getAddon, priceOf, labelOf, isReadyForSale };
