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
    {
      id: 640136,
      name: "Corned Beef And Cabbage With Irish Mustard Sauce",
      image_url: "https://img.spoonacular.com/recipes/640136-556x370.jpg",
      source_url:
        "https://spoonacular.com/corned-beef-and-cabbage-with-irish-mustard-sauce-640136",

      category: "Dinner",
      ready_in_minutes: 270,
      servings: 6,
      steps: "Combine corned beef and water to cover in a large Dutch oven...",
      cached_at: new Date(),
    },
    {
      id: 715594,
      name: "Homemade Garlic and Basil French Fries",
      image_url: "https://img.spoonacular.com/recipes/715594-556x370.jpg",
      source_url: "http://www.pinkwhen.com/homemade-french-fries/",

      category: "Side Dish",
      ready_in_minutes: 45,
      servings: 2,
      steps: "Slice potatoes, coat in flour, garlic powder, and basil...",
      cached_at: new Date(),
    },
  ]);
};
