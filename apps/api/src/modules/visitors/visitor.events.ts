export const VISITOR_ARRIVED = 'visitor.arrived';

export class VisitorArrivedEvent {
  constructor(
    readonly visitorId: string,
    readonly unitId: string,
    readonly name: string,
  ) {}
}
