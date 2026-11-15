import { ArrowDownLeft, ArrowUpRight, Check, Gauge, X } from 'lucide-react';
import { useState } from 'react';
import { useDecideAccess } from '../../api/queries';
import type { AccessRequest, AccessSuggestion, Gate, Unit } from '../../api/types';
import { Badge, Button, ErrorText, Input, cx } from '../../components/ui';
import { useNow } from '../../hooks/useNow';
import { formatPlate, reasonLabel, subjectLabel, suggestionLabel, unitLabel } from '../../lib/format';

const SUGGESTION_STYLE: Record<AccessSuggestion, { tone: 'green' | 'amber' | 'red'; border: string }> = {
  APPROVE: { tone: 'green', border: 'border-emerald-500/50' },
  REVIEW: { tone: 'amber', border: 'border-amber-500/50' },
  DENY: { tone: 'red', border: 'border-rose-500/60' },
};

interface Props {
  request: AccessRequest;
  gate?: Gate;
  unit?: Unit;
}

/** One pending access awaiting operator release, with expiry countdown. */
export function PendingCard({ request, gate, unit }: Props) {
  const now = useNow();
  const decide = useDecideAccess();
  const [note, setNote] = useState('');

  const created = new Date(request.createdAt).getTime();
  const expires = new Date(request.expiresAt).getTime();
  const remaining = Math.max(0, Math.round((expires - now) / 1000));
  const progress = Math.max(0, Math.min(100, ((expires - now) / (expires - created)) * 100));
  const style = SUGGESTION_STYLE[request.suggestion];

  const act = (action: 'approve' | 'deny') =>
    decide.mutate({ id: request.id, action, note: note || undefined });

  return (
    <article className={cx('overflow-hidden rounded-2xl border bg-slate-900', style.border)}>
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-sky-500 transition-[width] duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-4 p-4">
        {request.snapshotUrl && (
          <img
            src={request.snapshotUrl}
            alt="Imagem da câmera"
            className="h-24 w-36 rounded-lg object-cover"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xl font-bold tracking-widest text-slate-900">
              {formatPlate(request.plateRead)}
            </span>
            <Badge tone={style.tone}>Sugestão: {suggestionLabel[request.suggestion]}</Badge>
            <Badge tone="sky">
              {request.direction === 'IN' ? (
                <ArrowDownLeft className="inline size-3" />
              ) : (
                <ArrowUpRight className="inline size-3" />
              )}{' '}
              {request.direction === 'IN' ? 'Entrada' : 'Saída'}
            </Badge>
          </div>
          <p className="text-sm font-medium">{subjectLabel[request.subject]}</p>
          {reasonLabel(request.reason) !== subjectLabel[request.subject] && (
            <p className="text-sm text-slate-400">{reasonLabel(request.reason)}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Unidade: {unitLabel(unit)}</span>
            <span>Portão: {gate?.name ?? '—'}</span>
            {request.confidence !== null && (
              <span className="inline-flex items-center gap-1">
                <Gauge className="size-3" /> {Math.round(request.confidence * 100)}%
              </span>
            )}
            <span className={cx(remaining <= 15 && 'font-semibold text-amber-400')}>
              Expira em {remaining}s
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 p-3">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Observação (opcional)"
          className="min-w-40 flex-1"
          maxLength={255}
        />
        <Button variant="danger" disabled={decide.isPending} onClick={() => act('deny')}>
          <X className="size-4" /> Negar
        </Button>
        <Button variant="success" disabled={decide.isPending} onClick={() => act('approve')}>
          <Check className="size-4" /> Liberar
        </Button>
        <ErrorText error={decide.error} />
      </div>
    </article>
  );
}
