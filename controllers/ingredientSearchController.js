import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

import axios from "axios";
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = process.env.SPOONACULAR_BASE_URL;

const fetchSpoonacularIngredients = async (query) => {
  try {
    const response = await axios.get(
      `${SPOONACULAR_BASE_URL}/food/ingredients/search`,
      {
        params: { query },
        headers: { "x-rapidapi-key": SPOONACULAR_API_KEY },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching ingredients from Spoonacular:", error);
    return [];
  }
};

export const searchIngredients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    let results = await knex("ingredients")
      .whereRaw("LOWER(name) LIKE ?", [`%${query.toLowerCase()}%`])
      .orderByRaw("CASE WHEN name LIKE ? THEN 1 ELSE 2 END", [`${query}%`])
      .limit(10);

    if (results.length === 0) {
      results = await fetchSpoonacularIngredients(query);
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error searching ingredients:", error);
    res.status(500).json({ error: "Failed to search ingredients" });
  }
};
