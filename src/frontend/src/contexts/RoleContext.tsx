import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface RoleContextValue {
  role: UserRole;
  isAdmin: boolean;
  isStudent: boolean;
  isGuest: boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [role, setRole] = useState<UserRole>(UserRole.guest);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitializing) {
      setIsLoading(true);
      return;
    }

    if (!identity) {
      setRole(UserRole.guest);
      setIsLoading(false);
      return;
    }

    if (!actor || isFetching) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    actor
      .getCallerUserRole()
      .then((fetchedRole) => {
        setRole(fetchedRole);
      })
      .catch(() => {
        setRole(UserRole.guest);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [identity, actor, isFetching, isInitializing]);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      isAdmin: role === UserRole.admin,
      isStudent: role === UserRole.user,
      isGuest: role === UserRole.guest,
      isLoading,
    }),
    [role, isLoading],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
