import React, { useState } from 'react';
import {
  X, Camera, Plus, Trash, LockKey, Sparkle, MapPin,
  CalendarBlank, Smiley, ShareNetwork, Check, Tag
} from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';

/**
 * Pré-compressão cliente via HTML5 Canvas para upload ultrarrápido no celular
 */
async function compressImageClientSide(file, maxDimension = 1800, quality = 0.88) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const MOODS = [
'Exaustão',
  'Ansiedade',
  'Irritação',
  'Sobrecarga',
  'Derrota',
  'Apatia',
  'Esgotamento',
  'Frustração',
  'Tédio',
  'Surto',
  'Paranoia',
  'Sono',
  'Confusão',
  'Impaciência',
  'Vazio',
  'Desorientação',
  'Estresse',
  'Paralisia',
  'Incômodo',
  'Pânico',
  'Pavor',
  'Caos'
];

export default function NewMemoryModal({
  isOpen,
  onClose,
  onCreated,
  existingMemories = [],
  initialContent = ''
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent || '');
  const [memoryDate, setMemoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [location, setLocation] = useState('');
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockAt, setUnlockAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [customWordsInput, setCustomWordsInput] = useState('');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - selectedFiles.length;
    const toAdd = files.slice(0, remainingSlots);

    const newFiles = [...selectedFiles, ...toAdd];
    setSelectedFiles(newFiles);

    const newPreviews = toAdd.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  function handleRemoveImage(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Preencha o título e o conteúdo do relato.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('memoryDate', memoryDate);
      formData.append('mood', mood);
      formData.append('location', location.trim());
      formData.append('isCapsule', isCapsule ? 'true' : 'false');
      if (isCapsule && unlockAt) {
        formData.append('unlockAt', unlockAt);
      }

      if (tagsInput.trim()) {
        const tagsArr = tagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
        formData.append('tags', JSON.stringify(tagsArr));
      }

      if (selectedConnectionId) {
        formData.append('connectedMemoryIds', JSON.stringify([Number(selectedConnectionId)]));
      }

      if (customWordsInput.trim()) {
        const wordsArr = customWordsInput.split(',').map(w => w.trim()).filter(Boolean);
        formData.append('customWords', JSON.stringify(wordsArr));
      }

      // Compressão das imagens via Canvas antes do envio
      for (let i = 0; i < selectedFiles.length; i++) {
        const compressedBlob = await compressImageClientSide(selectedFiles[i], 1800, 0.88);
        formData.append('images', compressedBlob, `photo_${i}.jpg`);
      }

      const res = await fetch('/api/memories', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao salvar relato');
      }

      if (onCreated) onCreated(data.memory);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao gravar relato');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl my-auto animate-in fade-in duration-150">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <Sparkle weight="duotone" className="w-5 h-5" />
            <h2 className="text-sm font-bold font-display text-white">Novo Relato no Universo</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-sans">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Título do Relato</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nossa tarde tomando sorvete, Viagem secreta..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 font-display font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1">
                <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                Data da Memória
              </label>
              <input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1">
                <MapPin weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                Lugar / Cidade
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, Nosso cantinho..."
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1">
              <Smiley weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
              Sentimento / Humor
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-sans border transition-all ${
                    mood === m ? 'bg-pink-500/25 border-pink-500 text-pink-200' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">O que aconteceu? Conte todos os detalhes com carinho...</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva aqui sua memória..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none font-sans leading-relaxed"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                <Camera weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                <span>Fotos do Relato (Máx. 10 fotos)</span>
              </label>
              <span className="text-[10px] text-pink-300/80 font-sans">
                Compressão automática via Canvas
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-pink-500/30 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-all"
                  >
                    <Trash weight="bold" className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-pink-500/60 bg-white/5 flex flex-col items-center justify-center text-gray-400 hover:text-pink-300 cursor-pointer transition-all">
                  <Plus weight="bold" className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-sans">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1">
              <Tag weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: viagem, encontro, promessas, risadas"
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 font-sans"
            />
          </div>

          {/* Conexão com outra memória */}
          {existingMemories.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1">
                <ShareNetwork weight="duotone" className="w-3.5 h-3.5 text-purple-400" />
                Relacionar com outra memória no grafo
              </label>
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#140e20] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 font-sans"
              >
                <option value="">Nenhuma (memória independente)</option>
                {existingMemories.slice(0, 30).map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} - {m.title} ({m.memoryDate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cápsula do Tempo */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                <LockKey weight="duotone" className="w-4 h-4 text-amber-400" />
                <span>Selar como Cápsula do Tempo</span>
              </span>
              <input
                type="checkbox"
                checked={isCapsule}
                onChange={(e) => setIsCapsule(e.target.checked)}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            {isCapsule && (
              <div className="pt-1">
                <label className="text-[10px] text-gray-400 block mb-1 font-sans">Data futura para desbloqueio:</label>
                <input
                  type="date"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                  required={isCapsule}
                />
              </div>
            )}
          </div>

          {/* Botões de Envio */}
          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-sans"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-500/25 disabled:opacity-50 font-display"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Comprimindo & Enviando...</span>
                </>
              ) : (
                <>
                  <Check weight="bold" className="w-3.5 h-3.5" />
                  <span>Gravar Memória</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
