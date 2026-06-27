/**
 * Small shared UI primitives for the pattern renderers. They reuse the existing
 * visualizer's look: dark panels, gold (#D4AF37) accent, green for "good",
 * red for "bad", mono labels.
 */

const statusCls = (status, activeFallback) => {
  if (status === 'good') return 'bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80] scale-105 shadow-[0_0_8px_rgba(74,222,128,0.25)]';
  if (status === 'bad') return 'bg-red-500/10 border-red-500 text-red-400 scale-105';
  if (status === 'active') return 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105';
  if (status === 'crossed') return 'bg-[#0A0F16]/40 border-white/[0.03] text-zinc-600 line-through opacity-60';
  return activeFallback || 'bg-[#0A0F16] border-white/[0.05] text-[#E8EDF2]';
};

export function Cell({ label, status, index, size = 'md' }) {
  const dim = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size] || 'w-10 h-10 text-sm';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${dim} flex items-center justify-center font-mono font-bold transition-all duration-300 border ${statusCls(status)}`}>
        {label}
      </div>
      {index !== undefined && <span className="text-[8px] font-mono text-zinc-600">{index}</span>}
    </div>
  );
}

export function Chip({ label, sub, status }) {
  return (
    <div className={`flex flex-col items-center px-2 py-1 border rounded text-center transition-all duration-300 ${statusCls(status, 'bg-[#D4AF37]/5 border-[#D4AF37]/25 text-[#E8EDF2]')}`}>
      <span className="text-[11px] font-bold font-mono leading-tight">{label}</span>
      {sub != null && <span className="text-[8px] font-mono text-zinc-500">{sub}</span>}
    </div>
  );
}

export function Panel({ label, children, className = '' }) {
  return (
    <div className={`w-full max-w-xs bg-[#0A0F16]/60 border border-white/[0.04] p-3 ${className}`}>
      {label && <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 border-b border-white/[0.04] pb-1">{label}</h4>}
      {children}
    </div>
  );
}

export function Scalars({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-3 px-4 w-full max-w-xs justify-around flex-wrap">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{it.label}</span>
          <span className="text-sm font-bold font-mono text-[#D4AF37]">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Label({ children }) {
  return <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 mb-1 block">{children}</span>;
}
