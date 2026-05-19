import express from "express";
import userController from "../controllers/userControllers.js";

const router = express.Router();

router.post("/", userController.createUser);
router.get("/", userController.getUser);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.putUserById);
router.patch("/:id/deactivate", userController.patchUserById);

export default router;

