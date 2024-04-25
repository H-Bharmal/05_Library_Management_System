// Controller to see all login and logout register etc activities
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError }from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Student } from "../models/student.model.js";

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
        const student = await Student.findById(studentID);

        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        // Update the refresh Token in database
        student.refreshToken = refreshToken ;

        // save
        await student.save();

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
        $or : [{email : email?.toLowerCase()}, {mobileNumber}, {studentId : studentId?.toLowerCase()}]
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
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

export {registerStudent, loginStudent, logoutStudent, getStudentDetails, getStudentBookHistory, generateAccessAndRefreshToken}