import { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Wifi, Bot, Shield, FileText, BookOpen, TreePine, ChevronLeft,
} from "lucide-react";
import { IoTSensorDashboard } from "@/components/features/IoTSensors";
import { SchemesFinder } from "@/components/features/SchemesFinder";
import { ProduceBlockchain } from "@/components/features/ProduceBlockchain";
import { PDFExport } from "@/components/features/PDFExport";

const DroneAnalysis = lazy(() => import("@/components/features/DroneAnalysis").then(m => ({ default: m.DroneAnalysis })));

type ToolTab = "iot" | "drone" | "blockchain" | "schemes" | "pdf";

const TABS: { id: ToolTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "iot",        label: "IoT Sensors",     icon: Wifi,      description: "Live soil telemetry" },
  { id: "drone",      label: "Drone Analysis",  icon: TreePine,  description: "Aerial crop imaging" },
  { id: "blockchain", label: "Produce Ledger",  icon: Shield,    description: "Blockchain traceability" },
  { id: "schemes",    label: "Govt Schemes",    icon: BookOpen,  description: "Scheme eligibility" },
  { id: "pdf",        label: "PDF Export",      icon: FileText,  description: "Download farm report" },
];

export default function ToolsPage() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [activeTab, setActiveTab] = useState<ToolTab>("iot");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" />
              Tools & Insights
            </h1>
            <p className="text-sm text-muted-foreground">Advanced farming tools powered by IoT, AI & Blockchain</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TABS.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center gap-1 text-center p-3 rounded-xl border transition-all",
                activeTab === id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border hover:border-border/80 hover:bg-accent text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] opacity-70 hidden sm:block">{description}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="glass-card gradient-border rounded-2xl p-6">
          <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading…</div>}>
            {activeTab === "iot" && <IoTSensorDashboard />}
            {activeTab === "drone" && <DroneAnalysis />}
            {activeTab === "blockchain" && (
              <ProduceBlockchain
                farmerId={farmer?._id}
                farmerName={farmer?.name}
              />
            )}
            {activeTab === "schemes" && (
              <SchemesFinder landSize={farmer?.landSize ?? undefined} />
            )}
            {activeTab === "pdf" && <PDFExport />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
