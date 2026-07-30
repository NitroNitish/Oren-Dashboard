import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { FileText, Receipt, Briefcase, Users, TrendingUp, Clock, LayoutDashboard, Sun, Moon, Settings } from "lucide-react";
import { useBusinessProfile } from "@/contexts/BusinessProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quotation", href: "/quotation/new", icon: FileText },
  { name: "Billing", href: "/bill/new", icon: Receipt },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "History", href: "/history", icon: Clock },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Rates", href: "/rates", icon: FileText },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { profile, isLoaded, session } = useBusinessProfile();

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-full md:w-64 md:fixed md:inset-y-0 z-50 bg-card border-b md:border-r-[3px] md:border-primary md:border-b-0 shadow-sm flex flex-col">
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <img src="/favicon.png" alt="Oren Logo" className="h-8 w-8 mr-2 object-contain" />
          <span className="text-xl font-bold text-primary truncate" title="Oren">
            Oren
          </span>
        </div>
        <nav className="py-4">
          <ul className="space-y-1 px-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name} className="shrink-0">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t hidden md:block space-y-2">
          <Link
            to="/onboarding"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
