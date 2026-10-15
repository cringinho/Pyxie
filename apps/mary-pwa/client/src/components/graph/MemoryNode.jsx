import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpenText, Sparkle } from '@phosphor-icons/react';

function MemoryNode({ data, selected }) {
  const isMary = data.authorUsername === 'mary';
  const borderColor = isMary ? '#EC4899' : '#9333EA';

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 rounded-2xl p-2.5 backdrop-blur-xl border ${
        selected
          ? 'scale-110 shadow-2xl bg-black/90'
          : 'hover:scale-105 bg-[#120b1e]/85'
      }`}
      style={{
        borderColor: selected ? '#F59E0B' : borderColor,
        boxShadow: selected
          ? '0 0 25px rgba(245, 158, 11, 0.6)'
          : `0 0 15px ${borderColor}33`
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-pink-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-pink-400 !border-0" />

      <div className="flex items-center gap-2.5 max-w-[200px]">
        {/* Foto da Memória ou Ícone */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 flex items-center justify-center">
          {data.thumbUrl ? (
            <img src={data.thumbUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookOpenText weight="duotone" className="w-5 h-5 text-pink-400" />
          )}
        </div>

        {/* Título & Data */}
        <div className="overflow-hidden space-y-0.5">
          <p className="text-[11px] font-bold font-display text-white truncate leading-tight">
            {data.title}
          </p>
          <div className="flex items-center gap-1 text-[9px] text-pink-300/80 font-sans">
            <span>{data.memoryDate}</span>
            {data.mood && <span className="text-gray-400">• {data.mood.slice(0, 8)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(MemoryNode);
