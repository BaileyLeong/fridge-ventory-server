export const seed = async function (knex) {
  await knex("favorite_recipes").del();
  await knex("favorite_recipes").insert([
    { user_id: 1, recipe_id: 649004, created_at: new Date() },
  ]);
};
