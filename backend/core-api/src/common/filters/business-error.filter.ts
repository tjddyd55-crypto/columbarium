import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessError } from '../errors/business.error';

@Catch(BusinessError)
export class BusinessErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessErrorFilter.name);

  catch(exception: BusinessError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.statusCode;
    res.status(status).json({
      success: false,
      data: null,
      error: { code: exception.code, message: exception.message },
    });
  }
}
