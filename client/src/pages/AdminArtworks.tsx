import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Artwork } from "@shared/schema";
import { Plus, Edit2 } from "lucide-react";

export default function AdminArtworks() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    story: "",
    images: [] as string[],
    sizes: {} as Record<string, { price_cents: number; total_copies: number; remaining: number }>,
    type: "unique" as "unique" | "limited" | "auction",
    status: "available" as "available" | "coming_soon" | "sold" | "auction_closed"
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      if (import.meta.env.DEV) {
        // In development, try to authenticate with API key
        fetch("/api/auth/user", {
          headers: { "x-admin-api-key": "dev-admin-key-12345" },
          credentials: "include"
        }).then(() => window.location.reload()).catch(() => {
          toast({
            title: "Database Connection Required",
            description: "Please check your DATABASE_URL in .env file",
            variant: "destructive",
          });
        });
      } else {
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      setTimeout(() => { window.location.href = "/"; }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Redirecting...</div>;
  }

  return <AdminArtworksContent language={language} setLanguage={setLanguage} />;
}

function AdminArtworksContent({ language, setLanguage }: { language: "en" | "ar"; setLanguage: (lang: "en" | "ar") => void }) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    story: "",
    images: [] as string[],
    sizes: {} as Record<string, { price_cents: number; total_copies: number; remaining: number }>,
    type: "unique" as "unique" | "limited" | "auction",
    status: "available" as "available" | "coming_soon" | "sold" | "auction_closed"
  });

  const { data: artworks = [], isLoading, isError, error } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading artworks",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/artworks/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Artwork updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      setEditingId(null);
      resetForm();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        if (import.meta.env.DEV) {
        // In development, try to authenticate with API key
        fetch("/api/auth/user", {
          headers: { "x-admin-api-key": "dev-admin-key-12345" },
          credentials: "include"
        }).then(() => window.location.reload()).catch(() => {
          toast({
            title: "Database Connection Required",
            description: "Please check your DATABASE_URL in .env file",
            variant: "destructive",
          });
        });
      } else {
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
        return;
      }
      toast({ title: "Error", description: "Failed to update artwork", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      shortDescription: "",
      story: "",
      images: [],
      sizes: {},
      type: "unique",
      status: "available"
    });
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setFormData({
      title: artwork.title,
      slug: artwork.slug,
      shortDescription: artwork.shortDescription || "",
      story: artwork.story || "",
      images: artwork.images,
      sizes: artwork.sizes as any,
      type: artwork.type,
      status: artwork.status
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateArtworkMutation.mutate({ id: editingId, data: formData });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl font-bold" data-testid="text-page-title">
              Artworks Management
            </h1>
          </div>

          {editingId && (
            <Card className="p-6 mb-8">
              <h2 className="font-serif text-2xl font-bold mb-4">Edit Artwork</h2>
              <div className="grid gap-4">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-title"
                />
                <Input
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  data-testid="input-slug"
                />
                <Textarea
                  placeholder="Short Description"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  data-testid="input-short-description"
                />
                <Textarea
                  placeholder="Story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  rows={5}
                  data-testid="input-story"
                />
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="auction_closed">Auction Closed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} data-testid="button-save">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingId(null); resetForm(); }} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-bold mb-2" data-testid={`text-artwork-title-${artwork.id}`}>
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Slug: {artwork.slug}</p>
                    <p className="text-sm mb-2">{artwork.shortDescription}</p>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        artwork.status === "available" ? "bg-green-500/20 text-green-700" :
                        artwork.status === "coming_soon" ? "bg-blue-500/20 text-blue-700" :
                        "bg-gray-500/20 text-gray-700"
                      }`} data-testid={`badge-status-${artwork.id}`}>
                        {artwork.status.replace("_", " ")}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-700" data-testid={`badge-type-${artwork.id}`}>
                        {artwork.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sizes: {Object.keys(artwork.sizes).join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={artwork.status === "available" ? "destructive" : "default"}
                      size="sm"
                      onClick={async () => {
                        try {
                          await apiRequest("PATCH", `/api/admin/artworks/${artwork.id}`, {
                            status: artwork.status === "available" ? "coming_soon" : "available"
                          });
                          queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
                          toast({
                            title: "Success",
                            description: artwork.status === "available" 
                              ? "Sales paused" 
                              : "Sales resumed"
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message,
                            variant: "destructive"
                          });
                        }
                      }}
                      data-testid={`button-toggle-sales-${artwork.id}`}
                    >
                      {artwork.status === "available" 
                        ? (language === "en" ? "Pause Sales" : "إيقاف المبيعات")
                        : (language === "en" ? "Resume Sales" : "استئناف المبيعات")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(artwork)}
                      data-testid={`button-edit-${artwork.id}`}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {language === "en" ? "Edit" : "تعديل"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
