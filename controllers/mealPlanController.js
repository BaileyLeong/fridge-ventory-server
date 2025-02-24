import initKnex from "knex";
import axios from "axios";
import configuration from "../knexfile.js";
import dotenv from "dotenv";
dotenv.config();
const knex = initKnex(configuration);

const SPOONACULAR_BASE_URL = process.env.SPOONACULAR_BASE_URL;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

const isCacheValid = (cachedAt) => {
  if (!cachedAt) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(cachedAt) > oneHourAgo;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchBulkRecipesFromSpoonacular = async (recipeIds) => {
  try {
    const response = await axios.get(
      `${SPOONACULAR_BASE_URL}/recipes/informationBulk`,
      {
        params: { ids: recipeIds.join(",") },
        headers: { "x-rapidapi-key": SPOONACULAR_API_KEY },
      }
    );

    return response.data.map((recipe) => ({
      id: recipe.id,
      name: recipe.title,
      image_url: recipe.image,
      source_url: recipe.spoonacularSourceUrl,
      category: recipe.dishTypes?.[0] || "main course",
      ready_in_minutes: recipe.readyInMinutes,
      servings: recipe.servings,
      steps: recipe.sourceUrl || "No instructions available.",
      cached_at: new Date(),
    }));
  } catch (error) {
    console.error("Error fetching recipes from Spoonacular:", error);
    return [];
  }
};

export const getMealPlan = async (req, res) => {
  try {
    const user_id = req.user.id;

    const plan = await knex("meal_plans")
      .join("recipes", "meal_plans.recipe_id", "recipes.id")
      .where("meal_plans.user_id", user_id)
      .select(
        "meal_plans.id",
        "meal_plans.meal_date",
        "meal_plans.meal_type",
        "recipes.id as recipe_id",
        "recipes.name",
        "recipes.image_url",
        "recipes.source_url",
        "recipes.steps",
        "recipes.ready_in_minutes",
        "recipes.servings",
        "recipes.cached_at"
      );

    const missingDetails = plan
      .filter((meal) => !meal.steps || !isCacheValid(meal.cached_at))
      .map((m) => m.recipe_id);

    let fetchedRecipes = [];
    if (missingDetails.length > 0) {
      fetchedRecipes = await fetchBulkRecipesFromSpoonacular(missingDetails);

      if (fetchedRecipes.length > 0) {
        await knex("recipes").insert(fetchedRecipes).onConflict("id").merge();
      }
    }

    const finalPlan = plan.map((meal) => {
      const fetchedData = fetchedRecipes.find((r) => r.id === meal.recipe_id);
      return {
        ...meal,
        steps: fetchedData?.steps || meal.steps,
        ready_in_minutes:
          fetchedData?.ready_in_minutes || meal.ready_in_minutes,
        servings: fetchedData?.servings || meal.servings,
      };
    });

    res.status(200).json(finalPlan);
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
};

export const addMealToPlan = async (req, res) => {
  try {
    const { recipe_id, meal_type, date } = req.body;
    const user_id = req.user.id;

    console.log("received meal:", req.body);

    if (!user_id || !recipe_id || !meal_type) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const mealDate =
      date && date.trim() !== ""
        ? date
        : new Date().toISOString().split("T")[0];

    let recipe = await knex("recipes").where("id", recipe_id).first();

    const requiredExtraFields = ["category", "ready_in_minutes", "servings"];
    let fetchedRecipe;

    if (
      !recipe ||
      recipe.steps === "No instructions available." ||
      !requiredExtraFields.every((field) => recipe[field] !== null)
    ) {
      console.log(
        `🔍 Recipe ${recipe_id} not found/incomplete. Fetching via bulk API...`
      );
      const bulkData = await fetchBulkRecipesFromSpoonacular([recipe_id]);
      if (!bulkData.length) {
        console.error("❌ Bulk API returned empty data for recipe:", recipe_id);
        return res
          .status(500)
          .json({ error: "Failed to fetch recipe details" });
      }
      fetchedRecipe = bulkData[0];
      recipe = {
        id: fetchedRecipe.id,
        name: fetchedRecipe.name,
        image_url: fetchedRecipe.image_url,
        source_url: fetchedRecipe.source_url,
        category: fetchedRecipe.category,
        ready_in_minutes: fetchedRecipe.ready_in_minutes,
        servings: fetchedRecipe.servings,
        steps: fetchedRecipe.steps,
        cached_at: new Date(),
      };
      await knex("recipes").insert(recipe).onConflict("id").merge();
    }

    let recipeIngredients = await knex("recipe_ingredients")
      .where("recipe_id", recipe_id)
      .select("ingredient_id", "amount_metric", "unit_metric");

    if (
      (!recipeIngredients || recipeIngredients.length === 0) &&
      fetchedRecipe
    ) {
      const extendedIngredients = fetchedRecipe.extendedIngredients;
      if (extendedIngredients && extendedIngredients.length > 0) {
        const ingredientNames = extendedIngredients.map((ing) =>
          ing.name.toLowerCase()
        );
        const existingIngredients = await knex("ingredients")
          .whereIn(knex.raw("LOWER(name)"), ingredientNames)
          .select("id", "name");
        const nameToIdMap = {};
        existingIngredients.forEach((ing) => {
          nameToIdMap[ing.name.toLowerCase()] = ing.id;
        });
        const resolvedIngredients = extendedIngredients.map((ing) => {
          const lowerName = ing.name.toLowerCase();
          return {
            ...ing,
            resolvedId: nameToIdMap[lowerName] || ing.id,
          };
        });
        const missingIngredients = resolvedIngredients.filter(
          (ing) => !nameToIdMap.hasOwnProperty(ing.name.toLowerCase())
        );
        if (missingIngredients.length > 0) {
          const ingredientInserts = missingIngredients.map((ing) => ({
            id: ing.id,
            name: ing.name,
            category: null,
            image_url: null,
          }));
          await knex("ingredients")
            .insert(ingredientInserts)
            .onConflict("id")
            .ignore();
        }
        let ingredientRows = resolvedIngredients.map((ing) => ({
          recipe_id: recipe_id,
          ingredient_id: ing.resolvedId,
          amount_us: ing.amount,
          unit_us: ing.unit,
          amount_metric: ing.measures?.metric?.amount || null,
          unit_metric: ing.measures?.metric?.unitShort || null,
          cached_at: new Date(),
        }));
        // Remove duplicate rows
        const uniqueRowsMap = new Map();
        ingredientRows.forEach((row) => {
          const key = `${row.recipe_id}-${row.ingredient_id}`;
          if (!uniqueRowsMap.has(key)) {
            uniqueRowsMap.set(key, row);
          }
        });
        ingredientRows = Array.from(uniqueRowsMap.values());
        await knex("recipe_ingredients")
          .insert(ingredientRows)
          .onConflict(["recipe_id", "ingredient_id"])
          .ignore();
        recipeIngredients = ingredientRows;
      }
    }

    const [mealPlanId] = await knex("meal_plans").insert({
      user_id,
      recipe_id,
      meal_type,
      meal_date: mealDate,
    });

    let groceryItemsAdded = 0;
    for (const ingredient of recipeIngredients) {
      const existingGroceryItem = await knex("grocery_lists")
        .where({ user_id, ingredient_id: ingredient.ingredient_id })
        .first();
      if (existingGroceryItem) {
        await knex("grocery_lists")
          .where({ user_id, ingredient_id: ingredient.ingredient_id })
          .increment("quantity", ingredient.amount_metric || 1);
      } else {
        await knex("grocery_lists").insert({
          user_id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.amount_metric || 1,
          unit: ingredient.unit_metric || null,
          completed: false,
        });
        groceryItemsAdded++;
      }
    }

    return res.status(201).json({
      meal_plan_id: mealPlanId,
      user_id,
      recipe_id,
      meal_type,
      meal_date: mealDate,
      groceryItemsAdded,
    });
  } catch (error) {
    console.error("Error adding meal:", error);
    res.status(500).json({ error: "Failed to add meal" });
  }
};

export const updateMealInPlan = async (req, res) => {
  try {
    const { recipe_id, meal_type, date } = req.body;
    const { id } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const existingMeal = await knex("meal_plans")
      .where({ id, user_id })
      .first();
    if (!existingMeal) {
      return res.status(404).json({ error: "Meal not found or unauthorized" });
    }

    const mealDate =
      date && date.trim() !== ""
        ? date
        : new Date().toISOString().split("T")[0];

    const updated = await knex("meal_plans").where({ id, user_id }).update({
      recipe_id,
      meal_type,
      meal_date: mealDate,
    });

    if (!updated) {
      return res.status(500).json({ error: "Failed to update meal" });
    }

    const newRequiredIngredients = await knex("recipe_ingredients")
      .where("recipe_id", recipe_id)
      .select("ingredient_id", "amount_metric", "unit_metric");

    const oldRequiredIngredients = await knex("recipe_ingredients")
      .where("recipe_id", existingMeal.recipe_id)
      .pluck("ingredient_id");

    const existingGroceryItems = await knex("grocery_lists")
      .where({ user_id })
      .pluck("ingredient_id");

    const ingredientsToRemove = oldRequiredIngredients.filter(
      (ingredient_id) =>
        !newRequiredIngredients.some(
          (ing) => ing.ingredient_id === ingredient_id
        )
    );

    if (ingredientsToRemove.length > 0) {
      await knex("grocery_lists")
        .where({ user_id })
        .whereIn("ingredient_id", ingredientsToRemove)
        .del();
    }

    let groceryItemsAdded = 0;
    for (const ingredient of newRequiredIngredients) {
      const existingGroceryItem = await knex("grocery_lists")
        .where({ user_id, ingredient_id: ingredient.ingredient_id })
        .first();

      if (existingGroceryItem) {
        await knex("grocery_lists")
          .where({ user_id, ingredient_id: ingredient.ingredient_id })
          .increment("quantity", ingredient.amount_metric || 1);
      } else {
        await knex("grocery_lists").insert({
          user_id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.amount_metric || 1,
          unit: ingredient.unit_metric || null,
          completed: false,
        });
        groceryItemsAdded++;
      }
    }

    return res.status(200).json({
      message: "Meal updated successfully",
      id,
      user_id,
      recipe_id,
      meal_type,
      meal_date: mealDate,
      groceryItemsAdded,
      groceryItemsRemoved: ingredientsToRemove.length,
    });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return res.status(500).json({ error: "Failed to update meal plan" });
  }
};

export const deleteMealFromPlan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const deleted = await knex("meal_plans").where({ id, user_id }).del();

    if (!deleted) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    res.status(200).json({ message: "Meal removed from plan" });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    res.status(500).json({ error: "Failed to delete meal plan" });
  }
};

export const generateWeeklyMealPlan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cuisines, mealTypes } = req.body;

    const user = await knex("users").where({ id: user_id }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const dietaryRestrictions = user.dietary_restrictions || "";
    const allergens = user.allergens || "";

    const ingredientNames = await knex("fridge_items")
      .join("ingredients", "fridge_items.ingredient_id", "ingredients.id")
      .where("fridge_items.user_id", user_id)
      .distinct("ingredients.name")
      .pluck("ingredients.name");

    console.log("🔍 Fetching meal plan from Spoonacular...");
    await delay(500);

    const response = await axios.get(
      "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch",
      {
        params: {
          includeIngredients: ingredientNames.join(","),
          diet: dietaryRestrictions || undefined,
          intolerances: allergens || undefined,
          cuisine: cuisines.length > 0 ? cuisines.join(",") : undefined,
          type: mealTypes.length > 0 ? mealTypes.join(",") : undefined,
          number: 7,
          addRecipeInformation: true,
          sort: "max-used-ingredients",
        },
        headers: { "x-rapidapi-key": SPOONACULAR_API_KEY },
      }
    );

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "No suitable recipes found." });
    }

    const generatedMeals = response.data.results.map((recipe, index) => ({
      recipe_id: recipe.id,
      name: recipe.title,
      image_url: recipe.image,
      source_url: recipe.spoonacularSourceUrl,
      meal_date: new Date(new Date().setDate(new Date().getDate() + index))
        .toISOString()
        .split("T")[0],
      meal_type:
        mealTypes.length > 0 ? mealTypes[index % mealTypes.length] : "dinner",
    }));

    res.status(200).json(generatedMeals);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    res
      .status(500)
      .json({ error: "Failed to generate meal plan", details: error.message });
  }
};
