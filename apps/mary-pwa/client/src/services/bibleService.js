import { CURATED_VERSES } from './curatedVerses.js';

function getTodayKey() {
  const d = new Date();
  return `mary_daily_verse_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getRandomCuratedVerse() {
  const index = Math.floor(Math.random() * CURATED_VERSES.length);
  return { ...CURATED_VERSES[index], source: 'curated' };
}

/**
 * Busca versículo da API externa (Almeida) com timeout seguro de 3.5 segundos
 */
export async function fetchRemoteVerse() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch('https://bible-api.com/?random=verse&translation=almeida', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API externa indisponível');
    const data = await res.json();

    if (!data.text || !data.reference) {
      throw new Error('Formato inválido retornado pela API');
    }

    const firstVerseObj = data.verses?.[0] || {};

    return {
      reference: data.reference,
      bookName: firstVerseObj.book_name || data.reference.split(' ')[0] || 'Bíblia Sagrada',
      chapter: firstVerseObj.chapter || 1,
      verse: firstVerseObj.verse || 1,
      text: data.text.trim().replace(/\s+/g, ' '),
      source: 'api'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return getRandomCuratedVerse();
  }
}

/**
 * Retorna o Versículo do Dia (consistente durante todo o dia para a Mary)
 */
export async function getDailyVerse() {
  const key = getTodayKey();
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem(key);
    }
  }

  const verse = await fetchRemoteVerse();
  try {
    localStorage.setItem(key, JSON.stringify(verse));
  } catch (e) {}
  return verse;
}

/**
 * Sorteia uma nova palavra bíblica manualmente sob demanda
 */
export async function getNewWordVerse() {
  const verse = await fetchRemoteVerse();
  try {
    localStorage.setItem(getTodayKey(), JSON.stringify(verse));
  } catch (e) {}
  return verse;
}

/**
 * Salva o versículo nos favoritos da Mary no banco SQLite
 */
export async function saveFavoriteVerse(verse, note = null) {
  const res = await fetch('/api/verses/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      reference: verse.reference,
      text: verse.text,
      bookName: verse.bookName,
      chapter: verse.chapter,
      verse: verse.verse,
      note
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao salvar versículo favorito');
  }
  return data;
}
