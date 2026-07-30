import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessProfile } from "@/contexts/BusinessProfileContext";
import { toast } from "sonner";
import { Upload, Building2 } from "lucide-react";

export default function Onboarding() {
  const { setProfile, profile, session, isLoaded } = useBusinessProfile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState(profile?.businessName || "");
  const [brandName, setBrandName] = useState(profile?.brandName || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [logo, setLogo] = useState<string | null>(profile?.logo || null);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || "");
      setBrandName(profile.brandName || "");
      setAddress(profile.address || "");
      setPhone(profile.phone || "");
      setLogo(profile.logo || null);
    }
  }, [profile]);

  useEffect(() => {
    if (isLoaded && !session) {
      navigate("/auth", { replace: true });
    }
  }, [session, isLoaded, navigate]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !brandName || !address || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await setProfile({
        businessName,
        brandName,
        logo: logo || "/favicon.png", // fallback to default logo
        address,
        phone,
      });
      
      toast.success("Business profile saved successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(`Error: ${error?.message || "Failed to save profile. Check connection."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            Let's personalize your experience by setting up your business profile. 
            This information will appear on your bills and quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div 
                className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {logo ? (
                  <img src={logo} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name (Short)</Label>
                <Input
                  id="brandName"
                  placeholder="e.g. Oren"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Full Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Oren Digital Inc."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-6 h-12 text-lg" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
