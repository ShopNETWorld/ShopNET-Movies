import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    request.headers['x-request-id'] = requestId;
    response.setHeader('x-request-id', requestId);

    const startTime = Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const latency = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(`[${requestId}] ${method} ${url} ${statusCode} +${latency}ms`);
        },
        error: () => {
          const latency = Date.now() - startTime;
          this.logger.warn(`[${requestId}] ${method} ${url} FAILED +${latency}ms`);
        }
      })
    );
  }
}
