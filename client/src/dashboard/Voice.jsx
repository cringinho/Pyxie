import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, RefreshCw, Search, Sparkles, Trash2, Volume2 } from 'lucide-react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner, Switch } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

const CATEGORY_TONES = {
  daily: 'pink',
  work: 'violet',
  tarot: 'violet',
  quip: 'pink',
  animator: 'green',
};

export default function Voice({ t, lang }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.voiceStatus();
      setData(res);
    } catch (err) {
      setError(err.message || 'Erro ao carregar banco de vozes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setNotice(null);
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const res = await api.voiceGenerate({ count: 4, category });
      setNotice({
        tone: 'ok',
        text: lang === 'pt'
          ? `Sucesso! ${res.generated || 0} falas geradas via Groq.`
          : `Success! ${res.generated || 0} lines generated via Groq.`,
      });
      await load();
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err.message || (lang === 'pt' ? 'Falha ao acionar Groq' : 'Failed to call Groq'),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (id, nextState) => {
    if (!data) return;
    // Optimistic update
    const prevLines = data.lines;
    setData({
      ...data,
      lines: data.lines.map((l) => (l.id === id ? { ...l, active: nextState } : l)),
      status: {
        ...data.status,
        activeCount: nextState
          ? data.status.activeCount + 1
          : Math.max(0, data.status.activeCount - 1),
      },
    });

    try {
      await api.voiceToggle(id, nextState);
    } catch (err) {
      // Revert on error
      setData({ ...data, lines: prevLines });
      setNotice({
        tone: 'error',
        text: lang === 'pt' ? 'Erro ao alternar fala.' : 'Error toggling line.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('voice.confirmDelete'))) return;
    try {
      await api.voiceDelete(id);
      setData((prev) => ({
        ...prev,
        lines: prev.lines.filter((l) => l.id !== id),
        status: {
          ...prev.status,
          totalLines: Math.max(0, prev.status.totalLines - 1),
        },
      }));
    } catch (err) {
      setNotice({
        tone: 'error',
        text: lang === 'pt' ? 'Erro ao excluir fala.' : 'Error deleting line.',
      });
    }
  };

  const filteredLines = useMemo(() => {
    if (!data?.lines) return [];
    let list = data.lines;
    if (selectedCategory !== 'all') {
      list = list.filter((l) => l.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          (l.pt && l.pt.toLowerCase().includes(q)) ||
          (l.en && l.en.toLowerCase().includes(q)) ||
          (l.id && l.id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, selectedCategory, query]);

  if (loading) return <Spinner label={t('app.loading')} />;
  if (error) return <Notice tone="error">{error}</Notice>;

  const status = data?.status || {};
  const categories = data?.categories || ['daily', 'work', 'tarot', 'quip', 'animator'];

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dash-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/50">{t('voice.statTotal')}</p>
          <p className="mt-1 font-title text-2xl font-bold text-pyxie-glow">{status.totalLines || 0}</p>
        </div>
        <div className="dash-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/50">{t('voice.statActive')}</p>
          <p className="mt-1 font-title text-2xl font-bold text-emerald-400">{status.activeCount || 0}</p>
        </div>
        <div className="dash-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/50">{t('voice.statScheduler')}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status.schedulerRunning ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/30'
              }`}
            />
            <p className="text-sm font-semibold text-white">
              {status.schedulerRunning ? t('voice.schedulerRunning') : t('voice.schedulerStopped')}
            </p>
          </div>
        </div>
        <div className="dash-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/50">{t('voice.statModel')}</p>
          <p className="mt-1 truncate font-mono text-xs text-mystic-glow" title={status.model}>
            {status.model || 'qwen/qwen3.8-27b'}
          </p>
        </div>
      </div>

      {/* Controls Card */}
      <Card
        title={t('voice.title')}
        eyebrow="Tsundere Persona Engine"
        icon={Volume2}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              disabled={generating}
              onClick={handleGenerate}
              className="flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{t('voice.generating')}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t('voice.generateBatch')}</span>
                </>
              )}
            </Button>
          </div>
        }
      >
        <p className="mb-4 text-xs text-white/60">{t('voice.subtitle')}</p>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('voice.searchPlaceholder')}
              className={`${field} pl-9`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-pyxie-bright text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {t('voice.filterAll')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-mystic-violet text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {t(`voice.cat.${cat}`) || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Lines List */}
        <div className="mt-5 space-y-3">
          {filteredLines.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center text-sm text-white/40">
              {t('voice.empty')}
            </div>
          ) : (
            filteredLines.map((line) => {
              const tone = CATEGORY_TONES[line.category] || 'violet';
              return (
                <div
                  key={line.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                    line.active
                      ? 'border-white/10 bg-white/[0.03] hover:border-pyxie-glow/30'
                      : 'border-white/5 bg-black/20 opacity-60'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={tone}>{t(`voice.cat.${line.category}`) || line.category}</Badge>
                      <Badge tone={line.source === 'groq' ? 'pink' : 'muted'}>
                        {line.source === 'groq' ? (
                          <span className="flex items-center gap-1">
                            <Bot size={12} /> {t('voice.sourceGroq')}
                          </span>
                        ) : (
                          t('voice.sourceSeed')
                        )}
                      </Badge>
                      <span className="font-mono text-[11px] text-white/40">{line.id}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-white/90">
                        <span className="mr-2 text-xs font-bold text-pyxie-glow">PT:</span>
                        "{line.pt}"
                      </p>
                      <p className="text-xs text-white/70">
                        <span className="mr-2 text-[10px] font-bold text-mystic-glow">EN:</span>
                        "{line.en}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={line.active}
                        onChange={(val) => handleToggle(line.id, val)}
                        label={line.active ? t('voice.active') : t('voice.inactive')}
                      />
                      <span className="text-xs text-white/50">
                        {line.active ? t('voice.active') : t('voice.inactive')}
                      </span>
                    </div>

                    <button
                      type="button"
                      title={t('voice.delete')}
                      onClick={() => handleDelete(line.id)}
                      className="rounded-lg p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

