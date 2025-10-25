import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from 'dotenv'
import { log } from 'console';
dotenv.config()
// configure  cloudinary 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded on cloudinary . File src: " + response.url);

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log(result);
        
    } catch (error) {
        console.log("Error deleting form cloudinary", error);
        return null        
    }
}



export { uploadOnCloudinary ,deleteFromCloudinary }