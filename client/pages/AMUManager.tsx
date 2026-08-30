import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle, Link, Hash, FileText } from "lucide-react";

interface Block {
  index: number;
  timestamp: string;
  data: {
    animalId: string;
    drugName: string;
    dosage: string;
    withdrawalDays: number;
    applicator: string;
  };
  hash: string;
  previousHash: string;
}

export default function AMUManager() {
  const { farmer } = useAuth();
  const [ledger, setLedger] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [animalId, setAnimalId] = useState("");
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [withdrawalDays, setWithdrawalDays] = useState("7");

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    try {
      const res = await fetch("/api/amu/ledger");
      const data = await res.json();
      if (data.blocks) {
        setLedger(data.blocks.reverse()); // Show newest first
      }
    } catch (error) {
      console.error("Failed to fetch ledger", error);
    }
  }

  async function handleLogTreatment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/amu/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalId,
          drugName,
          dosage,
          withdrawalDays,
          applicator: farmer?.name || "Unknown",
        }),
      });

      if (res.ok) {
        toast.success("Treatment logged to Blockchain!");
        setAnimalId("");
        setDrugName("");
        setDosage("");
        fetchLedger(); // Refresh chain
      } else {
        toast.error("Failed to log treatment");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          AMU Safety Logbook
        </h1>
        <p className="text-slate-600 mt-2">
          Securely track antibiotic usage and ensure withdrawal compliance. 
          All records are hashed and linked for immutability.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* LOGGING FORM */}
        <div className="space-y-6">
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Log New Treatment
            </h2>
            <form onSubmit={handleLogTreatment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Animal Tag ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., COW-1024"
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Drug Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Oxytetracycline"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage (ml)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 10ml"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Withdrawal Period (Days)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={withdrawalDays}
                    onChange={(e) => setWithdrawalDays(e.target.value)}
                    className="flex-1"
                  />
                  <span className="font-bold w-12 text-center border p-1 rounded">
                    {withdrawalDays}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Milk/Meat cannot be sold for {withdrawalDays} days.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Hashing..." : "Sign & Log to Ledger"}
              </button>
            </form>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
             <h3 className="font-semibold text-blue-900 mb-2">Why this matters?</h3>
             <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
               <li>Prevents antibiotic resistance (AMR).</li>
               <li>Ensures higher market price for "Safe Milk".</li>
               <li>Builds trust with buyers via digital history.</li>
             </ul>
          </div>
        </div>

        {/* BLOCKCHAIN VISUALIZATION */}
        <div className="space-y-4">
           <h2 className="text-xl font-semibold flex items-center gap-2">
             <Link className="w-5 h-5 text-slate-500" />
             The Chain of Trust
           </h2>
           
           <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-8 py-2">
             {ledger.length === 0 && (
                <p className="text-slate-500 italic">No blocks found. Start the chain!</p>
             )}
             
             {ledger.map((block) => (
               <div key={block.hash} className="relative bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                 {/* Timeline Dot */}
                 <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                     Block #{block.index}
                   </span>
                   <span className="text-xs text-slate-400">
                     {new Date(block.timestamp).toLocaleString()}
                   </span>
                 </div>
                 
                 {block.index === 0 ? (
                    <div className="text-center py-2 font-mono text-slate-500">GENESIS BLOCK</div>
                 ) : (
                    <div className="space-y-1">
                       <div className="font-medium text-slate-900">
                         {block.data.drugName} ({block.data.dosage})
                       </div>
                       <div className="text-sm text-slate-600">
                         Target: <span className="font-semibold">{block.data.animalId}</span>
                       </div>
                       <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
                         <Hash className="w-3 h-3" />
                         <span className="font-mono truncate w-full" title={block.hash}>
                           {block.hash.substring(0, 20)}...
                         </span>
                       </div>
                    </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
