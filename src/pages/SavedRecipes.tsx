import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, ArrowLeft, Heart, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedRecipe {
  id: string;
  recipe_name: string;
  recipe_data: any;
  is_favorite: boolean;
  created_at: string;
}

const SavedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const savedRecipes = recipes.filter(r => !r.is_favorite);
  const favoriteRecipes = recipes.filter(r => r.is_favorite);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch saved recipes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRecipes(recipes.filter((r) => r.id !== id));
      toast({
        title: "Recipe deleted",
        description: "Recipe removed from your collection.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recipe.",
        variant: "destructive",
      });
    }
  };

  const handleViewRecipe = (recipe: SavedRecipe) => {
    navigate("/recipe", { state: { recipe: recipe.recipe_data } });
  };

  const renderRecipeGrid = (recipesToShow: SavedRecipe[]) => {
    if (recipesToShow.length === 0) {
      return (
        <Card className="p-12 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No recipes found</h2>
          <p className="text-muted-foreground mb-6">
            {activeTab === "favorites" 
              ? "You haven't added any favorites yet!" 
              : "Start creating and saving recipes!"}
          </p>
          <Button onClick={() => navigate("/")}>
            Create Your First Recipe
          </Button>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {recipesToShow.map((recipe) => (
          <Card key={recipe.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold flex-1">{recipe.recipe_name}</h3>
              {recipe.is_favorite && (
                <Heart className="w-5 h-5 text-destructive fill-destructive shrink-0" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.recipe_data?.cookingTime && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.recipe_data.cookingTime} mins
                </Badge>
              )}
              {recipe.recipe_data?.difficulty && (
                <Badge variant="outline" className="text-xs">
                  {recipe.recipe_data.difficulty}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleViewRecipe(recipe)}
                size="sm"
                className="flex-1"
              >
                View Recipe
              </Button>
              <Button
                onClick={() => handleDelete(recipe.id)}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">My Recipes</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No saved recipes yet</h2>
            <p className="text-muted-foreground mb-6">
              Start creating recipes and save your favorites!
            </p>
            <Button onClick={() => navigate("/")}>
              Create Your First Recipe
            </Button>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="all">Saved Recipes ({savedRecipes.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({favoriteRecipes.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {renderRecipeGrid(savedRecipes)}
            </TabsContent>
            <TabsContent value="favorites">
              {renderRecipeGrid(favoriteRecipes)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
