export const up = function (knex) {
  return knex.schema.createTable("ingredients", function (table) {
    table.integer("id").unsigned().primary();
    table.string("name").unique().notNullable();
    table.string("category").nullable();
    table.string("image_url").nullable();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("ingredients");
};
