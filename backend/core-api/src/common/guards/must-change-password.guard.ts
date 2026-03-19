import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from '../decorators/allow-pending-password-change.decorator';

/**
 * JWT 인증 후, mustChangePassword 인 사용자는 비밀번호 변경 API 외 요청을 차단한다.
 * (프론트 강제 이동과 함께 API 레벨 최소 방어)
 */
@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_PASSWORD_CHANGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowPending) return true;

    const req = context.switchToHttp().getRequest<{ user?: { mustChangePassword?: boolean } }>();
    const user = req.user;
    if (!user) return true;

    if (user.mustChangePassword === true) {
      throw new ForbiddenException('비밀번호를 변경한 뒤 이용할 수 있습니다.');
    }
    return true;
  }
}
