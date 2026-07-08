import { z } from "zod";

export const createNoteSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required"),

    content: z
        .string()
        .trim()
        .min(1, "Content body cannot be empty"),
});

export const updateNoteSchema = createNoteSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "Atleast one field must be provided"
})