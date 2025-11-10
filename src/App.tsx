import { AuthProvider } from "./components/auth/AuthProvider";
import { AppShell } from "./components/layout/AppShell";
import { TableExplorer } from "./components/table/TableExplorer";
import { QueryRunner } from "./components/table/QueryRunner";

export const App = () => (
  <AuthProvider>
    <AppShell
      main={
        <>
          <TableExplorer />
          <QueryRunner />
        </>
      }
    />
  </AuthProvider>
);

