import { DoorOpen } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useGates, useManualRelease, useUnitList } from '../../api/queries';
import type { Direction } from '../../api/types';
import { Button, Card, ErrorText, Field, Input, Select } from '../../components/ui';
import { unitLabel } from '../../lib/format';

/** Operator-initiated release: intercom calls, pedestrians, camera failures. */
export function ManualRelease() {
  const { data: gates = [] } = useGates();
  const { data: units = [] } = useUnitList();
  const release = useManualRelease();
  const [gateId, setGateId] = useState('');
  const [direction, setDirection] = useState<Direction>('IN');
  const [plate, setPlate] = useState('');
  const [unitId, setUnitId] = useState('');
  const [note, setNote] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    release.mutate(
      { gateId, direction, plate: plate || undefined, unitId: unitId || undefined, note: note || undefined },
      { onSuccess: () => (setPlate(''), setNote('')) },
    );
  };

  return (
    <Card title="Liberação manual">
      <form onSubmit={submit} className="grid gap-3">
        <Field label="Portão / catraca">
          <Select required value={gateId} onChange={(e) => setGateId(e.target.value)}>
            <option value="">Selecione</option>
            {gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sentido">
            <Select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
            </Select>
          </Field>
          <Field label="Placa (opcional)">
            <Input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} maxLength={8} />
          </Field>
        </div>
        <Field label="Unidade (opcional)">
          <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">—</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {unitLabel(u)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Motivo">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: morador pelo interfone"
          />
        </Field>
        <Button type="submit" disabled={!gateId || release.isPending}>
          <DoorOpen className="size-4" /> Abrir
        </Button>
        {release.isSuccess && <p className="text-sm text-emerald-400">Acesso liberado.</p>}
        <ErrorText error={release.error} />
      </form>
    </Card>
  );
}
