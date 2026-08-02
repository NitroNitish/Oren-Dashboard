import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Receipt, Briefcase, Users, TrendingUp, Clock, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalBills: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalClients: 0,
    totalProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [quotations, bills, clients, projects] = await Promise.all([
        supabase.from("quotations").select("grand_total"),
        supabase.from("bills").select("grand_total, paid_amount, payment_status"),
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("projects").select("id, name, created_at, images", { count: "exact" }).order("created_at", { ascending: false }).limit(4),
      ]);

      const totalRevenue = bills.data?.reduce((sum, bill) => sum + Number(bill.grand_total), 0) || 0;
      const pendingPayments = bills.data
        ?.filter(bill => bill.payment_status !== "paid")
        .reduce((sum, bill) => sum + (Number(bill.grand_total) - Number(bill.paid_amount)), 0) || 0;

      setStats({
        totalQuotations: quotations.data?.length || 0,
        totalBills: bills.data?.length || 0,
        totalRevenue,
        pendingPayments,
        totalClients: clients.count || 0,
        totalProjects: projects.count || 0,
      });
      
      if (projects.data) {
        setRecentProjects(projects.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <img src="/favicon.png" alt="Oren Logo" className="w-12 h-12 object-contain bg-primary/10 rounded-xl p-2" />
          <h1 className="text-3xl font-bold text-primary tracking-tight">Oren Dashboard</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search quotations, bills, clients..." 
            className="pl-10 max-w-xl bg-card border-muted-foreground/20"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => navigate("/quotation/new")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <FileText className="mr-2 h-6 w-6" />
            Quotation
          </Button>
          <Button
            onClick={() => navigate("/bill/new")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <Receipt className="mr-2 h-6 w-6" />
            Billing
          </Button>
          <Button
            onClick={() => navigate("/clients")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <Users className="mr-2 h-6 w-6" />
            Clients
          </Button>
          <Button
            onClick={() => navigate("/portfolio")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <Briefcase className="mr-2 h-6 w-6" />
            Portfolio
          </Button>
          <Button
            onClick={() => navigate("/history")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <Clock className="mr-2 h-6 w-6" />
            History
          </Button>
          <Button
            onClick={() => navigate("/analytics")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <TrendingUp className="mr-2 h-6 w-6" />
            Analytics
          </Button>
          <Button
            onClick={() => navigate("/rates")}
            className="h-24 text-lg font-semibold"
            size="lg"
          >
            <FileText className="mr-2 h-6 w-6" />
            Rates
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quotations
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalQuotations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bills
              </CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalBills}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Projects
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalProjects}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Projects</h2>
            <Button variant="outline" onClick={() => navigate("/portfolio")}>View All</Button>
          </div>
          
          {recentProjects.length === 0 ? (
            <Card className="p-8 text-center bg-muted/20">
              <p className="text-muted-foreground mb-4">No projects added yet.</p>
              <Button onClick={() => navigate("/portfolio/add")}>Add Your First Project</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/portfolio")}>
                  {project.images && project.images.length > 0 ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.name} 
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate" title={project.name}>{project.name}</h3>
                    {project.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Added: {new Date(project.created_at).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
