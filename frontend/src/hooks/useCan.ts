import { useAuth } from "../contexts/AuthContext";

import { validateUserPermissions } from "../utils/validateUserPermissions";

interface UseCanProps {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] }: UseCanProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles
  });

  return userHasValidPermissions;
}
