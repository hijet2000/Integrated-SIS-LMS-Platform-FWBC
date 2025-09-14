// FIX: Add missing scopes to the Scope type to resolve type errors.
export type Scope = 'school:read'|'school:write'|'school:admin' | 'library:read' | 'library:write' | 'lms:admin' | 'attendance:read' | 'attendance:write';

export type NavItem = {
  label: string;
  path?: string;            // leaf route
  icon?: string;            // lucide icon name
  scope?: Scope | Scope[];  // required RBAC scope(s)
  children?: NavItem[];     // nested
};