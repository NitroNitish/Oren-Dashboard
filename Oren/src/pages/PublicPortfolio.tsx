import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { useBusinessProfile } from "@/contexts/BusinessProfileContext";
import SEO from "../components/SEO";

export default function PublicPortfolio() {
  const { profile } = useBusinessProfile();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const businessName = profile?.businessName || "Portfolio";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${businessName} - Public Portfolio`,
    "description": "Showcase of our completed projects and client reviews.",
    "url": window.location.href,
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
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
      
      if (data) setProjects(data);
    } catch (error) {
      console.error("Error loading public portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (project: any) => {
    if (!project.ratings || project.ratings.length === 0) return 0;
    const sum = project.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    return (sum / project.ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${businessName} Portfolio`}
        description="Showcase of our completed projects and client reviews."
        schema={schema}
      />
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          {profile?.logo && (
            <img src={profile.logo} alt="Business Logo" className="h-12 w-auto mx-auto mb-2 object-contain bg-white rounded-md p-1" />
          )}
          <h1 className="text-3xl font-bold text-center">{profile?.businessName || "Portfolio"}</h1>
          <p className="text-sm opacity-90 text-center mt-1">Showcase of our completed projects</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  {project.ratings && project.ratings.length > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-normal">{getAverageRating(project)}</span>
                    </div>
                  )}
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
                {project.ratings && project.ratings.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Reviews ({project.ratings.length})</p>
                    {project.ratings.slice(0, 2).map((rating: any, idx: number) => (
                      <div key={idx} className="text-xs text-muted-foreground mb-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{rating.rating}/5</span>
                          <span>- {rating.reviewer_name || "Anonymous"}</span>
                        </div>
                        {rating.comment && <p className="ml-4 italic">"{rating.comment}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects available to display.</p>
          </div>
        )}
      </main>
    </div>
  );
}
