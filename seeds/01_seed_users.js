export const seed = async function (knex) {
  await knex("users").del();
  await knex("users").insert([
    {
      name: "Bailey",
      email: "bailey@example.com",
      dietary_restrictions: JSON.stringify([]),
      allergens: JSON.stringify([]),
    },
    {
      name: "Joe",
      email: "joe@example.com",
      dietary_restrictions: JSON.stringify(["vegetarian", "gluten-free"]),
      allergens: JSON.stringify(["peanuts", "shellfish"]),
    },
  ]);
};
