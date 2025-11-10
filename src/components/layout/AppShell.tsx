import { AuthGate } from "../auth/AuthGate";

interface AppShellProps {
  main: React.ReactNode;
}

export const AppShell = ({ main }: AppShellProps) => (
  <div
    style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <header
      style={{
        background: "#0f172a",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Supabase Front</h1>
      <AuthGate.HeaderActions />
    </header>
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <AuthGate>{main}</AuthGate>
    </main>
  </div>
);

