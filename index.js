import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recipesRoutes from "./routes/recipesRoutes.js";
import favoriteRecipesRoutes from "./routes/favoriteRecipesRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import groceryListRoutes from "./routes/groceryListRoutes.js";
import fridgeRoutes from "./routes/fridgeRoutes.js";
import ingredientSearchRoutes from "./routes/ingredientSearchRoutes.js";
import "./scripts/cacheCleanup.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/recipes", recipesRoutes);
app.use("/favorites", favoriteRecipesRoutes);
app.use("/meal-plan", mealPlanRoutes);
app.use("/grocery", groceryListRoutes);
app.use("/fridge", fridgeRoutes);
app.use("/ingredients", ingredientSearchRoutes);

app.get("/", (req, res) => {
  res.send("Fridge-Ventory API is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running!`);
});
