import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Share2, Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Portfolio() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPortfolioShareDialog, setShowPortfolioShareDialog] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        ratings (
          rating,
          comment,
          reviewer_name
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading projects:", error);
      toast.error(`Error loading projects: ${error.message}`);
    }
    if (data) setProjects(data);
  };

  const shareProject = (project: any) => {
    setSelectedProject(project);
    setShowShareDialog(true);
  };

  const copyRatingLink = () => {
    if (selectedProject) {
      const url = `${window.location.origin}/rate/${selectedProject.id}`;
      navigator.clipboard.writeText(url);
      toast.success("Rating link copied! Share this with your client.");
      setShowShareDialog(false);
    }
  };

  const getAverageRating = (project: any) => {
    if (!project.ratings || project.ratings.length === 0) return 0;
    const sum = project.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    return (sum / project.ratings.length).toFixed(1);
  };

  const copyPortfolioLink = () => {
    const url = `${window.location.origin}/portfolio/public`;
    navigator.clipboard.writeText(url);
    toast.success("Portfolio link copied!");
    setShowPortfolioShareDialog(false);
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deleteProjectId);

      if (error) throw error;

      toast.success("Project deleted successfully!");
      setDeleteProjectId(null);
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground">
            <ArrowLeft />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-sm opacity-90">Showcase of completed projects</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPortfolioShareDialog(true)} className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Share2 className="mr-2 h-4 w-4" />
              Share Portfolio
            </Button>
            <Button onClick={() => navigate("/portfolio/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-normal">{getAverageRating(project)}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.images && project.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {project.images.slice(0, 4).map((image: string, idx: number) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`${project.name} ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                {project.completed_at && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Completed: {new Date(project.completed_at).toLocaleDateString('en-IN')}
                  </p>
                )}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2">Reviews ({project.ratings?.length || 0})</p>
                  {project.ratings?.slice(0, 2).map((rating: any, idx: number) => (
                    <div key={idx} className="text-xs text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{rating.rating}/5</span>
                        <span>- {rating.reviewer_name}</span>
                      </div>
                      {rating.comment && <p className="ml-4 italic">"{rating.comment}"</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => shareProject(project)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Get Rating Link
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteProjectId(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects added yet</p>
            <Button className="mt-4" onClick={() => navigate("/portfolio/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Project
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Rating Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link with your client so they can rate this project. Their personal information will remain private.
            </p>
            {selectedProject && (
              <div>
                <Label>Rating Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={`${window.location.origin}/rate/${selectedProject.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyRatingLink}>
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPortfolioShareDialog} onOpenChange={setShowPortfolioShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link to showcase your complete portfolio to anyone.
            </p>
            <div>
              <Label>Portfolio Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={`${window.location.origin}/portfolio/public`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyPortfolioLink}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will also delete all ratings associated with this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
