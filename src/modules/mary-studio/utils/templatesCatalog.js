/**
 * Catálogo Canônico de Modelos Prontos para a Lojinha de Robux da Mary
 * Cada template permite ser carregado com 1 clique no Construtor Visual.
 */

const TEMPLATES = [
  {
    id: 'vitrine_principal',
    name: '🎀 Vitrine Principal (Com 2 Botões de Imagem)',
    description: 'Mensagem oficial de boas-vindas com botões de Como Criar Gamepass, Tabela de Preços e Compra.',
    category: 'vitrine',
    data: {
      content: '✨ Olá! Seja muito bem-vindo(a) à nossa lojinha oficial de Robux!',
      embed: {
        title: '🎀・Lojinha de Robux da Mary',
        description: [
          'Adquira seus Robux com entrega rápida, segurança total e o melhor atendimento!',
          '',
          '📦 **Status da Loja:** {status_loja}',
          '💎 **Estoque Disponível:** `{estoque}`',
          '💰 **Cotação Atual:** `{preco_1k}`',
          '',
          '📌 **Como funciona?**',
          '> Você cria uma Gamepass no valor exato que nossa calculadora indicar e nós compramos!',
          '> O Roblox entrega os Robux na sua conta no prazo padrão de 5 dias úteis.',
          '',
          '👇 **Toque nos botões abaixo para ver os guias ou fazer seu pedido:**',
        ].join('\n'),
        color: '#ec4899',
        imageUrl: '',
        thumbnailUrl: '',
        footerText: '🎀 Mary Store • Pagamento via PIX • Entrega Garantida',
        footerIconUrl: '',
        showTimestamp: true,
        fields: [
          {
            name: '⚡ Entrega Instantânea',
            value: 'Após a confirmação do PIX, compramos sua gamepass em poucos minutos.',
            inline: true,
          },
          {
            name: '🛡️ 100% Seguro',
            value: 'Método oficial sem risco para a sua conta do Roblox.',
            inline: true,
          },
        ],
      },
      buttons: [
        {
          id: 'btn_como_criar',
          label: 'Como Criar Gamepass',
          emoji: '📘',
          style: 'Primary', // Blurple
          actionType: 'image_response',
          responseEphemeral: true,
          responseText: '📸 **Passo a passo simples para criar sua Gamepass:**\n1. Acesse https://create.roblox.com/dashboard/creations\n2. Vá no seu jogo público padrão ➔ Passes ➔ Criar um Passe\n3. Defina o valor indicado pela nossa calculadora com os 30% inclusos e marque "À Venda"!',
          responseImageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80',
          subButtons: [
            {
              id: 'btn_sub_calc',
              label: 'Calcular Meus 30%',
              emoji: '🧮',
              style: 'Success',
              actionType: 'calculator',
            },
            {
              id: 'btn_sub_buy',
              label: 'Quero Comprar',
              emoji: '🛒',
              style: 'Primary',
              actionType: 'ticket',
            },
          ],
        },
        {
          id: 'btn_tabela_precos',
          label: 'Tabela de Preços',
          emoji: '💰',
          style: 'Secondary', // Grey
          actionType: 'image_response',
          responseEphemeral: true,
          responseText: '💎 **Confira nossos pacotes com descontos especiais hoje:**',
          responseImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
          subButtons: [
            {
              id: 'btn_sub_buy_2',
              label: 'Abrir Pedido',
              emoji: '🛒',
              style: 'Success',
              actionType: 'ticket',
            },
          ],
        },
        {
          id: 'btn_calc_roblox',
          label: 'Calculadora 30%',
          emoji: '🧮',
          style: 'Success', // Green
          actionType: 'calculator',
        },
        {
          id: 'btn_comprar_ticket',
          label: 'Comprar Robux',
          emoji: '🛒',
          style: 'Danger', // Red/Pink
          actionType: 'ticket',
        },
      ],
    },
  },
  {
    id: 'anuncio_estoque',
    name: '💎 Anúncio de Reposição de Estoque',
    description: 'Aviso chamativo para avisar os membros quando novos lotes de Robux chegarem.',
    category: 'anuncios',
    data: {
      content: '🚨 @everyone・**ESTOQUE DE ROBUX REABASTECIDO!**',
      embed: {
        title: '✨ REABASTECIMENTO CONCLUÍDO!',
        description: [
          'Acabamos de repor uma grande remessa de Robux prontos para entrega imediata!',
          '',
          '📦 **Estoque Fresquinho:** `{estoque}`',
          '💵 **Preço Promocional:** `{preco_1k}`',
          '',
          '⏳ *Os estoques costumam esgotar rápido, garanta os seus agora mesmo!*',
          '',
          '👉 Clique no botão abaixo para abrir seu carrinho de compras:',
        ].join('\n'),
        color: '#38bdf8',
        footerText: '🎀 Mary Store • Aproveite enquanto durar o estoque!',
        showTimestamp: true,
        fields: [],
      },
      buttons: [
        {
          id: 'btn_estoque_comprar',
          label: 'Comprar Agora',
          emoji: '🛒',
          style: 'Success',
          actionType: 'ticket',
        },
        {
          id: 'btn_estoque_calc',
          label: 'Calcular Valor',
          emoji: '🧮',
          style: 'Secondary',
          actionType: 'calculator',
        },
      ],
    },
  },
  {
    id: 'guia_gamepass_grupo',
    name: '📖 Guia: Entrega via Gamepass vs. Grupo',
    description: 'Explica de forma clara e visual o funcionamento da taxa de 30% e os 5 dias de espera do Roblox.',
    category: 'guias',
    data: {
      content: '',
      embed: {
        title: '📖・Guia Completo: Como Você Recebe os Robux',
        description: [
          'Para sua total transparência e tranquilidade, veja como funciona o processo oficial:',
          '',
          '🔸 **1. O que é a Taxa de 30% do Roblox?**',
          '> Quando alguém compra uma Gamepass sua, o próprio Roblox retém 30% do valor.',
          '> *Exemplo:* Para você receber **1.000 Robux limpos**, sua Gamepass deve custar **1.429 Robux**. Nós cobrimos e pagamos os 1.429!',
          '',
          '🔸 **2. Quando os Robux caem na conta?**',
          '> Assim que compramos sua gamepass, o Roblox coloca o saldo como **Pendente (Pending Robux)**.',
          '> O prazo do Roblox para liberar o saldo é fixo de **5 dias corridos**.',
          '> Você pode acompanhar em tempo real em: `roblox.com/transactions`.',
        ].join('\n'),
        color: '#a855f7',
        footerText: '🎀 Mary Store • Dúvidas? Abra um ticket!',
        showTimestamp: true,
        fields: [],
      },
      buttons: [
        {
          id: 'btn_guia_calc',
          label: 'Testar Calculadora 30%',
          emoji: '🧮',
          style: 'Primary',
          actionType: 'calculator',
        },
        {
          id: 'btn_guia_duvidas',
          label: 'Tirar Dúvidas',
          emoji: '💬',
          style: 'Secondary',
          actionType: 'ticket',
        },
      ],
    },
  },
  {
    id: 'termos_compra',
    name: '🛡️ Termos de Compra & Segurança',
    description: 'Termos de compra profissionais para proteger a lojinha contra disputas e fraudes.',
    category: 'termos',
    data: {
      content: '',
      embed: {
        title: '🛡️・Termos & Condições de Compra',
        description: [
          'Ao realizar compras em nossa loja, você concorda com os seguintes termos:',
          '',
          '1. **Comprovante de Pagamento:**',
          '> Aceitamos apenas PIX. O envio dos Robux inicia imediatamente após a compensação.',
          '',
          '2. **Gamepass Configurada Corretamente:**',
          '> O comprador é responsável por criar a gamepass no valor informado e desativar preços regionais.',
          '',
          '3. **Prazo de Pendência do Roblox:**',
          '> Não temos controle sobre o tempo de pendência do Roblox (geralmente 5 dias).',
          '',
          '4. **Garantia de Entrega:**',
          '> Sempre enviamos o print comprovando a compra com seu nick na tela.',
        ].join('\n'),
        color: '#10b981',
        footerText: '🎀 Mary Store • Segurança e Honestidade',
        showTimestamp: true,
        fields: [],
      },
      buttons: [
        {
          id: 'btn_concordo_comprar',
          label: 'Concordo & Quero Comprar',
          emoji: '✅',
          style: 'Success',
          actionType: 'ticket',
        },
      ],
    },
  },
  {
    id: 'painel_ticket',
    name: '🎫 Painel de Atendimento & Compras',
    description: 'Card dedicado para os clientes abrirem salas privadas de compras e suporte.',
    category: 'tickets',
    data: {
      content: '',
      embed: {
        title: '🎫・Central de Atendimento & Pedidos',
        description: [
          'Pronto(a) para realizar seu pedido de Robux?',
          '',
          'Clique no botão abaixo para abrir sua sala privada de compra!',
          'Nossa equipe responderá rapidamente para passar os detalhes do PIX e tirar dúvidas.',
          '',
          '🕒 **Horário de Atendimento:** 09:00 às 23:00',
        ].join('\n'),
        color: '#f59e0b',
        footerText: '🎀 Mary Store • Atendimento Personalizado',
        showTimestamp: true,
        fields: [],
      },
      buttons: [
        {
          id: 'btn_open_ticket',
          label: 'Abrir Ticket de Compra',
          emoji: '🎫',
          style: 'Primary',
          actionType: 'ticket',
        },
      ],
    },
  },
];

function getAllTemplates() {
  return TEMPLATES;
}

function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

module.exports = {
  TEMPLATES,
  getAllTemplates,
  getTemplateById,
};
