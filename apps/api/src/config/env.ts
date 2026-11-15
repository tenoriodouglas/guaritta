import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export enum AlprProvider {
  None = 'none',
  PlateRecognizer = 'platerecognizer',
}

export class Env {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  PORT = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN = '8h';

  @IsEnum(AlprProvider)
  ALPR_PROVIDER: AlprProvider = AlprProvider.None;

  @IsOptional()
  @IsString()
  ALPR_API_TOKEN?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  ALPR_MIN_CONFIDENCE = 0.8;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  ACCESS_REQUEST_TTL_SECONDS = 120;
}

// Fails fast on boot when required variables are missing or malformed.
export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw);
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  return env;
}
