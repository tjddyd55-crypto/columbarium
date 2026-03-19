import { SetMetadata } from '@nestjs/common';

/** 비밀번호 변경 의무가 있어도 접근 허용 (예: POST /auth/change-password) */
export const ALLOW_PENDING_PASSWORD_CHANGE_KEY = 'allowPendingPasswordChange';

export const AllowPendingPasswordChange = () =>
  SetMetadata(ALLOW_PENDING_PASSWORD_CHANGE_KEY, true);
