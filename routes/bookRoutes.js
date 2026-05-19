import express from "express";
import bookController from "../controllers/bookController.js";

const router = express.Router();

router.post("/", bookController.postBook);
router.get("/", bookController.getBook);
router.get("/:id", bookController.getBookById);

export default router;
 