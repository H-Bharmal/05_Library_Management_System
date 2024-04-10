// middleware to check if you are loggedIn

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";

const verifyJWTStudent =asyncHandler(async function(req, res, next){
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(req.cookies);
    if(!accessToken){
        // Check if we have refreshToken
        if(!refreshToken){
            throw new ApiError(400, "Unauthorized User");
        }
        else{
            // try to refresh the access token
        }
    }

    // Find the user with the help of accessToken
    const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // From decoded token we get id and then from that we get user
    const user = await Student.findById(decodedAccessToken._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(400, "Access Token Invalid")
    }

    req.student = user ;
    next();
});

export {verifyJWTStudent}