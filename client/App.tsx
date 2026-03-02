import "./global.css";
import "./i18n";
import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import React, { Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RootLayout from "./pages/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import { GamificationProvider } from "@/context/GamificationContext";

import PageLoader from "@/components/PageLoader";

// ── Lazy-loaded page chunks (each becomes its own JS bundle) ────────────────
const Login        = React.lazy(() => import("./pages/Login"));
const Profile      = React.lazy(() => import("./pages/Profile"));
const Dashboard    = React.lazy(() => import("./pages/Dashboard"));
const AMUManager   = React.lazy(() => import("./pages/AMUManager"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const VetDashboard = React.lazy(() => import("./pages/VetDashboard"));
const Leaderboard  = React.lazy(() => import("./pages/Leaderboard"));
const Marketplace  = React.lazy(() => import("./pages/Marketplace"));
const CropCalendar = React.lazy(() => import("./pages/CropCalendar"));
const ToolsPage    = React.lazy(() => import("./pages/ToolsPage"));



// ── QueryClient with sensible caching to avoid redundant refetches ───────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,   // data is fresh for 1 minute
      gcTime:    300_000,  // keep unused cache for 5 minutes
      retry: 1,
    },
  },
});

// Patch global fetch in the browser to guard against preview or 3rd-party scripts
// that call fetch and produce uncaught TypeError 'Failed to fetch' in restricted environments.
if (typeof window !== "undefined") {
  const g = window as any;
  if (!g.__fetchSafePatched) {
    const origFetch = g.fetch && g.fetch.bind(g);
    if (origFetch) {
      g.fetch = (...args: any[]) => {
        return (async () => {
          try {
            const res = await origFetch(...args);
            return res;
          } catch (err) {
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
      <GamificationProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route element={<RootLayout />}>
                      <Route index element={<Index />} />
                      <Route path="/login"      element={<Login />} />
                      <Route path="/profile"    element={<Profile />} />
                      <Route path="/dashboard"  element={<Dashboard />} />
                      <Route path="/amu"        element={<AMUManager />} />
                      <Route path="/admin"      element={<AdminDashboard />} />
                      <Route path="/vet"        element={<VetDashboard />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/calendar"   element={<CropCalendar />} />
                      <Route path="/tools"      element={<ToolsPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </GamificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
