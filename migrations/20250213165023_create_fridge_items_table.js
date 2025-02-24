export const up = function (knex) {
  return knex.schema.createTable("fridge_items", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.integer("ingredient_id").unsigned().notNullable();
    table.decimal("quantity", 10, 4).notNullable().defaultTo(0);
    table.string("unit", 50).nullable().defaultTo(null);
    table.date("expires_at");
    table.string("image_url", 255).defaultTo("https://placehold.co/500");
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("ingredient_id")
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("fridge_items");
};
