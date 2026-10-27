// Radar de notícias e direitos (plano 5.9). Coleta RSS/Atom, o Groq resume (menos Reddit: só título
// e link, sem copiar o texto das pessoas), o resumo vai primeiro para a staff aprovar e a publicação
// sempre leva o link da fonte e o aviso de que não é orientação jurídica nem médica.
// Itens vistos e pendentes em data/newsRadar.json (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SEEN_LIMIT = 1000;
const PER_FEED = 5;

function fileFor() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'newsRadar.json');
}

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(), 'utf8'));
    return { seen: raw.seen || [], pending: raw.pending || {}, lastRunAt: Number(raw.lastRunAt) || 0 };
  } catch (_) {
    return { seen: [], pending: {}, lastRunAt: 0 };
  }
}

function save(state) {
  fs.mkdirSync(path.dirname(fileFor()), { recursive: true });
  fs.writeFileSync(`${fileFor()}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${fileFor()}.tmp`, fileFor());
}

const decode = (s) =>
  String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    // Entidades primeiro: muitos feeds mandam o HTML da descrição escapado (&lt;p&gt;).
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Parser simples de RSS (<item>) e Atom (<entry>), suficiente para portais de notícia e Reddit.
function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  for (const b of blocks) {
    const tag = (name) => (b.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`)) || [])[1];
    const atomLink = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1];
    const link = decode(tag('link')) || atomLink || '';
    const title = decode(tag('title'));
    if (!title || !/^https?:\/\//.test(link)) continue;
    items.push({ title: title.slice(0, 250), link, description: decode(tag('description') || tag('summary') || tag('content')).slice(0, 1200) });
  }
  return items;
}

const isReddit = (url) => /(^|\.)reddit\.com/.test((() => { try { return new URL(url).hostname; } catch (_) { return ''; } })());

async function summarize(item, { chat } = {}) {
  if (isReddit(item.link) || !item.description) return null;
  const groq = chat || require('./groqClient').chatCompletionNow;
  const res = await groq(
    {
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content:
            'Resuma em português do Brasil, em até 3 frases curtas e neutras, a notícia abaixo para uma comunidade de pessoas neurodivergentes. ' +
            'Não invente fatos, não dê conselho jurídico nem médico, não opine. Responda só o resumo.',
        },
        { role: 'user', content: `${item.title}\n\n${item.description}` },
      ],
    },
    { label: 'Radar' }
  );
  const text = res.ok ? String(res.data?.choices?.[0]?.message?.content || '').trim() : '';
  return text && text.length <= 900 && !/https?:\/\//.test(text) ? text : null;
}

/** Coleta itens novos de todos os feeds e devolve os pendentes criados (para a staff aprovar). */
async function collect(feeds, { fetchImpl = fetch, chat = null, now = Date.now() } = {}) {
  const state = load();
  const seen = new Set(state.seen);
  const created = [];
  for (const feed of feeds) {
    let xml = '';
    try {
      const res = await fetchImpl(feed, { headers: { 'User-Agent': 'PyxieRadar/1.0 (+https://pyxie.com.br)' }, signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      xml = await res.text();
    } catch (_) {
      continue;
    }
    for (const item of parseFeed(xml).slice(0, PER_FEED)) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      const id = crypto.createHash('sha1').update(item.link).digest('hex').slice(0, 12);
      const entry = { id, title: item.title, link: item.link, summary: await summarize(item, { chat }), reddit: isReddit(item.link), createdAt: now };
      state.pending[id] = entry;
      created.push(entry);
    }
  }
  state.seen = [...seen].slice(-SEEN_LIMIT);
  state.lastRunAt = now;
  save(state);
  return created;
}

function takePending(id) {
  const state = load();
  const entry = state.pending[id] || null;
  if (entry) {
    delete state.pending[id];
    save(state);
  }
  return entry;
}

function lastRunAt() {
  return load().lastRunAt;
}

module.exports = { parseFeed, summarize, collect, takePending, lastRunAt, isReddit };
