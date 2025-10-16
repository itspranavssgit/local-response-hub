import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { useNavigate } from "react-router-dom";
import { LogOut, AlertCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  // -------------------------------
  // 1️⃣ Check user and fetch requests
  // -------------------------------
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        setUser(data?.user ?? null);
        setLoading(false);

        if (data?.user) fetchRequests();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/admin");
      if (session?.user) fetchRequests();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // -------------------------------
  // 2️⃣ Fetch requests from Supabase
  // -------------------------------
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("requests") // Replace with your table name
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data ?? []);
    } catch (err: any) {
      toast({
        title: "Error fetching requests",
        description: err.message || "Could not fetch requests",
        variant: "destructive",
      });
    }
  };

  // -------------------------------
  // 3️⃣ Real-time subscription for new requests
  // -------------------------------
  useEffect(() => {
    const subscription = supabase
      .from("requests")
      .on("INSERT", (payload) => {
        setRequests((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // -------------------------------
  // 4️⃣ Google Sign In
  // -------------------------------
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "Sign In Failed",
        description: err.message || "Could not sign in with Google",
        variant: "destructive",
      });
    }
  };

  // -------------------------------
  // 5️⃣ Sign Out
  // -------------------------------
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Sign Out Failed",
        description: err.message || "Could not sign out",
        variant: "destructive",
      });
    }
  };

  // -------------------------------
  // 6️⃣ Loading State
  // -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // -------------------------------
  // 7️⃣ User Not Logged In
  // -------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Staff Portal</h1>
            </div>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-md">
          <Card className="p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Staff Login</h2>
              <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className="w-full h-12 text-lg"
              size="lg"
            >
              Continue with Google
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  // -------------------------------
  // 8️⃣ Admin Dashboard
  // -------------------------------
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email ?? "Loading..."}</span>
            <Button variant="secondary" onClick={handleSignOut} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Emergency Requests Dashboard</h2>

          {requests.length === 0 ? (
            <p className="text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req: any, index: number) => (
                <div key={req.id ?? index} className="p-4 border rounded shadow-sm">
                  <p><strong>Request ID:</strong> {req.id ?? "N/A"}</p>
                  <p><strong>Name:</strong> {req.name ?? "N/A"}</p>
                  <p><strong>Details:</strong> {req.details ?? "N/A"}</p>
                  <p><strong>Date:</strong> {req.created_at ? new Date(req.created_at).toLocaleString() : "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Admin;
