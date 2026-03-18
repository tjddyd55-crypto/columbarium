import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessError } from '../errors/business.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const requestId = (req as any).requestId ?? 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = '서버 오류가 발생했습니다.';

    if (exception instanceof BusinessError) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      code = status === 401 ? 'AUTH_INVALID' : status === 403 ? 'PERMISSION_DENIED' : 'HTTP_ERROR';
      message = typeof resp === 'object' && resp && 'message' in resp
        ? (Array.isArray((resp as any).message) ? (resp as any).message[0] : (resp as any).message)
        : exception.message;
    } else if (exception instanceof Error) {
      this.logger.error(
        JSON.stringify({
          level: 'error',
          requestId,
          code: 'INTERNAL_ERROR',
          message: exception.message,
          stack: exception.stack,
        }),
      );
    }

    if (status >= 500) {
      this.logger.warn(
        JSON.stringify({
          level: 'warn',
          requestId,
          code,
          status,
          endpoint: req.method + ' ' + req.url,
        }),
      );
    }

    res.setHeader('X-Request-Id', requestId);
    res.status(status).json({
      success: false,
      data: null,
      error: { code, message, requestId },
    });
  }
}
