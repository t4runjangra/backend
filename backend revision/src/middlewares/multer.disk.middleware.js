import multer from "multer"
import path from "path"
import crypto from "crypto"
import { apiError } from "../utils/api.error.js"

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp")
    },

    filenme: (req, file, cb) => {
        const extension = path.extname(file.originalname)

        const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`

        cb(null, uniqueName)
    }

})

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new apiError(
                400,
                "Only JPEG, PNG  and WebP images are allowed"
            )
        )
    }
    cb(null, true)
}


const diskUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})


export { diskUpload }