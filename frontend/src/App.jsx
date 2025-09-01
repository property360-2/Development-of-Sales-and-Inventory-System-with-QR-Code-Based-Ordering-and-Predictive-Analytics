import React, { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import useAuthStore from "./stores/useAuthStore";

// React Query imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />

      {/* ✅ Only load devtools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// ✅ Import devtools conditionally
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default App;
