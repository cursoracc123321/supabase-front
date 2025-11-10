import { useCallback } from "react";
import { useAuthStore } from "../../state/authStore";
import { signOut } from "../../api/auth";
import { AuthForm } from "./AuthForm";

interface AuthGateBaseProps {
  children: React.ReactNode;
}

const AuthGateBase = ({ children }: AuthGateBaseProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.1)",
          maxWidth: "420px",
          margin: "4rem auto",
        }}
      >
        <AuthForm />
      </div>
    );
  }

  return <>{children}</>;
};

const HeaderActions = () => {
  const user = useAuthStore((state) => state.user);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <span style={{ fontSize: "0.875rem" }}>{user.email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.3)",
          background: "transparent",
          color: "white",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
};

export const AuthGate = Object.assign(AuthGateBase, { HeaderActions });

