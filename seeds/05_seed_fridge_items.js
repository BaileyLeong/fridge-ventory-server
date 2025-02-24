export const seed = async function (knex) {
  await knex("fridge_items").del();
  await knex("fridge_items").insert([
    {
      user_id: 1,
      ingredient_id: 20081,
      quantity: 500,
      unit: "g",
      expires_at: "2025-03-01",
      image_url: "https://spoonacular.com/cdn/ingredients_500x500/flour.jpg",
    }, // Flour
    {
      user_id: 1,
      ingredient_id: 1077,
      quantity: 1,
      unit: "L",
      expires_at: "2025-02-22",
      image_url: "https://spoonacular.com/cdn/ingredients_500x500/milk.jpg",
    }, // Milk
    {
      user_id: 1,
      ingredient_id: 1123,
      quantity: 6,
      unit: null,
      expires_at: "2025-02-25",
      image_url: "https://spoonacular.com/cdn/ingredients_500x500/egg.jpg",
    }, // Eggs
    {
      user_id: 1,
      ingredient_id: 1001,
      quantity: 200,
      unit: "g",
      expires_at: "2025-04-10",
      image_url: "https://spoonacular.com/cdn/ingredients_500x500/butter.jpg",
    }, // Butter
    {
      user_id: 2,
      ingredient_id: 93740, // Almond Flour
      quantity: 500,
      unit: "g",
      expires_at: "2025-03-01",
      image_url:
        "https://spoonacular.com/cdn/ingredients_500x500/almond-flour.jpg",
    },
    {
      user_id: 2,
      ingredient_id: 93607, // Almond Milk
      quantity: 1,
      unit: "L",
      expires_at: "2025-02-22",
      image_url:
        "https://spoonacular.com/cdn/ingredients_500x500/almond-milk.jpg",
    },
    {
      user_id: 2,
      ingredient_id: 4047, // Coconut Oil
      quantity: 200,
      unit: "g",
      expires_at: "2025-04-10",
      image_url:
        "https://spoonacular.com/cdn/ingredients_500x500/coconut-oil.jpg",
    },
  ]);
};
