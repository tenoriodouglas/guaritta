import { PackageCheck, PackagePlus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import {
  useDeliveries,
  usePickupDelivery,
  useRegisterDelivery,
  useUnitList,
  useUnits,
} from '../../api/queries';
import type { Delivery } from '../../api/types';
import { Button, Card, Empty, ErrorText, Field, Input, Select } from '../../components/ui';
import { formatDateTime, unitLabel } from '../../lib/format';

export function DeliveriesView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <RegisterDelivery />
      <PendingDeliveries />
    </div>
  );
}

function RegisterDelivery() {
  const { data: units = [] } = useUnitList();
  const register = useRegisterDelivery();
  const [form, setForm] = useState({ unitId: '', carrier: '', trackingCode: '', description: '' });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate(
      {
        unitId: form.unitId,
        carrier: form.carrier,
        trackingCode: form.trackingCode || undefined,
        description: form.description || undefined,
      },
      { onSuccess: () => setForm({ ...form, trackingCode: '', description: '' }) },
    );
  };

  return (
    <Card title="Receber encomenda">
      <form onSubmit={submit} className="grid gap-3">
        <Field label="Unidade">
          <Select required value={form.unitId} onChange={set('unitId')}>
            <option value="">Selecione</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {unitLabel(u)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Transportadora">
          <Input
            required
            value={form.carrier}
            onChange={set('carrier')}
            placeholder="Correios, Mercado Livre…"
          />
        </Field>
        <Field label="Código de rastreio">
          <Input value={form.trackingCode} onChange={set('trackingCode')} />
        </Field>
        <Field label="Descrição">
          <Input value={form.description} onChange={set('description')} placeholder="Caixa média" />
        </Field>
        <Button type="submit" disabled={register.isPending}>
          <PackagePlus className="size-4" /> Registrar e notificar morador
        </Button>
        {register.isSuccess && <p className="text-sm text-emerald-400">Encomenda registrada.</p>}
        <ErrorText error={register.error} />
      </form>
    </Card>
  );
}

function PendingDeliveries() {
  const { data = [] } = useDeliveries('RECEIVED');
  const { data: units } = useUnits();
  return (
    <Card title={`Aguardando retirada (${data.length})`}>
      {data.length === 0 ? (
        <Empty>Nenhuma encomenda na portaria.</Empty>
      ) : (
        <ul className="divide-y divide-slate-800">
          {data.map((d) => (
            <DeliveryRow key={d.id} delivery={d} unit={unitLabel(units?.get(d.unitId))} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function DeliveryRow({ delivery, unit }: { delivery: Delivery; unit: string }) {
  const pickup = usePickupDelivery();
  const [name, setName] = useState('');
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div>
        <p className="font-medium">
          {unit} · {delivery.carrier}
        </p>
        <p className="text-xs text-slate-400">
          {delivery.description ?? 'Sem descrição'} · recebida {formatDateTime(delivery.createdAt)}
          {delivery.trackingCode && ` · ${delivery.trackingCode}`}
        </p>
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          pickup.mutate({ id: delivery.id, pickedUpBy: name });
        }}
      >
        <Input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Retirado por"
          className="w-44"
        />
        <Button type="submit" variant="success" disabled={pickup.isPending}>
          <PackageCheck className="size-4" /> Entregar
        </Button>
      </form>
      <ErrorText error={pickup.error} />
    </li>
  );
}
