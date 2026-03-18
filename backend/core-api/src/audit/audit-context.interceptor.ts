import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { auditContextStorage } from './audit-context.storage';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const requestId =
      (req.headers['x-request-id'] as string) || randomUUID();
    req.requestId = requestId;
    const user = req.user;
    const store = {
      requestId,
      userId: user?.id,
      userRole: user?.role,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.get?.('user-agent'),
    };
    return new Observable((subscriber) => {
      auditContextStorage.run(store, () => {
        next.handle().subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
