export enum DeliveryStatus {
  RECEIVED = 'RECEIVED',
  PICKED_UP = 'PICKED_UP',
}

export interface Delivery {
  id: string;
  unit: string;
  carrier: string;
  description?: string;
  status: DeliveryStatus;
  receivedAt: Date;
  pickedUpAt?: Date;
  pickedUpBy?: string;
}
