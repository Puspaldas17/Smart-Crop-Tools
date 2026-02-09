import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Stethoscope,
  Activity
} from "lucide-react";

interface TreatmentRequest {
  id: string;
  farmerName: string;
  animalId: string;
  condition: string; 
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
}

// Mock data for demo purposes since we don't have a full backend for this yet
const MOCK_REQUESTS: TreatmentRequest[] = [
  { id: "req_1", farmerName: "Ramesh Kumar", animalId: "COW-104", condition: "Mastitis", requestedDate: "2024-05-20", status: "pending" },
  { id: "req_2", farmerName: "Surendra Singh", animalId: "BUF-202", condition: "Fever", requestedDate: "2024-05-19", status: "pending" },
];

export default function VetDashboard() {
  const { farmer, logout } = useAuth();
  const [requests, setRequests] = useState<TreatmentRequest[]>(MOCK_REQUESTS);
  const [activeTab, setActiveTab] = useState<"requests" | "withdrawal">("requests");

  const handleApprove = (id: string) => {
    toast.success("Treatment approved & digital prescription signed.");
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "approved" } : req));
  };

  const handleReject = (id: string) => {
    toast.error("Treatment request rejected.");
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "rejected" } : req));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Veterinarian Workspace
          </h1>
          <p className="text-slate-600 mt-2">
            Welcome, Dr. {farmer?.name || "Veterinarian"}
          </p>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 border rounded hover:bg-slate-50"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Requests</p>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === "pending").length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Withdrawals</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 flex">
            <button 
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-4 font-medium ${activeTab === "requests" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Treatment Requests
            </button>
            <button 
              onClick={() => setActiveTab("withdrawal")}
              className={`px-6 py-4 font-medium ${activeTab === "withdrawal" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Withdrawal Monitoring
            </button>
          </div>

          <div className="p-6">
            {activeTab === "requests" && (
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No pending requests.</p>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div>
                        <h3 className="font-semibold">{req.farmerName}</h3>
                        <p className="text-sm text-slate-600">Animal: {req.animalId} • Condition: {req.condition}</p>
                        <p className="text-xs text-slate-400 mt-1">{req.requestedDate}</p>
                      </div>
                      <div className="flex gap-2">
                        {req.status === "pending" ? (
                          <>
                            <button 
                              onClick={() => handleApprove(req.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            req.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "withdrawal" && (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    High Risk Alerts
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    3 Animals are currently within withdrawal period in your district. Milk from these animals should not be sold.
                  </p>
                </div>

                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Drug</th>
                      <th className="px-4 py-3">Days Remaining</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 font-medium">COW-1024 <br/> <span className="text-xs font-normal text-slate-500">Ramesh Kumar</span></td>
                      <td className="px-4 py-3">Oxytetracycline</td>
                      <td className="px-4 py-3 font-bold text-red-600">4 Days</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Do Not Sell</span></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 font-medium">BUF-301 <br/> <span className="text-xs font-normal text-slate-500">Anita Devi</span></td>
                      <td className="px-4 py-3">Ivermectin</td>
                      <td className="px-4 py-3 font-bold text-orange-600">12 Days</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Do Not Sell</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
