export const seed = async function (knex) {
  await knex("recipes").del();

  await knex("recipes").insert([
    {
      id: 649004,
      name: "Kohlrabi Salad With Apple, Bacon, and Snow Peas",
      image_url: "https://img.spoonacular.com/recipes/649004-556x370.jpg",
      source_url:
        "https://spoonacular.com/kohlrabi-salad-with-apple-bacon-and-snow-peas-649004",

      category: "Salad",
      ready_in_minutes: 45,
      servings: 1,
      steps: "Slice the kohlrabi paper thin, mix with chopped apple...",
      cached_at: new Date(),
    },
  ]);
};
