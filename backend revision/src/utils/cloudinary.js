import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloundinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "avatar",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                })
            }
        )
        uploadStream.end(buffer)
    })
}

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return null
    }
    const result = await cloudinary.uploader.destroy(publicId, {
        resouce_type: "image"
    })

    return result
}
export { uploadOnCloundinary, deleteFromCloudinary }
