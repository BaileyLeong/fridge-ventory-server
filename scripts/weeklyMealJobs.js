import initKnex from "knex";
import configuration from "../knexfile.js";
import cron from "node-cron";

const knex = initKnex(configuration);

export const clearMealPlan = async (user_id) => {
  try {
    await knex("meal_plans").where({ user_id }).del();
    console.log(`Meal plan cleared for user: ${user_id}`);
  } catch (error) {
    console.error(`Error clearing meal plan for user ${user_id}:`, error);
  }
}; // Clear meal plans for selected user

export const clearAllMealPlans = async () => {
  try {
    await knex("meal_plans").del();
    console.log("Meal plans cleared for all users.");
  } catch (error) {
    console.error("Error clearing all meal plans:", error);
  }
}; // Clear meal plans for all users

cron.schedule("0 0 * * 0", async () => {
  console.log("Running weekly meal plan clearance...");
  await clearAllMealPlans();
});

// clearAllMealPlans();
// clearMealPlan(1);
