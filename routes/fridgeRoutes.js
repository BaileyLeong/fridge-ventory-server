import express from "express";
import * as fridgeController from "../controllers/fridgeController.js";
import requireUserId from "../middleware/requireUserId.js";

const router = express.Router();

router.use(requireUserId);

router
  .route("/")
  .get(fridgeController.getAllFridgeItems)
  .post(fridgeController.addFridgeItem);

router
  .route("/:id")
  .patch(fridgeController.updateFridgeItem)
  .delete(fridgeController.deleteFridgeItem);

router.route("/move/:id").post(fridgeController.moveGroceryToFridge);

router.route("/use-meal/:id").post(fridgeController.useMealIngredients);

export default router;
