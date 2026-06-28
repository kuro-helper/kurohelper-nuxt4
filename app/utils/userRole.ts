/** 與 kurohelper-service/db.UserRole* 對齊 */
export const USER_ROLE = {
  USER: 0,
  DEVELOPER: 5,
  OWNER: 10,
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_LABELS: Partial<Record<number, string>> = {
  [USER_ROLE.USER]: '一般使用者',
  [USER_ROLE.DEVELOPER]: '開發者',
  [USER_ROLE.OWNER]: '站主',
};

export function userRoleLabel(role: number): string {
  return USER_ROLE_LABELS[role] ?? `未知(${role})`;
}

export function userRoleColor(role: number): string | undefined {
  switch (role) {
    case USER_ROLE.DEVELOPER:
      return 'info';
    default:
      return undefined;
  }
}

export function isUserRoleOwner(role: number): boolean {
  return role === USER_ROLE.OWNER;
}

export function isUserRoleDeveloper(role: number): boolean {
  return role === USER_ROLE.DEVELOPER;
}

export function isValidUserRole(role: number): boolean {
  return role >= USER_ROLE.USER && role <= USER_ROLE.OWNER;
}
