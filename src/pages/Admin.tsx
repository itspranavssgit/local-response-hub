import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { useNavigate } from "react-router-dom";
import { LogOut, AlertCircle, MapPin, User, Trash2, Truck } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

const Admin = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([
    { id: 1, contact_number: "9999999999", details: "Power outage in sector 7", created_at: "2025-10-16 10:00" },
    { id: 2, contact_number: "8888888888", details: "Water leak on 3rd floor", created_at: "2025-10-16 11:15" },
    { id: 3, contact_number: "7777777777", details: "Elevator stuck at floor 5", created_at: "2025-10-16 12:30" },
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/admin");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Signed Out", description: "You have been signed out successfully." });
      setUser(null);
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Demo: Track location
  const handleTrackLocation = (contact_number: string) => {
    toast({ title: "Track Location", description: `Tracking location for ${contact_number} (demo).` });
  };

  // Manage profile options
  const handleAssignAmbulance = (contact_number: string) => {
    toast({ title: "Assign Ambulance", description: `Ambulance assigned to ${contact_number} (demo).` });
  };

  const handleDeletePatient = (id: number) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
    toast({ title: "Patient Deleted", description: "Patient removed from the list (demo)." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Staff Portal</h1>
            </div>
            <Button variant="secondary" onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 max-w-md">
          <Card className="p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Staff Login</h2>
              <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
            </div>
            <Button onClick={handleGoogleSignIn} className="w-full h-12 text-lg" size="lg">
              Continue with Google
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <Button variant="secondary" onClick={handleSignOut} size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Emergency Requests Dashboard</h2>

          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="p-4 border rounded shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <p><strong>Contact Number:</strong> {req.contact_number}</p>
                  <p><strong>Details:</strong> {req.details}</p>
                  <p><strong>Date:</strong> {req.created_at}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => handleTrackLocation(req.contact_number)}>
                    <MapPin className="mr-1 h-4 w-4" /> Track Location
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAssignAmbulance(req.contact_number)}>
                    <Truck className="mr-1 h-4 w-4" /> Assign Ambulance
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePatient(req.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete Patient
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
