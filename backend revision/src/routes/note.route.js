import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getNotes, updateNote } from "../controllers/note.controller.js";
const noteRouter = Router()

noteRouter.post("/note", verifyJWT, createNote)
noteRouter.get("/note",verifyJWT, getNotes)
noteRouter.patch("/note/:id",verifyJWT, updateNote)
noteRouter.delete("/note/:id",verifyJWT, deleteNote)

export default noteRouter

