export const up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.json("dietary_restrictions").nullable();
    table.json("allergens").nullable();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable("users");
};
