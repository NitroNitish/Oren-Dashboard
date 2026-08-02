import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Download, Save } from "lucide-react";
import jsPDF from "jspdf";
import { useBusinessProfile } from "@/contexts/BusinessProfileContext";

interface Item {
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export default function QuotationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useBusinessProfile();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, rate: 0, total: 0 }]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [quotationNumber, setQuotationNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    if (data) setClients(data);
  };

  const loadQuotation = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setProjectTitle(data.project_title);
        setSelectedClientId(data.client_id || "");
        setItems((data.items as any) as Item[]);
        setTaxPercentage(data.tax_percentage || 0);
        setDiscountPercentage(data.discount_percentage || 0);
        setQuotationNumber(data.quotation_number);
        
        if (data.signature_data && signatureRef.current) {
          signatureRef.current.fromDataURL(data.signature_data);
        }
      }
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, rate: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      newItems[index].total = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < items.length - 1) {
        document.getElementById(`item-${index + 1}-${field}`)?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        document.getElementById(`item-${index - 1}-${field}`)?.focus();
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxPercentage) / 100;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const generateQuotationNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const prefix = profile?.brandName ? profile.brandName.substring(0, 3).toUpperCase() : "QUO";
    return `${prefix}-Q-${year}-${random}`;
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const saveQuotation = async () => {
    if (!projectTitle || !selectedClientId || items.some(item => !item.name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const signatureData = signatureRef.current?.toDataURL();
    const number = id ? quotationNumber : generateQuotationNumber();

    try {
      const quotationData = {
        quotation_number: number,
        client_id: selectedClientId,
        project_title: projectTitle,
        items: items as any,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        signature_data: signatureData,
        status: "draft",
      };

      let error;
      if (id) {
        // Update existing quotation
        const result = await supabase
          .from("quotations")
          .update(quotationData as any)
          .eq("id", id);
        error = result.error;
      } else {
        // Insert new quotation
        const result = await supabase
          .from("quotations")
          .insert(quotationData as any);
        error = result.error;
      }

      if (error) throw error;

      toast.success(id ? "Quotation updated successfully!" : "Quotation saved successfully!");
      navigate("/history");
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error("Failed to save quotation");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 30;
    
    const checkPageBreak = (currentY: number, neededSpace: number = 20) => {
      if (currentY + neededSpace > pageHeight - marginBottom) {
        doc.addPage();
        return 20; // Return new Y position at top of new page
      }
      return currentY;
    };
    
    const formatCurrency = (amount: number) => {
      return "Rs. " + amount.toFixed(2);
    };
    
    // Theme colors: Orange (249, 115, 22)
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(10);
    doc.text(profile?.businessName || "Your Business Name", 15, 15);
    doc.text(`Mobile: ${profile?.phone || "N/A"}`, pageWidth - 15, 15, { align: "right" });
    
    let headerY = 25;
    
    // Company name centered in orange
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text(profile?.businessName || "Your Business Name", pageWidth / 2, headerY, { align: "center" });
    
    // Address below company name
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const splitAddress = doc.splitTextToSize(profile?.address || "Your Address", 100);
    doc.text(splitAddress, pageWidth / 2, headerY + 7, { align: "center" });
    
    // Document number on left
    doc.setFontSize(14);
    doc.text(id ? quotationNumber : generateQuotationNumber(), 15, headerY);
    
    // Date on right
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 15, headerY, { align: "right" });
    
    // Horizontal line
    doc.setDrawColor(249, 115, 22);
    let lineY = headerY + 15;
    if (splitAddress.length > 1) {
      lineY += (splitAddress.length - 1) * 5;
    }
    doc.line(15, lineY, pageWidth - 15, lineY);
    
    // Project details
    doc.setFontSize(10);
    doc.text(`Project: ${projectTitle}`, 15, lineY + 8);
    const client = clients.find(c => c.id === selectedClientId);
    let clientYPos = lineY + 15;
    if (client) {
      doc.text(`Client: ${client.name}`, 15, clientYPos);
      if (client.address) {
        clientYPos += 5;
        doc.text(`Address: ${client.address}`, 15, clientYPos);
      }
    }
    
    // Items Table Header
    let yPos = clientYPos + 15;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("No.", 15, yPos);
    doc.text("Item Description", 30, yPos);
    doc.text("Qty", 115, yPos);
    doc.text("Rate", 140, yPos);
    doc.text("Total", 170, yPos);
    
    // Table line
    yPos += 2;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Items
    yPos += 7;
    doc.setFont(undefined, "normal");
    items.forEach((item, index) => {
      yPos = checkPageBreak(yPos, 10);
      doc.text((index + 1).toString(), 15, yPos);
      doc.text(item.name, 30, yPos);
      doc.text(item.quantity.toString(), 115, yPos);
      doc.text(item.rate.toFixed(2), 140, yPos);
      doc.text(item.total.toFixed(2), 170, yPos);
      yPos += 7;
    });
    
    // Check if we need page break for totals section
    yPos = checkPageBreak(yPos, 50);
    
    // Totals section
    yPos += 5;
    doc.line(120, yPos, pageWidth - 15, yPos);
    yPos += 7;
    doc.text("Subtotal:", 120, yPos);
    doc.text(formatCurrency(subtotal), 160, yPos, { align: "left" });
    yPos += 7;
    doc.text(`Tax (${taxPercentage}%):`, 120, yPos);
    doc.text(formatCurrency(taxAmount), 160, yPos, { align: "left" });
    yPos += 7;
    doc.text(`Discount (${discountPercentage}%):`, 120, yPos);
    doc.text("- " + formatCurrency(discountAmount), 160, yPos, { align: "left" });
    yPos += 7;
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", 120, yPos);
    doc.text(formatCurrency(grandTotal), 160, yPos, { align: "left" });
    
    // Signature
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      yPos += 15;
      yPos = checkPageBreak(yPos, 40);
      doc.addImage(signatureData, "PNG", pageWidth - 70, yPos, 50, 20);
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.text(profile?.brandName || "Authorized Signatory", pageWidth - 45, yPos + 25, { align: "center" });
      doc.setFont(undefined, "normal");
      doc.text("(Authorized Signature)", pageWidth - 45, yPos + 30, { align: "center" });
    }
    
    doc.save(`Quotation-${id ? quotationNumber : generateQuotationNumber()}.pdf`);
    toast.success("PDF exported successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading quotation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground shadow-lg print:shadow-none rounded-b-xl mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium">{profile?.businessName || "Your Business Name"}</div>
            <div className="text-sm">Mobile: {profile?.phone || "N/A"}</div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft />
            </Button>
            <div className="flex-1 text-center flex flex-col items-center">
              <h1 className="text-4xl font-bold tracking-tight">{profile?.businessName || "Your Business Name"}</h1>
              <p className="text-sm opacity-90 mt-2 max-w-lg mx-auto">{profile?.address || "Your Address"}</p>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-card text-card-foreground shadow-xl rounded-lg p-10 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">{id ? "Edit Quotation" : "New Quotation"}</h2>
            <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString('en-IN')}</p>
          </div>

          <div className="border-b-2 border-border pb-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="projectTitle" className="text-base font-semibold">Project Title *</Label>
                <Input
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="mt-2 h-11"
                />
              </div>
              <div>
                <Label htmlFor="client" className="text-base font-semibold">Select Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="mt-2 h-11">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-800">Items & Services</h3>
              <Button onClick={addItem} size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-1 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-12 gap-3 pb-2 border-b border-gray-300 mb-3 font-semibold text-sm text-gray-700">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-2">Total (₹)</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="py-2 bg-card rounded mb-2 px-2">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <Input
                        id={`item-${index}-name`}
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, "name")}
                        placeholder="Item description"
                        className="h-10 border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        id={`item-${index}-quantity`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                        min="1"
                        className="h-10 border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        id={`item-${index}-rate`}
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                        onKeyDown={(e) => handleKeyDown(e, index, "rate")}
                        min="0"
                        step="0.01"
                        className="h-10 border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        value={`₹${item.total.toFixed(2)}`} 
                        disabled 
                        className="h-10 bg-gray-100 border-gray-300 font-semibold" 
                      />
                    </div>
                    {items.length > 1 && (
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <Label className="text-base font-semibold">Tax (%)</Label>
              <Input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                min="0"
                max="100"
                step="0.01"
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label className="text-base font-semibold">Discount (%)</Label>
              <Input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                min="0"
                max="100"
                step="0.01"
                className="mt-2 h-11"
              />
            </div>
          </div>

          <div className="border-t-2 border-gray-300 pt-6 mb-8">
            <div className="space-y-3 ml-auto max-w-md bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Tax ({taxPercentage}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Discount ({discountPercentage}%):</span>
                <span className="text-red-600">-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary pt-3 border-t-2 border-gray-300">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <Label className="mb-3 block text-base font-semibold">Authorized Signature</Label>
            <div className="border-2 border-border rounded-lg bg-card">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-40 rounded-lg",
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="mt-3"
            >
              Clear Signature
            </Button>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveQuotation} className="flex-1 h-12 text-base">
              <Save className="mr-2 h-5 w-5" />
              {id ? "Update Quotation" : "Save Quotation"}
            </Button>
            <Button onClick={exportPDF} variant="outline" className="flex-1 h-12 text-base">
              <Download className="mr-2 h-5 w-5" />
              Export PDF
            </Button>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-8 pb-4">
          Powered by Oren
        </div>
      </main>
    </div>
  );
}
