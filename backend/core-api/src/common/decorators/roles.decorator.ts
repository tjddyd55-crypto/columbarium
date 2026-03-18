import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'SUPER_ADMIN' | 'OPERATOR_ADMIN' | 'SALES_MANAGER' | 'USER';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
