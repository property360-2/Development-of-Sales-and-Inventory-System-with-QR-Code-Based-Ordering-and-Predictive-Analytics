import React, { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import useAuthStore from "./stores/useAuthStore";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize(); // ✅ restore session from localStorage on mount
  }, [initialize]);

  return <AppRouter />;
}

export default App;
