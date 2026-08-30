import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminDashboard() {
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);

  useEffect(() => {
    if (!farmer || farmer.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [farmer, navigate]);

  if (!farmer || farmer.role !== "admin") return null;
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("info");

  const fetchData = () => {
    Promise.all([
      fetch("/api/analytics/system").then((res) => res.json()),
      fetch("/api/farmers").then((res) => res.json()),
      fetch("/api/alerts").then((res) => res.json())
    ])
      .then(([analyticsData, farmersData, alertsData]) => {
        setData(analyticsData);
        setFarmers(Array.isArray(farmersData) ? farmersData : []);
        setActiveAlerts(Array.isArray(alertsData) ? alertsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMsg) return;
    
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: alertMsg, type: alertType })
      });
      alert("Broadcast sent successfully!");
      setAlertMsg("");
      fetchData(); // Refresh alerts
    } catch(err) {
      alert("Failed to send broadcast.");
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this alert?")) return;
    try {
      await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      alert("Failed to delete alert");
    }
  };

  const handleFarmerAction = async (id: string, action: string) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to permanently delete this farmer?")) return;
      try {
        await fetch(`/api/farmers/${id}`, { method: "DELETE" });
        fetchData();
      } catch (e) {
        alert("Failed to delete farmer");
      }
    } else {
      try {
        await fetch(`/api/farmers/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action })
        });
        fetchData();
      } catch (e) {
        alert("Failed to update status");
      }
    }
  };

  const downloadCSV = () => {
    if (!farmers.length) return;
    const headers = ["Name", "Email", "Phone", "Language", "Soil Type", "Role", "Subscription"];
    const rows = farmers.map(f => [
      f.name || "", 
      f.email || "", 
      f.phone || "", 
      f.language || "", 
      f.soilType || "", 
      f.role || "", 
      f.subscriptionStatus || "free"
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "farmers_directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Loading Authority Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <ShieldCheck className="w-8 h-8 text-blue-700" />
             Authority Dashboard
           </h1>
           <p className="text-slate-500">AgriVerse System Overview & Compliance Monitoring</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium text-sm">
           Odisha / Khordha District
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
           icon={<Users className="w-5 h-5 text-blue-600" />}
           label="Total Farmers"
           value={data.metrics.totalFarmers}
           sub="Growth: +12% this month"
        />
        <MetricCard 
           icon={<Activity className="w-5 h-5 text-green-600" />}
           label="AI Scans"
           value={data.metrics.totalScans}
           sub={`${(data.metrics.activeToday / data.metrics.totalFarmers * 100).toFixed(0)}% Active Today`}
        />
        <MetricCard 
           icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
           label="AMU Violations"
           value={data.metrics.activeWithdrawals}
           sub="Active withdrawal periods"
        />
        <MetricCard 
           icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
           label="Compliance Rate"
           value="98.2%"
           sub="Based on ledger checks"
        />
      </div>

      {/* GRAPHS ROW 1 */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-lg mb-6">Disease Outbreak Trends</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data.diseaseDistribution}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   outerRadius={80}
                   fill="#8884d8"
                   dataKey="value"
                 >
                   {data.diseaseDistribution.map((entry: any, index: number) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-lg mb-6">Platform Adoption</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.adoptionTrend}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="month" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
      {/* BROADCAST AND DIRECTORY ROW */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* BROADCAST ALERT */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
           <h3 className="font-semibold text-lg mb-4 text-blue-900">Broadcast Alert</h3>
           <p className="text-sm text-blue-700 mb-4">Send a system-wide notification to all farmers' dashboards.</p>
           <form onSubmit={handleBroadcast} className="space-y-4">
             <div>
               <label className="block text-xs font-semibold text-blue-800 mb-1">Alert Type</label>
               <select 
                 value={alertType}
                 onChange={(e) => setAlertType(e.target.value)}
                 className="w-full p-2 rounded-md border border-blue-200 bg-white"
               >
                 <option value="info">Information</option>
                 <option value="warning">Weather/Pest Warning</option>
                 <option value="critical">Critical Alert</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-blue-800 mb-1">Message</label>
               <textarea 
                 value={alertMsg}
                 onChange={(e) => setAlertMsg(e.target.value)}
                 className="w-full p-2 rounded-md border border-blue-200 bg-white min-h-[100px]"
                 placeholder="Type your alert message here..."
               />
             </div>
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
               Send Broadcast
             </button>
           </form>

           {activeAlerts.length > 0 && (
             <div className="mt-6 border-t border-blue-200 pt-4">
               <h4 className="font-semibold text-sm text-blue-900 mb-3">Active Broadcasts</h4>
               <div className="space-y-3 max-h-[300px] overflow-y-auto">
                 {activeAlerts.map((alert: any) => (
                   <div key={alert._id} className="bg-white p-3 rounded-lg border text-sm flex flex-col gap-2">
                     <div className="flex justify-between items-start">
                       <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                         alert.type === 'critical' ? 'bg-red-100 text-red-700' :
                         alert.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                         'bg-blue-100 text-blue-700'
                       }`}>{alert.type}</span>
                       <button onClick={() => deleteAlert(alert._id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                         Revoke
                       </button>
                     </div>
                     <p className="text-slate-700">{alert.message}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* FARMER DIRECTORY */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">Farmer Directory</h3>
             <button onClick={downloadCSV} className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md">
               Export CSV
             </button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                 <tr>
                   <th className="px-4 py-3">Name</th>
                   <th className="px-4 py-3">Phone</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {farmers.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No farmers registered yet.</td>
                   </tr>
                 ) : (
                   farmers.map((farmer: any, idx: number) => (
                     <tr key={idx} className="border-b hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium">
                         {farmer.name || "Unknown"}
                         {farmer.subscriptionStatus === "premium" && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded">PREMIUM</span>}
                       </td>
                       <td className="px-4 py-3">{farmer.phone || "N/A"}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                           farmer.role === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                         }`}>
                           {farmer.role === 'suspended' ? 'Suspended' : 'Active'}
                         </span>
                       </td>
                       <td className="px-4 py-3">
                         <div className="flex gap-2 items-center">
                           {farmer.role !== 'suspended' ? (
                             <button onClick={() => handleFarmerAction(farmer._id, 'suspend')} className="text-xs text-orange-600 hover:underline">Suspend</button>
                           ) : (
                             <button onClick={() => handleFarmerAction(farmer._id, 'activate')} className="text-xs text-green-600 hover:underline">Activate</button>
                           )}
                           {farmer.subscriptionStatus !== 'premium' && (
                             <button onClick={() => handleFarmerAction(farmer._id, 'premium')} className="text-xs text-yellow-600 hover:underline">Upgrade</button>
                           )}
                           <button onClick={() => handleFarmerAction(farmer._id, 'delete')} className="text-xs text-red-600 hover:underline">Delete</button>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="flex gap-4 flex-wrap mt-8">
        <Link to="/amu" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">
           View AMU Ledger
        </Link>
      </div>

    </div>
  );
}

function MetricCard({ icon, label, value, sub }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
         <span className="p-2 bg-slate-50 rounded-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
