import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected internal server error occurred';

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
      errorCode = `HTTP_${status}`;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, any>;
      errorMessage = Array.isArray(resp.message) ? resp.message.join(', ') : resp.message || errorMessage;
      errorCode = resp.error || `HTTP_${status}`;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    const errorPayload = {
      success: false,
      statusCode: status,
      errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] || undefined
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception)
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Message: ${errorMessage}`);
    }

    response.status(status).json(errorPayload);
  }
}
