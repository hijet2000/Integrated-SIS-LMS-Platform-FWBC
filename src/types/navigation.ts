
// FIX: Removed local Scope definition and imported from '@/types' to ensure a single source of truth.
import type { Scope } from '@/types';

export type NavItem = {
  label: string;
  path?: string;            // leaf route
  icon?: string;            // lucide icon name
  scope?: Scope | Scope[];  // required RBAC scope(s)
  children?: NavItem[];     // nested
};
