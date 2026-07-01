import { Note } from "../models/note.model.js";

export const createNote = async (req, res, next) => {
    const { title, content } = req.body
    if (!title || !content) return res.status(400).json({ message: "Fields should be filed " })
    const note = await Note.create({
        title,
        content,
        owner: req.user.id
    })
    return res.status(201)
        .json({
            message: "Note created successfully",
            note
        })

}


export const getNotes = async (req, res) => {
    const notes = await Note.find({
        owner: req.user.id
    });

    return res.status(200).json({
        message: "Notes fetched successfully",
        notes
    });
};

export const updateNote = async (req, res) => {
    const noteId = req.params.id;

    if (!noteId) {
        return res.status(400).json({
            message: "Note ID is required"
        });
    }
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required"
        });
    }

    const note = await Note.findById(noteId);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }
    if (req.user.id != note.owner) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    console.log(note.owner, req.user.id);
    
    note.title = title;
    note.content = content;

    await note.save();

    return res.status(200).json({
        message: "Note updated successfully",
        note
    });
};

export const deleteNote = async (req, res) => {
    const noteId = req.params.id;

    if (!noteId) {
        return res.status(400).json({
            message: "Note ID is required"
        });
    }

    const note = await Note.findById(noteId);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    if (req.user.id != note.owner) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    await note.deleteOne();

    return res.status(200).json({
        message: "Note deleted successfully"
    });
};