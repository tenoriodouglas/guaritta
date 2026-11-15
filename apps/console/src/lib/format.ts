import type { AccessStatus, AccessSubject, AccessSuggestion, Unit } from '../api/types';

export const subjectLabel: Record<AccessSubject, string> = {
  RESIDENT_VEHICLE: 'Veículo de morador',
  VISITOR_VEHICLE: 'Veículo de visitante',
  BLOCKED_VEHICLE: 'Veículo bloqueado',
  UNKNOWN_VEHICLE: 'Veículo não cadastrado',
  VISITOR: 'Visitante',
  PERSON: 'Pedestre',
};

export const suggestionLabel: Record<AccessSuggestion, string> = {
  APPROVE: 'Liberar',
  REVIEW: 'Verificar',
  DENY: 'Negar',
};

export const statusLabel: Record<AccessStatus, string> = {
  PENDING: 'Aguardando',
  APPROVED: 'Liberado',
  DENIED: 'Negado',
  EXPIRED: 'Expirado',
};

const REASON_PT: Record<string, string> = {
  'Registered resident vehicle': 'Veículo cadastrado de morador',
  'Pre-authorized visitor': 'Visitante pré-autorizado',
  'Visitor leaving': 'Visitante saindo',
  'Vehicle is blocked': 'Veículo bloqueado',
  'Unregistered vehicle': 'Veículo não cadastrado',
  'Unregistered vehicle leaving': 'Veículo não cadastrado saindo',
  'Plate could not be read': 'Placa ilegível',
  'Manual release': 'Liberação manual',
};

/** Translates decision-engine reasons (API returns English). */
export function reasonLabel(reason: string): string {
  const [main, ...extra] = reason.split('; ');
  const translated = REASON_PT[main] ?? main;
  return extra.length ? `${translated} · baixa confiança na leitura` : translated;
}

/** "ABC1D23" -> "ABC-1D23" for readability. */
export function formatPlate(plate: string | null | undefined): string {
  if (!plate) return '—';
  return plate.length === 7 ? `${plate.slice(0, 3)}-${plate.slice(3)}` : plate;
}

export function unitLabel(unit: Unit | undefined): string {
  if (!unit) return '—';
  return unit.block ? `${unit.block}-${unit.number}` : unit.number;
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
