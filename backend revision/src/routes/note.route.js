import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getNotes, updateNote } from "../controllers/note.controller.js";
import { createNoteSchema, updateNoteSchema } from "../validators/note.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
const noteRouter = Router()

noteRouter.post("/note", validate(createNoteSchema), verifyJWT, createNote)
noteRouter.get("/note", verifyJWT, getNotes)
noteRouter.patch("/note/:id", validate(updateNoteSchema), verifyJWT, updateNote)
noteRouter.delete("/note/:id", verifyJWT, deleteNote)

export default noteRouter

