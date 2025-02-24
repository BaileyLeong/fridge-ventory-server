export const up = function (knex) {
  return knex.schema.createTable("recipes", function (table) {
    table.integer("id").unsigned().notNullable().primary();
    table.string("name").notNullable();
    table.string("image_url").defaultTo("https://placehold.co/500");
    table.string("source_url").notNullable();

    table.string("category").nullable();
    table.integer("ready_in_minutes").nullable();
    table.integer("servings").nullable();
    table.text("steps").nullable();

    table.timestamp("cached_at").defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("recipes");
};
