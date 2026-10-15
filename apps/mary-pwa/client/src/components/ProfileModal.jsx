import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import {
  X, Camera, Check, Sparkle, Heart, MoonStars,
  HandsPraying, Coffee, SlidersHorizontal, MagnifyingGlassPlus
} from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';

const MOOD_OPTIONS = [
  { label: 'Apaixonada(o) ₊˚⊹♡', icon: Heart },
  { label: 'Brilhando com glitter ✨', icon: Sparkle },
  { label: 'Em paz & gratidão 🕊️', icon: HandsPraying },
  { label: 'Sonhadora & Mágica 🌙', icon: MoonStars },
  { label: 'Focada(o) no café ☕', icon: Coffee }
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [moodStatus, setMoodStatus] = useState('');
  const [activeTheme, setActiveTheme] = useState('dark-romantic');

  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setMoodStatus(user.moodStatus || '');
      setActiveTheme(user.theme || theme || 'dark-romantic');
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageObjRef.current;
    if (!img) return;

    ctx.clearRect(0, 0, 400, 400);
    const minDim = Math.min(img.width, img.height);
    const cropSize = minDim / zoom;
    const sx = (img.width - cropSize) / 2;
    const sy = (img.height - cropSize) / 2;

    ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, 400, 400);
  }, [imageSrc, zoom]);

  if (!isOpen || !user) return null;

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageObjRef.current = img;
        setImageSrc(reader.result);
        setZoom(1);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveAvatar() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsUploading(true);
    setStatusMsg(null);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsUploading(false);
        return;
      }
      try {
        await uploadAvatar(blob);
        setImageSrc(null);
        setStatusMsg({ type: 'success', text: 'Foto atualizada em WebP!' });
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message || 'Erro ao salvar avatar' });
      } finally {
        setIsUploading(false);
      }
    }, 'image/jpeg', 0.95);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await updateProfile({ displayName, nickname, bio, moodStatus, theme: activeTheme });
      setTheme(activeTheme);
      setStatusMsg({ type: 'success', text: 'Perfil e tema salvos!' });
      setTimeout(onClose, 800);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao salvar perfil' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl my-auto">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <SlidersHorizontal weight="duotone" className="w-5 h-5" />
            <h2 className="text-sm font-bold font-display text-white">Editar Perfil & Foto</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Avatar com Canvas */}
          <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-pink-500/40 overflow-hidden bg-[#18121e] flex items-center justify-center shadow-xl">
                {imageSrc ? (
                  <canvas ref={canvasRef} width={400} height={400} className="w-full h-full object-cover" />
                ) : user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-serif text-pink-300 font-bold">{user.username === 'mary' ? 'M' : 'L'}</span>
                )}
              </div>

              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg cursor-pointer border-2 border-[#09070f]"
                title="Escolher Foto da Galeria"
              >
                <Camera weight="bold" className="w-3.5 h-3.5" />
                <input id="avatar-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>

            {imageSrc && (
              <div className="w-full max-w-xs space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-300">
                  <span className="flex items-center gap-1">
                    <MagnifyingGlassPlus weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                    Zoom & Enquadramento
                  </span>
                  <span className="font-mono text-pink-300">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={isUploading}
                  className="w-full py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check weight="bold" className="w-3.5 h-3.5" />}
                  <span>Aplicar Foto Recortada</span>
                </button>
              </div>
            )}
          </div>

          {statusMsg && (
            <div className={`p-2 rounded-xl text-xs text-center ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Nome</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Apelido do Casal</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Maricota / Cringinho"
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Status de Humor</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-1.5">
                {MOOD_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = moodStatus === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMoodStatus(opt.label)}
                      className={`px-2 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 border text-left ${
                        isSelected ? 'bg-pink-500/20 border-pink-500 text-pink-200' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon weight={isSelected ? 'fill' : 'duotone'} className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={moodStatus}
                onChange={(e) => setMoodStatus(e.target.value)}
                placeholder="Ou digite seu status personalizado..."
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Bio Afetiva</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Uma mensagem ou frase especial..."
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Tema Visual Dinâmico</label>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTheme(t.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      activeTheme === t.id ? 'border-pink-500 bg-pink-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }} />
                      <span className="text-xs font-semibold font-display text-white">{t.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{t.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-white/5 text-gray-300 text-xs">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check weight="bold" className="w-3.5 h-3.5" />}
                <span>Salvar Perfil & Tema</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
