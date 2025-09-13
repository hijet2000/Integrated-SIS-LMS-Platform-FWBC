
export type Scope = 'school:read'|'school:write'|'school:admin';

export type NavItem = {
  label: string;
  path?: string;            // leaf route
  icon?: string;            // lucide icon name
  scope?: Scope | Scope[];  // required RBAC scope(s)
  children?: NavItem[];     // nested
};
