import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, qs } from './client';
import type {
  AccessRequest,
  AccessSummary,
  Delivery,
  Direction,
  Gate,
  Unit,
  Vehicle,
  Visitor,
} from './types';

export const keys = {
  access: ['access'] as const,
  units: ['units'] as const,
  gates: ['gates'] as const,
  visitors: ['visitors'] as const,
  deliveries: ['deliveries'] as const,
  vehicles: ['vehicles'] as const,
};

export function useUnits() {
  return useQuery({
    queryKey: keys.units,
    queryFn: () => api<Unit[]>('/units?limit=200'),
    staleTime: 5 * 60_000,
    select: (units) => new Map(units.map((u) => [u.id, u])),
  });
}

export function useUnitList() {
  return useQuery({
    queryKey: keys.units,
    queryFn: () => api<Unit[]>('/units?limit=200'),
    staleTime: 5 * 60_000,
  });
}

export function useGates() {
  return useQuery({ queryKey: keys.gates, queryFn: () => api<Gate[]>('/gates'), staleTime: 5 * 60_000 });
}

export function usePendingAccess() {
  return useQuery({
    queryKey: [...keys.access, 'pending'],
    queryFn: () => api<AccessRequest[]>('/access/requests?status=PENDING&limit=50'),
    // SSE triggers refetches; polling is only a safety net.
    refetchInterval: 30_000,
  });
}

export function useAccessHistory(plate?: string) {
  return useQuery({
    queryKey: [...keys.access, 'history', plate],
    queryFn: () => api<AccessRequest[]>(`/access/requests${qs({ limit: 30, plate })}`),
  });
}

export function useAccessSummary() {
  return useQuery({
    queryKey: [...keys.access, 'summary'],
    queryFn: () => api<AccessSummary>('/access/summary'),
    refetchInterval: 60_000,
  });
}

export function useDecideAccess() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'deny'; note?: string }) =>
      api<AccessRequest>(`/access/requests/${id}/${action}`, { method: 'POST', json: { note } }),
    onSettled: () => client.invalidateQueries({ queryKey: keys.access }),
  });
}

export interface ManualReleaseInput {
  gateId: string;
  direction: Direction;
  plate?: string;
  unitId?: string;
  visitorId?: string;
  note?: string;
}

export function useManualRelease() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualReleaseInput) =>
      api<AccessRequest>('/access/manual', { method: 'POST', json: input }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.access });
      void client.invalidateQueries({ queryKey: keys.visitors });
    },
  });
}

export function useVisitors(status: Visitor['status']) {
  return useQuery({
    queryKey: [...keys.visitors, status],
    queryFn: () => api<Visitor[]>(`/visitors${qs({ status, limit: 100 })}`),
    refetchInterval: 60_000,
  });
}

export function useDeliveries(status: Delivery['status']) {
  return useQuery({
    queryKey: [...keys.deliveries, status],
    queryFn: () => api<Delivery[]>(`/deliveries${qs({ status, limit: 100 })}`),
  });
}

export function useRegisterDelivery() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { unitId: string; carrier: string; trackingCode?: string; description?: string }) =>
      api<Delivery>('/deliveries', { method: 'POST', json: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.deliveries }),
  });
}

export function usePickupDelivery() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pickedUpBy }: { id: string; pickedUpBy: string }) =>
      api<Delivery>(`/deliveries/${id}/pickup`, { method: 'PATCH', json: { pickedUpBy } }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.deliveries }),
  });
}

export function useVehicleByPlate(plate: string) {
  return useQuery({
    queryKey: [...keys.vehicles, plate],
    queryFn: () => api<Vehicle>(`/vehicles/plate/${encodeURIComponent(plate)}`),
    enabled: plate.length >= 7,
    retry: false,
  });
}

export function useSetVehicleStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Vehicle['status'] }) =>
      api<Vehicle>(`/vehicles/${id}/status`, { method: 'PATCH', json: { status } }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.vehicles }),
  });
}
