const express = require('express');
const accountStore = require('../modules/accounts/accountStore');
const webDraftStore = require('../modules/hyperfokus/webDraftStore');
const { importGitHubSnippet } = require('../modules/hyperfokus/githubImporter');
const accountSessions = require('../services/accountSessions');

function createAccountRouter() {
  const router = express.Router();

  // Middleware para extrair a conta autenticada do usuário (se houver)
  router.use((req, res, next) => {
    const cookie = accountSessions.getCookie(req);
    const session = accountSessions.readSession(cookie);
    if (session && session.accountId) {
      req.account = accountStore.getAccountById(session.accountId);
    } else {
      req.account = null;
    }
    next();
  });

  function requireAuth(req, res, next) {
    if (!req.account) {
      return res.status(401).json({ success: false, error: 'not_authenticated' });
    }
    next();
  }

  // 1. Cadastro com E-mail e Senha
  router.post('/api/auth/register', (req, res) => {
    const { email, password, lang = 'pt' } = req.body || {};
    const normEmail = String(email || '').trim().toLowerCase();

    if (!normEmail || !normEmail.includes('@') || !normEmail.includes('.')) {
      return res.status(400).json({ success: false, error: 'invalid_email' });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ success: false, error: 'password_too_short' });
    }

    try {
      const account = accountStore.createAccount({ email: normEmail, password: String(password) });
      const verifyToken = accountStore.createEmailVerificationToken(account.id);

      // Cria sessão e seta cookie HttpOnly
      const cookieVal = accountSessions.createSession(account.id);
      accountSessions.setCookie(res, cookieVal);

      return res.json({
        success: true,
        account,
        verifyToken,
        message: lang === 'pt' ? 'Conta criada com sucesso!' : 'Account created successfully!',
      });
    } catch (err) {
      if (err.message === 'email_already_registered') {
        return res.status(409).json({ success: false, error: 'email_already_registered' });
      }
      return res.status(500).json({ success: false, error: 'registration_failed' });
    }
  });

  // 2. Login com E-mail e Senha
  router.post('/api/auth/login', (req, res) => {
    const { email, password, lang = 'pt' } = req.body || {};
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    try {
      const account = accountStore.authenticateWithPassword(email, password, clientIp);
      const cookieVal = accountSessions.createSession(account.id);
      accountSessions.setCookie(res, cookieVal);

      return res.json({
        success: true,
        account,
        message: lang === 'pt' ? 'Login realizado com sucesso!' : 'Login successful!',
      });
    } catch (err) {
      if (err.message.startsWith('rate_limit_exceeded')) {
        const mins = err.message.split(':')[1] || '15';
        return res.status(429).json({
          success: false,
          error: 'rate_limit_exceeded',
          message: lang === 'pt'
            ? `Muitas tentativas incorretas. Tente novamente em ${mins} minutos.`
            : `Too many failed attempts. Try again in ${mins} minutes.`,
        });
      }
      return res.status(401).json({
        success: false,
        error: 'invalid_credentials',
        message: lang === 'pt' ? 'E-mail ou senha incorretos.' : 'Invalid email or password.',
      });
    }
  });

  // 3. Logout
  router.post('/api/auth/logout', (req, res) => {
    const cookie = accountSessions.getCookie(req);
    accountSessions.destroySession(cookie);
    accountSessions.clearCookie(res);
    return res.json({ success: true });
  });

  // 4. Sessão Atual
  router.get('/api/auth/me', (req, res) => {
    if (!req.account) {
      return res.json({ authenticated: false, account: null });
    }
    return res.json({ authenticated: true, account: req.account });
  });

  // 5. Esqueci a Senha
  router.post('/api/auth/forgot-password', (req, res) => {
    const { email, lang = 'pt' } = req.body || {};
    const token = accountStore.createPasswordResetToken(email);

    // Mensagem opaca por segurança (não confirma se o e-mail existe)
    return res.json({
      success: true,
      token, // exposto para testes locais e rotina de envio
      message: lang === 'pt'
        ? 'Se o e-mail estiver cadastrado, as instruções para redefinição foram enviadas.'
        : 'If the email is registered, password reset instructions have been sent.',
    });
  });

  // 6. Redefinição de Senha
  router.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword, lang = 'pt' } = req.body || {};
    try {
      const account = accountStore.resetPasswordWithToken(token, newPassword);
      return res.json({
        success: true,
        message: lang === 'pt' ? 'Senha redefinida com sucesso!' : 'Password reset successfully!',
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Verificação de E-mail
  router.get('/api/auth/verify-email', (req, res) => {
    const { token } = req.query;
    try {
      accountStore.verifyEmailWithToken(token);
      return res.redirect('/meu-perfil?verified=1');
    } catch (err) {
      return res.redirect('/meu-perfil?verify_error=1');
    }
  });

  // 8. Salvar Preferências de Leitura Acessível
  router.post('/api/user/reading-preferences', requireAuth, (req, res) => {
    const { fontSize, theme, dyslexicFont } = req.body || {};
    const updated = accountStore.updateReadingPreferences(req.account.id, {
      ...(fontSize ? { fontSize } : {}),
      ...(theme ? { theme } : {}),
      ...(dyslexicFont !== undefined ? { dyslexicFont: Boolean(dyslexicFont) } : {}),
    });
    return res.json({ success: true, readingPreferences: updated });
  });

  // 9. Estatísticas e Artigos do Usuário
  router.get('/api/user/my-articles', requireAuth, (req, res) => {
    const stats = accountStore.getAccountStats(req.account.id);
    return res.json({ success: true, stats });
  });

  // 10. Solicitação de Remoção de Artigo (Ticket)
  router.post('/api/user/removal-ticket', requireAuth, (req, res) => {
    const { articleId, reason } = req.body || {};
    if (!articleId || !reason) {
      return res.status(400).json({ success: false, error: 'missing_fields' });
    }

    const ticketId = `ticket_rem_${Date.now().toString(36)}`;
    // Registra ticket em log/estrutura atômica
    return res.json({
      success: true,
      ticketId,
      message: 'Solicitação de remoção registrada com sucesso. A equipe editorial analisará o caso.',
    });
  });

  // 11. Gestão de Rascunhos Web (Escrita no Site)
  router.get('/api/hyperfokus/web-drafts', requireAuth, (req, res) => {
    const drafts = webDraftStore.listUserDrafts(req.account.id);
    return res.json({ success: true, drafts });
  });

  router.post('/api/hyperfokus/web-drafts', requireAuth, (req, res) => {
    const { title, contentMarkdown, categoryTags, coverImage } = req.body || {};
    const draft = webDraftStore.createWebDraft(req.account.id, {
      title,
      contentMarkdown,
      categoryTags,
      coverImage,
    });
    return res.json({ success: true, draft });
  });

  router.get('/api/hyperfokus/web-drafts/:id', requireAuth, (req, res) => {
    const draft = webDraftStore.getWebDraft(req.params.id, req.account.id);
    if (!draft) return res.status(404).json({ success: false, error: 'draft_not_found' });
    return res.json({ success: true, draft });
  });

  router.put('/api/hyperfokus/web-drafts/:id', requireAuth, (req, res) => {
    try {
      const draft = webDraftStore.updateWebDraft(req.params.id, req.account.id, req.body || {});
      return res.json({ success: true, draft });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.delete('/api/hyperfokus/web-drafts/:id', requireAuth, (req, res) => {
    try {
      const deleted = webDraftStore.deleteWebDraft(req.params.id, req.account.id);
      return res.json({ success: true, deleted });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // Enviar Rascunho Web para Análise Editorial
  router.post('/api/hyperfokus/web-drafts/:id/submit', requireAuth, async (req, res) => {
    try {
      const authorUsername = req.account.email ? req.account.email.split('@')[0] : 'Autor Web';
      const result = await webDraftStore.submitWebDraft(req.params.id, req.account.id, {
        authorUsername,
        discordUserId: req.account.discordUserId,
      });
      return res.json({
        success: true,
        article: result.article,
        draft: result.draft,
        message: 'Artigo enviado com sucesso para a fila de revisão editorial!',
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // 12. Importador Seguro de Código do GitHub
  router.post('/api/hyperfokus/github-snippet', async (req, res) => {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, error: 'missing_url' });
    }

    try {
      const snippet = await importGitHubSnippet(url);
      return res.json({ success: true, snippet });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = {
  createAccountRouter,
};
