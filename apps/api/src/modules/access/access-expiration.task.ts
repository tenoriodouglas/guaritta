import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AccessService } from './access.service.js';

/** Expires pending requests nobody acted on, so stale reads never open a gate. */
@Injectable()
export class AccessExpirationTask {
  private readonly logger = new Logger(AccessExpirationTask.name);

  constructor(private readonly access: AccessService) {}

  @Interval(5_000)
  async run(): Promise<void> {
    try {
      const expired = await this.access.expireOverdue();
      if (expired) this.logger.log(`${expired} access request(s) expired`);
    } catch (error) {
      this.logger.error(`Expiration failed: ${(error as Error).message}`);
    }
  }
}
