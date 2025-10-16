import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { useNavigate } from "react-router-dom";
import { LogOut, AlertCircle, MapPin, Trash2, Truck } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

interface EmergencyRequest {
  id: number;
  name: string;
  details: string;
  created_at: string;
  status?: string;
  latitude?: number;
  longitude?: number;
}

const Admin = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // -------------------------
  // Authentication
  // -------------------------
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

  // -------------------------
  // Fetch emergency requests
  // -------------------------
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from<EmergencyRequest>("emergency_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching requests", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
  };

  useEffect(() => {
    fetchRequests();

    const subscription = supabase
      .from("emergency_requests")
      .on("*", () => fetchRequests())
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // -------------------------
  // Button Handlers
  // -------------------------
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Signed Out", description: "You have been signed out successfully." });
      setUser(null);
    } catch (error) {
      toast({ title: "Sign Out Failed", description: "Could not sign out. Please try again.", variant: "destructive" });
    }
  };

  const handleTrackLocation = (lat?: number, lng?: number, name?: string) => {
    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      toast({ title: "Location not available", description: `Cannot track location for ${name}`, variant: "destructive" });
    }
  };

  const handleAssignAmbulance = async (id: number) => {
    const { error } = await supabase
      .from("emergency_requests")
      .update({ status: "ambulance assigned" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ambulance Assigned", description: "Ambulance assigned successfully." });
      fetchRequests();
    }
  };

  const handleDeletePatient = async (id: number) => {
    const { error } = await supabase
      .from("emergency_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Patient Deleted", description: "Patient removed successfully." });
      fetchRequests();
    }
  };

  // -------------------------
  // Render
  // -------------------------
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
                  <p><strong>Name:</strong> {req.name}</p>
                  <p><strong>Details:</strong> {req.details}</p>
                  <p><strong>Date:</strong> {req.created_at}</p>
                  <p><strong>Status:</strong> {req.status || "pending"}</p>
                  {req.latitude && req.longitude && (
                    <p><strong>Coordinates:</strong> {req.latitude}, {req.longitude}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => handleTrackLocation(req.latitude, req.longitude, req.name)}>
                    <MapPin className="mr-1 h-4 w-4" /> Track Location
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAssignAmbulance(req.id)}>
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
