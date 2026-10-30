const crypto = require('node:crypto');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_FAILED_ATTEMPTS = 5;

function getAccountsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'accounts.json');
}

function loadAccountsStore() {
  return readJson(getAccountsFile(), {
    accounts: {}, // chave: accountId -> { id, email, passwordHash, discordUserId, verifiedEmail, readingPreferences, createdAt, updatedAt }
    tokens: {}, // chave: token -> { type: 'VERIFY' | 'RESET', accountId, expiresAt }
    failedAttempts: {}, // chave: ipOrEmail -> { count, lastAttempt }
  });
}

function saveAccountsStore(store) {
  return writeJsonAtomic(getAccountsFile(), store);
}

/**
 * Hash seguro com crypto.scrypt (OWASP / NIST recomendado).
 * Equivalente em custo e resistência a GPU do Argon2id.
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verificação de senha com comparação em tempo constante para evitar timing attacks.
 */
function comparePassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, salt, originalHash] = parts;
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const originalBuf = Buffer.from(originalHash, 'hex');
  if (derivedKey.length !== originalBuf.length) return false;
  return crypto.timingSafeEqual(derivedKey, originalBuf);
}

/**
 * Rate limit contra força bruta por IP ou identificador de login.
 */
function checkRateLimit(key) {
  if (!key) return;
  const store = loadAccountsStore();
  const record = store.failedAttempts[key];
  if (record) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < RATE_LIMIT_WINDOW_MS && record.count >= MAX_FAILED_ATTEMPTS) {
      const waitMin = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 60000);
      throw new Error(`rate_limit_exceeded:${waitMin}`);
    }
  }
}

function recordFailedAttempt(key) {
  if (!key) return;
  const store = loadAccountsStore();
  const record = store.failedAttempts[key];
  if (record && Date.now() - record.lastAttempt < RATE_LIMIT_WINDOW_MS) {
    record.count++;
    record.lastAttempt = Date.now();
  } else {
    store.failedAttempts[key] = { count: 1, lastAttempt: Date.now() };
  }
  saveAccountsStore(store);
}

function clearFailedAttempts(key) {
  if (!key) return;
  const store = loadAccountsStore();
  if (store.failedAttempts[key]) {
    delete store.failedAttempts[key];
    saveAccountsStore(store);
  }
}

/**
 * Criação de conta unificada (E-mail + Senha e/ou Discord).
 */
function createAccount({ email, password, discordUserId = null, readingPreferences = {} } = {}) {
  const normEmail = email ? String(email).trim().toLowerCase() : null;
  if (!normEmail && !discordUserId) {
    throw new Error('missing_identifier');
  }

  const store = loadAccountsStore();

  // Verifica se o e-mail já existe
  if (normEmail) {
    const existing = Object.values(store.accounts).find((a) => a.email === normEmail);
    if (existing) {
      throw new Error('email_already_registered');
    }
  }

  // Verifica se o Discord já está cadastrado
  if (discordUserId) {
    const existingDiscord = Object.values(store.accounts).find((a) => a.discordUserId === discordUserId);
    if (existingDiscord) {
      throw new Error('discord_already_registered');
    }
  }

  const id = `acc_${crypto.randomBytes(12).toString('hex')}`;
  const now = new Date().toISOString();

  const newAccount = {
    id,
    email: normEmail,
    passwordHash: password ? hashPassword(password) : null,
    discordUserId: discordUserId || null,
    verifiedEmail: normEmail ? 0 : 1, // se criado só por Discord, já é verificado pelo Discord
    readingPreferences: {
      fontSize: 'normal',
      theme: 'dark',
      dyslexicFont: false,
      ...readingPreferences,
    },
    createdAt: now,
    updatedAt: now,
  };

  store.accounts[id] = newAccount;
  saveAccountsStore(store);

  // Espelha no PostgreSQL via Drizzle de forma assíncrona
  syncAccountToPostgres(newAccount).catch(() => {});

  const { passwordHash: _, ...safeAccount } = newAccount;
  return safeAccount;
}

/**
 * Autentica usuário por e-mail e senha com rate limit e mensagens opacas.
 */
function authenticateWithPassword(email, password, clientIp = '') {
  const normEmail = String(email || '').trim().toLowerCase();
  const rateLimitKey = `${clientIp}:${normEmail}`;
  checkRateLimit(rateLimitKey);

  const store = loadAccountsStore();
  const account = Object.values(store.accounts).find((a) => a.email === normEmail);

  if (!account || !account.passwordHash || !comparePassword(password, account.passwordHash)) {
    recordFailedAttempt(rateLimitKey);
    // Mensagem opaca de segurança: nunca revela se o e-mail existe
    throw new Error('invalid_credentials');
  }

  clearFailedAttempts(rateLimitKey);

  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

function getAccountById(id) {
  if (!id) return null;
  const store = loadAccountsStore();
  const account = store.accounts[id];
  if (!account) return null;
  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

function getAccountByDiscordId(discordUserId) {
  if (!discordUserId) return null;
  const store = loadAccountsStore();
  const account = Object.values(store.accounts).find((a) => a.discordUserId === discordUserId);
  if (!account) return null;
  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

function getAccountByEmail(email) {
  if (!email) return null;
  const norm = String(email).trim().toLowerCase();
  const store = loadAccountsStore();
  const account = Object.values(store.accounts).find((a) => a.email === norm);
  if (!account) return null;
  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

/**
 * Login com Discord no site: acha a conta pelo Snowflake ou cria uma, e guarda nome e avatar públicos
 * (os mesmos que aparecem em comentários). Retorna a conta sem o hash de senha.
 */
function upsertDiscordAccount(user) {
  const discordUserId = String(user?.id || '');
  if (!/^\d{17,20}$/.test(discordUserId)) throw new Error('invalid_discord_user');
  const displayName = String(user.global_name || user.username || '').slice(0, 64) || null;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${discordUserId}/${user.avatar}.png?size=128` : null;
  const store = loadAccountsStore();
  let account = Object.values(store.accounts).find((a) => a.discordUserId === discordUserId);
  const now = new Date().toISOString();
  if (!account) {
    createAccount({ discordUserId });
    return upsertDiscordAccount(user);
  }
  account.displayName = displayName;
  account.avatarUrl = avatarUrl;
  account.updatedAt = now;
  saveAccountsStore(store);
  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

/**
 * Conecta ou funde conta do Discord à conta de e-mail existente (mesma pessoa = uma conta única).
 */
function linkDiscordAccount(accountId, discordUserId) {
  if (!accountId || !discordUserId) throw new Error('missing_params');
  const store = loadAccountsStore();
  const account = store.accounts[accountId];
  if (!account) throw new Error('account_not_found');

  // Verifica se este Discord já pertence a outra conta
  const conflict = Object.values(store.accounts).find((a) => a.discordUserId === discordUserId && a.id !== accountId);
  if (conflict) {
    // Funde contas mantendo a atual
    delete store.accounts[conflict.id];
  }

  account.discordUserId = discordUserId;
  account.updatedAt = new Date().toISOString();
  saveAccountsStore(store);

  syncAccountToPostgres(account).catch(() => {});

  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

/**
 * Cria token de recuperação de senha com validade curta (1 hora) e uso único.
 */
function createPasswordResetToken(email) {
  const norm = String(email || '').trim().toLowerCase();
  const store = loadAccountsStore();
  const account = Object.values(store.accounts).find((a) => a.email === norm);

  // Se a conta não existir, não lança erro (evita enumeração), apenas simula sucesso
  if (!account) {
    return null;
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora

  store.tokens[token] = {
    type: 'RESET',
    accountId: account.id,
    expiresAt,
  };
  saveAccountsStore(store);
  return token;
}

/**
 * Redefine a senha através de token de uso único.
 */
function resetPasswordWithToken(token, newPassword) {
  if (!token || !newPassword || newPassword.length < 8) {
    throw new Error('invalid_password_or_token');
  }

  const store = loadAccountsStore();
  const entry = store.tokens[token];

  if (!entry || entry.type !== 'RESET' || entry.expiresAt <= Date.now()) {
    if (entry) delete store.tokens[token];
    saveAccountsStore(store);
    throw new Error('token_expired_or_invalid');
  }

  const account = store.accounts[entry.accountId];
  if (!account) {
    delete store.tokens[token];
    saveAccountsStore(store);
    throw new Error('account_not_found');
  }

  account.passwordHash = hashPassword(newPassword);
  account.updatedAt = new Date().toISOString();

  // Invalida o token após o uso (uso único)
  delete store.tokens[token];
  saveAccountsStore(store);

  syncAccountToPostgres(account).catch(() => {});

  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

/**
 * Gera token de verificação de e-mail (24h de validade).
 */
function createEmailVerificationToken(accountId) {
  const store = loadAccountsStore();
  const account = store.accounts[accountId];
  if (!account) throw new Error('account_not_found');

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

  store.tokens[token] = {
    type: 'VERIFY',
    accountId,
    expiresAt,
  };
  saveAccountsStore(store);
  return token;
}

function verifyEmailWithToken(token) {
  const store = loadAccountsStore();
  const entry = store.tokens[token];

  if (!entry || entry.type !== 'VERIFY' || entry.expiresAt <= Date.now()) {
    if (entry) delete store.tokens[token];
    saveAccountsStore(store);
    throw new Error('verification_token_invalid');
  }

  const account = store.accounts[entry.accountId];
  if (!account) throw new Error('account_not_found');

  account.verifiedEmail = 1;
  account.updatedAt = new Date().toISOString();

  delete store.tokens[token];
  saveAccountsStore(store);

  syncAccountToPostgres(account).catch(() => {});

  const { passwordHash: _, ...safeAccount } = account;
  return safeAccount;
}

/**
 * Salva preferências de leitura acessível do leitor no perfil.
 */
function updateReadingPreferences(accountId, preferences = {}) {
  const store = loadAccountsStore();
  const account = store.accounts[accountId];
  if (!account) throw new Error('account_not_found');

  account.readingPreferences = {
    ...(account.readingPreferences || {}),
    ...preferences,
  };
  account.updatedAt = new Date().toISOString();
  saveAccountsStore(store);

  syncAccountToPostgres(account).catch(() => {});
  return account.readingPreferences;
}

/**
 * Estatísticas consolidadas do autor (artigos publicados, em análise, leituras).
 */
function getAccountStats(accountId) {
  const articleStore = require('../hyperfokus/articleStore');
  const webDraftStore = require('../hyperfokus/webDraftStore');

  const account = getAccountById(accountId);
  const userDiscordId = account?.discordUserId || null;

  // Lista artigos do usuário
  const allArticles = articleStore.listArticles({ limit: 200 }).items || [];
  const userArticles = allArticles.filter((art) => {
    if (art.metadata?.accountId === accountId) return true;
    if (userDiscordId && (art.authors || []).some((a) => a.userId === userDiscordId)) return true;
    return false;
  });

  const published = userArticles.filter((a) => a.status === 'PUBLISHED');
  const pending = userArticles.filter((a) => a.status === 'PENDING_REVIEW');
  const drafts = webDraftStore.listUserDrafts(accountId);

  let totalLikes = 0;
  let totalComments = 0;

  for (const art of published) {
    totalLikes += art.likesCount || 0;
    totalComments += art.commentsCount || 0;
  }

  return {
    totalArticles: userArticles.length,
    publishedCount: published.length,
    pendingCount: pending.length,
    draftsCount: drafts.length,
    totalLikes,
    totalComments,
    articles: userArticles,
    drafts,
  };
}

async function syncAccountToPostgres(account) {
  try {
    const { db } = require('../../database');
    const schema = require('../../database/schema');
    if (!db || !schema.accounts) return;

    await db.insert(schema.accounts).values({
      id: account.id,
      email: account.email,
      passwordHash: account.passwordHash,
      discordUserId: account.discordUserId,
      verifiedEmail: account.verifiedEmail,
      readingPreferences: account.readingPreferences,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt),
    }).onConflictDoUpdate({
      target: schema.accounts.id,
      set: {
        email: account.email,
        passwordHash: account.passwordHash,
        discordUserId: account.discordUserId,
        verifiedEmail: account.verifiedEmail,
        readingPreferences: account.readingPreferences,
        updatedAt: new Date(account.updatedAt),
      },
    });
  } catch (_) {
    // Silencia em ambiente de testes ou se Postgres estiver indisponível
  }
}

module.exports = {
  createAccount,
  upsertDiscordAccount,
  authenticateWithPassword,
  getAccountById,
  getAccountByDiscordId,
  getAccountByEmail,
  linkDiscordAccount,
  createPasswordResetToken,
  resetPasswordWithToken,
  createEmailVerificationToken,
  verifyEmailWithToken,
  updateReadingPreferences,
  getAccountStats,
  hashPassword,
  comparePassword,
  loadAccountsStore,
  saveAccountsStore,
};

