export const seed = async function (knex) {
  await knex("meal_plans").del();
  await knex("meal_plans").insert([
    {
      user_id: 1,
      recipe_id: 649004,
      meal_date: "2025-02-20",
      meal_type: "breakfast",
    },
  ]);
};
