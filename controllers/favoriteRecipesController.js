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

const fetchBulkRecipesFromSpoonacular = async (recipeIds) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

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
      category: recipe.dishTypes?.[0] || null,
      ready_in_minutes: recipe.readyInMinutes,
      servings: recipe.servings,
      steps: recipe.sourceUrl || null,
      cached_at: new Date(),
    }));
  } catch (error) {
    console.error("Error fetching recipes from Spoonacular:", error);
    return [];
  }
};

const fetchRecipeFromSpoonacular = async (recipe_id) => {
  try {
    const response = await axios.get(
      `${SPOONACULAR_BASE_URL}/recipes/${recipe_id}/information`,
      {
        headers: { "x-rapidapi-key": SPOONACULAR_API_KEY },
      }
    );

    const recipe = response.data;

    return {
      id: recipe.id,
      name: recipe.title,
      image_url: recipe.image,
      source_url: recipe.spoonacularSourceUrl,
      category: recipe.dishTypes?.[0] || null,
      ready_in_minutes: recipe.readyInMinutes,
      servings: recipe.servings,
      steps: recipe.sourceUrl || null,
      cached_at: new Date(),
    };
  } catch (error) {
    console.error("Error fetching recipe from Spoonacular:", error);
    return null;
  }
};

export const getFavoriteRecipes = async (req, res) => {
  try {
    const user_id = req.user.id;

    const favoriteRecipes = await knex("favorite_recipes")
      .where({ user_id })
      .select("recipe_id");

    if (favoriteRecipes.length === 0) {
      return res.status(200).json([]);
    }

    const recipeIds = favoriteRecipes.map(({ recipe_id }) => recipe_id);

    const recipesFromDB = await knex("recipes").whereIn("id", recipeIds);

    const requiredExtraFields = [
      "category",
      "ready_in_minutes",
      "servings",
      "steps",
    ];

    const notCachedIds = recipeIds.filter(
      (id) => !recipesFromDB.some((recipe) => recipe.id === id)
    );

    const cachedIncompleteIds = recipesFromDB
      .filter(
        (recipe) =>
          !requiredExtraFields.every((field) => recipe[field] !== null)
      )
      .map((recipe) => recipe.id);

    const missingRecipeIds = [
      ...new Set([...notCachedIds, ...cachedIncompleteIds]),
    ];

    let recipesFromAPI = [];
    if (missingRecipeIds.length > 0) {
      recipesFromAPI = await fetchBulkRecipesFromSpoonacular(missingRecipeIds);

      await knex("recipes").insert(recipesFromAPI).onConflict("id").merge();
    }

    const finalRecipes = await knex("recipes").whereIn("id", recipeIds);

    res.status(200).json(finalRecipes);
  } catch (error) {
    console.error("Error fetching favorite recipes:", error);
    res.status(500).json({ error: "Failed to fetch favorite recipes" });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    let recipe = await knex("recipes").where({ id }).first();

    if (!recipe || !isCacheValid(recipe.cached_at)) {
      recipe = await fetchRecipeFromSpoonacular(id);
      if (recipe) {
        await knex("recipes").insert(recipe).onConflict("id").merge();
      }
    }

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};

export const addFavoriteRecipe = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { recipe_id } = req.body;

    if (!recipe_id) {
      return res.status(400).json({ error: "Recipe ID is required" });
    }

    let recipeExists = await knex("recipes").where({ id: recipe_id }).first();
    if (!recipeExists || !isCacheValid(recipeExists.cached_at)) {
      recipeExists = await fetchRecipeFromSpoonacular(recipe_id);
      if (recipeExists) {
        await knex("recipes").insert(recipeExists).onConflict("id").merge();
      } else {
        return res
          .status(404)
          .json({ error: "Recipe not found in Spoonacular" });
      }
    }

    const existingFavorite = await knex("favorite_recipes")
      .where({ user_id, recipe_id })
      .first();

    if (existingFavorite) {
      return res.status(200).json({ message: "Recipe already in favorites" });
    }

    await knex("favorite_recipes").insert({ user_id, recipe_id });

    res.status(201).json({ message: "Recipe added to favorites", recipe_id });
  } catch (error) {
    console.error("Error adding favorite recipe:", error);
    res.status(500).json({ error: "Failed to add favorite recipe" });
  }
};

export const removeFavoriteRecipe = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id: recipe_id } = req.params;

    const existingFavorite = await knex("favorite_recipes")
      .where({ user_id, recipe_id })
      .first();

    if (!existingFavorite) {
      console.warn(
        `⚠️ Favorite not found for User ${user_id} and Recipe ${recipe_id}`
      );
      return res.status(404).json({ error: "Favorite not found" });
    }

    const deleted = await knex("favorite_recipes")
      .where({ recipe_id, user_id })
      .del();

    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete favorite" });
    }

    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    console.error("Error deleting favorite recipe:", error);
    res.status(500).json({ error: "Failed to delete favorite recipe" });
  }
};
