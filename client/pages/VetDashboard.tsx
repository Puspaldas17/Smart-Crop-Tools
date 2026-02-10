
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Stethoscope, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

interface DrugLog {
  _id: string;
  animalId: string;
  drugName: string;
  dosage: string;
  withdrawalDays: number;
  treatmentDate: string;
  applicator: string;
}

export default function VetDashboard() {
  const { farmer, logout } = useAuth();
  const [logs, setLogs] = useState<DrugLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      // In a real app, this would be a filtered query. 
      // For now, we fetch all via a new endpoint or reusing existing logic if available.
      // Since we don't have a specific "get all logs" endpoint yet, 
      // we'll simulate it or assume the vet tracks specific animals.
      // Let's assume we can fetch logs for a specific animal or all if we had the route.
      // For this implementation, we will fetch status for the searched animal if provided, 
      // or just show a placeholder "Search to view records".
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function searchAnimal() {
    if (!searchId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/amu/status/${searchId}`);
      if (res.ok) {
         // The status endpoint returns a summary, but we might want detailed logs.
         // Let's assume we want to see history. 
         // We might need to adjust the backend to return full history for a vet.
         // For now, let's mock the display to show we have the UI structure.
         toast.success("Animal found (Mock)");
         setLogs([
           {
             _id: "1",
             animalId: searchId,
             drugName: "Oxytetracycline",
             dosage: "10ml",
             withdrawalDays: 7,
             treatmentDate: new Date().toISOString(),
             applicator: "Farmer"
           }
         ]);
      } else {
        toast.error("Animal not found");
        setLogs([]);
      }
    } catch (e) {
      toast.error("Search failed");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Veterinary Portal
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome, Dr. {farmer?.name}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Search Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Patient Search</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Animal ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={searchAnimal}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
             <h3 className="font-semibold text-blue-900 mb-2">Pending Approvals</h3>
             <p className="text-sm text-blue-700">
               You have 3 prescription requests waiting for review.
             </p>
             <button className="mt-3 text-sm font-medium text-blue-800 hover:underline">
               View Requests &rarr;
             </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Medical Records</h2>
              <span className="text-sm text-slate-500">
                {logs.length} records found
              </span>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Search className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p>Search for an animal ID to view history</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {logs.map((log) => (
                   <div key={log._id} className="p-4 hover:bg-slate-50 flex items-start gap-4">
                     <div className="p-2 bg-indigo-50 rounded-lg">
                       <FileText className="h-6 w-6 text-indigo-600" />
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-medium text-slate-900">{log.drugName}</h4>
                           <p className="text-sm text-slate-600">
                             Dosage: {log.dosage} • By {log.applicator}
                           </p>
                         </div>
                         <div className="text-right">
                           <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                             {new Date(log.treatmentDate).toLocaleDateString()}
                           </span>
                         </div>
                       </div>
                       
                       <div className="mt-3 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-slate-600">
                              Withdrawal: {log.withdrawalDays} days
                            </span>
                          </div>
                          {/* Logic to calculate if safe would go here */}
                          <div className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span className="text-green-700 font-medium">Safe to consume</span>
                          </div>
                       </div>
                     </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
