import express from "express";
import * as groceryListController from "../controllers/groceryListController.js";
import requireUserId from "../middleware/requireUserId.js";

const router = express.Router();

router.use(requireUserId);

router
  .route("/")
  .get(groceryListController.getGroceryList)
  .post(groceryListController.addItemToGroceryList);

router
  .route("/:id")
  .delete(groceryListController.removeItemFromGroceryList)
  .patch(groceryListController.groceryItemComplete);

export default router;
