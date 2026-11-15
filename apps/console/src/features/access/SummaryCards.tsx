import { useAccessSummary } from '../../api/queries';

const ITEMS = [
  { key: 'total', label: 'Acessos hoje', className: 'text-slate-100' },
  { key: 'APPROVED', label: 'Liberados', className: 'text-emerald-400' },
  { key: 'DENIED', label: 'Negados', className: 'text-rose-400' },
  { key: 'EXPIRED', label: 'Expirados', className: 'text-amber-400' },
] as const;

export function SummaryCards() {
  const { data } = useAccessSummary();
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map((item) => (
        <div key={item.key} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className={`mt-1 text-3xl font-bold tabular-nums ${item.className}`}>
            {item.key === 'total' ? (data?.total ?? 0) : (data?.byStatus[item.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  );
}
