import multer from "multer";
import { apiError } from "../utils/api.error.js";
const storage = multer.memoryStorage()


const allowedMimeType = [
    "image/jpeg",
    "image/png",
    "image/webp"
]


function fileFilter(req, file, cb) {
    const isAllowed = allowedMimeType.includes(file.mimetype)
    if (!isAllowed) {
        return cb(
         new apiError (400, "Only JPEG, PNG, and WebP images are allowed")
        )
    }
    cb(null, true)

}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})


export { upload }