import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";

import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme";
import { DashboardPage } from "@/pages/dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Switch>
          <Route path="/" component={DashboardPage} />
        </Switch>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
