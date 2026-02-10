import { Play, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const style = {
  border: '1px solid rgba(212, 175, 55, 0.2)',
  gold: '#D4AF37',
  muted: '#9A9A9A',
};

const langOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

export default function SubmitPanel({
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  loading,
  runResult,
  submitResult,
  disabled,
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-3 border-t"
      style={{ backgroundColor: 'rgba(20, 20, 25, 0.98)', borderColor: 'rgba(212, 175, 55, 0.1)' }}
    >
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
        style={{
          backgroundColor: 'rgba(15, 15, 20, 0.98)',
          border: style.border,
          color: '#EDEDED',
        }}
      >
        {langOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRun}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          border: style.border,
          color: style.gold,
        }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
        Run
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
        }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Submit
      </button>
      {runResult != null && (
        <div className="flex items-center gap-2 text-sm" style={{ color: runResult.success ? '#22c55e' : '#ef4444' }}>
          {runResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{runResult.success ? 'Sample tests passed' : runResult.errorMessage || 'Sample tests failed'}</span>
        </div>
      )}
      {submitResult != null && (
        <div className="flex items-center gap-2 text-sm" style={{ color: submitResult.accepted ? '#22c55e' : '#ef4444' }}>
          {submitResult.accepted ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>
            {submitResult.accepted
              ? `Accepted (${submitResult.passedTestCases}/${submitResult.totalTestCases})`
              : submitResult.errorMessage || `Wrong (${submitResult.passedTestCases}/${submitResult.totalTestCases})`}
          </span>
        </div>
      )}
    </div>
  );
}
