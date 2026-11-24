import type { Role } from "@/lib/types";

export const permissions = {
  admin: ["inventory:read", "inventory:write", "movement:write", "incident:write", "incident:resolve", "settings:write"],
  supervisor: ["inventory:read", "inventory:write", "movement:write", "incident:write", "incident:resolve"],
  employee: ["inventory:read", "movement:write", "incident:write"],
} as const;

export function can(role: Role, permission: (typeof permissions)[Role][number]): boolean {
  return permissions[role].includes(permission as never);
}
