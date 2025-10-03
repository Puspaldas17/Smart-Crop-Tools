import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Profile() {
  const { farmer, login, logout } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!farmer) navigate("/login", { replace: true });
  }, [farmer, navigate]);

  const [form, setForm] = useState(() => ({
    name: farmer?.name || "",
    phone: farmer?.phone || "",
    soilType: farmer?.soilType || "",
    landSize: farmer?.landSize?.toString() || "",
    language: farmer?.language || "en-IN",
  }));

  useEffect(() => {
    setForm({
      name: farmer?.name || "",
      phone: farmer?.phone || "",
      soilType: farmer?.soilType || "",
      landSize: farmer?.landSize?.toString() || "",
      language: farmer?.language || "en-IN",
    });
  }, [farmer]);

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus("Name and phone are required");
      return;
    }
    setSubmitting(true);
    setStatus("Saving…");
    try {
      const r = await fetchWithTimeout("/api/auth/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          soilType: form.soilType || undefined,
          landSize: Number(form.landSize || 0),
          language: form.language || "en-IN",
        }),
        timeoutMs: 8000,
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        login(data as any);
        toast.success("Profile saved");
        setStatus("Saved");
      } else {
        setStatus(data?.error || "Failed to save");
      }
    } catch {
      setStatus("Network error");
    }
    setSubmitting(false);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">Update your details.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full name"
          required
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="Phone"
          required
          disabled={submitting}
          inputMode="tel"
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="soilType"
          value={form.soilType}
          onChange={onChange}
          placeholder="Soil type (optional)"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="landSize"
          value={form.landSize}
          onChange={onChange}
          placeholder="Land size (acres)"
          type="number"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <input
          name="language"
          value={form.language}
          onChange={onChange}
          placeholder="Preferred language (e.g., hi-IN)"
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-70"
        />
        <div className="mt-2 flex gap-2">
          <button
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-80"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/#tools")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            Back
          </button>
        </div>
        <div className="text-sm text-slate-600">{status}</div>
      </form>
    </div>
  );
}
