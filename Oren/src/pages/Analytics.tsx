import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalQuotations: 0,
    totalBills: 0,
    averageQuotationValue: 0,
    averageBillValue: 0,
    paymentRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const [quotationsRes, billsRes] = await Promise.all([
      supabase.from("quotations").select("grand_total"),
      supabase.from("bills").select("grand_total, paid_amount, payment_status"),
    ]);

    const quotations = quotationsRes.data || [];
    const bills = billsRes.data || [];

    const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.grand_total), 0);
    const paidAmount = bills.reduce((sum, bill) => sum + Number(bill.paid_amount), 0);
    const pendingAmount = totalRevenue - paidAmount;

    const averageQuotationValue = quotations.length > 0
      ? quotations.reduce((sum, q) => sum + Number(q.grand_total), 0) / quotations.length
      : 0;

    const averageBillValue = bills.length > 0
      ? totalRevenue / bills.length
      : 0;

    const paymentRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;

    setAnalytics({
      totalRevenue,
      paidAmount,
      pendingAmount,
      totalQuotations: quotations.length,
      totalBills: bills.length,
      averageQuotationValue,
      averageBillValue,
      paymentRate,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-sm opacity-90">Business insights and performance metrics</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₹{analytics.totalRevenue.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Amount Collected
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₹{analytics.paidAmount.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Amount
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                ₹{analytics.pendingAmount.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Collection Rate
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {analytics.paymentRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Quotation Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₹{analytics.averageQuotationValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Bill Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₹{analytics.averageBillValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quotations</p>
                  <p className="text-2xl font-bold">{analytics.totalQuotations}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="text-2xl font-bold">{analytics.totalBills}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {analytics.totalQuotations > 0
                      ? ((analytics.totalBills / analytics.totalQuotations) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-destructive">
                    {analytics.totalBills - Math.round((analytics.paidAmount / analytics.totalRevenue) * analytics.totalBills)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
