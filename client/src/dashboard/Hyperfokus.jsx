import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileEdit,
  Globe,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

export default function Hyperfokus({ t, lang, guildId }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'published' | 'rejected'
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Form de edição editorial
  const [editForm, setEditForm] = useState({
    title: '',
    seoTitle: '',
    metaDescription: '',
    slug: '',
    coverImage: '',
    categoryTags: '',
    contentMarkdown: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [queueRes, pubRes, rejRes] = await Promise.all([
        api.hyperfokusQueue(guildId),
        api.hyperfokusArticles(guildId, 'PUBLISHED'),
        api.hyperfokusArticles(guildId, 'REJECTED'),
      ]);
      setQueue(queueRes.queue || []);
      setPublished(pubRes.articles || []);
      setRejected(rejRes.articles || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do Hyperfokus');
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setEditForm({
      title: article.title || '',
      seoTitle: article.seoTitle || article.title || '',
      metaDescription: article.metaDescription || '',
      slug: article.slug || '',
      coverImage: article.coverImage || '',
      categoryTags: (article.categoryTags || []).join(', '),
      contentMarkdown: article.contentMarkdown || '',
    });
    setNotice(null);
  };

  const handleSaveDraft = async () => {
    if (!selectedArticle) return;
    try {
      setBusyAction(true);
      setNotice(null);
      const tags = editForm.categoryTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.hyperfokusSave(guildId, selectedArticle.id, {
        title: editForm.title,
        seoTitle: editForm.seoTitle,
        metaDescription: editForm.metaDescription,
        slug: editForm.slug,
        coverImage: editForm.coverImage,
        categoryTags: tags,
        contentMarkdown: editForm.contentMarkdown,
      });

      setSelectedArticle(res.article);
      setNotice({
        tone: 'ok',
        text: lang === 'pt' ? 'Artigo editorial atualizado com sucesso!' : 'Editorial article updated successfully!',
      });
      await loadData();
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Erro ao salvar artigo.' : 'Error saving article.'),
      });
    } finally {
      setBusyAction(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedArticle) return;
    if (!window.confirm(lang === 'pt' ? 'Aprovar e publicar este artigo oficialmente no portal?' : 'Approve and publish this article to the portal?')) {
      return;
    }
    try {
      setBusyAction(true);
      setNotice(null);
      // Salva edições primeiro
      await handleSaveDraft();

      const res = await api.hyperfokusPublish(guildId, selectedArticle.id);
      setSelectedArticle(res.article);
      setNotice({
        tone: 'ok',
        text: lang === 'pt'
          ? `🎉 Artigo publicado com sucesso! Link: ${res.url}`
          : `🎉 Article published successfully! Link: ${res.url}`,
      });
      await loadData();
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Erro ao publicar artigo.' : 'Error publishing article.'),
      });
    } finally {
      setBusyAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedArticle) return;
    try {
      setBusyAction(true);
      setNotice(null);
      const res = await api.hyperfokusReject(guildId, selectedArticle.id, rejectReason);
      setSelectedArticle(res.article);
      setShowRejectModal(false);
      setRejectReason('');
      setNotice({
        tone: 'ok',
        text: lang === 'pt' ? 'Artigo recusado. Permanecerá apenas no Discord.' : 'Article rejected. It remains exclusively on Discord.',
      });
      await loadData();
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Erro ao recusar artigo.' : 'Error rejecting article.'),
      });
    } finally {
      setBusyAction(false);
    }
  };

  if (loading) return <Spinner label={t('app.loading')} />;
  if (error) return <Notice tone="error">{error}</Notice>;

  const currentList = activeTab === 'queue' ? queue : activeTab === 'published' ? published : rejected;

  return (
    <div className="space-y-6">
      {notice && (
        <Notice tone={notice.tone}>
          <div className="flex items-center justify-between">
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-3 text-xs opacity-75 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </Notice>
      )}

      {/* Top Stat Tiles */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div
          onClick={() => { setActiveTab('queue'); setSelectedArticle(null); }}
          className={`dash-card cursor-pointer rounded-2xl p-4 transition ${
            activeTab === 'queue' ? 'border-pyxie-bright/50 shadow-[0_0_16px_rgba(236,72,153,0.2)]' : ''
          }`}
        >
          <p className="text-xs font-semibold text-white/50">
            {lang === 'pt' ? 'Fila de Validação' : 'Review Queue'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-pyxie-glow">{queue.length}</p>
        </div>
        <div
          onClick={() => { setActiveTab('published'); setSelectedArticle(null); }}
          className={`dash-card cursor-pointer rounded-2xl p-4 transition ${
            activeTab === 'published' ? 'border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.2)]' : ''
          }`}
        >
          <p className="text-xs font-semibold text-white/50">
            {lang === 'pt' ? 'Artigos Publicados' : 'Published Articles'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-emerald-400">{published.length}</p>
        </div>
        <div
          onClick={() => { setActiveTab('rejected'); setSelectedArticle(null); }}
          className={`dash-card cursor-pointer rounded-2xl p-4 transition ${
            activeTab === 'rejected' ? 'border-red-500/50 shadow-[0_0_16px_rgba(239,68,68,0.2)]' : ''
          }`}
        >
          <p className="text-xs font-semibold text-white/50">
            {lang === 'pt' ? 'Recusados / Só Discord' : 'Rejected / Discord Only'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-white/60">{rejected.length}</p>
        </div>
      </div>

      {/* Seção Principal: Lista ou Editor */}
      {!selectedArticle ? (
        <Card
          title={
            activeTab === 'queue'
              ? lang === 'pt' ? 'Fila Editorial de Hiperfocos' : 'Editorial Review Queue'
              : activeTab === 'published'
              ? lang === 'pt' ? 'Artigos Publicados no Portal' : 'Published Articles'
              : lang === 'pt' ? 'Artigos Recusados' : 'Rejected Articles'
          }
          eyebrow="Pyxie Hyperfokus"
          icon={BookOpen}
          action={
            <Button variant="ghost" onClick={loadData} className="flex items-center gap-1.5 text-xs">
              <RefreshCw size={14} /> {lang === 'pt' ? 'Atualizar' : 'Refresh'}
            </Button>
          }
        >
          <div className="mt-3 space-y-3">
            {currentList.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center text-sm text-white/40">
                {lang === 'pt'
                  ? 'Nenhum artigo encontrado nesta visualização.'
                  : 'No articles found in this view.'}
              </div>
            ) : (
              currentList.map((art) => (
                <div
                  key={art.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-pyxie-glow/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          art.status === 'PUBLISHED'
                            ? 'green'
                            : art.status === 'REJECTED'
                            ? 'red'
                            : 'pink'
                        }
                      >
                        {art.status}
                      </Badge>
                      <span className="font-mono text-xs text-white/40">/{art.slug}</span>
                      {(art.categoryTags || []).map((t) => (
                        <Badge key={t} tone="muted">
                          #{t}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="font-title text-base font-bold text-white">{art.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-mystic-glow" />
                        {(art.authors || []).map((a) => a.username).join(', ') || 'Autor'}
                      </span>
                      {art.publishedAt && (
                        <span>
                          {lang === 'pt' ? 'Publicado em:' : 'Published:'}{' '}
                          {new Date(art.publishedAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleSelectArticle(art)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <FileEdit size={14} />
                      {lang === 'pt' ? 'Revisar & Editar' : 'Review & Edit'}
                    </Button>
                    {art.status === 'PUBLISHED' && (
                      <a
                        href={`/hyperfokus/${art.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/10 p-2.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                        title={lang === 'pt' ? 'Abrir no site' : 'Open on site'}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : (
        /* Visualização do Editor Editorial */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              {lang === 'pt' ? 'Voltar para a lista' : 'Back to list'}
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                disabled={busyAction}
                onClick={handleSaveDraft}
                className="text-xs"
              >
                {lang === 'pt' ? 'Salvar Edições' : 'Save Draft'}
              </Button>
              {selectedArticle.status !== 'REJECTED' && (
                <Button
                  variant="ghost"
                  disabled={busyAction}
                  onClick={() => setShowRejectModal(true)}
                  className="border-red-500/30 text-xs text-red-300 hover:bg-red-500/10"
                >
                  <XCircle size={14} className="mr-1 inline" />
                  {lang === 'pt' ? 'Recusar' : 'Reject'}
                </Button>
              )}
              <Button
                variant="primary"
                disabled={busyAction}
                onClick={handlePublish}
                className="text-xs"
              >
                <CheckCircle2 size={14} className="mr-1 inline" />
                {lang === 'pt' ? 'Aprovar & Publicar' : 'Approve & Publish'}
              </Button>
            </div>
          </div>

          <Card title={selectedArticle.title} eyebrow="Editor Editorial de Hiperfoco" icon={FileEdit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Título Original */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/70">
                  {lang === 'pt' ? 'Título do Artigo' : 'Article Title'}
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              {/* Título de SEO */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>{lang === 'pt' ? 'Título de SEO (Google / Aba)' : 'SEO Title'}</span>
                  <span
                    className={
                      editForm.seoTitle.length > 60 ? 'text-amber-400 font-bold' : 'text-white/40'
                    }
                  >
                    {editForm.seoTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={editForm.seoTitle}
                  onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
                  placeholder={editForm.title}
                  className={`${field} mt-1`}
                />
              </div>

              {/* Slug URL */}
              <div>
                <label className="block text-xs font-semibold text-white/70">
                  {lang === 'pt' ? 'Slug URL Amigável' : 'URL Slug'}
                </label>
                <div className="mt-1 flex items-center gap-1 font-mono text-xs text-white/40">
                  <span>/hyperfokus/</span>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    className={field}
                  />
                </div>
              </div>

              {/* Meta Descrição */}
              <div className="sm:col-span-2">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>{lang === 'pt' ? 'Meta Descrição (SEO)' : 'Meta Description'}</span>
                  <span
                    className={
                      editForm.metaDescription.length > 160
                        ? 'text-amber-400 font-bold'
                        : 'text-white/40'
                    }
                  >
                    {editForm.metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={editForm.metaDescription}
                  onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                  placeholder={
                    lang === 'pt'
                      ? 'Resumo atraente para os resultados do Google (até 160 caracteres)...'
                      : 'Engaging summary for search engine results (up to 160 characters)...'
                  }
                  className={`${field} mt-1 py-2`}
                />
              </div>

              {/* Imagem de Capa e Tags */}
              <div>
                <label className="block text-xs font-semibold text-white/70">
                  {lang === 'pt' ? 'URL da Imagem de Capa' : 'Cover Image URL'}
                </label>
                <input
                  type="text"
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70">
                  {lang === 'pt' ? 'Categorias / Tags (separadas por vírgula)' : 'Tags (comma separated)'}
                </label>
                <input
                  type="text"
                  value={editForm.categoryTags}
                  onChange={(e) => setEditForm({ ...editForm, categoryTags: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>
            </div>

            {/* Split Editor: Markdown à esquerda, Preview à direita */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mystic-glow">
                {lang === 'pt' ? 'Editor de Conteúdo Autoral' : 'Author Content Editor'}
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <textarea
                    rows={18}
                    value={editForm.contentMarkdown}
                    onChange={(e) => setEditForm({ ...editForm, contentMarkdown: e.target.value })}
                    placeholder="Conteúdo em Markdown..."
                    className="dash-field w-full rounded-2xl p-4 font-mono text-sm leading-relaxed"
                  />
                </div>

                <div className="dash-card max-h-[500px] overflow-y-auto rounded-2xl p-5">
                  <p className="mb-3 border-b border-white/10 pb-2 text-xs font-bold text-white/50">
                    {lang === 'pt' ? 'PRÉ-VISUALIZAÇÃO AO VIVO' : 'LIVE PREVIEW'}
                  </p>
                  <div className="prose prose-invert max-w-none space-y-3 text-sm leading-relaxed text-white/90">
                    <h1 className="font-title text-xl font-bold text-pyxie-glow">
                      {editForm.title || 'Título do Artigo'}
                    </h1>
                    {editForm.coverImage && (
                      <img
                        src={editForm.coverImage}
                        alt="Capa"
                        className="h-44 w-full rounded-xl object-cover"
                      />
                    )}
                    <div className="whitespace-pre-wrap font-sans text-sm text-white/80">
                      {editForm.contentMarkdown || 'Escreva algo no editor...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Recusa com Motivo */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="dash-card w-full max-w-md rounded-2xl p-5 shadow-2xl">
            <h3 className="font-title text-base font-bold text-white">
              {lang === 'pt' ? 'Recusar Publicação do Artigo' : 'Reject Article Publication'}
            </h3>
            <p className="mt-1 text-xs text-white/60">
              {lang === 'pt'
                ? 'O artigo não será publicado no site, mas continuará acessível no Discord.'
                : 'The article will not be published to the website, remaining on Discord.'}
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={lang === 'pt' ? 'Motivo da recusa (opcional)...' : 'Reason for rejection...'}
              className={`${field} mt-3 py-2`}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)} className="text-xs">
                {lang === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                disabled={busyAction}
                onClick={handleReject}
                className="bg-red-500/80 text-xs hover:bg-red-600"
              >
                {lang === 'pt' ? 'Confirmar Recusa' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
