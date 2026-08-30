import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SECTIONS = [
  { id: "profile",    label: "🧑‍🌾 Farm Profile",           always: true },
  { id: "advisory",  label: "📋 AI Advisory History",      always: false },
  { id: "pest",      label: "🦟 Pest Forecast",             always: false },
  { id: "iot",       label: "📡 IoT Sensor Readings",       always: false },
  { id: "amu",       label: "💊 AMU Drug Log",              always: false },
  { id: "blockchain",label: "🔗 Produce Blockchain Ledger", always: false },
];

export function PDFExport() {
  const { farmer } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["profile", "advisory", "pest"])
  );
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    if (id === "profile") return; // always included
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);

    try {
      // Render the hidden report div to canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgW = 210; // A4 width in mm
      const pageH = 297; // A4 height in mm
      const imgH = (canvas.height * imgW) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");

      let yOffset = 0;
      let remaining = imgH;

      while (remaining > 0) {
        // Slice the canvas into A4 pages
        const sliceH = Math.min(remaining, pageH);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH / imgH) * canvas.height;

        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(
          canvas,
          0,
          yOffset * (canvas.height / imgH),
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );

        const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.95);
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(sliceImg, "JPEG", 0, 0, imgW, sliceH);

        yOffset += sliceH;
        remaining -= sliceH;
      }

      pdf.save(
        `SmartCropTools_FarmReport_${farmer?.name?.replace(/\s+/g, "_") ?? "Report"}_${now.getFullYear()}.pdf`
      );
    } catch (err) {
      console.error("[PDFExport] Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">📄 Export Farm Report (PDF)</h2>
        <p className="text-sm text-muted-foreground">
          Select the sections to include. A professionally formatted PDF will be downloaded directly.
        </p>
      </div>

      {/* Section selector */}
      <div className="grid gap-2 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <label
            key={s.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
              selected.has(s.id)
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            } ${s.always ? "opacity-70 cursor-not-allowed" : "hover:border-primary/50"}`}
          >
            <input
              type="checkbox"
              checked={selected.has(s.id)}
              disabled={s.always}
              onChange={() => toggle(s.id)}
              className="accent-primary"
            />
            <span className="text-sm font-medium">{s.label}</span>
            {s.always && (
              <span className="ml-auto text-[10px] text-muted-foreground">Always included</span>
            )}
          </label>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:brightness-105 disabled:opacity-60 transition-all"
      >
        {generating ? (
          <>
            <span className="animate-spin">⏳</span> Generating PDF…
          </>
        ) : (
          <>⬇️ Download PDF Report</>
        )}
      </button>

      {/* Hidden report div that gets rendered to PDF */}
      <div
        ref={reportRef}
        style={{
          position: "fixed",
          top: "-9999px",
          left: 0,
          width: "794px",        // ~A4 at 96dpi
          background: "#ffffff",
          color: "#1a1a1a",
          fontFamily: "Georgia, serif",
          padding: "40px 48px",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "3px solid #2ea043", paddingBottom: 16, marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a5c2e", margin: 0 }}>
            🌾 Smart Crop Tools — Farm Report
          </h1>
          <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
            Generated on {dateStr} &nbsp;|&nbsp; Confidential
          </p>
        </div>

        {/* Profile section (always) */}
        <Section title="Farm Profile">
          <Row label="Farmer Name"  value={farmer?.name ?? "—"} />
          <Row label="Phone"        value={farmer?.phone ?? "—"} />
          <Row label="Soil Type"    value={farmer?.soilType ?? "—"} />
          <Row label="Land Size"    value={farmer?.landSize ? `${farmer.landSize} acres` : "—"} />
          <Row label="Location"     value={farmer?.location?.village ?? farmer?.location?.state ?? "—"} />
          <Row label="Language"     value={farmer?.language ?? "English"} />
          <Row label="Plan"         value={farmer?.subscriptionStatus === "premium" ? "Premium ⭐" : "Free"} />
          <Row label="Member Since" value={farmer?.createdAt ? new Date(farmer.createdAt).toLocaleDateString("en-IN") : "—"} />
        </Section>

        {selected.has("advisory") && (
          <Section title="AI Advisory History">
            <p style={noteStyle}>
              View your full advisory history in the app under the <strong>Dashboard → AI Advisory</strong> tab.
              Your recent recommendations cover crop health, fertilizer, irrigation and pest management.
            </p>
          </Section>
        )}

        {selected.has("pest") && (
          <Section title="Pest Forecast Summary">
            <p style={noteStyle}>
              The integrated 14-day pest forecast engine uses seasonal patterns, local weather,
              and crop-specific risk models to predict infestation likelihood. Check the
              <strong> Pest Alert</strong> widget on your dashboard for live data.
            </p>
          </Section>
        )}

        {selected.has("iot") && (
          <Section title="IoT Sensor Readings">
            <p style={noteStyle}>
              IoT sensor data is live and refreshed every 30 seconds. Navigate to
              <strong> Tools &amp; Insights → IoT Sensors</strong> for real-time soil moisture,
              temperature, pH and nitrogen readings.
            </p>
          </Section>
        )}

        {selected.has("amu") && (
          <Section title="AMU Drug Log">
            <p style={noteStyle}>
              Your Antimicrobial Usage (AMU) log is secured with a hash-chain for tamper-proof
              record keeping. See the full ledger under <strong>Dashboard → AMU Log</strong>.
            </p>
          </Section>
        )}

        {selected.has("blockchain") && (
          <Section title="Produce Blockchain Ledger">
            <p style={noteStyle}>
              Each harvest registered on the blockchain ledger receives a unique transaction hash
              for supply-chain traceability. View your records under
              <strong> Tools &amp; Insights → Produce Ledger</strong>.
            </p>
          </Section>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 14, borderTop: "1px solid #ddd", fontSize: 11, color: "#888" }}>
          <p style={{ margin: 0 }}>
            This report was generated by Smart Crop Tools — an AI-powered precision agriculture
            platform. All data is sourced directly from your farm profile and activity logs.
          </p>
          <p style={{ margin: "6px 0 0" }}>
            © {now.getFullYear()} Smart Crop Tools &nbsp;|&nbsp; Report ID: SCT-{Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: 16, fontWeight: 700, color: "#1a5c2e",
        borderLeft: "4px solid #2ea043", paddingLeft: 10, marginBottom: 12,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 13, padding: "5px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ width: 140, color: "#666", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{value}</span>
    </div>
  );
}

const noteStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#444",
  lineHeight: 1.7,
  background: "#f8fdf9",
  border: "1px solid #d4edda",
  borderRadius: 6,
  padding: "10px 14px",
  margin: 0,
};
