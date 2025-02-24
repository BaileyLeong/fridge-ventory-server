export const up = function (knex) {
  return knex.schema.createTable("favorite_recipes", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("recipe_id").unsigned().notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

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

    table.unique(["user_id", "recipe_id"]);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("favorite_recipes");
};
