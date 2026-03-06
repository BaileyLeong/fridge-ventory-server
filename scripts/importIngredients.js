import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const csvFilePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/top-1k-ingredients.csv"
);

const ingredients = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    const id = parseInt(row.id, 10);
    const name = row.name?.trim();

    if (id && name) {
      ingredients.push({ id, name });
    }
  })
  .on("end", async () => {
    try {
      await insertIngredients(ingredients);
    } catch (error) {
      console.error("Error inserting ingredients:", error);
    } finally {
      knex.destroy();
    }
  })
  .on("error", (err) => {
    console.error("Error reading CSV:", err);
  });

async function insertIngredients(data) {
  if (data.length === 0) {
    return;
  }

  // Dedupe so we never insert two rows with same name (or same id) in one statement.
  // NOT EXISTS only sees the table before the insert, so duplicate names in the batch would both pass the check and then violate the unique constraint.
  const byName = new Map();
  for (const r of data) {
    if (!byName.has(r.name)) byName.set(r.name, r);
  }
  const byId = new Map();
  for (const r of byName.values()) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }
  const deduped = [...byId.values()];

  try {
    // Insert only rows that don't conflict on id OR name (PostgreSQL allows one ON CONFLICT per INSERT)
    const bindings = deduped.flatMap((r) => [r.id, r.name]);
    const valuePlaceholders = deduped.map(() => "(?, ?)").join(", ");
    await knex.raw(
      `INSERT INTO ingredients (id, name)
       SELECT v.id::int, v.name::text
       FROM (VALUES ${valuePlaceholders}) AS v(id, name)
       WHERE NOT EXISTS (SELECT 1 FROM ingredients i WHERE i.id = (v.id)::int)
         AND NOT EXISTS (SELECT 1 FROM ingredients i WHERE i.name = (v.name)::text)`,
      bindings
    );
  } catch (error) {
    console.error("Database insert failed:", error);
  }
}
