import express from "express";
import { searchIngredients } from "../controllers/ingredientSearchController.js";
import requireUserId from "../middleware/requireUserId.js";

const router = express.Router();

router.use(requireUserId);

router.get("/search", searchIngredients);

export default router;
