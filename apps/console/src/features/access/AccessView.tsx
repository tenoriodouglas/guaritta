import { useMemo } from 'react';
import { useGates, usePendingAccess, useUnits } from '../../api/queries';
import { Card, Empty } from '../../components/ui';
import { AccessHistory } from './AccessHistory';
import { ManualRelease } from './ManualRelease';
import { PendingCard } from './PendingCard';
import { SummaryCards } from './SummaryCards';

export function AccessView() {
  const { data: pending = [], isLoading } = usePendingAccess();
  const { data: gateList = [] } = useGates();
  const { data: units } = useUnits();
  const gates = useMemo(() => new Map(gateList.map((g) => [g.id, g])), [gateList]);
  // Oldest first: closest to expiring.
  const queue = useMemo(() => [...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [pending]);

  return (
    <div className="grid gap-4">
      <SummaryCards />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card title={`Fila de liberação (${queue.length})`}>
          {isLoading ? (
            <Empty>Carregando…</Empty>
          ) : queue.length === 0 ? (
            <Empty>Nenhum acesso aguardando liberação.</Empty>
          ) : (
            <div className="grid gap-3">
              {queue.map((r) => (
                <PendingCard
                  key={r.id}
                  request={r}
                  gate={gates.get(r.gateId)}
                  unit={r.unitId ? units?.get(r.unitId) : undefined}
                />
              ))}
            </div>
          )}
        </Card>
        <ManualRelease />
      </div>
      <AccessHistory gates={gates} units={units} />
    </div>
  );
}
