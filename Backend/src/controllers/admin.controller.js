import { ApiError } from "../utils/ApiError.js";
import {Admin} from "../models/admin.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../constants.js";
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
        $or : [{email}, {mobileNumber : isNaN(mobileNumber) ? -1 : mobileNumber}, {adminId}]
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

export {registerAdmin, loginAdmin, logoutAdmin, generateAccessAndRefreshToken, getAdminDetails}