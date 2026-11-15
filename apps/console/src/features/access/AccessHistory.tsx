import { useState } from 'react';
import { useAccessHistory } from '../../api/queries';
import type { AccessStatus, Gate, Unit } from '../../api/types';
import { Badge, Card, Empty, Input } from '../../components/ui';
import { formatPlate, formatTime, statusLabel, subjectLabel, unitLabel } from '../../lib/format';

const STATUS_TONE: Record<AccessStatus, 'green' | 'red' | 'amber' | 'sky'> = {
  APPROVED: 'green',
  DENIED: 'red',
  EXPIRED: 'amber',
  PENDING: 'sky',
};

export function AccessHistory({ gates, units }: { gates: Map<string, Gate>; units?: Map<string, Unit> }) {
  const [plate, setPlate] = useState('');
  // Only query by plate once it is complete.
  const { data = [] } = useAccessHistory(plate.length === 7 ? plate : undefined);

  return (
    <Card
      title="Histórico"
      actions={
        <Input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="Filtrar por placa"
          maxLength={7}
          className="w-44"
        />
      }
    >
      {data.length === 0 ? (
        <Empty>Nenhum registro.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Hora</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Unidade</th>
                <th>Portão</th>
                <th>Origem</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 tabular-nums">{formatTime(r.createdAt)}</td>
                  <td className="font-mono">{formatPlate(r.plateRead)}</td>
                  <td>{subjectLabel[r.subject]}</td>
                  <td>{unitLabel(r.unitId ? units?.get(r.unitId) : undefined)}</td>
                  <td>{gates.get(r.gateId)?.name ?? '—'}</td>
                  <td>{r.source === 'LPR' ? 'Câmera' : 'Manual'}</td>
                  <td>
                    <Badge tone={STATUS_TONE[r.status]}>{statusLabel[r.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
