export const seed = async function (knex) {
  await knex("recipe_ingredients").del();

  const cachedAt = new Date();

  await knex("recipe_ingredients").insert([
    // Kohlrabi Salad With Apple, Bacon, and Snow Peas
    {
      recipe_id: 649004,
      ingredient_id: 11241,
      amount_us: 1,
      unit_us: "small",
      amount_metric: 1,
      unit_metric: "small",
      cached_at: cachedAt,
    },
    {
      recipe_id: 649004,
      ingredient_id: 1049003,
      amount_us: 0.25,
      unit_us: "cup",
      amount_metric: 31.25,
      unit_metric: "g",
      cached_at: cachedAt,
    },
    {
      recipe_id: 649004,
      ingredient_id: 11300,
      amount_us: 10,
      unit_us: null,
      amount_metric: 10,
      unit_metric: null,
      cached_at: cachedAt,
    },
    {
      recipe_id: 649004,
      ingredient_id: 12036,
      amount_us: 1,
      unit_us: "Tbsp",
      amount_metric: 1,
      unit_metric: "Tbsp",
      cached_at: cachedAt,
    },
    {
      recipe_id: 649004,
      ingredient_id: 10123,
      amount_us: 2,
      unit_us: "slice",
      amount_metric: 2,
      unit_metric: "slice",
      cached_at: cachedAt,
    },
  ]);
};
