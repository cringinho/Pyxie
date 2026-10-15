import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkle, Heart, Star, Cloud, Crown, Cat, Handshake } from '@phosphor-icons/react';

const ICON_MAP = {
  Sparkles: Sparkle,
  Sparkle: Sparkle,
  Heart: Heart,
  Star: Star,
  Cloud: Cloud,
  Crown: Crown,
  Cat: Cat,
  Handshake: Handshake
};

function WordNode({ data, selected }) {
  const Icon = ICON_MAP[data.iconName] || Sparkle;
  const count = data.count || 0;
  const baseColor = data.color || '#EC4899';

  // O tamanho escala sutilmente com a frequência da palavra nos relatos
  const scale = count >= 10 ? 1.25 : count >= 5 ? 1.12 : count >= 2 ? 1.05 : 1;

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 rounded-2xl px-3.5 py-2 backdrop-blur-xl border flex items-center gap-2 ${
        selected ? 'shadow-2xl scale-125' : 'hover:scale-110'
      }`}
      style={{
        transform: `scale(${scale})`,
        backgroundColor: `${baseColor}22`,
        borderColor: baseColor,
        boxShadow: selected
          ? `0 0 30px ${baseColor}, 0 0 10px #FFFFFF`
          : `0 0 16px ${baseColor}66`
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-pink-400 !border-0" />

      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
        style={{ backgroundColor: `${baseColor}44`, color: baseColor }}
      >
        <Icon weight="duotone" className="w-4 h-4" />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-bold font-display text-white tracking-wide leading-tight">
          {data.word}
        </span>
        <span className="text-[9px] font-sans font-semibold text-pink-200/80">
          {count} {count === 1 ? 'menção' : 'menções'}
        </span>
      </div>
    </div>
  );
}

export default memo(WordNode);
