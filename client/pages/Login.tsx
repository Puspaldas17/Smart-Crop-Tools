import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const { login, farmer } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (farmer) navigate("/#tools", { replace: true });
  }, [farmer, navigate]);

  const fetchWithTimeout = useMemo(
    () =>
      async (
        input: RequestInfo | URL,
        init: RequestInit & { timeoutMs?: number } = {},
      ) => {
        const { timeoutMs = 8000, ...rest } = init;
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const res = await fetch(input, { ...rest, signal: ctrl.signal });
          return res;
        } finally {
          clearTimeout(id);
        }
      },
    [],
  );

  async function handleGuestLogin() {
    setSubmitting(true);
    setStatus("Loading as guest…");
    try {
      const r = await fetchWithTimeout("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "en-IN",
        }),
        timeoutMs: 8000,
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        login(data as any);
        toast.success("Welcome! Continuing as guest...");
        setStatus("Success. Redirecting…");
        navigate("/#tools", { replace: true });
        return;
      }
      setStatus("Failed to load as guest");
    } catch (err: any) {
      setStatus(
        err?.name === "AbortError" ? "Request timed out" : "Network error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const name = String(payload.name || "").trim();
    const phone = String(payload.phone || "").trim();
    if (!name || !phone) {
      setStatus("Name and phone are required");
      return;
    }

    setSubmitting(true);
    setStatus("Signing in…");

    const body = JSON.stringify({
      name,
      phone,
      soilType: payload.soilType || undefined,
      landSize: Number(payload.landSize || 0),
      language: payload.language || "en-IN",
    });

    let lastError = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetchWithTimeout("/api/auth/farmer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          timeoutMs: 8000,
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          login(data as any);
          toast.success(`Welcome, ${data?.name || "Farmer"}!`);
          setStatus("Success. Redirecting…");
          navigate("/#tools", { replace: true });
          return;
        }
        lastError = data?.error || `Attempt ${attempt} failed`;
      } catch (err: any) {
        lastError =
          err?.name === "AbortError" ? "Request timed out" : "Network error";
      }
      if (attempt < 3) {
        setStatus(`Retrying… (${attempt}/3)`);
        await new Promise((res) => setTimeout(res, 400 * attempt));
      }
    }

    setStatus(lastError || "Failed to sign in");
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Farmer Login / Registration</h1>
      <p className="mt-2 text-sm text-slate-600">
        Create your profile once. Next time, use the same phone to sign in.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input
          name="name"
          placeholder="Full name"
          required
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="phone"
          placeholder="Phone"
          required
          disabled={submitting}
          inputMode="tel"
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="soilType"
          placeholder="Soil type (optional)"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="landSize"
          placeholder="Land size (acres)"
          type="number"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="language"
          placeholder="Preferred language (e.g., hi-IN)"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <button
          disabled={submitting}
          aria-busy={submitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-80"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Signing in…
            </span>
          ) : (
            "Continue"
          )}
        </button>
        <div className="text-sm text-slate-600">{status}</div>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <p className="mb-3 text-center text-sm text-slate-600">
          Or continue as a guest to explore
        </p>
        <button
          onClick={handleGuestLogin}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
