import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Stethoscope,
} from "lucide-react";

interface Appointment {
  _id: string;
  farmerId: string;
  farmerName?: string;
  vetName?: string;
  scheduledAt: string;
  reason: string;
  animalId?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  vetNote?: string;
}

const statusConfig = {
  pending:   { label: "Pending",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",       icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30",    icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30",          icon: XCircle },
};

/** Farmer-facing appointment booking panel */
export function AppointmentBooking() {
  const { farmer, authHeaders } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    animalId: "",
    reason: "",
    scheduledAt: "",
  });

  async function fetchAppointments() {
    if (!farmer?._id) return;
    try {
      const res = await fetch("/api/appointments", { headers: authHeaders() });
      if (res.ok) setAppointments(await res.json());
    } catch {}
  }

  useEffect(() => { fetchAppointments(); }, [farmer]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!farmer?._id) return toast.error("Please login first");
    if (!form.scheduledAt) return toast.error("Please pick a date & time");
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ farmerId: farmer._id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Appointment requested! The vet will confirm shortly.");
      setOpen(false);
      setForm({ animalId: "", reason: "", scheduledAt: "" });
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Vet Appointments
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Schedule a Vet Visit
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBook} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="animalId">Animal ID / Tag (optional)</Label>
                <Input
                  id="animalId"
                  placeholder="e.g. COW-042"
                  value={form.animalId}
                  onChange={(e) => setForm((f) => ({ ...f, animalId: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason / Symptoms *</Label>
                <Textarea
                  id="reason"
                  required
                  placeholder="Describe the issue or reason for visit..."
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="scheduledAt">Preferred Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Booking..." : "Request Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointment cards */}
      {appointments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No appointments yet.</p>
          <p className="text-sm">Book a vet visit using the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const cfg = statusConfig[appt.status];
            const Icon = cfg.icon;
            return (
              <Card key={appt._id} className="glass-card border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{appt.reason}</p>
                      {appt.animalId && (
                        <p className="text-xs text-muted-foreground">Animal: {appt.animalId}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(appt.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium", timeStyle: "short",
                        })}
                      </div>
                      {appt.vetName && (
                        <p className="text-xs text-muted-foreground">Vet: {appt.vetName}</p>
                      )}
                      {appt.vetNote && (
                        <p className="text-xs text-primary/80 italic mt-1">
                          Vet note: {appt.vetNote}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Vet-facing appointment manager panel */
export function AppointmentManager() {
  const { authHeaders } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchAll() {
    try {
      const res = await fetch("/api/appointments", { headers: authHeaders() });
      if (res.ok) setAppointments(await res.json());
    } catch {}
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleUpdate(id: string, updates: Partial<{ status: string; vetNote: string }>) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("Appointment updated");
        fetchAll();
      } else {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const [vetNote, setVetNote] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Appointment Requests
        {appointments.filter((a) => a.status === "pending").length > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs">
            {appointments.filter((a) => a.status === "pending").length}
          </span>
        )}
      </h3>

      {appointments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No appointments scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const cfg = statusConfig[appt.status];
            const Icon = cfg.icon;
            return (
              <Card key={appt._id} className="glass-card border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{appt.farmerName || "Unknown Farmer"}</p>
                      <p className="text-sm text-muted-foreground">{appt.reason}</p>
                      {appt.animalId && (
                        <p className="text-xs text-muted-foreground">Animal: {appt.animalId}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(appt.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium", timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Vet note */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Add a note (optional)..."
                      value={vetNote[appt._id] ?? appt.vetNote ?? ""}
                      onChange={(e) => setVetNote((n) => ({ ...n, [appt._id]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {appt.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, { status: "confirmed", vetNote: vetNote[appt._id] })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                      </Button>
                    )}
                    {appt.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, { status: "completed", vetNote: vetNote[appt._id] })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Done
                      </Button>
                    )}
                    {(appt.status === "pending" || appt.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, { status: "cancelled", vetNote: vetNote[appt._id] })}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                    {vetNote[appt._id] !== undefined && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, { vetNote: vetNote[appt._id] })}
                      >
                        Save Note
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
