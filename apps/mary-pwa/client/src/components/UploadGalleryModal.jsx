import React, { useState } from 'react';
import { X, Camera, Plus, Trash, Check, Images, CalendarBlank, FolderPlus } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { compressImageClientSide } from '../services/imageUtils';

export default function UploadGalleryModal({ isOpen, onClose, onUploaded, albums = [] }) {
  const [albumName, setAlbumName] = useState('Nossas Fotos');
  const [customAlbum, setCustomAlbum] = useState('');
  const [isCreatingNewAlbum, setIsCreatingNewAlbum] = useState(false);
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState(() => new Date().toISOString().split('T')[0]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 15 - selectedFiles.length;
    const toAdd = files.slice(0, remaining);

    setSelectedFiles(prev => [...prev, ...toAdd]);
    setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  }

  function handleRemoveFile(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMsg('Selecione pelo menos uma foto para enviar.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      const finalAlbum = isCreatingNewAlbum && customAlbum.trim() ? customAlbum.trim() : albumName;
      formData.append('albumName', finalAlbum);
      formData.append('takenAt', takenAt);
      if (caption.trim()) formData.append('caption', caption.trim());

      for (let i = 0; i < selectedFiles.length; i++) {
        const compressedBlob = await compressImageClientSide(selectedFiles[i], 1800, 0.88);
        formData.append('images', compressedBlob, `photo_${i}.jpg`);
      }

      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao enviar fotos');
      }

      if (onUploaded) onUploaded(data.uploaded);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao processar envio');
    } finally {
      setUploading(false);
    }
  }

  const defaultAlbums = ['Nossas Fotos', 'Prints & Memes', 'Saídas', 'Gatinhos', 'Geral'];
  const allAlbums = Array.from(new Set([...defaultAlbums, ...albums]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl my-auto animate-in fade-in duration-150">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <Images weight="duotone" className="w-5 h-5" />
            <h2 className="text-sm font-bold font-display text-white">Adicionar Fotos à Galeria</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-sans">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1 font-sans">
                <FolderPlus weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                Álbum da Galeria
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewAlbum(!isCreatingNewAlbum)}
                className="text-[10px] text-pink-300 hover:underline font-sans"
              >
                {isCreatingNewAlbum ? 'Escolher existente' : '+ Criar novo álbum'}
              </button>
            </div>

            {isCreatingNewAlbum ? (
              <input
                type="text"
                value={customAlbum}
                onChange={(e) => setCustomAlbum(e.target.value)}
                placeholder="Nome do novo álbum..."
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                required
              />
            ) : (
              <select
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#140e20] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 font-sans"
              >
                {allAlbums.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center gap-1 font-sans">
                <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                Data das Fotos
              </label>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 font-sans">
                Legenda Opcional
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Tarde fofa..."
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1 font-sans">
                <Camera weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                <span>Fotos (Até 15 fotos)</span>
              </label>
              <span className="text-[10px] text-pink-300/80 font-sans">
                {selectedFiles.length}/15 selecionadas
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-pink-500/30 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-all"
                  >
                    <Trash weight="bold" className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 15 && (
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
              disabled={uploading || selectedFiles.length === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-500/25 disabled:opacity-50 font-display"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Check weight="bold" className="w-3.5 h-3.5" />
                  <span>Enviar para a Galeria</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
