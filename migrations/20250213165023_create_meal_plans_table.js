export const up = function (knex) {
  return knex.schema.createTable("meal_plans", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("recipe_id").unsigned().notNullable();
    table.date("meal_date").notNullable();
    table.string("meal_type").notNullable();
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("recipe_id")
      .references("id")
      .inTable("recipes")
      .onDelete("CASCADE");

    table.unique(["user_id", "meal_date", "meal_type"]);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("meal_plans");
};
