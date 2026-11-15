export enum VisitStatus {
  AUTHORIZED = 'AUTHORIZED',
  INSIDE = 'INSIDE',
  LEFT = 'LEFT',
}

export interface Visitor {
  id: string;
  name: string;
  document: string;
  unit: string;
  status: VisitStatus;
  authorizedAt: Date;
  enteredAt?: Date;
  leftAt?: Date;
}
