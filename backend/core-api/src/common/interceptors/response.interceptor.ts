import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BusinessError } from '../errors/business.error';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data ?? null,
        error: null,
      })),
      catchError((err) => {
        if (err instanceof BusinessError) {
          context.switchToHttp().getResponse().status(err.statusCode);
          return of({
            success: false,
            data: null,
            error: { code: err.code, message: err.message },
          });
        }
        const status = err.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        context.switchToHttp().getResponse().status(status);
        return of({
          success: false,
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: err.message ?? '서버 오류가 발생했습니다.',
          },
        });
      }),
    );
  }
}
