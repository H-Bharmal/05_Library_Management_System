import {ApiError} from "./ApiError.js"
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_NAME,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) throw new ApiError(404, "File path required !");

        const response = await cloudinary.uploader.upload(localFilePath, {
            firesource_type : "auto"
        })

        if(!response) throw new ApiError(500, "Error uploading to Cloudinary");
        fs.unlinkSync(localFilePath);
        console.log("Cloudinary - File Upload success");
        return response ;
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        console.log("Cloudinary - Error uploading to Cloudinary");
        return null;
    }
}

const deleteFromCloudinary = async(cloudinaryImageUrl)=>{
    try{
        console.log("Deleting the image from cloudinary");
        if(!cloudinaryImageUrl) return false;
        const publicIdImage = cloudinaryImageUrl.split('/').pop().split('.')[0] ;
        console.log(publicIdImage);
        if(!publicIdImage) return false;
        const response = await cloudinary.uploader.destroy(publicIdImage);
        console.log(response);
        if(response.result === "ok"){
            console.log("Cloudinary - Image deleted successfully");
            return true;
        }
        else{
            console.log("Cloudinary - Error while deleting the image from cloudinary");
            return false ;
        }
    }catch(error){
        console.log("Cloudinary - Could not delete the image with publicId :", publicIdImage);
        return false ;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}