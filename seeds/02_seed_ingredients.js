export const seed = async function (knex) {
  await knex("ingredients").del();

  await knex("ingredients").insert([
    {
      id: 11241,
      name: "kohlrabi",
      category: "Vegetables",
      image_url: "https://img.spoonacular.com/ingredients_500x500/kohlrabi.jpg",
    },
    {
      id: 1049003,
      name: "fuji apple",
      category: "Fruits",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/fuji-apple.jpg",
    },
    {
      id: 11300,
      name: "snow peas",
      category: "Vegetables",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/snow-peas.jpg",
    },
    {
      id: 12036,
      name: "sunflower seeds",
      category: "Nuts & Seeds",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/sunflower-seeds.jpg",
    },
    {
      id: 10123,
      name: "bacon",
      category: "Meat",
      image_url: "https://img.spoonacular.com/ingredients_500x500/bacon.jpg",
    },
    {
      id: 1053,
      name: "heavy cream",
      category: "Dairy",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/heavy-cream.jpg",
    },
    {
      id: 2048,
      name: "apple cider vinegar",
      category: "Condiments",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/apple-cider-vinegar.jpg",
    },
    {
      id: 19296,
      name: "honey",
      category: "Sweeteners",
      image_url: "https://img.spoonacular.com/ingredients_500x500/honey.jpg",
    },
    {
      id: 2004,
      name: "bay leaf",
      category: "Herbs & Spices",
      image_url: "https://img.spoonacular.com/ingredients_500x500/bay-leaf.jpg",
    },
    {
      id: 11109,
      name: "cabbage",
      category: "Vegetables",
      image_url: "https://img.spoonacular.com/ingredients_500x500/cabbage.jpg",
    },
    {
      id: 11124,
      name: "carrot",
      category: "Vegetables",
      image_url: "https://img.spoonacular.com/ingredients_500x500/carrot.jpg",
    },
    {
      id: 10013346,
      name: "corned beef brisket",
      category: "Meat",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/corned-beef-brisket.jpg",
    },
    {
      id: 20027,
      name: "cornstarch",
      category: "Baking",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/cornstarch.jpg",
    },
    {
      id: 1002024,
      name: "mustard powder",
      category: "Herbs & Spices",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/mustard-powder.jpg",
    },
    {
      id: 1125,
      name: "egg yolks",
      category: "Dairy",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/egg-yolks.jpg",
    },
    {
      id: 1001,
      name: "butter",
      category: "Dairy",
      image_url: "https://img.spoonacular.com/ingredients_500x500/butter.jpg",
    },
    {
      id: 19335,
      name: "sugar",
      category: "Sweeteners",
      image_url: "https://img.spoonacular.com/ingredients_500x500/sugar.jpg",
    },
    {
      id: 14412,
      name: "water",
      category: "Other",
      image_url: "https://img.spoonacular.com/ingredients_500x500/water.jpg",
    },
    {
      id: 2044,
      name: "basil",
      category: "Herbs & Spices",
      image_url: "https://img.spoonacular.com/ingredients_500x500/basil.jpg",
    },
    {
      id: 11352,
      name: "potatoes",
      category: "Vegetables",
      image_url: "https://img.spoonacular.com/ingredients_500x500/potatoes.jpg",
    },
    {
      id: 1022020,
      name: "garlic powder",
      category: "Herbs & Spices",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/garlic-powder.jpg",
    },
    {
      id: 1062047,
      name: "garlic salt",
      category: "Herbs & Spices",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/garlic-salt.jpg",
    },
    {
      id: 4669,
      name: "vegetable oil",
      category: "Oils & Fats",
      image_url:
        "https://img.spoonacular.com/ingredients_500x500/vegetable-oil.jpg",
    },
    {
      id: 20081,
      name: "flour",
      category: "Baking",
      image_url: "https://img.spoonacular.com/ingredients_500x500/flour.jpg",
    },
    {
      id: 1077,
      name: "milk",
      category: "Dairy",
      image_url: "https://img.spoonacular.com/ingredients_500x500/milk.jpg",
    },
    {
      id: 1123,
      name: "eggs",
      category: "Dairy",
      image_url: "https://img.spoonacular.com/ingredients_500x500/egg.jpg",
    },
  ]);
};
