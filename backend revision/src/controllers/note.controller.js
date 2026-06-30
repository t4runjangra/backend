import { Note } from "../models/note.model";

export const createNote = async (req, res, next) => {
    const { title, content } = req.body
    if (!title || !content) return res.status(400).json({ message: "Fields should be filed " })
    const note = await Note.create({
        title,
        content,
        owner: req.user._id
    })
    return res.status(201)
        .json({
            message: "Note created successfully",
            note
        })

}


export const getNotes = async (req, res) => {
    const notes = await Note.find({
        owner: req.user._id
    });

    return res.status(200).json({
        message: "Notes fetched successfully",
        notes
    });
};