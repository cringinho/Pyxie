import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, ExternalLink, Tag } from 'lucide-react';

export default function ShopeeBentoGrid({ t, lang }) {
  const [items, setItems] = useState([]);

  // Curated fallback products in dark-kawaii style
  const defaultItems = [
    {
      id: 'sh-01',
      titulo: 'Pelúcia Kuromi Gótica 30cm com Asas de Morcego',
      titulo_en: 'Gothic Kuromi 30cm Plush with Bat Wings',
      preco: 'R$ 49,90',
      preco_en: '$9.90',
      tag: 'Mais Vendido',
      tag_en: 'Best Seller',
      link: '/promo',
      imagem: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=500',
    },
    {
      id: 'sh-02',
      titulo: 'Mousepad Gamer Extra Grande Roxo & Rosa Estelar',
      titulo_en: 'XXL Starry Purple & Pink Gaming Mousepad',
      preco: 'R$ 38,50',
      preco_en: '$7.80',
      tag: 'Setup Aesthetic',
      tag_en: 'Setup Aesthetic',
      link: '/promo',
      imagem: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
    },
    {
      id: 'sh-03',
      titulo: 'Luminária de Lua Mística RGB com Controle',
      titulo_en: 'Mystic Lunar RGB Lamp with Remote',
      preco: 'R$ 54,90',
      preco_en: '$11.20',
      tag: 'Iluminação',
      tag_en: 'Lighting',
      link: '/promo',
      imagem: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
    },
    {
      id: 'sh-04',
      titulo: 'Kit Papelaria Mágica & Canetas Néon Pastel',
      titulo_en: 'Magical Stationery & Pastel Neon Pen Set',
      preco: 'R$ 29,90',
      preco_en: '$5.90',
      tag: 'Papelaria',
      tag_en: 'Stationery',
      link: '/promo',
      imagem: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500',
    },
  ];

  useEffect(() => {
    fetch('/api/shopee/showcase')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items.slice(0, 4));
        } else {
          setItems(defaultItems);
        }
      })
      .catch(() => {
        setItems(defaultItems);
      });
  }, []);

  const isPt = lang === 'pt';

  return (
    <section className="py-16 md:py-24 border-t border-purple-500/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Setup & Lifestyle</span>
          </div>
          <h2 className="font-title font-black text-3xl sm:text-4xl text-white tracking-tight">
            {t('shopee.title')}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2">
            {t('shopee.subtitle')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const title = isPt ? item.titulo : (item.titulo_en || item.titulo);
            const price = isPt ? item.preco : (item.preco_en || item.preco);
            const tag = isPt ? item.tag : (item.tag_en || item.tag);

            return (
              <a
                key={item.id || idx}
                href={item.link || '/promo'}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between overflow-hidden"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-4 bg-purple-950/40">
                  <img
                    src={item.imagem}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-pink-400" />
                    <span>{tag}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-title font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-500/15">
                    <span className="font-title font-black text-lg text-amber-300">
                      {price}
                    </span>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1">
                      {t('shopee.cta')}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
