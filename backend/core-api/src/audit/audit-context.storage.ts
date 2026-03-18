import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContextData {
  requestId: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContextData>();

export function getAuditContext(): AuditContextData | undefined {
  return auditContextStorage.getStore();
}
