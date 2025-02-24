## Database Setup

### 1. Install Dependencies

Make sure you have Knex and MySQL installed in your project:

```sh
npm install knex mysql2
```

### 2. Run Migrations

Before inserting data, ensure your database schema is set up correctly:

```sh
npx knex migrate:latest
```

### 3. Seed the Database

After running migrations, seed the database with:

```sh
npx knex seed:run
```

### 4. Import Spoonacular Ingredients

Spoonacular provides a list of the top 1,000 most common ingredients, which can be inserted into the database.

The ingredient data is stored in: `/data/top-1k-ingredients.csv`

To import ingredients into the database, run:

```sh
node scripts/importIngredients.js
```
