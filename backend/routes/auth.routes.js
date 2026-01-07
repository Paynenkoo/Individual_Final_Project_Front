import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";

const router = Router();

router.use(protect);

router.get("/", listNotes);
router.get("/:id", getNote);

router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
