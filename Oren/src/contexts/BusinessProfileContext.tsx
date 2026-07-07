import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessProfile {
  id?: string;
  businessName: string;
  brandName: string;
  logo: string; // base64 or data URL
  address: string;
  phone: string;
}

interface BusinessProfileContextType {
  profile: BusinessProfile | null;
  setProfile: (profile: BusinessProfile) => Promise<void>;
  isLoaded: boolean;
  session: any | null;
}

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export function BusinessProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<BusinessProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    async function initialize(currentSession: any) {
      if (currentSession) {
        try {
          const { data, error } = await supabase
            .from("business_profiles")
            .select("*")
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error("Error loading profile from Supabase:", error);
          } else if (data) {
            setProfileState({
              id: data.id,
              businessName: data.business_name,
              brandName: data.brand_name,
              logo: data.logo || "",
              address: data.address || "",
              phone: data.phone || "",
            });
          }
        } catch (err) {
          console.error("Failed to load business profile", err);
        }
      } else {
        setProfileState(null);
      }
      setIsLoaded(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      initialize(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      initialize(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setProfile = async (newProfile: BusinessProfile) => {
    try {
      if (profile?.id) {
        // Update existing profile
        const { error } = await supabase
          .from("business_profiles")
          .update({
            business_name: newProfile.businessName,
            brand_name: newProfile.brandName,
            logo: newProfile.logo,
            address: newProfile.address,
            phone: newProfile.phone,
          })
          .eq("id", profile.id);

        if (error) throw error;
        setProfileState({ ...newProfile, id: profile.id });
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from("business_profiles")
          .insert({
            business_name: newProfile.businessName,
            brand_name: newProfile.brandName,
            logo: newProfile.logo,
            address: newProfile.address,
            phone: newProfile.phone,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setProfileState({
            id: data.id,
            businessName: data.business_name,
            brandName: data.brand_name,
            logo: data.logo || "",
            address: data.address || "",
            phone: data.phone || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to save business profile to Supabase", err);
      throw err;
    }
  };

  return (
    <BusinessProfileContext.Provider value={{ profile, setProfile, isLoaded, session }}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

export function useBusinessProfile() {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error("useBusinessProfile must be used within a BusinessProfileProvider");
  }
  return context;
}
