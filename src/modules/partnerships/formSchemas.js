const { TextInputStyle } = require('discord.js');

/**
 * Esquemas dos 9 formulários de triagem (Etapa 1 do Wizard).
 * Todo texto visível ao usuário é um par { pt, en } (paridade bilíngue obrigatória).
 * Limites do Discord: título do modal <= 45, label <= 45, placeholder <= 100, máx. 5 campos.
 */
const S = TextInputStyle.Short;
const P = TextInputStyle.Paragraph;

const CATEGORY_SCHEMAS = {
  youtube: {
    macroCategory: 'creator',
    label: { pt: 'YouTuber', en: 'YouTuber' },
    emoji: '🔴',
    title: { pt: 'Triagem • Canal no YouTube', en: 'Screening • YouTube Channel' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nome / @ do Canal:', en: 'Channel name / @handle:' }, placeholder: { pt: 'Ex: Canal do cringe_arts', en: 'e.g. cringe_arts\'s Channel' } },
      { id: 'access_link', style: S, label: { pt: 'Link do Canal:', en: 'Channel link:' }, placeholder: { pt: 'https://youtube.com/@...', en: 'https://youtube.com/@...' } },
      { id: 'metrics', style: S, label: { pt: 'Inscritos e Frequência de Postagem:', en: 'Subscribers & posting frequency:' }, placeholder: { pt: 'Ex: 15k inscritos, vídeos semanais', en: 'e.g. 15k subs, weekly videos' } },
      { id: 'proposal', style: P, label: { pt: 'Nicho e Proposta de Colaboração:', en: 'Niche & collaboration proposal:' }, placeholder: { pt: 'Assunto abordado e ideias de colaboração mútua...', en: 'Topics covered and mutual collaboration ideas...' } },
    ],
  },
  streamer: {
    macroCategory: 'creator',
    label: { pt: 'Streamer', en: 'Streamer' },
    emoji: '🟣',
    title: { pt: 'Triagem • Criador de Lives', en: 'Screening • Live Streamer' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nick / Nome do Canal:', en: 'Nickname / channel name:' }, placeholder: { pt: 'Ex: pyxie_live', en: 'e.g. pyxie_live' } },
      { id: 'access_link', style: S, label: { pt: 'Link da Stream (Twitch / Kick):', en: 'Stream link (Twitch / Kick):' }, placeholder: { pt: 'https://twitch.tv/...', en: 'https://twitch.tv/...' } },
      { id: 'metrics', style: S, label: { pt: 'Plataforma, Média de Views (CCV):', en: 'Platform & average viewers (CCV):' }, placeholder: { pt: 'Ex: Twitch, média 45 CCV, RPGs', en: 'e.g. Twitch, avg 45 CCV, RPGs' } },
      { id: 'proposal', style: P, label: { pt: 'Proposta de Integração:', en: 'Integration proposal:' }, placeholder: { pt: 'Jogatinas, eventos ou alertas mútuos...', en: 'Game sessions, events or mutual shout-outs...' } },
    ],
  },
  tiktok: {
    macroCategory: 'creator',
    label: { pt: 'TikToker', en: 'TikToker' },
    emoji: '🎵',
    title: { pt: 'Triagem • Criador do TikTok', en: 'Screening • TikTok Creator' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: '@ da Conta / Nome:', en: 'Account @handle / name:' }, placeholder: { pt: 'Ex: @cringe_arts_arts', en: 'e.g. @cringe_arts_arts' } },
      { id: 'access_link', style: S, label: { pt: 'Link do Perfil no TikTok:', en: 'TikTok profile link:' }, placeholder: { pt: 'https://tiktok.com/@...', en: 'https://tiktok.com/@...' } },
      { id: 'metrics', style: S, label: { pt: 'Seguidores & Média de Views:', en: 'Followers & average views:' }, placeholder: { pt: 'Ex: 30k seguidores, ~10k views', en: 'e.g. 30k followers, ~10k views' } },
      { id: 'proposal', style: P, label: { pt: 'Nicho e Formato do Conteúdo:', en: 'Niche & content format:' }, placeholder: { pt: 'Cortes, comédia, animação ou tutoriais...', en: 'Clips, comedy, animation or tutorials...' } },
    ],
  },
  seller: {
    macroCategory: 'service',
    label: { pt: 'Vendedor(a) / Loja', en: 'Seller / Shop' },
    emoji: '🛍️',
    title: { pt: 'Triagem • Comércio & Vendas', en: 'Screening • Commerce & Sales' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nome da Loja / Vendedor:', en: 'Shop / seller name:' }, placeholder: { pt: 'Ex: Bazar Kawaii Store', en: 'e.g. Kawaii Bazaar Store' } },
      { id: 'access_link', style: S, label: { pt: 'Link da Loja (Site, Shopee, Insta):', en: 'Shop link (site, marketplace, Insta):' }, placeholder: { pt: 'https://...', en: 'https://...' } },
      { id: 'products', style: S, label: { pt: 'Produtos Vendidos & Pagamentos:', en: 'Products sold & payment methods:' }, placeholder: { pt: 'Ex: Chaveiros, vestuário, prints. Pix e cartão.', en: 'e.g. Keychains, clothing, prints. Cards and PayPal.' } },
      { id: 'proposal', style: P, label: { pt: 'Reputação & Vantagens para Membros:', en: 'Reputation & member perks:' }, placeholder: { pt: 'Avaliações de clientes e eventual cupom exclusivo...', en: 'Customer reviews and any exclusive coupon...' } },
    ],
  },
  freelancer: {
    macroCategory: 'service',
    label: { pt: 'Freelancer / Artista', en: 'Freelancer / Artist' },
    emoji: '🎨',
    title: { pt: 'Triagem • Serviços & Comissões', en: 'Screening • Services & Commissions' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Assinatura Artística / Nome:', en: 'Artist signature / name:' }, placeholder: { pt: 'Ex: Leonard Garden', en: 'e.g. Leonard Garden' } },
      { id: 'access_link', style: S, label: { pt: 'Link do Portfólio (Carrd, ArtStation):', en: 'Portfolio link (Carrd, ArtStation):' }, placeholder: { pt: 'https://...', en: 'https://...' } },
      { id: 'service_type', style: S, label: { pt: 'Serviço Ofertado & Faixa de Preço:', en: 'Service offered & price range:' }, placeholder: { pt: 'Ex: Ilustrações, emotes, bots. R$ 30 a R$ 200.', en: 'e.g. Illustrations, emotes, bots. $10 to $60.' } },
      { id: 'proposal', style: P, label: { pt: 'Prazos e Métodos de Cobrança:', en: 'Deadlines & payment methods:' }, placeholder: { pt: 'Como funciona sua fila e métodos de pagamento aceitos...', en: 'How your queue works and accepted payment methods...' } },
    ],
  },
  discord_community: {
    macroCategory: 'community',
    label: { pt: 'Comunidade Discord', en: 'Discord Community' },
    emoji: '🏰',
    title: { pt: 'Triagem • Servidor do Discord', en: 'Screening • Discord Server' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nome do Servidor:', en: 'Server name:' }, placeholder: { pt: 'Ex: Taverna dos Magos', en: 'e.g. Wizards\' Tavern' } },
      { id: 'access_link', style: S, label: { pt: 'Link de Convite Permanente:', en: 'Permanent invite link:' }, placeholder: { pt: 'https://discord.gg/...', en: 'https://discord.gg/...' } },
      { id: 'metrics', style: S, label: { pt: 'Total de Membros & Média Ativos:', en: 'Total members & daily actives:' }, placeholder: { pt: 'Ex: 1.500 membros, 400 ativos/dia', en: 'e.g. 1,500 members, 400 active/day' } },
      { id: 'proposal', style: P, label: { pt: 'Temática & Onde Divulgará a Cringelândia:', en: 'Theme & where you will promote us:' }, placeholder: { pt: 'Tema da comunidade e canal em que nosso post ficará...', en: 'Community theme and the channel our post will go in...' } },
    ],
  },
  external_community: {
    macroCategory: 'community',
    label: { pt: 'Comunidade Externa', en: 'External Community' },
    emoji: '🌐',
    title: { pt: 'Triagem • Fórum / Plataforma Externa', en: 'Screening • Forum / External Platform' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nome da Comunidade & Plataforma:', en: 'Community name & platform:' }, placeholder: { pt: 'Ex: r/jogos (Reddit) ou Fórum X', en: 'e.g. r/gaming (Reddit) or Forum X' } },
      { id: 'access_link', style: S, label: { pt: 'Link Direto da Plataforma:', en: 'Direct platform link:' }, placeholder: { pt: 'https://...', en: 'https://...' } },
      { id: 'metrics', style: S, label: { pt: 'Volume de Membros / Leitores:', en: 'Members / readers volume:' }, placeholder: { pt: 'Ex: 10k membros registrados', en: 'e.g. 10k registered members' } },
      { id: 'proposal', style: P, label: { pt: 'Público-Alvo e Formato da Troca:', en: 'Target audience & exchange format:' }, placeholder: { pt: 'Como a troca de divulgação será anunciada...', en: 'How the promotion swap will be announced...' } },
    ],
  },
  ong: {
    macroCategory: 'ong',
    label: { pt: 'ONG / Projeto Social', en: 'NGO / Social Project' },
    emoji: '🌱',
    title: { pt: 'Triagem • Organização / Causa Social', en: 'Screening • Organization / Social Cause' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Nome da Instituição / Coletivo:', en: 'Institution / collective name:' }, placeholder: { pt: 'Ex: Resgate Animal ZL', en: 'e.g. Animal Rescue Team' } },
      { id: 'access_link', style: S, label: { pt: 'Site Oficial ou Rede Social:', en: 'Official site or social network:' }, placeholder: { pt: 'https://instagram.com/...', en: 'https://instagram.com/...' } },
      { id: 'cause', style: P, label: { pt: 'Causa Defendida & Transparência:', en: 'Cause defended & transparency:' }, placeholder: { pt: 'Finalidade social e onde ver a prestação de contas...', en: 'Social purpose and where to see the accountability...' } },
      { id: 'proposal', style: P, label: { pt: 'Objetivo da Divulgação:', en: 'Promotion goal:' }, placeholder: { pt: 'Adoção, doações, voluntariado ou conscientização...', en: 'Adoption, donations, volunteering or awareness...' } },
    ],
  },
  business: {
    macroCategory: 'service',
    label: { pt: 'Empresa Pequena / Startup', en: 'Small Business / Startup' },
    emoji: '💼',
    title: { pt: 'Triagem • Parceria Institucional', en: 'Screening • Institutional Partnership' },
    fields: [
      { id: 'rep_name', style: S, label: { pt: 'Razão Social / Nome Fantasia:', en: 'Company / trade name:' }, placeholder: { pt: 'Ex: Studio Pixel Indie Ltda.', en: 'e.g. Pixel Indie Studio LLC' } },
      { id: 'access_link', style: S, label: { pt: 'Site Oficial / Landing Page:', en: 'Official site / landing page:' }, placeholder: { pt: 'https://...', en: 'https://...' } },
      { id: 'service_type', style: S, label: { pt: 'Ramo de Atuação & Serviços:', en: 'Industry & services:' }, placeholder: { pt: 'Ex: Estúdio de dublagem ou criação de jogos', en: 'e.g. Voice-over studio or game development' } },
      { id: 'proposal', style: P, label: { pt: 'Proposta Institucional & Benefícios:', en: 'Institutional proposal & benefits:' }, placeholder: { pt: 'O que a empresa traz de benefício aos membros...', en: 'What the company brings to our members...' } },
    ],
  },
};

/** Resolve um par { pt, en } para o idioma ativo ('pt' | 'en'). */
function pick(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || value.pt || '';
  return value;
}

module.exports = { CATEGORY_SCHEMAS, pick };

