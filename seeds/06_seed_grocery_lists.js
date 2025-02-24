export const seed = async function (knex) {
  await knex("grocery_lists").del();
  await knex("grocery_lists").insert([
    {
      user_id: 1,
      ingredient_id: 19335,
      quantity: 500,
      unit: "g",
      completed: false,
      image_url: "https://img.spoonacular.com/ingredients_500x500/sugar.jpg",
    }, // Sugar
  ]);
};
