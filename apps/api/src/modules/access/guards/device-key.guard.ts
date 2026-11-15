import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { Gate } from '../../gates/gates.repository.js';
import { GatesService } from '../../gates/gates.service.js';

export const DEVICE_KEY_HEADER = 'x-device-key';

export type DeviceRequest = Request & { gate?: Gate };

/** Authenticates camera devices by their per-gate API key. */
@Injectable()
export class DeviceKeyGuard implements CanActivate {
  constructor(private readonly gates: GatesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DeviceRequest>();
    const key = request.header(DEVICE_KEY_HEADER);
    const gate = key ? await this.gates.findByDeviceKey(key) : undefined;
    if (!gate) throw new UnauthorizedException('Invalid device key');
    request.gate = gate;
    return true;
  }
}
