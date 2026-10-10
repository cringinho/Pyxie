import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, ExternalLink, Tag } from 'lucide-react';

export default function ShopeeBentoGrid({ t, lang }) {
  const [items, setItems] = useState([]);

  // Curated products in dark-kawaii / Sanrio / Goth aesthetic with matching Shopee images
  const defaultItems = [
    {
      id: '23798670825',
      titulo: 'Kuromi Sanrio Boneca de pelúcia fofa 25cm Kuromi Sanrio',
      titulo_en: 'Kuromi Sanrio 25cm Cute Plush Doll',
      preco: 'R$ 55,99',
      preco_en: '$10.77',
      tag: 'Pelúcia Sanrio',
      tag_en: 'Sanrio Plush',
      link: 'https://s.shopee.com.br/1BMdNQEU79',
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-mbe0k65jvlov9d',
    },
    {
      id: '58265449372',
      titulo: 'Camiseta Feminina Premium Hello Kitty Kuromi 100% Algodão',
      titulo_en: 'Premium Hello Kitty Kuromi 100% Cotton Women T-Shirt',
      preco: 'R$ 34,90',
      preco_en: '$6.71',
      tag: 'Moda & Estilo',
      tag_en: 'Fashion & Goth',
      link: 'https://s.shopee.com.br/1AfzHIvTw',
      imagem: 'https://down-br.img.susercontent.com/file/sg-11134201-8257t-mrez4efi09vpc3',
    },
    {
      id: '28812198611',
      titulo: 'EEBR Vintage Goth Espinhos Casal Anéis Para Homens Mulheres',
      titulo_en: 'Vintage Goth Thorn Couple Rings for Men & Women',
      preco: 'R$ 12,06',
      preco_en: '$2.32',
      tag: 'Acessório Goth',
      tag_en: 'Goth Jewelry',
      link: 'https://s.shopee.com.br/LnWNtHeo2',
      imagem: 'https://down-br.img.susercontent.com/file/sg-11134201-7rdy7-m0j7wbk9ta7y39',
    },
    {
      id: '58212898323',
      titulo: 'Anel gótico camafeu roxo pedra roxa oval moldura ornamental',
      titulo_en: 'Gothic Purple Cameo Ring with Oval Stone',
      preco: 'R$ 29,90',
      preco_en: '$5.75',
      tag: 'Acessório Goth',
      tag_en: 'Goth Jewelry',
      link: 'https://s.shopee.com.br/W6waCH1T5',
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-820ly-mppd70swjy81c9',
    },
  ];

  useEffect(() => {
    fetch('/api/showcase')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items.slice(0, 4));
        } else {
          setItems(defaultItems);
        }
      })
      .catch(() => {
        fetch('/api/shopee/showcase')
          .then((res) => res.json())
          .then((st) => {
            if (st && st.success && Array.isArray(st.items) && st.items.length > 0) {
              setItems(st.items.slice(0, 4));
            } else {
              setItems(defaultItems);
            }
          })
          .catch(() => setItems(defaultItems));
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
