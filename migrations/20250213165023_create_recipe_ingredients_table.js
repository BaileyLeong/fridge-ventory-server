export const up = function (knex) {
  return knex.schema.createTable("recipe_ingredients", function (table) {
    table.integer("recipe_id").unsigned().notNullable();
    table.integer("ingredient_id").unsigned().notNullable();
    table.decimal("amount_us", 10, 4);
    table.string("unit_us", 50);
    table.decimal("amount_metric", 10, 4);
    table.string("unit_metric", 50);
    table.timestamp("cached_at").defaultTo(knex.fn.now());

    table.primary(["recipe_id", "ingredient_id"]);
    table
      .foreign("recipe_id")
      .references("id")
      .inTable("recipes")
      .onDelete("CASCADE");
    table
      .foreign("ingredient_id")
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("recipe_ingredients");
};
