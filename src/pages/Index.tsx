import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Plus, X, Loader2, LogOut, BookMarked } from "lucide-react";
import kitchenHero from "@/assets/kitchen-hero.jpg";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "Add some ingredients",
        description: "Please add at least one ingredient to generate a recipe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: { ingredients },
      });

      if (error) throw error;

      if (data?.recipe) {
        toast({
          title: "Recipe generated!",
          description: "Your delicious recipe is ready.",
        });
        navigate("/recipe", { state: { recipe: data.recipe } });
      }
    } catch (error: any) {
      console.error("Error generating recipe:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setCurrentIngredient("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={kitchenHero}
          alt="Kitchen with fresh ingredients"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate("/saved-recipes")}
            className="gap-2"
          >
            <BookMarked className="w-4 h-4" />
            My Recipes
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-4">
            <UtensilsCrossed className="w-12 h-12 text-white drop-shadow-lg" />
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              AI ChefBot
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/95 drop-shadow-md max-w-2xl">
            Transform your ingredients into delicious recipes with AI magic
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <Card className="p-6 md:p-8 shadow-lg border-2">
          <h2 className="text-2xl font-bold mb-4 text-foreground">What's in your kitchen?</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter an ingredient (e.g., chicken, tomatoes)"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addIngredient()}
              className="flex-1"
            />
            <Button onClick={addIngredient} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="text-sm py-2 px-3 pr-2 flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="hover:bg-background/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={generateRecipe}
              disabled={isLoading || ingredients.length === 0}
              className="flex-1 text-lg py-6 shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cooking up your recipe...
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-5 h-5 mr-2" />
                  Generate Recipe
                </>
              )}
            </Button>
            {ingredients.length > 0 && (
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading}
                className="text-lg py-6"
                size="lg"
              >
                Reset
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
