import { Schema } from "mongoose";
import mongoose from "mongoose";
import { User } from "./user.model.js";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}
    , {
        timestamps: true
    }
)

export const Note = mongoose.model("Note", noteSchema)