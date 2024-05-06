// Controller to see all login and logout register etc activities
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError }from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Student } from "../models/student.model.js";
import { cookieOptions } from "../constants.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const registerStudent = asyncHandler( async (req, res, next)=>{
    console.log(req.body);
    const {firstName, middleName, lastName, dob, password, email, mobileNumber, studentId, course, branch, semester} = req.body ;

    if(
        [firstName, lastName, dob, password, email, mobileNumber, studentId, course, branch, semester].some( (field)=>field?.toString().trim() == "")
    ){
        throw new ApiError(400, "All Fields are Required !");
    }
    console.log([firstName, lastName, dob, password, email, mobileNumber, studentId, course, branch, semester]);
    // check if user exists
    const existedStudent = await Student.findOne({
        $or : [{email}, {mobileNumber}, {studentId}]
    })
    if(existedStudent){
        throw new ApiError(400, "Student Exists already !");
    }

    //  Profile Picture


    const dateOfBirth = new Date(dob);
    if(!dateOfBirth){
        throw new ApiError(500, "Could not parse Birth Date");
    }
    console.log(dateOfBirth);
    const student = await Student.create({
        firstName, middleName : middleName || "", lastName,
        dob:dateOfBirth, password, email, mobileNumber, studentId, course, branch, semester
    })

    // verify the creation of student 
    const createdStudent = await Student.findById(student._id).select("-password -refreshToken");
    if(!createdStudent){
        throw new ApiError(500, "Error while creating student user");
    }

    // send the response back
    res.status(200)
    .json(new ApiResponse(200,createdStudent, "Student User registered successfully"))
});

const generateAccessAndRefreshToken = async (studentID)=>{
    try{
        console.log("Generating new Tokens..");
        const student = await Student.findById(studentID);

        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        // Update the refresh Token in database
        student.refreshToken = refreshToken ;

        // save
        await student.save();
        console.log("Tokens generated !");
        return {accessToken, refreshToken}
    }
    catch(error){
        console.log(error);
        throw new ApiError(500, "Error generating Tokens");
    }
}

const loginStudent = asyncHandler( async (req, res, next)=>{
    const {email, mobileNumber, studentId, password} = req.body ;
    console.log(req.body);
    // if(req.cookies?.accessToken){
    //     throw new ApiError(300, "Student already logged In !");
    // }
    if(!email && !mobileNumber && !studentId){
        throw new ApiError(400, "Provide email/mobilenumber/studentid");
    }
    if(!password){
        throw new ApiError("400", "Password is required");
    }

    const student = await Student.findOne({
        $or : [{email : email?.toLowerCase()}, {mobileNumber : isNaN(mobileNumber) ? -1 : mobileNumber}, {studentId : studentId?.toLowerCase()}]
    })
    if(!student){
        throw new ApiError(404, "Student does not exists");
    }

    // Now check if password matches
    if(!(await student.isPasswordCorrect(password))){
        throw new ApiError(401, "Invalid Credentials");
    }

    // Create jwt tokens
    const {accessToken, refreshToken} =await generateAccessAndRefreshToken(student._id);

    const loggedInStudent =await Student.findById(student._id).select("-password -refreshToken");

    // const expirationDate = new Date();
    // expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    // send cookies
    const options = {
        httpOnly : true,
        secure : true,
        // expires : expirationDate,
        sameSite: 'None',
    }

    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedInStudent, "Logged In Successfully"));
})

const logoutStudent = asyncHandler(async(req, res, next)=>{
    const student = req.student;

    await Student.findByIdAndUpdate(student._id, {
        $set : {
            refreshToken : "undefined"
        }
    }, {new : true});

    const options = {
        httpOnly : true,
        secure : true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Successful"))
})

//  Functions used for frontend rendering
const getStudentDetails = asyncHandler( async(req, res, next)=>{
    const student = req.student ;
    console.log("Dashboard renderer called.");
    res.status(200)
    .json(new ApiResponse(200,student,"Student fetched !"));
})

const getStudentBookHistory = asyncHandler( async(req, res)=>{

    let student = req.student ;
    if(req.admin){
        const studentId = req.body.studentId ;
        const email = req.body.email ;
        let mobileNumber = req.body.mobileNumber ;
        if(typeof mobileNumber === "string") mobileNumber=0;
        
        student = await Student.findOne({
            $or :[ {studentId}, {email}, {mobileNumber}]
        })
    }

    if(!student) throw new ApiError(400,"No such Student Found !");

    return res.status(200)
    .json(new ApiResponse(200,student?.bookHistory, "Book History Fetched"))
})

const changePassword = asyncHandler( async (req, res)=>{
    // Check if user is logged in
    // Check if password provided is same as password in database
    // If yes, change the password
    console.log("Changing Password..");
    const user = req.student ;
    console.log(req.body);
    const currentPassword = req.body.currentPassword ;
    const newPassword = req.body.newPassword?.trim() ;
    if(!currentPassword) throw new ApiError(400,"Credentials Required !");
    if(!newPassword || newPassword==="") throw new ApiError(400,"No password Supplied !");
    if(!user) throw new ApiError(401,"Unauthorized access");

    // console.log(user._id);
    const student =await Student.findById(user._id);
    if(!student) throw new ApiError(500,"Error fetching student from database");
    // console.log("Verifying passwords!");
    // console.log(student);
    if(! await student.changePassword(currentPassword, newPassword)){
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
    console.log(req.body);
    if(!imagePath && !mobile && !email) throw new ApiError(400, "No Information to Update");
    if(mobile?.trim() =='' || email?.trim() =='') throw new ApiError(400, "Fields Required !");
    
    const student = req.student ;
    
    if(student.email == email && student.mobileNumber == mobile && !imagePath) throw new ApiError(400, "No modifications done !");
    
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

    const currentImage = student.profilePicture ;
    let updatedImage = null;
    let updatedMobile=null, updatedEmail=null ;
    if(imagePathPresent){
        updatedImage = imageOnCloudinary.secure_url || currentImage  ;
    }
    else{
        updatedImage = currentImage ;
    }
    if(mobile && mobile?.trim() !=='null'){
        updatedMobile = mobile || student.mobileNumber ;
    }
    else{
        updatedMobile = student.mobileNumber ;
    }
    if(email && email?.trim() !=='null'){
        updatedEmail = email || student.email ;
    }
    else{
        updatedEmail = student.email ;
    }

    const updatedStudent = await Student.findByIdAndUpdate(student._id,{
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
    return res.status(200).json(new ApiResponse(200,updatedStudent, "Student Information updated successfully"));
})

const removeProfilePicture = asyncHandler(async(req, res)=>{
    // Just the student is enough
    const student = req.student ;
    if(!student) throw new ApiError(401, "Unauthorized Request !")

    if(!student.profilePicture || student.profilePicture?.trim() == '') throw new ApiError(404,"No profile picture found");

    const isImageDeleted = await deleteFromCloudinary(student.profilePicture);
    if(!isImageDeleted) throw new ApiError(500, "Something went wrong while deleting the image");

    const updatedStudent = await Student.findByIdAndUpdate(student._id, {
        $set : {
            profilePicture : null
        }
    }, {new : true})?.select("-password -refreshToken");

    if(!updatedStudent) throw new ApiError(500, "Something went wrong while updating database");

    return res.status(200).json(new ApiResponse(200,updatedStudent, "Profile Removed Successfully"))
})

const getProfilePicture = asyncHandler(async (req,res)=>{
    const student = req.student ;
    if(!student.profilePicture || student.profilePicture?.trim() =='') throw new ApiError(404,"No profile Picture Found !");

    return res.status(200).json(new ApiResponse(200,{profilePicture : student.profilePicture}));
})

export {registerStudent, loginStudent, logoutStudent, getStudentDetails, getStudentBookHistory, generateAccessAndRefreshToken, changePassword, updateInformation, removeProfilePicture, getProfilePicture}