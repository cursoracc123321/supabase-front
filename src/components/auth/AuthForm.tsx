import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "../../api/auth";
import { useAuthStore } from "../../state/authStore";
import { ErrorBanner } from "../common/ErrorBanner";

type AuthMode = "sign-in" | "sign-up";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setLoadingGlobal = useAuthStore((state) => state.setLoading);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingGlobal(true);

    try {
      if (mode === "sign-in") {
        const { error: signInError } = await signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
        }
      } else {
        const { error: signUpError } = await signUpWithPassword({
          email,
          password,
          metadata: {},
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMode("sign-in");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLoadingGlobal(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "1rem" }}>
        {mode === "sign-in" ? "Welcome back" : "Create an account"}
      </h2>
      {error ? <ErrorBanner message={error} /> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1rem",
            background: "#0f172a",
            color: "white",
            borderRadius: "8px",
            border: "none",
          }}
        >
          {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
            setError(null);
          }}
          style={{
            padding: "0.75rem 1rem",
            background: "transparent",
            color: "#0f172a",
            borderRadius: "8px",
            border: "1px solid #0f172a",
          }}
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </form>
  );
};

