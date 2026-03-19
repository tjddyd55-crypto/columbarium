import { describe, it, expect } from 'vitest';
import { canAccessAdminPortal } from './adminPortalAccess';
import type { AuthUser } from './api';

function u(partial: Partial<AuthUser> & Pick<AuthUser, 'id' | 'role'>): AuthUser {
  return { id: partial.id, role: partial.role, ...partial };
}

describe('canAccessAdminPortal', () => {
  it('USER 단일 역할이면 false', () => {
    expect(canAccessAdminPortal(u({ id: '1', role: 'USER', roles: ['USER'] }))).toBe(false);
  });

  it('AGENT면 false', () => {
    expect(canAccessAdminPortal(u({ id: '1', role: 'AGENT', roles: ['AGENT'] }))).toBe(false);
  });

  it('roles에 ADMIN이 있으면 true', () => {
    expect(canAccessAdminPortal(u({ id: '1', role: 'USER', roles: ['USER', 'ADMIN'] }))).toBe(true);
  });

  it('대표 role만 SUPER_ADMIN이면 true', () => {
    expect(canAccessAdminPortal(u({ id: '1', role: 'SUPER_ADMIN', roles: ['SUPER_ADMIN'] }))).toBe(true);
  });

  it('null이면 false', () => {
    expect(canAccessAdminPortal(null)).toBe(false);
  });
});
