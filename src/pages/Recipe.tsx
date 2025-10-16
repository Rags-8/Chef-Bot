import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ChefHat, ArrowLeft, Save, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  name: string;
  cookingTime: number;
  difficulty: string;
  servings: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  instructions: string[];
}

const Recipe = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.recipe) {
      setRecipe(location.state.recipe);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        recipe_name: recipe.name,
        recipe_data: recipe as any,
        is_favorite: false,
      });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Recipe saved!",
        description: "You can find it in your saved recipes.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save recipe.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFavoriteRecipe = async () => {
    if (!recipe) return;
    
    setIsFavoriting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        recipe_name: recipe.name,
        recipe_data: recipe as any,
        is_favorite: true,
      });

      if (error) throw error;

      setIsFavorited(true);
      toast({
        title: "Added to favorites!",
        description: "Recipe saved to your favorites.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites.",
        variant: "destructive",
      });
    } finally {
      setIsFavoriting(false);
    }
  };

  if (!recipe) {
    return null;
  }

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
            Back to Ingredients
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">AI ChefBot</span>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <Card className="p-6 md:p-8 shadow-lg border-2 animate-in fade-in-50 duration-500">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              {recipe.name}
            </h1>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className="text-sm py-1 px-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {recipe.cookingTime} mins
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                {recipe.difficulty}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                {recipe.servings} servings
              </Badge>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{recipe.macros.calories}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{recipe.macros.protein}g</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{recipe.macros.carbs}g</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{recipe.macros.fats}g</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fats</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="text-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Instructions</h2>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-primary font-bold shrink-0 w-6">{index + 1}.</span>
                  <span className="text-foreground">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 pt-6 border-t flex flex-wrap gap-3">
            <Button
              onClick={handleSaveRecipe}
              disabled={isSaving || isSaved}
              size="lg"
              variant="outline"
              className="flex-1 md:flex-initial"
            >
              <Save className={`w-5 h-5 mr-2 ${isSaved ? 'fill-black text-black' : ''}`} />
              {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Recipe"}
            </Button>
            <Button
              onClick={handleFavoriteRecipe}
              disabled={isFavoriting || isFavorited}
              size="lg"
              variant="outline"
              className="flex-1 md:flex-initial"
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavoriting ? "Adding..." : isFavorited ? "Favorited" : "Add to Favorites"}
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="flex-1 md:flex-initial"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Create Another Recipe
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Recipe;
