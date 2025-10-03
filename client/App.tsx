import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RootLayout from "./pages/Layout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// Patch global fetch in the browser to guard against preview or 3rd-party scripts
// that call fetch and produce uncaught TypeError 'Failed to fetch' in restricted environments.
if (typeof window !== "undefined") {
  const g = window as any;
  if (!g.__fetchSafePatched) {
    const origFetch = g.fetch && g.fetch.bind(g);
    if (origFetch) {
      g.fetch = (...args: any[]) => {
        // Always return a promise; await origFetch inside to catch async rejections
        return (async () => {
          try {
            const res = await origFetch(...args);
            return res;
          } catch (err) {
            // Swallow error and return a harmless non-ok response
            return {
              ok: false,
              status: 502,
              json: async () => ({}),
              text: async () => "",
            } as any;
          }
        })();
      };
    }
    g.__fetchSafePatched = true;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
