/**
 * Access Control Helper Functions
 * Maps positions and roles to equivalent access levels
 */

/**
 * Maps a position to its equivalent access position
 * @param posisi - The user's position
 * @returns The equivalent position for access control
 */
export function getEquivalentPosisi(posisi: string): string {
  const posisiMap: Record<string, string> = {
    // ELECTRICIAN, WELDER, TYREMAN have same access as MEKANIK
    ELECTRICIAN: 'MEKANIK',
    WELDER: 'MEKANIK',
    TYREMAN: 'MEKANIK',
    // GROUP_LEADER_TYRE has same access as GROUP_LEADER_MEKANIK
    GROUP_LEADER_TYRE: 'GROUP_LEADER_MEKANIK',
    // SUPERVISOR has same access as PLANNER
    SUPERVISOR: 'PLANNER',
    // DEPT_HEAD and MANAGEMENT have same access as SUPERADMIN (but may be read-only if role is USERS)
    DEPT_HEAD: 'SUPERADMIN',
    MANAGEMENT: 'SUPERADMIN',
  };

  return posisiMap[posisi] || posisi;
}

/**
 * Maps a position to its equivalent access position for role-based access
 * @param posisi - The user's position
 * @returns Array of equivalent positions for access control
 */
export function getEquivalentPosisiArray(posisi: string): string[] {
  const equivalent = getEquivalentPosisi(posisi);
  // Return both original and equivalent to support both checks
  return equivalent !== posisi ? [posisi, equivalent] : [posisi];
}

/**
 * Checks if a user has read-only access
 * DEPT_HEAD and MANAGEMENT with Role USERS are read-only
 * @param role - The user's role
 * @param posisi - The user's position
 * @returns true if user has read-only access
 */
export function isReadOnly(role: string, posisi: string): boolean {
  const readOnlyPositions = ['DEPT_HEAD', 'MANAGEMENT'];
  return readOnlyPositions.includes(posisi) && role === 'USERS';
}

/**
 * Checks if a user can perform write operations
 * @param role - The user's role
 * @param posisi - The user's position
 * @returns true if user can write
 */
export function canWrite(role: string, posisi: string): boolean {
  return !isReadOnly(role, posisi);
}

/**
 * Checks if a user has access based on allowed roles and positions
 * @param userRole - The user's role
 * @param userPosisi - The user's position
 * @param allowedRoles - Array of allowed roles
 * @param allowedPosisi - Array of allowed positions
 * @returns true if user has access
 */
export function hasAccess(
  userRole: string,
  userPosisi: string,
  allowedRoles?: string[],
  allowedPosisi?: string[]
): boolean {
  // If no restrictions, allow access
  if (!allowedRoles && !allowedPosisi) {
    return true;
  }

  let hasAccess = false;

  // Check role directly
  if (allowedRoles && allowedRoles.includes(userRole)) {
    hasAccess = true;
  }

  // Check position directly (including equivalent positions)
  if (allowedPosisi) {
    const equivalentPositions = getEquivalentPosisiArray(userPosisi);
    for (const pos of equivalentPositions) {
      if (allowedPosisi.includes(pos)) {
        hasAccess = true;
        break;
      }
    }
  }

  // Check if equivalent position matches allowed roles
  // For example: MANAGEMENT maps to SUPERADMIN, so if allowedRoles includes SUPERADMIN, allow access
  // This handles cases where a position maps to a role
  if (!hasAccess && allowedRoles) {
    const equivalentPosisi = getEquivalentPosisi(userPosisi);
    // If equivalent position is a role (like SUPERADMIN), check if it's in allowedRoles
    if (equivalentPosisi !== userPosisi && allowedRoles.includes(equivalentPosisi)) {
      hasAccess = true;
    }
  }

  // Check if equivalent position matches allowed positions
  // For example: SUPERVISOR maps to PLANNER, so if allowedPosisi includes PLANNER, allow access
  // This handles cases where a position maps to another position
  if (!hasAccess && allowedPosisi) {
    const equivalentPosisi = getEquivalentPosisi(userPosisi);
    if (equivalentPosisi !== userPosisi && allowedPosisi.includes(equivalentPosisi)) {
      hasAccess = true;
    }
  }

  return hasAccess;
}

