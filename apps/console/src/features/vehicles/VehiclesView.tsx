import { Ban, CircleCheck, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ApiError } from '../../api/client';
import { useGates, useSetVehicleStatus, useUnits, useVehicleByPlate } from '../../api/queries';
import { Badge, Button, Card, Empty, ErrorText, Input } from '../../components/ui';
import { formatPlate, unitLabel } from '../../lib/format';
import { AccessHistory } from '../access/AccessHistory';

/** Plate lookup (legacy or Mercosul) with block/unblock. */
export function VehiclesView() {
  const [plate, setPlate] = useState('');
  const { data: vehicle, error, isFetching } = useVehicleByPlate(plate);
  const { data: units } = useUnits();
  const { data: gateList = [] } = useGates();
  const gates = useMemo(() => new Map(gateList.map((g) => [g.id, g])), [gateList]);
  const setStatus = useSetVehicleStatus();
  const notFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="grid gap-4">
      <Card title="Consultar veículo">
        <div className="relative max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-slate-500" />
          <Input
            autoFocus
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="ABC1D23 ou ABC1234"
            maxLength={7}
            className="pl-9 font-mono tracking-widest"
          />
        </div>
        <div className="mt-4">
          {plate.length < 7 ? (
            <Empty>Digite a placa completa.</Empty>
          ) : isFetching ? (
            <Empty>Buscando…</Empty>
          ) : notFound ? (
            <Empty>Veículo não cadastrado.</Empty>
          ) : vehicle ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 p-4">
              <div className="grid gap-1">
                <span className="font-mono text-2xl font-bold tracking-widest">
                  {formatPlate(vehicle.plate)}
                </span>
                <span className="text-sm text-slate-400">
                  {[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' · ') ||
                    'Sem descrição'}
                </span>
                <span className="text-sm">Unidade {unitLabel(units?.get(vehicle.unitId))}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={vehicle.status === 'ACTIVE' ? 'green' : 'red'}>
                  {vehicle.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                </Badge>
                {vehicle.status === 'ACTIVE' ? (
                  <Button
                    variant="danger"
                    onClick={() => setStatus.mutate({ id: vehicle.id, status: 'BLOCKED' })}
                  >
                    <Ban className="size-4" /> Bloquear
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => setStatus.mutate({ id: vehicle.id, status: 'ACTIVE' })}
                  >
                    <CircleCheck className="size-4" /> Desbloquear
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ErrorText error={error} />
          )}
          <ErrorText error={setStatus.error} />
        </div>
      </Card>
      <AccessHistory gates={gates} units={units} />
    </div>
  );
}
