import initKnex from "knex";
import configuration from "../knexfile.js";
import axios from "axios";
const knex = initKnex(configuration);
const API_KEY = process.env.SPOONACULAR_SECONDARY_API_KEY;

export const getGroceryList = async (req, res) => {
  try {
    const user_id = req.user.id;

    const groceryItems = await knex("grocery_lists")
      .join("ingredients", "grocery_lists.ingredient_id", "ingredients.id")
      .where({ user_id })
      .select(
        "grocery_lists.id",
        "grocery_lists.ingredient_id",
        "ingredients.name as ingredient_name",
        "grocery_lists.quantity",
        "grocery_lists.unit",
        "grocery_lists.completed",
        "grocery_lists.created_at"
      );

    const mealPlans = await knex("meal_plans")
      .where({ user_id })
      .select("recipe_id");

    const recipeIds = mealPlans.map((mp) => mp.recipe_id);

    let mealPlanIngredients = [];
    if (recipeIds.length) {
      mealPlanIngredients = await knex("recipe_ingredients")
        .whereIn("recipe_id", recipeIds)
        .pluck("ingredient_id");
    }

    mealPlanIngredients = [...new Set(mealPlanIngredients)];

    const groceryListWithFlag = groceryItems.map((item) => {
      const isMealPlanItem = mealPlanIngredients.includes(item.ingredient_id);
      return { ...item, manual: !isMealPlanItem };
    });

    return res.status(200).json(groceryListWithFlag);
  } catch (error) {
    console.error("Error generating grocery list:", error);
    return res.status(500).json({ error: "Failed to generate grocery list" });
  }
};

export const addItemToGroceryList = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, quantity = 1, unit = null, completed = false } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Ingredient name is required" });
    }

    let ingredient = await knex("ingredients").where("name", name).first();

    if (!ingredient) {
      const response = await axios.get(
        "https://api.spoonacular.com/food/ingredients/search",
        {
          params: { query: name },
          headers: { "x-api-key": API_KEY },
        }
      );

      if (response.data.results.length > 0) {
        const foundIngredient = response.data.results[0];

        const [newIngredientId] = await knex("ingredients")
          .insert({
            id: foundIngredient.id,
            name: foundIngredient.name,
          })
          .onConflict("id")
          .ignore();

        ingredient = { id: newIngredientId || foundIngredient.id };
      } else {
        return res.status(400).json({ error: "Ingredient not found" });
      }
    }

    if (!ingredient || !ingredient.id) {
      return res.status(400).json({ error: "Ingredient ID not found." });
    }

    const existingItem = await knex("grocery_lists")
      .where({ user_id, ingredient_id: ingredient.id })
      .first();

    if (existingItem) {
      await knex("grocery_lists")
        .where({ user_id, ingredient_id: ingredient.id })
        .increment("quantity", quantity);

      return res.status(200).json({
        message: "Quantity updated in grocery list",
        ingredient_id: ingredient.id,
        new_quantity: existingItem.quantity + quantity,
      });
    }

    const [id] = await knex("grocery_lists").insert({
      user_id,
      ingredient_id: ingredient.id,
      quantity,
      unit,
      completed,
    });

    return res
      .status(201)
      .json({ id, user_id, ingredient_id: ingredient.id, quantity, completed });
  } catch (error) {
    console.error("Error adding grocery item:", error);
    return res.status(500).json({ error: "Failed to add item" });
  }
};

export const removeItemFromGroceryList = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const bypassMealPlanCheck =
      req.headers["bypass-meal-plan-check"] === "true";

    const groceryItem = await knex("grocery_lists")
      .where({ id, user_id })
      .first();

    if (!groceryItem) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    if (!bypassMealPlanCheck) {
      const isMealPlanItem = await knex("meal_plans")
        .join(
          "recipe_ingredients",
          "meal_plans.recipe_id",
          "recipe_ingredients.recipe_id"
        )
        .where("meal_plans.user_id", user_id)
        .where("recipe_ingredients.ingredient_id", groceryItem.ingredient_id)
        .first();

      if (isMealPlanItem) {
        return res.status(400).json({
          error:
            "This ingredient is needed for a planned meal. Remove the meal plan first.",
        });
      }
    }

    await knex("grocery_lists").where({ id, user_id }).del();
    return res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    return res.status(500).json({ error: "Failed to delete item" });
  }
};

export const groceryItemComplete = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "Completed status must be true or false." });
    }

    const updated = await knex("grocery_lists")
      .where({ id, user_id })
      .update({ completed });

    if (!updated) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    return res.status(200).json({
      message: `Item marked as ${completed ? "complete" : "incomplete"}`,
    });
  } catch (error) {
    console.error("Error updating grocery item:", error);
    return res.status(500).json({ error: "Failed to update grocery item" });
  }
};
