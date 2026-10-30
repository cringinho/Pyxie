import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PyxieEditorField from './PyxieEditorField';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileEdit,
  Globe,
  Pause,
  Pin,
  Play,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

export default function Hyperfokus({ t, lang, guildId }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'published' | 'rejected' | 'pins' | 'analytics'
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [pins, setPins] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
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
      const [queueRes, pubRes, rejRes, pinsRes, analyticsRes] = await Promise.all([
        api.hyperfokusQueue(guildId).catch(() => ({ queue: [] })),
        api.hyperfokusArticles(guildId, 'PUBLISHED').catch(() => ({ articles: [] })),
        api.hyperfokusArticles(guildId, 'REJECTED').catch(() => ({ articles: [] })),
        api.hyperfokusPins(guildId).catch(() => ({ pins: [] })),
        api.hyperfokusAnalytics(guildId, analyticsDays).catch(() => ({ summary: null })),
      ]);
      setQueue(queueRes.queue || []);
      setPublished(pubRes.articles || []);
      setRejected(rejRes.articles || []);
      setPins(pinsRes.pins || []);
      setAnalytics(analyticsRes.summary || null);
    } catch (err) {
      setError(err.message || (lang === 'pt' ? 'Erro ao carregar dados do Hyperfokus' : 'Error loading Hyperfokus data'));
    } finally {
      setLoading(false);
    }
  }, [guildId, analyticsDays, lang]);

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

  const handleTogglePin = async (pinId) => {
    try {
      setBusyAction(true);
      await api.hyperfokusTogglePin(guildId, pinId);
      const res = await api.hyperfokusPins(guildId);
      setPins(res.pins || []);
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Erro ao alternar pin.' : 'Error toggling pin.'),
      });
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeletePin = async (pinId) => {
    if (!window.confirm(lang === 'pt' ? 'Remover este item da fila do Pinterest?' : 'Remove this item from Pinterest queue?')) {
      return;
    }
    try {
      setBusyAction(true);
      await api.hyperfokusDeletePin(guildId, pinId);
      const res = await api.hyperfokusPins(guildId);
      setPins(res.pins || []);
      setNotice({
        tone: 'ok',
        text: lang === 'pt' ? 'Pin removido da fila.' : 'Pin removed from queue.',
      });
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Erro ao remover pin.' : 'Error deleting pin.'),
      });
    } finally {
      setBusyAction(false);
    }
  };

  if (loading) return <Spinner label={t('app.loading')} />;
  if (error) return <Notice tone="error">{error}</Notice>;

  const currentList = activeTab === 'queue' ? queue : activeTab === 'published' ? published : rejected;

  // Formatação de segundos em mm:ss
  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

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

      {/* Top Stat Tiles / Tab Switcher */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
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
            {lang === 'pt' ? 'Publicados' : 'Published'}
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
            {lang === 'pt' ? 'Recusados' : 'Rejected'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-white/60">{rejected.length}</p>
        </div>

        <div
          onClick={() => { setActiveTab('pins'); setSelectedArticle(null); }}
          className={`dash-card cursor-pointer rounded-2xl p-4 transition ${
            activeTab === 'pins' ? 'border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.2)]' : ''
          }`}
        >
          <p className="text-xs font-semibold text-white/50">
            {lang === 'pt' ? 'Fila Pinterest' : 'Pinterest Queue'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-amber-400">{pins.length}</p>
        </div>

        <div
          onClick={() => { setActiveTab('analytics'); setSelectedArticle(null); }}
          className={`dash-card cursor-pointer rounded-2xl p-4 transition ${
            activeTab === 'analytics' ? 'border-cyan-400/50 shadow-[0_0_16px_rgba(34,211,238,0.2)]' : ''
          }`}
        >
          <p className="text-xs font-semibold text-white/50">
            {lang === 'pt' ? 'Analytics Real' : 'Real Analytics'}
          </p>
          <p className="mt-1 font-title text-2xl font-bold text-cyan-400">
            {analytics?.totalPageViews ?? 0}
          </p>
        </div>
      </div>

      {/* Visão de Analytics Real */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card
            title={lang === 'pt' ? 'Métricas & Audiência Editorial' : 'Editorial Audience & Analytics'}
            eyebrow={lang === 'pt' ? 'Telemetria Real • Zero Mock' : 'Real Telemetry • Zero Mock'}
            icon={BarChart3}
            action={
              <div className="flex items-center gap-2">
                <select
                  value={analyticsDays}
                  onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                >
                  <option value={7}>{lang === 'pt' ? 'Últimos 7 dias' : 'Last 7 days'}</option>
                  <option value={30}>{lang === 'pt' ? 'Últimos 30 dias' : 'Last 30 days'}</option>
                  <option value={90}>{lang === 'pt' ? 'Últimos 90 dias' : 'Last 90 days'}</option>
                </select>
                <Button variant="ghost" onClick={loadData} className="flex items-center gap-1 text-xs">
                  <RefreshCw size={12} /> {lang === 'pt' ? 'Atualizar' : 'Refresh'}
                </Button>
              </div>
            }
          >
            {/* 6 KPI Tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Page Views' : 'Page Views'}</span>
                <p className="mt-1 font-title text-xl font-bold text-white">
                  {analytics?.totalPageViews || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Visitantes Únicos' : 'Unique Visitors'}</span>
                <p className="mt-1 font-title text-xl font-bold text-mystic-glow">
                  {analytics?.totalUniqueVisitors || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Tempo Ativo Médio' : 'Avg Active Time'}</span>
                <p className="mt-1 font-title text-xl font-bold text-cyan-400">
                  {formatSeconds(analytics?.avgActiveTimeSeconds || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Leitura 100%' : '100% Scroll Depth'}</span>
                <p className="mt-1 font-title text-xl font-bold text-emerald-400">
                  {analytics?.totalScroll100 || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Cliques Shopee' : 'Shopee Clicks'}</span>
                <p className="mt-1 font-title text-xl font-bold text-amber-400">
                  {analytics?.totalShopeeClicks || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <span className="text-xs text-white/50">{lang === 'pt' ? 'Entradas Discord' : 'Discord Joins'}</span>
                <p className="mt-1 font-title text-xl font-bold text-pyxie-glow">
                  {analytics?.totalDiscordJoinClicks || 0}
                </p>
              </div>
            </div>

            {/* Funil de Rolagem e Origens de Tráfego */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Funil de Leitura / Profundidade */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h4 className="flex items-center gap-2 font-title text-sm font-bold text-white">
                  <TrendingUp size={16} className="text-emerald-400" />
                  {lang === 'pt' ? 'Funil de Retenção de Leitura' : 'Reading Retention Funnel'}
                </h4>
                <p className="mt-1 text-xs text-white/50">
                  {lang === 'pt' ? 'Profundidade atingida na rolagem dos artigos' : 'Scroll depth reached across articles'}
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Scroll 25%', count: analytics?.totalScroll25 || 0, color: 'bg-cyan-500' },
                    { label: 'Scroll 50%', count: analytics?.totalScroll50 || 0, color: 'bg-emerald-500' },
                    { label: 'Scroll 75%', count: analytics?.totalScroll75 || 0, color: 'bg-amber-500' },
                    { label: 'Scroll 100% (Conclusão)', count: analytics?.totalScroll100 || 0, color: 'bg-pyxie-glow' },
                  ].map((step) => {
                    const max = Math.max(1, analytics?.totalPageViews || 1);
                    const pct = Math.min(100, Math.round((step.count / max) * 100));
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">{step.label}</span>
                          <span className="font-mono text-white/50">{step.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full ${step.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Origens de Tráfego */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h4 className="flex items-center gap-2 font-title text-sm font-bold text-white">
                  <Globe size={16} className="text-cyan-400" />
                  {lang === 'pt' ? 'Origens de Tráfego' : 'Traffic Referrers'}
                </h4>
                <p className="mt-1 text-xs text-white/50">
                  {lang === 'pt' ? 'De onde os leitores vieram' : 'Where readers arrived from'}
                </p>
                <div className="mt-4 max-h-[160px] space-y-2 overflow-y-auto">
                  {(!analytics?.referrers || Object.keys(analytics.referrers).length === 0) ? (
                    <p className="py-6 text-center text-xs text-white/40">
                      {lang === 'pt' ? 'Nenhuma visita registrada ainda.' : 'No traffic recorded yet.'}
                    </p>
                  ) : (
                    Object.entries(analytics.referrers).map(([ref, count]) => {
                      const max = Math.max(1, analytics?.totalPageViews || 1);
                      const pct = Math.min(100, Math.round((count / max) * 100));
                      return (
                        <div key={ref} className="flex items-center justify-between text-xs">
                          <span className="font-medium capitalize text-white/80">{ref}</span>
                          <span className="font-mono text-white/50">{count} ({pct}%)</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Aviso de conformidade LGPD */}
            <p className="mt-6 text-center text-xs text-white/40">
              {lang === 'pt'
                ? '🔒 Coleta anônima e conforme a LGPD: sem cookies de rastreio, sem gravação de IPs crus e agregação em PostgreSQL.'
                : '🔒 Privacy and LGPD compliant: no tracking cookies, zero raw IPs stored, salted daily aggregation in PostgreSQL.'}
            </p>
          </Card>
        </div>
      )}

      {/* Visão da Fila do Pinterest */}
      {activeTab === 'pins' && (
        <Card
          title={lang === 'pt' ? 'Fila Agendada do Pinterest' : 'Scheduled Pinterest Queue'}
          eyebrow={lang === 'pt' ? 'Orçamento de 3 pins/dia • RSS Automatizado' : '3 Pins/Day Budget • Automated RSS'}
          icon={Pin}
          action={
            <Button variant="ghost" onClick={loadData} className="flex items-center gap-1 text-xs">
              <RefreshCw size={14} /> {lang === 'pt' ? 'Atualizar' : 'Refresh'}
            </Button>
          }
        >
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-xs text-amber-200/90">
            {lang === 'pt'
              ? '📌 O Pinterest consome os pins automaticamente via /rss-pinterest.xml. Os itens são distribuídos nos horários de pico (~12h30, ~18h30, ~21h30 BRT com variação de ±20min para evitar shadowban).'
              : '📌 Pinterest consumes pins automatically via /rss-pinterest.xml. Pins are scheduled around peak hours (~12:30, ~18:30, ~21:30 BRT with ±20min jitter to prevent shadowbans).'}
          </div>

          <div className="mt-4 space-y-3">
            {pins.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center text-sm text-white/40">
                {lang === 'pt'
                  ? 'Nenhum pin na fila. Novos artigos publicados entram automaticamente.'
                  : 'No pins in queue. Newly published articles are automatically queued.'}
              </div>
            ) : (
              pins.map((pin) => {
                const releaseDate = new Date(pin.releaseAt);
                const isReleased = releaseDate <= new Date();
                return (
                  <div
                    key={pin.id}
                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {pin.imageUrl ? (
                        <img
                          src={pin.imageUrl}
                          alt={pin.altText || 'Pin image'}
                          className="h-16 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-white/5 text-white/20">
                          <Pin size={20} />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge tone={pin.status === 'PAUSED' ? 'muted' : isReleased ? 'green' : 'amber'}>
                            {pin.status === 'PAUSED'
                              ? lang === 'pt' ? 'Pausado' : 'Paused'
                              : isReleased
                              ? lang === 'pt' ? 'Liberado no Feed' : 'Released to Feed'
                              : lang === 'pt' ? 'Agendado' : 'Scheduled'}
                          </Badge>
                          <span className="text-xs text-white/50">
                            {lang === 'pt' ? 'Liberação:' : 'Release:'}{' '}
                            {releaseDate.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                              timeZone: 'America/Sao_Paulo',
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <h4 className="font-title text-sm font-bold text-white">{pin.title}</h4>
                        <p className="line-clamp-1 text-xs text-white/50">{pin.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        disabled={busyAction}
                        onClick={() => handleTogglePin(pin.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {pin.status === 'PAUSED' ? (
                          <>
                            <Play size={14} className="text-emerald-400" />
                            {lang === 'pt' ? 'Retomar' : 'Resume'}
                          </>
                        ) : (
                          <>
                            <Pause size={14} className="text-amber-400" />
                            {lang === 'pt' ? 'Pausar' : 'Pause'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busyAction}
                        onClick={() => handleDeletePin(pin.id)}
                        className="border-red-500/20 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* Seção de Artigos: Lista ou Editor */}
      {(activeTab === 'queue' || activeTab === 'published' || activeTab === 'rejected') && (
        !selectedArticle ? (
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

              {/* Editor da Pyxie (o mesmo do site): o que aparece aqui é como fica publicado. */}
              <div className="mt-6">
                <p id="hf-editor-label" className="mb-2 text-xs font-semibold uppercase tracking-wider text-mystic-glow">
                  {lang === 'pt' ? 'Texto do artigo' : 'Article text'}
                </p>
                <PyxieEditorField
                  key={selectedArticle.id}
                  lang={lang}
                  label={lang === 'pt' ? 'Texto do artigo' : 'Article text'}
                  initialHtml={selectedArticle.contentHtml}
                  initialMarkdown={selectedArticle.contentMarkdown}
                  onChange={(md) => setEditForm((prev) => ({ ...prev, contentMarkdown: md }))}
                />
              </div>
            </Card>
          </div>
        )
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
