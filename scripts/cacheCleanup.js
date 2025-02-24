import initKnex from "knex";
import configuration from "../knexfile.js";
import cron from "node-cron";

const knex = initKnex(configuration);

const clearExpiredCache = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    await knex("recipes").where("cached_at", "<", oneHourAgo).update({
      steps: null,
      ready_in_minutes: null,
      servings: null,
      cached_at: null,
    });

    await knex("recipe_ingredients").where("cached_at", "<", oneHourAgo).del();
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

cron.schedule("*/30 * * * *", clearExpiredCache);
