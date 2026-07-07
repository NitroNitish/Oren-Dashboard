import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileText, Receipt, Search, Trash2, FileCheck } from "lucide-react";
import { toast } from "sonner";

export default function History() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteQuotationId, setDeleteQuotationId] = useState<string | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [quotationsRes, billsRes] = await Promise.all([
      supabase.from("quotations").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("bills").select("*, clients(name)").order("created_at", { ascending: false }),
    ]);

    if (quotationsRes.data) setQuotations(quotationsRes.data);
    if (billsRes.data) setBills(billsRes.data);
  };

  const filterData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleDeleteQuotation = async () => {
    if (!deleteQuotationId) return;
    
    try {
      const { error } = await supabase
        .from("quotations")
        .delete()
        .eq("id", deleteQuotationId);

      if (error) throw error;

      toast.success("Quotation deleted successfully!");
      setDeleteQuotationId(null);
      loadData();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation");
    }
  };

  const handleDeleteBill = async () => {
    if (!deleteBillId) return;
    
    try {
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("id", deleteBillId);

      if (error) throw error;

      toast.success("Bill deleted successfully!");
      setDeleteBillId(null);
      loadData();
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast.error("Failed to delete bill");
    }
  };

  const handleConvertToBill = async (quotation: any) => {
    try {
      const billNumber = `RKW-B-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      
      const billData = {
        bill_number: billNumber,
        client_id: quotation.client_id,
        project_title: quotation.project_title,
        items: quotation.items,
        subtotal: quotation.subtotal,
        tax_percentage: quotation.tax_percentage,
        tax_amount: quotation.tax_amount,
        discount_percentage: quotation.discount_percentage,
        discount_amount: quotation.discount_amount,
        grand_total: quotation.grand_total,
        signature_data: quotation.signature_data,
        payment_status: "pending",
        paid_amount: 0,
      };

      const { error } = await supabase
        .from("bills")
        .insert(billData as any);

      if (error) throw error;

      toast.success("Quotation converted to bill successfully!");
      loadData();
    } catch (error) {
      console.error("Error converting to bill:", error);
      toast.error("Failed to convert quotation to bill");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">History</h1>
            <p className="text-sm opacity-90">View all quotations and bills</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="quotations">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quotations">
              <FileText className="mr-2 h-4 w-4" />
              Quotations
            </TabsTrigger>
            <TabsTrigger value="bills">
              <Receipt className="mr-2 h-4 w-4" />
              Bills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotations" className="space-y-4">
            {filterData(quotations).map((quotation) => (
              <Card key={quotation.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/quotation/edit/${quotation.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{quotation.quotation_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-muted-foreground">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertToBill(quotation);
                        }}
                        className="h-8"
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        Convert to Bill
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteQuotationId(quotation.id);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">{quotation.project_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{quotation.clients?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-primary">₹{Number(quotation.grand_total).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{quotation.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            {filterData(bills).map((bill) => (
              <Card key={bill.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/bill/edit/${bill.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{bill.bill_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-muted-foreground">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteBillId(bill.id);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">{bill.project_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{bill.clients?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-primary">₹{Number(bill.grand_total).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className={`font-medium capitalize ${bill.payment_status === 'paid' ? 'text-green-600' : 'text-destructive'}`}>
                        {bill.payment_status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!deleteQuotationId} onOpenChange={() => setDeleteQuotationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuotation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteBillId} onOpenChange={() => setDeleteBillId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
