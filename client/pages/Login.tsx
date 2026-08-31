import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login, farmer } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmer) navigate("/dashboard", { replace: true });
  }, [farmer, navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Registration failed");

      login(data.user, data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "en-IN" }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Guest login failed");

      login(data);
      toast.success("Welcome, Guest!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 animate-fade-in-up">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden group">
        <img 
          src="/images/auth_bg.jpg" 
          alt="Farmer checking tablet" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 text-white z-10 animate-fade-in-up delay-200">
          <h2 className="text-4xl font-black mb-4">Empower Your Harvest</h2>
          <p className="text-lg text-white/80 max-w-md">Join AgriVerse to get AI-powered insights, real-time market data, and expert advisory tailored for your farm.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4 lg:p-12 animate-fade-in-up delay-100">
        <Card className="w-full max-w-md border-0 lg:border shadow-neo bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-green-700 tracking-tight">AgriVerse</CardTitle>
            <CardDescription className="font-semibold">Smart Farming Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 rounded-xl p-1">
                <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="farmer@example.com" required className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" name="password" type="password" required className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Log In"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" name="name" placeholder="John Doe" required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" name="email" type="email" placeholder="farmer@example.com" required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone</Label>
                    <Input id="reg-phone" name="phone" type="tel" placeholder="9876543210" required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" name="password" type="password" required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="reg-soil">Soil Type</Label>
                       <Input id="reg-soil" name="soilType" placeholder="Loam" className="rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="reg-land">Land Size (Acres)</Label>
                       <Input id="reg-land" name="landSize" type="number" step="0.1" placeholder="5.5" className="rounded-xl border-slate-200" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold">
                <span className="bg-white/80 px-2 text-muted-foreground">Or continue as</span>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl border-slate-300 hover:bg-slate-100 font-bold" onClick={handleGuestLogin} disabled={loading}>
              Guest User
            </Button>

            <div className="text-center text-sm text-slate-500 mt-6 pt-4 border-t border-slate-200/50">
              <p className="mb-2 font-semibold">For Demo Purposes:</p>
              <div className="flex justify-center gap-2 text-xs">
                 <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    // Simulate vet login
                    login({ ...farmer, role: 'vet', name: 'Dr. John Doe' } as any);
                    navigate("/dashboard");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                 >
                   Login as Vet
                 </Button>
                 <span className="self-center opacity-50">|</span>
                 <Button 
                  variant="ghost" 
                  size="sm" 
                   onClick={() => {
                    // Simulate admin login
                    login({ ...farmer, role: 'admin', name: 'Authority' } as any);
                    navigate("/dashboard");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                 >
                   Login as Admin
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
