// Controller to send fine notifications
// To pay fine
// To see fine of a student
// To see Total Fine

import { Issue } from "../models/issue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Student} from "../models/student.model.js"

const booksWithFineStudent = asyncHandler(async (req, res)=>{
    // Accepts studentId or Student object
    console.log("Getting Fine of a student");
    let student = req.student ;
    // Either the student is not authorized or it is called by admin
    if(req.admin && req.body.studentId){
        student = await Student.findOne({studentId:req.body.studentId});   
    }
        
    if(!student) throw new ApiError(400,"Invalid Request, Student not found");


    const response = await Issue.find({
        student : student._id
    })
    // Find all the issues of a student and sum the fine
    // const response = await Issue.aggregate([
    //     {
    //         $match :{
    //             student : student._id
    //         }
    //     },
    //     // {
    //     //     $group:{
    //     //         _id : "$student",
    //     //         fine : {$sum : "$fine"}
    //     //     }
    //     // }
    // ])
    // console.log("The response from aggregate query is : ",response);
    let totalFine=0;
    response.forEach((issue)=>{
        issue.fine = issue.getFine()
        totalFine += issue?.fine;
    })
    // console.log("The total fine is ", totalFine);
    
    return res.status(200)
    .json(new ApiResponse(200,{books : response, totalFine : totalFine},"User Fine Fetched"));

})

const allStudentFine = asyncHandler( async(req,res)=>{
    
    const response =await Issue.aggregate([
        {
            $group :{
                _id : "$student",
                fine :{ $sum : "$fine"} 
            }
        }
    ])
    console.log(response);
    return res.status(200)
    .json(new ApiResponse(200,response,"All Students Details"))

})

export {booksWithFineStudent, allStudentFine}