import { ApiError } from "../utils/ApiError.js";
import {Admin} from "../models/admin.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../constants.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// This function is done by superUser only and hence registering this requires master key
function isValidMasterKey(masterKey){
    if(masterKey == process.env.MASTER_KEY) return true ;
    return false
}
const registerAdmin = asyncHandler( async(req, res, next)=>{
    const {masterKey, password, email, mobileNumber, adminId, joiningDate, 
    firstName, lastName, middleName, dob} = req.body ;

    // To validate if master key --> util Function
    if(!isValidMasterKey(masterKey)){
        throw new ApiError(400, "Unauthorized SuperUser Access !");
    }

    // Check if all parameters available
    if(
        [password, email, mobileNumber, adminId, joiningDate, 
            firstName, lastName, dob].some((field)=> field?.toString().trim() == "")
    ){
        throw new ApiError(400, "All fields are required!");
    }

    const existedAdmin = await Admin.findOne({
        $or : [{adminId},{email}, {mobileNumber}]
    })
    console.log(existedAdmin);
    if(existedAdmin) throw new ApiError(400, "Admin_User already exists !");

    const dateOfBirth = new Date(dob);
    const joiningDateParsed = new Date(joiningDate)
    if(!dateOfBirth || !joiningDateParsed) throw new ApiError(500, "Could not parse Date !");

    const createdAdmin = await Admin.create({
        firstName, lastName,middleName : middleName || "", dob : dateOfBirth, email, mobileNumber,
        password, adminId, joiningDate : joiningDateParsed
    });

    if(!createdAdmin) throw new ApiError(500, "Error while registering admin");

    res.status(200)
    .json(new ApiResponse(200, createdAdmin, "Admin Registered Successfully !"));
})

const generateAccessAndRefreshToken =async function(_id){
    console.log("Generating access and refresh token");
    try{
        const admin = await Admin.findById(_id);
        
        const refreshToken =await admin.generateRefreshToken();
        const accessToken =await admin.generateAccessToken();
        // console.log(refreshToken, accessToken);
        admin.refreshToken = refreshToken ;

        await admin.save({validateBeforeSave : false});
        console.log("Generation Complete access and refresh token");
        return {refreshToken, accessToken};
    }
    catch(error){
        console.log(error);
        throw new ApiError(500, "Error generating access and refresh token", [error])
    }
}

const loginAdmin = asyncHandler( async(req, res, next)=>{
    // We get password, email/adminID/mobileNumber
    // if(req.cookies?.accessToken) throw new ApiError(300, "Already Logged In !");

    const {password, email, adminId, mobileNumber} = req.body ;

    if(!password) throw new ApiError(400, "All fields are required !");

    if(!email && !adminId && !mobileNumber) throw new ApiError(400, "All fields are required !");

    // check if user exists
    const admin = await Admin.findOne({
        $or : [{email}, {mobileNumber : (isNaN(mobileNumber) ? -1 : mobileNumber)}, {adminId}]
    })

    if(!admin) throw new ApiError(400, "Admin is not registered !")

    // check if password is valid
    if(! await admin.isPasswordCorrect(password)) throw new ApiError(400, "Invalid Credentials");

    // Create refresh and access token
    const {refreshToken, accessToken} =await generateAccessAndRefreshToken(admin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");


    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedInAdmin, "Logged In Successful !"));
})

const logoutAdmin = asyncHandler( async(req, res, next)=>{
    // Check for if user is loggedIn is done by middleware

    if(!req.admin) throw new ApiError("Unauthorized Access");

    const admin = req.admin ;
    await Admin.findByIdAndUpdate(admin._id, {
        $set : {refreshToken : "undefined"}
    }, {new : true})

    res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200,{}, "LogOut Successful"));
})

const getAdminDetails = asyncHandler( async(req, res)=>{
    if(!req.admin) throw new ApiError(404,"Admin Not Found !");

    return res.status(200).json(new ApiResponse(200,req.admin, "Admin Details"))
})

const changePassword = asyncHandler( async (req, res)=>{
    // Check if user is logged in
    // Check if password provided is same as password in database
    // If yes, change the password
    console.log("Changing Password..");
    const user = req.admin ;
    // console.log(req.body);
    const currentPassword = req.body.currentPassword ;
    const newPassword = req.body.newPassword?.trim() ;
    if(!currentPassword) throw new ApiError(400,"Credentials Required !");
    if(!newPassword || newPassword==="") throw new ApiError(400,"No password Supplied !");
    if(!user) throw new ApiError(401,"Unauthorized access");

    const admin =await Admin.findById(user._id);
    if(!admin) throw new ApiError(500,"Error fetching admin from database");

    if(! await admin.changePassword(currentPassword, newPassword)){
        throw new ApiError(400,"Invalid Credentials!");
    }
    res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Success!"));
})

const updateInformation = asyncHandler( async (req, res)=>{
    // Expects image, mobileNumber, Email
    console.log("Stating to update information");
    const imagePath = req.file?.path ;
    const mobile = req.body.mobile ;
    const email = req.body.email ;
    // console.log(req.body);
    if(!imagePath && !mobile && !email) throw new ApiError(400, "No Information to Update");
    if(mobile?.trim() =='' || email?.trim() =='') throw new ApiError(400, "Fields Required !");
    
    const admin = req.admin ;
    
    if(admin.email == email && admin.mobileNumber == mobile && !imagePath) throw new ApiError(400, "No modifications done !");
    
    let imagePathPresent = true ;
    console.log("Image path : ",imagePath);
    if(!imagePath) imagePathPresent = false ;
    console.log("Image path present: ",imagePathPresent);

    let imageOnCloudinary ;
    if(imagePathPresent){
        imageOnCloudinary =await uploadOnCloudinary(imagePath);

        if(!imageOnCloudinary) throw new ApiError(500, "Error uploading image !");
        
        // console.log(imageOnCloudinary);
    }

    const currentImage = admin.profilePicture ;
    let updatedImage = null;
    let updatedMobile=null, updatedEmail=null ;
    if(imagePathPresent){
        updatedImage = imageOnCloudinary.secure_url || currentImage  ;
    }
    else{
        updatedImage = currentImage ;
    }
    if(mobile && mobile?.trim() !=='null'){
        updatedMobile = mobile || admin.mobileNumber ;
    }
    else{
        updatedMobile = admin.mobileNumber ;
    }
    if(email && email?.trim() !=='null'){
        updatedEmail = email || admin.email ;
    }
    else{
        updatedEmail = admin.email ;
    }

    const updatedStudent = await Admin.findByIdAndUpdate(admin._id,{
        $set : {
            profilePicture : updatedImage,   
            mobileNumber : updatedMobile,
            email : updatedEmail
        }
    }, {new : true})?.select("-password -refreshToken");

    if(!updatedStudent) throw new ApiError(500, "Something went wrong while updating the database");

    if(updatedImage != currentImage){
        // Delete the old image from the cloudinary database
        const isImageDeleted = await deleteFromCloudinary(currentImage);
        if(isImageDeleted) console.log("Old Image deleted from cloudinary");
        if(!isImageDeleted) console.log("Old Image could not be deleted");
    }
    // console.log(imagePath);
    // console.log(mobile);
    // console.log(email);
    return res.status(200).json(new ApiResponse(200,updatedStudent, "admin Information updated successfully"));
})

const removeProfilePicture = asyncHandler(async(req, res)=>{
    // Just the admin is enough
    const admin = req.admin ;
    if(!admin) throw new ApiError(401, "Unauthorized Request !")

    if(!admin.profilePicture || admin.profilePicture?.trim() == '') throw new ApiError(404,"No profile picture found");

    const isImageDeleted = await deleteFromCloudinary(admin.profilePicture);
    if(!isImageDeleted) throw new ApiError(500, "Something went wrong while deleting the image");

    const updatedAdmin = await Admin.findByIdAndUpdate(admin._id, {
        $set : {
            profilePicture : null
        }
    }, {new : true})?.select("-password -refreshToken");

    if(!updatedAdmin) throw new ApiError(500, "Something went wrong while updating database");

    return res.status(200).json(new ApiResponse(200,updatedAdmin, "Profile Removed Successfully"))
})

const getProfilePicture = asyncHandler(async (req,res)=>{
    const admin = req.admin ;
    if(!admin.profilePicture || admin.profilePicture?.trim() =='') throw new ApiError(404,"No profile Picture Found !");

    return res.status(200).json(new ApiResponse(200,{profilePicture : admin.profilePicture}));
})

export {registerAdmin, loginAdmin, logoutAdmin, generateAccessAndRefreshToken, getAdminDetails, changePassword, 
    updateInformation, removeProfilePicture, getProfilePicture
}