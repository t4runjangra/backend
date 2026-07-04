import { Note } from "../models/note.model.js";
import { apiError } from "../utils/api.error.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createNote = asyncHandler(
    async (req, res) => {
        const { title, content } = req.body

        const note = await Note.create({
            title,
            content,
            owner: req.user.id
        })
        return res.status(201)
            .json(
                new apiResponse(201, note, "Note created successfully")
            )

    }
)



export const getNotes = asyncHandler(
    async (req, res) => {
        const notes = await Note.find({
            owner: req.user.id
        }).populate("owner",  "-password -refreshToken ");

        return res.status(200).json(
            new apiResponse(200, notes, "Notes fetched successfully")
        )
    }
)


export const updateNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;

    if (!noteId) throw new apiError(400, "Note ID is required")


    const { title, content } = req.body;



    const note = await Note.findById(noteId);

    if (!note) throw new apiError(404, "Note not found")


    if (!note.owner.equals(req.user.id)) {
        throw new apiError(403, "Forbidden");
    }

    note.title = title;
    note.content = content;

    await note.save();

    return res.status(200).json(
        new apiResponse(200, note, "Note updated successfully")

    );
})

export const deleteNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;

    if (!noteId) throw new apiError(400, "Note ID is required")



    const note = await Note.findById(noteId);

    if (!note) throw new apiError(404, "Note not found")


    if (!note.owner.equals(req.user.id)) {
        throw new apiError(403, "Forbidden");
    }

    await note.deleteOne();

    return res.status(200).json(
        new apiResponse(200, null,  "Note deleted successfully")
    )
})