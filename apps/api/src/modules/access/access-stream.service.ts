import { Injectable, MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import { ACCESS_DECIDED, ACCESS_REQUESTED, AccessEvent } from './access.events.js';

/** Broadcasts access events to operator consoles via Server-Sent Events. */
@Injectable()
export class AccessStreamService implements OnModuleDestroy {
  private readonly stream = new Subject<MessageEvent>();

  get events(): Observable<MessageEvent> {
    return this.stream.asObservable();
  }

  @OnEvent(ACCESS_REQUESTED)
  onRequested(event: AccessEvent): void {
    this.stream.next({ type: ACCESS_REQUESTED, data: event.request });
  }

  @OnEvent(ACCESS_DECIDED)
  onDecided(event: AccessEvent): void {
    this.stream.next({ type: ACCESS_DECIDED, data: event.request });
  }

  onModuleDestroy(): void {
    this.stream.complete();
  }
}
