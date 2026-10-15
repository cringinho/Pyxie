import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import LoginView from './components/LoginView';
import CoupleHeader from './components/CoupleHeader';
import DailyBibleVerseCard from './components/DailyBibleVerseCard';
import MemoryCard from './components/MemoryCard';
import NewMemoryModal from './components/NewMemoryModal';
import SearchBar from './components/SearchBar';
import BottomNav from './components/BottomNav';
import ProfileModal from './components/ProfileModal';
import StarryCanvas from './components/StarryCanvas';
import PhotoGalleryView from './components/PhotoGalleryView';
import MonthlyRecapView from './components/MonthlyRecapView';
import RelationshipGraphView from './components/RelationshipGraphView';
import SettingsView from './components/SettingsView';
import { initOfflineSync } from './services/offlineStorage';

import {
  initSearchEngine, searchMemories, persistMemoriesToCache, loadMemoriesFromCache
} from './services/searchEngine';
import {
  Sparkle, Plus, Images, ShareNetwork, SlidersHorizontal,
  SignOut, Palette, HeartBreak, NotePencil, Database, ShieldCheck
} from '@phosphor-icons/react';

export default function App() {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [activeTab, setActiveTab] = useState('feed');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewMemoryOpen, setIsNewMemoryOpen] = useState(false);
  const [initialMemoryContent, setInitialMemoryContent] = useState('');

  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(true);

  // Busca e Filtros Instantâneos
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // 1. Carregamento de Relatos (Cache IndexedDB primeiro + Sync API)
  useEffect(() => {
    if (!user) return;

    async function fetchMemories() {
      // Tenta cache offline imediato do IndexedDB
      const cached = await loadMemoriesFromCache();
      if (cached && cached.length > 0) {
        setMemories(cached);
        initSearchEngine(cached);
        setLoadingMemories(false);
      }

      // Sincroniza com o servidor
      try {
        const res = await fetch('/api/memories', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.memories) {
            setMemories(data.memories);
            initSearchEngine(data.memories);
            persistMemoriesToCache(data.memories);
          }
        }
      } catch (err) {
        console.warn('Erro ao sincronizar memórias com servidor:', err);
      } finally {
        setLoadingMemories(false);
      }
    }

    fetchMemories();
  }, [user]);
  // Inicializa ouvinte para sincronização offline em segundo plano
  useEffect(() => {
    initOfflineSync(handleMemoryCreated);
  }, []);


  // 2. Ação de Like Afetivo
  async function handleLike(memoryId, reaction = 'heart') {
    try {
      const res = await fetch(`/api/memories/${memoryId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reaction })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMemories(prev => {
          const updated = prev.map(m => m.id === memoryId ? { ...m, likes: data.likes } : m);
          persistMemoriesToCache(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Erro ao registrar like:', err);
    }
  }

  // 3. Ação de Excluir Relato
  async function handleDeleteMemory(memoryId) {
    if (!window.confirm('Tem certeza que deseja apagar este relato do Universo?')) {
      return;
    }

    try {
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setMemories(prev => {
          const updated = prev.filter(m => m.id !== memoryId);
          initSearchEngine(updated);
          persistMemoriesToCache(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Erro ao deletar relato:', err);
    }
  }

  // 4. Transformar Versículo em Relato
  function handleTransformVerseToMemory(verse) {
    setInitialMemoryContent(`📖 "${verse.text}"\n— ${verse.reference}\n\nO que senti com esta palavra hoje:\n`);
    setIsNewMemoryOpen(true);
  }

  // 5. Novo Relato Criado com Sucesso
  function handleMemoryCreated(newMemory) {
    setMemories(prev => {
      const updated = [newMemory, ...prev];
      initSearchEngine(updated);
      persistMemoriesToCache(updated);
      return updated;
    });
  }
  // 6. Ir direto para um relato a partir de uma foto
  function handleGoToMemory(memoryId) {
    setActiveTab('feed');
    const target = memories.find(m => m.id === memoryId);
    if (target) {
      setSearchQuery(target.title);
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-pink-400 gap-3">
        <Sparkle weight="fill" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium font-sans text-gray-300">Carregando Nosso Universo...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Filtragem com MiniSearch + Chips
  let filteredMemories = searchMemories(searchQuery, memories);

  if (activeFilter === 'photos') {
    filteredMemories = filteredMemories.filter(m => m.media && m.media.length > 0);
  } else if (activeFilter === 'liked') {
    filteredMemories = filteredMemories.filter(m => m.likes && m.likes.length > 0);
  } else if (activeFilter === 'mary') {
    filteredMemories = filteredMemories.filter(m => m.author?.username === 'mary');
  } else if (activeFilter === 'leh') {
    filteredMemories = filteredMemories.filter(m => m.author?.username === 'leh');
  }

  const words = [
    { word: 'Cringinho', color: '#8B5CF6' },
    { word: 'Maricota', color: '#EC4899' },
    { word: 'Besties', color: '#F43F5E' },
    { word: 'Promessa de Dedinho', color: '#A855F7' },
    { word: 'Boleta Rodante', color: '#F59E0B' },
    { word: 'Kuromi', color: '#9333EA' },
    { word: 'Cinnamoroll', color: '#38BDF8' },
    { word: 'Meu Amor', color: '#E11D48' },
    { word: 'Protagonistas', color: '#10B981' }
  ];

  return (
    <div className="min-h-screen relative flex flex-col pb-24 selection:bg-pink-500 selection:text-white">
      <StarryCanvas />
      <CoupleHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        {/* ABA 1: Início & Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card de Versículo Bíblico Diário da Mary */}
            <DailyBibleVerseCard onTransformToMemory={handleTransformVerseToMemory} />

            {/* Barra de Pesquisa Instantânea + Botão de Criar Relato */}
            <div className="glass-panel p-4 rounded-3xl border border-pink-500/20 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    totalCount={filteredMemories.length}
                  />
                </div>

                <button
                  onClick={() => {
                    setInitialMemoryContent('');
                    setIsNewMemoryOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/25 shrink-0 transition-all font-display"
                  title="Criar novo relato com fotos"
                >
                  <Plus weight="bold" className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo Relato</span>
                </button>
              </div>
            </div>

            {/* Lista da Timeline de Relatos */}
            {loadingMemories ? (
              <div className="py-12 text-center text-xs text-gray-400 font-sans flex items-center justify-center gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-pink-400 animate-spin" />
                <span>Carregando relatos do nosso universo...</span>
              </div>
            ) : filteredMemories.length > 0 ? (
              <div className="space-y-6">
                {filteredMemories.map((m) => (
                  <MemoryCard
                    key={m.id}
                    memory={m}
                    onLike={handleLike}
                    onDelete={handleDeleteMemory}
                    onTagClick={(tag) => setSearchQuery(tag)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-10 rounded-3xl border border-pink-500/20 text-center space-y-3">
                <HeartBreak weight="duotone" className="w-10 h-10 text-pink-400/60 mx-auto" />
                <h3 className="text-base font-bold font-display text-white">Nenhum relato encontrado</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans">
                  {searchQuery || activeFilter !== 'all'
                    ? 'Nenhum momento coincide com os filtros da busca. Tente buscar por outros termos!'
                    : 'Nosso feed ainda está limpinho! Que tal gravar a primeira memória juntos com fotos do dia?'}
                </p>
                <button
                  onClick={() => setIsNewMemoryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                  <span>Gravar Primeiro Relato</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABA 2: Galeria */}
        {activeTab === 'gallery' && (
          <PhotoGalleryView onGoToMemory={handleGoToMemory} />
        )}

        {/* ABA 3: Grafo & Palavras */}
        {activeTab === 'graph' && (
          <RelationshipGraphView onGoToMemory={handleGoToMemory} />
        )}

        {/* ABA 4: Recap Mensal */}
        {activeTab === 'recap' && (
          <MonthlyRecapView onGoToMemory={handleGoToMemory} />
        )}

        {/* ABA 5: Ajustes */}
        {activeTab === 'settings' && (
          <SettingsView onOpenProfile={() => setIsProfileOpen(true)} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NewMemoryModal
        isOpen={isNewMemoryOpen}
        onClose={() => {
          setIsNewMemoryOpen(false);
          setInitialMemoryContent('');
        }}
        onCreated={handleMemoryCreated}
        existingMemories={memories}
        initialContent={initialMemoryContent}
      />
    </div>
  );
}
