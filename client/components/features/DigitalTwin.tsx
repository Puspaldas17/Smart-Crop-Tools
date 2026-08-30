import { useState, useEffect } from "react";
import { Thermometer, Droplets, Satellite, Leaf, Activity } from "lucide-react";

export function DigitalTwin() {
  const [data, setData] = useState({
    soilMoisture: 45,
    soilNPK: { n: 40, p: 30, k: 50 },
    ndvi: 0.65,
    cropStage: "Vegetative",
    temperature: 28,
    healthScore: 85,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        soilMoisture: Math.max(10, Math.min(90, prev.soilMoisture + (Math.random() * 4 - 2))),
        temperature: Math.max(15, Math.min(45, prev.temperature + (Math.random() * 2 - 1))),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Farm Digital Twin
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Sensors Active
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Soil Moisture */}
        <div className="p-5 glass-panel bento-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Droplets className="h-5 w-5" />
            </div>
            <p className="font-medium">Soil Moisture</p>
          </div>
          <p className="text-2xl font-bold">{data.soilMoisture.toFixed(1)}%</p>
          <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${data.soilMoisture}%` }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="p-5 glass-panel bento-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Thermometer className="h-5 w-5" />
            </div>
            <p className="font-medium">Micro-climate</p>
          </div>
          <p className="text-2xl font-bold">{data.temperature.toFixed(1)}°C</p>
          <p className="text-sm text-muted-foreground mt-1">Optimal for current stage</p>
        </div>

        {/* Satellite NDVI */}
        <div className="p-5 glass-panel bento-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Satellite className="h-5 w-5" />
            </div>
            <p className="font-medium">Satellite NDVI</p>
          </div>
          <p className="text-2xl font-bold">{data.ndvi.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">Vegetation Index</p>
        </div>

        {/* NPK Levels */}
        <div className="p-5 glass-panel bento-card md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                 <Activity className="h-5 w-5" />
               </div>
               <p className="font-medium">Soil NPK Levels</p>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Nitrogen (N)</p>
              <p className="text-xl font-bold text-slate-700">{data.soilNPK.n} <span className="text-xs font-normal">mg/kg</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Phosphorus (P)</p>
              <p className="text-xl font-bold text-slate-700">{data.soilNPK.p} <span className="text-xs font-normal">mg/kg</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Potassium (K)</p>
              <p className="text-xl font-bold text-slate-700">{data.soilNPK.k} <span className="text-xs font-normal">mg/kg</span></p>
            </div>
          </div>
        </div>

        {/* Crop Stage */}
        <div className="p-5 glass-panel bento-card relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Leaf className="h-5 w-5" />
            </div>
            <p className="font-medium">Crop Stage Tracking</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{data.cropStage}</p>
          
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">
              <span>Seedling</span>
              <span className="text-green-600">Vegetative</span>
              <span>Flowering</span>
              <span>Harvest</span>
            </div>
            <div className="flex gap-1 relative">
              <div className="h-2 flex-1 bg-green-500 rounded-full"></div>
              <div className="h-2 flex-1 bg-green-500 rounded-full relative">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-4 border-green-600 rounded-full shadow-sm z-10"></div>
              </div>
              <div className="h-2 flex-1 bg-secondary rounded-full"></div>
              <div className="h-2 flex-1 bg-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 glass-panel bento-card flex items-start gap-4">
         <div className="p-2 bg-blue-500/20 rounded-xl shrink-0">
           <Activity className="h-6 w-6 text-blue-400" />
         </div>
         <div>
           <h4 className="font-bold text-foreground">System Status</h4>
           <p className="text-muted-foreground text-sm mt-1">All IoT sensors are online and transmitting data. Satellite imagery was updated 4 hours ago. The XAI advisory model is actively using this data to generate recommendations.</p>
         </div>
      </div>
    </div>
  );
}
