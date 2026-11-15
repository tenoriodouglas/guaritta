import { IsIn, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

export type GateKind = 'TURNSTILE' | 'VEHICLE_GATE' | 'DOOR';
export type GateDriverType = 'SIMULATED' | 'HTTP_RELAY';

export class CreateGateDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsIn(['TURNSTILE', 'VEHICLE_GATE', 'DOOR'])
  kind: GateKind;

  @IsOptional()
  @IsIn(['SIMULATED', 'HTTP_RELAY'])
  driver?: GateDriverType;

  /** Relay URL called to open the gate; required for HTTP_RELAY. */
  @ValidateIf((o: CreateGateDto) => o.driver === 'HTTP_RELAY')
  @IsUrl({ require_tld: false })
  endpoint?: string;
}
