import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';

interface PgError {
  code?: string;
  detail?: string;
}

// Postgres SQLSTATE codes translated to HTTP responses.
const PG_STATUS: Record<string, HttpStatus> = {
  '23505': HttpStatus.CONFLICT, // unique_violation
  '23503': HttpStatus.UNPROCESSABLE_ENTITY, // foreign_key_violation
  '22P02': HttpStatus.BAD_REQUEST, // invalid_text_representation
};

/** Maps database constraint errors to HTTP errors; anything else goes to the default handler. */
@Catch()
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    const pgError = this.extractPgError(exception);
    const status = pgError?.code ? PG_STATUS[pgError.code] : undefined;
    if (!status) return super.catch(exception, host);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, message: pgError?.detail ?? 'Database constraint violated' });
  }

  // Drizzle wraps driver errors in `cause`.
  private extractPgError(exception: unknown): PgError | undefined {
    const candidate = exception as ({ cause?: PgError } & PgError) | undefined;
    if (candidate?.cause?.code) return candidate.cause;
    if (candidate?.code) return candidate;
    return undefined;
  }
}
