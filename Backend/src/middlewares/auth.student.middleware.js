// middleware to check if you are loggedIn

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { generateAccessAndRefreshToken } from "../controllers/student.controller.js";

const verifyJWTStudent =asyncHandler(async function(req, res, next){
    console.log("Authorizing..");
    const incomingAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    // console.log(req.cookies);
    

    if(!incomingAccessToken || !incomingRefreshToken ) throw new ApiError(400, "Authorization Token missing !");

    const accessTokenExp =await jwt.decode(incomingAccessToken).exp * 1000; // Multiply by 1000 to convert seconds to milliseconds
    const currentTime = new Date().getTime();

    if (accessTokenExp < currentTime) {
        console.log("Access Token Expired, Generating New !");
        // Access token is expired,  generate new
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await Student.findById(decodedRefreshToken._id).select("-password");
        
        if(!user) throw new ApiError(400, "Invalid Refresh Token");
        
        // if(incomingRefreshToken !== user?.refreshToken){
        //     throw new ApiError(401,"Invalid Refresh Token");
        // }
        
        const generatedTokens = await generateAccessAndRefreshToken(user._id)

        const renewedAccessToken = generatedTokens.accessToken
        const renewedRefreshToken = generatedTokens.refreshToken
        
        const options = {
            httpOnly : true,
            secure : true,
        } 

        res
        .cookie("accessToken", renewedAccessToken, options)
        .cookie("refreshToken", renewedRefreshToken, options)

        const student = await Student.findById(decodedRefreshToken._id).select("-password -refreshToken");
        
        if(!student) throw new ApiError(400, "Error while fetching admin details from database");
        
        req.student = student ;

        next();
    }
    else{
        // Find the user with the help of accessToken
        const decodedAccessToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("Access Token Decrypted !");

        // From decoded token we get id and then from that we get user
        const student = await Student.findById(decodedAccessToken._id).select("-password -refreshToken");

        if(!student){
            throw new ApiError(400, "Access Token Invalid")
        }
        req.student = student ;
        next();
    }
});

export {verifyJWTStudent}