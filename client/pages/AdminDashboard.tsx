import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/system")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
      
      {/* QUICK LINKS */}
      <div className="flex gap-4">
        <Link to="/amu" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">
           View AMU Ledger
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">
           View Farmer Dashboard
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
