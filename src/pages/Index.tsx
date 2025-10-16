import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { AlertCircle, MapPin, Phone, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [patientCount, setPatientCount] = useState("1");
  const [emergencyType, setEmergencyType] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enable location to submit emergency request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("emergency_requests").insert({
        patient_count: parseInt(patientCount),
        emergency_type: emergencyType,
        location_lat: location.lat,
        location_lng: location.lng,
        contact_phone: contactPhone,
        notes: notes || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Emergency Request Submitted",
        description: "Help is on the way! We're finding the nearest available partner.",
      });

      // Reset form
      setPatientCount("1");
      setEmergencyType("");
      setContactPhone("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Rural Emergency Response</h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin")}
            className="text-sm"
          >
            Staff Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6 shadow-xl border-2">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Reques Emergency Help</h2>
            <p className="text-muted-foreground">Quick medical transport for rural areas</p>
          </div>

          {/* Location Status */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-5 w-5 text-primary" />
              {location ? (
                <span className="text-foreground font-medium">Location detected ✓</span>
              ) : (
                <span className="text-muted-foreground">Detecting location...</span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Count */}
            <div className="space-y-2">
              <Label htmlFor="patientCount" className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Patients
              </Label>
              <Select value={patientCount} onValueChange={setPatientCount}>
                <SelectTrigger id="patientCount" className="h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Patient</SelectItem>
                  <SelectItem value="2">2 Patients</SelectItem>
                  <SelectItem value="3">3 Patients</SelectItem>
                  <SelectItem value="4">4+ Patients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Type */}
            <div className="space-y-2">
              <Label htmlFor="emergencyType" className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Type of Emergency
              </Label>
              <Select value={emergencyType} onValueChange={setEmergencyType} required>
                <SelectTrigger id="emergencyType" className="h-12 text-lg">
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Road Accident</SelectItem>
                  <SelectItem value="cardiac">Heart Attack / Cardiac</SelectItem>
                  <SelectItem value="breathing">Breathing Problem</SelectItem>
                  <SelectItem value="injury">Serious Injury</SelectItem>
                  <SelectItem value="pregnancy">Pregnancy Emergency</SelectItem>
                  <SelectItem value="other">Other Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter contact number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-12 text-lg"
                required
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base">
                Additional Information (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific details about the emergency..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 text-base"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-xl font-bold"
              disabled={!location || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-6 w-6" />
                  Request Emergency Help Now
                </>
              )}
            </Button>
          </form>

          {/* Info Footer */}
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground text-center">
            <p>Help will be assigned to the nearest available partner automatically</p>
          </div>
        </Card>
      </main>
    </div>
  );
};
import React, { useState } from 'react';
import MapComponent from 'src/components/MapComponent';

export default function EmergencyRequest() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Emergency request sent with location:', location);
    // You can later send this data to Supabase
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-2">Emergency Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <MapComponent onLocationChange={setLocation} mapHeight="350px" />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default Index;

