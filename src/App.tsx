import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";

import { PassphraseGate } from "@/components/passphrase-gate";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme";
import { DashboardPage } from "@/pages/dashboard";

function Gated() {
  const { status } = useAuth();

  if (status === "loading") return null;
  if (status === "unauthenticated") return <PassphraseGate />;

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Gated />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
