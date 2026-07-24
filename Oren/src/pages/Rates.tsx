import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/contexts/BusinessProfileContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Rate {
  id: string;
  item_name: string;
  description: string;
  rate: number;
  unit: string;
  created_at: string;
}

export default function Rates() {
  const navigate = useNavigate();
  const { profile } = useBusinessProfile();
  const [rates, setRates] = useState<Rate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    rate: "",
    unit: "sq.ft",
  });

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    const { data, error } = await supabase
      .from("rates")
      .select("*")
      .order("item_name");

    if (error) {
      console.error("Error loading rates:", error);
      toast.error("Failed to load rates");
    } else {
      setRates(data || []);
    }
  };

  const handleOpenDialog = (rate?: Rate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        item_name: rate.item_name,
        description: rate.description || "",
        rate: rate.rate.toString(),
        unit: rate.unit,
      });
    } else {
      setEditingRate(null);
      setFormData({
        item_name: "",
        description: "",
        rate: "",
        unit: "sq.ft",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRate(null);
    setFormData({
      item_name: "",
      description: "",
      rate: "",
      unit: "sq.ft",
    });
  };

  const handleSave = async () => {
    if (!formData.item_name || !formData.rate) {
      toast.error("Please fill in item name and rate");
      return;
    }

    const rateData = {
      item_name: formData.item_name,
      description: formData.description,
      rate: parseFloat(formData.rate),
      unit: formData.unit,
    };

    try {
      if (editingRate) {
        const { error } = await supabase
          .from("rates")
          .update(rateData)
          .eq("id", editingRate.id);

        if (error) throw error;
        toast.success("Rate updated successfully!");
      } else {
        const { error } = await supabase.from("rates").insert(rateData);

        if (error) throw error;
        toast.success("Rate added successfully!");
      }

      loadRates();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving rate:", error);
      toast.error("Failed to save rate");
    }
  };

  const handleDelete = async () => {
    if (!selectedRateId) return;

    try {
      const { error } = await supabase
        .from("rates")
        .delete()
        .eq("id", selectedRateId);

      if (error) throw error;

      toast.success("Rate deleted successfully!");
      loadRates();
      setIsDeleteDialogOpen(false);
      setSelectedRateId(null);
    } catch (error) {
      console.error("Error deleting rate:", error);
      toast.error("Failed to delete rate");
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedRateId(id);
    setIsDeleteDialogOpen(true);
  };

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

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Standard Rates</h2>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rates.map((rate) => (
            <Card key={rate.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {rate.item_name}
                    </h3>
                    {rate.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {rate.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(rate)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(rate.id)}
                      className="h-8 w-8 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rate:</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{rate.rate.toFixed(2)} / {rate.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rates added yet</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rate
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRate ? "Edit Rate" : "Add New Rate"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                placeholder="e.g., Tile Work, Painting, Plumbing"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the work"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate">Rate (₹) *</Label>
                <Input
                  id="rate"
                  type="number"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="sq.ft, piece, etc."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingRate ? "Update" : "Add"} Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rate? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRateId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
