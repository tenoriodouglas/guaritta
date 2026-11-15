export const DELIVERY_RECEIVED = 'delivery.received';

export class DeliveryReceivedEvent {
  constructor(
    readonly deliveryId: string,
    readonly unitId: string,
    readonly carrier: string,
  ) {}
}
