import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const start = Date.now();
    const method = req.method;
    const url = req.url;
    const requestId = (req as any).requestId;
    const userId = (req as any).user?.id;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        this.logger.log(
          JSON.stringify({
            level: 'info',
            requestId,
            userId: userId ?? null,
            method,
            endpoint: url,
            status,
            durationMs: duration,
          }),
        );
      }),
    );
  }
}
