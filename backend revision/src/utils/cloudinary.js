import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";
import fs from "fs/promises"
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

const uploadLocalFileToCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "cover-avatar",
            resource_type: "image",
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } finally {
        console.log("DELETING TEMP FILE:", localFilePath);
        try {
            await fs.unlink(localFilePath);
            console.log("TEMP FILE DELETED");
        } catch (cleanupError) {
            console.error(
                "Failed to delete temporary local file:",
                cleanupError
            );
        }
    }
}


const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return null
    }
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
    })

    return result;
}
export { uploadOnCloundinary, deleteFromCloudinary, uploadLocalFileToCloudinary }
