import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name || !payload.phone) {
      setStatus("Name and phone are required");
      return;
    }
    setStatus("Signing in…");
    const r = await fetch("/api/auth/farmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        soilType: payload.soilType,
        landSize: Number(payload.landSize || 0),
        language: payload.language || "en-IN",
      }),
    });
    const data = await r.json();
    if (r.ok) {
      login(data);
      setStatus("Success. Redirecting…");
      navigate("/#tools");
    } else setStatus(data.error || "Failed to sign in");
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Farmer Login / Registration</h1>
      <p className="mt-2 text-sm text-slate-600">Create your profile once. Next time, use the same phone to sign in.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input name="name" placeholder="Full name" required className="rounded-md border border-slate-300 px-3 py-2" />
        <input name="phone" placeholder="Phone" required className="rounded-md border border-slate-300 px-3 py-2" />
        <input name="soilType" placeholder="Soil type (optional)" className="rounded-md border border-slate-300 px-3 py-2" />
        <input name="landSize" placeholder="Land size (acres)" type="number" className="rounded-md border border-slate-300 px-3 py-2" />
        <input name="language" placeholder="Preferred language (e.g., hi-IN)" className="rounded-md border border-slate-300 px-3 py-2" />
        <button className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Continue</button>
        <div className="text-sm text-slate-600">{status}</div>
      </form>
    </div>
  );
}
