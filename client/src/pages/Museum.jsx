import React, { useEffect, useState } from 'react';
import { Sparkles, Search, User, Calendar, Trash2, Edit3, X, ExternalLink, ShieldAlert } from 'lucide-react';

export default function Museum({ t, lang }) {
  const [arts, setArts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [selectedArt, setSelectedArt] = useState(null);
  const [editingArt, setEditingArt] = useState(null);
  const [newDesc, setNewDesc] = useState('');
  const [shieldModalOpen, setShieldModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pyxie_admin_token') || '';
    setAdminToken(token);
  }, []);

  const fetchArts = (p = 1, user = selectedUser) => {
    let url = `/api/museum/arts?page=${p}&limit=12`;
    if (user) url += `&user=${encodeURIComponent(user)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setArts(data.arts || []);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchArts(1);
  }, [selectedUser]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente remover esta arte da galeria?')) return;
    try {
      const res = await fetch(`/api/museum/art/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (data.success) {
        fetchArts(page);
      } else {
        alert('Falha ao remover arte.');
      }
    } catch (_) {
      alert('Erro na requisição.');
    }
  };

  const handleEditSave = async () => {
    if (!editingArt) return;
    try {
      const res = await fetch(`/api/museum/art/${editingArt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ description: newDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingArt(null);
        fetchArts(page);
      } else {
        alert('Falha ao salvar descrição.');
      }
    } catch (_) {
      alert('Erro na requisição.');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Fórum de Artes & Criações</span>
        </div>
        <h1 className="font-title font-black text-4xl sm:text-5xl text-white tracking-tight">
          Museu Virtual da Comunidade
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2">
          Explore as ilustrações, pinturas e criações dos membros da Pyxie em alta resolução.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-10 p-4 rounded-2xl glass-panel border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por ID de Autor..."
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Página {page} de {totalPages}</span>
        </div>
      </div>

      {/* Arts Grid with Art-Shield */}
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setShieldModalOpen(true);
        }}
        className="art-shield grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {arts.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArt(art)}
            className="group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-purple-950/40 mb-3">
              <img
                src={art.imageUrl}
                alt={art.author || 'Arte da Comunidade'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30">
                ✦ {art.id}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-title font-bold text-sm text-pink-300">
                  @{art.author}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(art.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                {art.description || 'Obra sem descrição.'}
              </p>

              {/* Admin Moderation Controls */}
              {adminToken && (
                <div className="pt-2 border-t border-purple-500/15 flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingArt(art);
                      setNewDesc(art.description || '');
                    }}
                    className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/40"
                    title="Editar descrição"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(art.id, e)}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40"
                    title="Remover arte"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-12">
          <button
            disabled={page <= 1}
            onClick={() => fetchArts(page - 1)}
            className="px-5 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-bold text-slate-300 disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchArts(page + 1)}
            className="px-5 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-bold text-slate-300 disabled:opacity-30"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Edit Description Modal */}
      {editingArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl glass-panel border border-purple-500/40 p-6 space-y-4">
            <h3 className="font-title font-bold text-lg text-white">Editar Descrição da Obra</h3>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-white/5 border border-purple-500/25 text-xs text-white outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingArt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white shadow-neon-pink"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Art Inspection Modal */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <img
                src={selectedArt.imageUrl}
                alt={selectedArt.author}
                className="w-full h-80 object-cover rounded-2xl border border-purple-500/30 pointer-events-none select-none"
              />
              <div className="space-y-4 text-left">
                <span className="text-xs font-mono font-bold text-pink-400">@{selectedArt.author}</span>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedArt.description}</p>
                <div className="text-xs text-purple-300/80">
                  {new Date(selectedArt.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anti-copy Right Click Alert */}
      {shieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center space-y-4">
            <ShieldAlert className="w-8 h-8 text-pink-400 mx-auto" />
            <h4 className="font-title font-bold text-xl text-white">Proteção Visual .art-shield</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Esta obra é de propriedade visual dos membros da comunidade Pyxie. O download direto está desativado para proteger os artistas.
            </p>
            <button
              onClick={() => setShieldModalOpen(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
