import { LogIn, LogOut } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useGates, useManualRelease, useUnits, useVisitors } from '../../api/queries';
import type { Direction, Visitor } from '../../api/types';
import { Badge, Button, Card, Empty, ErrorText, Field, Select } from '../../components/ui';
import { formatDateTime, formatPlate, unitLabel } from '../../lib/format';

/** Expected and present visitors; release goes through the audited manual access flow. */
export function VisitorsView() {
  const { data: gates = [] } = useGates();
  const [gateId, setGateId] = useState('');
  const release = useManualRelease();

  const act = (visitor: Visitor, direction: Direction) =>
    release.mutate({ gateId, direction, visitorId: visitor.id, note: `Visitante ${visitor.name}` });

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Portão / catraca para liberação">
            <Select value={gateId} onChange={(e) => setGateId(e.target.value)} className="w-72">
              <option value="">Selecione</option>
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <ErrorText error={release.error} />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <VisitorList
          title="Esperados"
          status="AUTHORIZED"
          action={(v) => (
            <Button variant="success" disabled={!gateId || release.isPending} onClick={() => act(v, 'IN')}>
              <LogIn className="size-4" /> Liberar entrada
            </Button>
          )}
        />
        <VisitorList
          title="No condomínio"
          status="INSIDE"
          action={(v) => (
            <Button variant="ghost" disabled={!gateId || release.isPending} onClick={() => act(v, 'OUT')}>
              <LogOut className="size-4" /> Liberar saída
            </Button>
          )}
        />
      </div>
    </div>
  );
}

function VisitorList({
  title,
  status,
  action,
}: {
  title: string;
  status: Visitor['status'];
  action: (visitor: Visitor) => ReactNode;
}) {
  const { data = [] } = useVisitors(status);
  const { data: units } = useUnits();
  return (
    <Card title={`${title} (${data.length})`}>
      {data.length === 0 ? (
        <Empty>Nenhum visitante.</Empty>
      ) : (
        <ul className="divide-y divide-slate-800">
          {data.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-xs text-slate-400">
                  Unidade {unitLabel(units?.get(v.unitId))} · válido até {formatDateTime(v.validUntil)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {v.plate && <Badge tone="sky">{formatPlate(v.plate)}</Badge>}
                {action(v)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
