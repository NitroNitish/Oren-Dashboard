import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { BusinessProfileProvider } from "./contexts/BusinessProfileContext";
import AppLayout from "./components/AppLayout";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import QuotationForm from "./pages/QuotationForm";
import BillForm from "./pages/BillForm";
import Clients from "./pages/Clients";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import AddProject from "./pages/AddProject";
import PublicRating from "./pages/PublicRating";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Rates from "./pages/Rates";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BusinessProfileProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <VercelAnalytics />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/rate/:projectId" element={<PublicRating />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/quotation/new" element={<AppLayout><QuotationForm /></AppLayout>} />
                <Route path="/quotation/edit/:id" element={<AppLayout><QuotationForm /></AppLayout>} />
                <Route path="/bill/new" element={<AppLayout><BillForm /></AppLayout>} />
                <Route path="/bill/edit/:id" element={<AppLayout><BillForm /></AppLayout>} />
                <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
                <Route path="/portfolio" element={<AppLayout><Portfolio /></AppLayout>} />
                <Route path="/portfolio/public" element={<PublicPortfolio />} />
                <Route path="/portfolio/add" element={<AppLayout><AddProject /></AppLayout>} />
                <Route path="/history" element={<AppLayout><History /></AppLayout>} />
                <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                <Route path="/rates" element={<AppLayout><Rates /></AppLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </BusinessProfileProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
