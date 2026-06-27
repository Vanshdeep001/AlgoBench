/**
 * View components for each visualization pattern. Each reads `simulation.input`
 * and the active step `state`, and renders a pattern-appropriate picture. They
 * are intentionally defensive (lots of `?.`/defaults) so a malformed step never
 * throws inside the visualizer.
 */
import { Cell, Chip, Panel, Scalars, Label } from './_ui';

/* ---------------- arrayScanHash ---------------- */
export function ArrayScanHashView({ simulation, step }) {
  const st = step?.state || {};
  const { arr = [], arr2, arrLabel, arr2Label } = simulation.input || {};
  const row = (data, activeIdx, matchIdx, label) => (
    <div className="flex flex-col w-full items-center gap-1">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {data.map((v, i) => (
          <Cell key={i} label={String(v)} index={i}
            status={matchIdx === i ? 'good' : activeIdx === i ? 'active' : undefined} size="sm" />
        ))}
      </div>
    </div>
  );
  return (
    <div className="w-full flex flex-col items-center gap-4">
      {row(arr, st.activeIdx, st.matchIdx, arrLabel)}
      {arr2 && row(arr2, st.active2Idx, undefined, arr2Label)}
      {st.store !== undefined && (
        <Panel label={st.storeLabel || 'Memory'}>
          {st.store.length === 0
            ? <p className="text-[10px] font-mono text-zinc-600 italic py-1">empty</p>
            : <div className="flex flex-wrap gap-1.5">{st.store.map((c, i) => <Chip key={i} {...c} />)}</div>}
        </Panel>
      )}
      {st.result && (
        <Panel label="Result">
          {st.result.length === 0
            ? <p className="text-[10px] font-mono text-zinc-600 italic py-1">empty</p>
            : <div className="flex flex-wrap gap-1.5">{st.result.map((c, i) => <Chip key={i} {...c} status="good" />)}</div>}
        </Panel>
      )}
    </div>
  );
}

/* ---------------- twoPointers ---------------- */
export function TwoPointersView({ simulation, step }) {
  const st = step?.state || {};
  const arr = st.arr || simulation.input?.arr || [];
  const { result } = st;
  return (
    <div className="w-full flex flex-col items-center gap-5">
      {simulation.input?.arrLabel && <Label>{simulation.input.arrLabel}</Label>}
      <div className="flex items-end gap-1.5 flex-wrap justify-center">
        {arr.map((v, i) => {
          const marker = [st.left === i && 'L', st.mid === i && 'M', st.right === i && 'R'].filter(Boolean).join('/');
          const isPtr = st.left === i || st.right === i || st.mid === i;
          const bad = st.mismatch && (st.left === i || st.right === i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="h-4 text-[9px] font-mono font-bold text-amber-400">{marker}</span>
              <Cell label={String(v)} index={i}
                status={bad ? 'bad' : st.swapped && isPtr ? 'active' : isPtr ? 'active' : undefined} size="md" />
            </div>
          );
        })}
      </div>
      {result && (
        <div className="flex flex-col items-center gap-1">
          <Label>result</Label>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {result.map((v, i) => (
              <Cell key={i} label={v == null ? '·' : String(v)} index={i}
                status={st.writeIdx === i ? 'active' : v == null ? undefined : 'good'} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- barsScalarDP ---------------- */
export function BarsScalarView({ simulation, step }) {
  const st = step?.state || {};
  const { arr = [], arrLabel, dpLabel, unit = '' } = simulation.input || {};
  const maxAbs = Math.max(1, ...arr.map((v) => Math.abs(v)));
  return (
    <div className="w-full flex flex-col items-center gap-5">
      {arr.length > 0 && (
        <div className="w-full flex flex-col items-center gap-1">
          {arrLabel && <Label>{arrLabel}</Label>}
          <div className="flex items-end justify-center gap-1.5 h-[120px] border-b border-white/[0.04] pb-1 px-2 flex-wrap">
            {arr.map((v, i) => {
              const inRange = st.rangeStart != null && i >= st.rangeStart && i <= st.activeIdx;
              const active = st.activeIdx === i;
              const h = 18 + (Math.abs(v) / maxAbs) * 90;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-7 flex items-center justify-center font-mono text-[9px] font-bold border transition-all duration-300 ${
                    active ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105'
                      : inRange ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-[#0A0F16] border-white/[0.04] text-zinc-500'}`}
                    style={{ height: `${h}px` }}>
                    {unit}{v}
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600">{i}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {st.dpRow && (
        <div className="flex flex-col items-center gap-1 w-full">
          <Label>{dpLabel || 'dp[i]'}</Label>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {st.dpRow.map((v, i) => (
              <Cell key={i} label={v == null ? '?' : String(v)} index={i}
                status={st.dpActive === i ? 'active' : v == null ? undefined : 'good'} size="sm" />
            ))}
          </div>
        </div>
      )}
      <Scalars items={st.scalars} />
    </div>
  );
}

/* ---------------- binarySearch ---------------- */
export function BinarySearchView({ simulation, step }) {
  const st = step?.state || {};
  if (simulation.input?.numeric || st.numeric) {
    const chips = [{ label: 'lo', value: st.lo }, { label: 'mid', value: st.mid >= 0 ? st.mid : '—' }, { label: 'hi', value: st.hi }];
    return (
      <div className="w-full flex flex-col items-center gap-5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">x = <span className="text-[#E8EDF2] font-bold">{st.x ?? simulation.input?.x}</span></div>
        <div className="flex items-center gap-3">
          {chips.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{c.label}</span>
              <span className={`text-lg font-bold font-mono ${c.label === 'mid' ? 'text-[#D4AF37]' : 'text-[#E8EDF2]'}`}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const { arr = [], target, arrLabel } = simulation.input || {};
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider bg-white/[0.01] border border-white/[0.05] px-3 py-1">
        <span>Target:</span><span className="text-[#D4AF37] font-bold">{target}</span>
      </div>
      {arrLabel && <Label>{arrLabel}</Label>}
      <div className="flex items-end gap-1.5 flex-wrap justify-center">
        {arr.map((v, i) => {
          const inRange = i >= st.lo && i <= st.hi;
          const isMid = st.mid === i;
          const found = st.foundIdx === i;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="h-4 text-[9px] font-mono font-bold text-amber-400">{st.lo === i ? 'lo' : st.hi === i ? 'hi' : ''}</span>
              <Cell label={String(v)} index={i}
                status={found ? 'good' : isMid ? 'active' : inRange ? undefined : 'crossed'} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- digitsMath ---------------- */
export function DigitsMathView({ step }) {
  const st = step?.state || {};
  const tagCls = (s) => s === 'good' ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/5'
    : s === 'bad' ? 'text-red-400 border-red-500/40 bg-red-500/5'
      : s === 'active' ? 'text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10 scale-105'
        : s === 'crossed' ? 'text-zinc-600 border-white/[0.03] line-through opacity-50'
          : 'text-[#E8EDF2] border-white/[0.06] bg-[#0A0F16]';
  return (
    <div className="w-full flex flex-col items-center gap-5">
      {st.display != null && (
        <div className="px-6 py-3 border border-[#D4AF37]/20 bg-[#D4AF37]/5 font-mono text-2xl font-bold text-[#D4AF37] tracking-wider">
          {String(st.display)}
        </div>
      )}
      {st.panels && st.panels.length > 0 && (
        <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-2.5 px-4 justify-around flex-wrap max-w-xs">
          {st.panels.map((p, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{p.label}</span>
              <span className="text-sm font-bold font-mono text-[#E8EDF2]">{p.value}</span>
            </div>
          ))}
        </div>
      )}
      {st.cells && st.cells.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-md">
          {st.cells.map((c, i) => (
            <div key={i} className={`px-2 py-1 min-w-[28px] text-center font-mono text-xs font-bold border transition-all duration-300 ${tagCls(c.status)}`}>
              {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- conversionTable ---------------- */
export function ConversionTableView({ simulation, step }) {
  const st = step?.state || {};
  const { tokens = [], value, table = [], tableLabel, inputLabel } = simulation.input || {};
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        {inputLabel && <Label>{inputLabel}</Label>}
        {tokens.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {tokens.map((c, i) => (
              <Cell key={i} label={String(c)} status={st.activeIdx === i ? 'active' : undefined} size="sm" />
            ))}
          </div>
        ) : (
          <div className="px-4 py-2 border border-white/[0.06] bg-[#0A0F16] font-mono text-lg font-bold text-[#E8EDF2]">{value}</div>
        )}
      </div>

      <div className="flex items-center gap-6 w-full justify-center flex-wrap">
        <div className="flex flex-col items-center bg-[#0A0F16] border border-white/[0.04] px-4 py-2">
          <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">total</span>
          <span className="text-lg font-bold font-mono text-[#D4AF37]">{st.total ?? 0}</span>
        </div>
        {st.built != null && (
          <div className="flex flex-col items-center bg-[#0A0F16] border border-white/[0.04] px-4 py-2">
            <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">built</span>
            <span className="text-lg font-bold font-mono text-[#4ade80]">{st.built || '—'}</span>
          </div>
        )}
      </div>

      <Panel label={tableLabel || 'Mapping'}>
        <div className="grid grid-cols-4 gap-1">
          {table.map((r, i) => (
            <div key={i} className={`flex flex-col items-center border rounded py-1 transition-all ${
              st.activeSym === r.sym ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/[0.04] bg-[#0A0F16]/40'}`}>
              <span className="text-[11px] font-bold font-mono text-[#E8EDF2]">{r.sym}</span>
              <span className="text-[8px] font-mono text-zinc-500">{r.val}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- dpGrid ---------------- */
export function DPGridView({ step }) {
  const st = step?.state || {};
  const grid = st.grid || [];
  return (
    <div className="w-full flex flex-col items-center gap-2">
      {st.colLabels && (
        <div className="flex items-center gap-1 ml-[34px]">
          {st.colLabels.map((l, i) => <span key={i} className="w-8 text-center text-[8px] font-mono text-zinc-600">{l}</span>)}
        </div>
      )}
      {grid.map((rowArr, r) => (
        <div key={r} className="flex items-center gap-1">
          {st.rowLabels && <span className="w-[30px] text-[8px] font-mono text-zinc-500 text-right pr-1">{st.rowLabels[r]}</span>}
          {rowArr.map((v, c) => {
            const active = st.r === r && st.c === c;
            return (
              <div key={c} className={`w-8 h-8 flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${
                active ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-110'
                  : v == null ? 'bg-[#0A0F16]/40 border-white/[0.03] text-zinc-700'
                    : 'bg-[#0A0F16] border-white/[0.06] text-[#E8EDF2]'}`}>
                {v == null ? '·' : v}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------------- gridTraversal ---------------- */
export function GridTraversalView({ step }) {
  const st = step?.state || {};
  const cells = st.cells || [];
  const cls = (s) => s === 'current' ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#D4AF37] scale-110'
    : s === 'visited' ? 'bg-[#4ade80]/15 border-[#4ade80]/60 text-[#4ade80]'
      : s === 'land' ? 'bg-[#0A0F16] border-white/[0.12] text-[#E8EDF2]'
        : 'bg-[#0A0F16]/40 border-white/[0.03] text-zinc-700';
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex flex-col gap-1">
        {cells.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => (
              <div key={c} className={`w-8 h-8 flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${cls(cell.status)}`}>
                {cell.label}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center bg-[#0A0F16] border border-white/[0.04] px-4 py-2">
        <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">islands found</span>
        <span className="text-lg font-bold font-mono text-[#D4AF37]">{st.count ?? 0}</span>
      </div>
    </div>
  );
}

/* ---------------- sortHeap ---------------- */
export function SortHeapView({ simulation, step }) {
  const st = step?.state || {};
  const { arr = [], arrLabel } = simulation.input || {};
  return (
    <div className="w-full flex flex-col items-center gap-5">
      {arrLabel && <Label>{arrLabel}</Label>}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {arr.map((v, i) => (
          <Cell key={i} label={String(v)} index={i} status={st.activeIdx === i ? 'active' : undefined} size="sm" />
        ))}
      </div>
      <Panel label={`Min-heap (top ${st.k ?? ''})`}>
        {(st.heap || []).length === 0
          ? <p className="text-[10px] font-mono text-zinc-600 italic py-1">empty</p>
          : <div className="flex items-center gap-1.5 flex-wrap">
            {st.heap.map((c, i) => <Chip key={i} {...c} sub={i === 0 ? 'min' : undefined} />)}
          </div>}
      </Panel>
    </div>
  );
}
