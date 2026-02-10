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

      login(data);
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

      login(data);
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">AgriVerse</CardTitle>
          <CardDescription>Smart Farming Assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="farmer@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input id="reg-name" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" name="email" type="email" placeholder="farmer@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone</Label>
                  <Input id="reg-phone" name="phone" type="tel" placeholder="9876543210" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" name="password" type="password" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="reg-soil">Soil Type</Label>
                     <Input id="reg-soil" name="soilType" placeholder="Loam" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="reg-land">Land Size (Acres)</Label>
                     <Input id="reg-land" name="landSize" type="number" step="0.1" placeholder="5.5" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue as</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={loading}>
            Guest
          </Button>

          <div className="text-center text-sm text-slate-500 mt-6">
            <p className="mb-2">For Demo Purposes:</p>
            <div className="flex justify-center gap-2 text-xs">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // Simulate vet login
                  login({ ...farmer, role: 'vet', name: 'Dr. John Doe' } as any);
                  navigate("/dashboard");
                }}
                className="text-blue-600 hover:text-blue-800"
               >
                 Login as Vet
               </Button>
               <span className="self-center">|</span>
               <Button 
                variant="ghost" 
                size="sm" 
                 onClick={() => {
                  // Simulate admin login
                  login({ ...farmer, role: 'admin', name: 'Authority' } as any);
                  navigate("/dashboard");
                }}
                className="text-blue-600 hover:text-blue-800"
               >
                 Login as Admin
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
