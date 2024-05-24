// This controller is used to send details

import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BookInstance } from "../models/bookInstance.model.js";
import { Student } from "../models/student.model.js";
import { Issue } from "../models/issue.model.js";
import { maxDaysBeforeRenew } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";

const totalBooksInLibrary = asyncHandler( async (req, res, next)=>{
    // Count the instances
    const response = await BookInstance.countDocuments({});
    if(!response) throw new ApiError(500,"Error Retriving Data from Database");
    // This causes if the function is used as a middleware
    // console.log(req.route);
    // if(req.route){
        // console.log("Inside the middleware block");
        req.responseData = req.responseData || {};
        req.responseData.bookCount = response ;
        return next();
    // }
    // console.log("Outside the middleware block")
    // return res.status(200).json(new ApiResponse(200, {bookCount : response}, "Total Books Count Fetched !"))
});

const totalStudentsRegistered = asyncHandler( async (req, res, next)=>{
    const response = await Student.countDocuments({});
    if(!response) throw new ApiError(500,"Error Retriving Data from Database");
    // if(next != null){
        req.responseData = req.responseData || {};
        req.responseData.studentCount = response ;
        next();
    // }
    // return res.status(200).json(new ApiResponse(200, {studentCount : response}, "Student Registered Fetched !"))
})

const totalActiveIssues = asyncHandler( async (req, res, next)=>{
    const response = await Issue.countDocuments({bookStatus:'Active'});
    if(!response) throw new ApiError(500,"Error Retriving Data from Database");
    // if(next != null){
        req.responseData = req.responseData || {};
        req.responseData.activeIssues = response ;
        next();
    // }
    // return res.status(200).json(new ApiResponse(200, {activeIssues : response}, "Active Issues Count Fetched !"))
})

const totalFinePending = asyncHandler( async (req, res, next)=>{
    const response = await Issue.aggregate([
        {
            $match :{
                $or : [{bookStatus : "Active"}, {bookStatus : "Fine Pending"}]
            }
        },
        {
            $group:{
                _id:null,
                total:{$sum : "$fine"}
            }
        },
        {
            $project:{
                _id:0
            }
        }
    ])

    if(!response) throw new ApiError(500,"Error Retriving Data from Database");

    // if(next != null){
        req.responseData = req.responseData || {};
        req.responseData.totalFine = response[0].total ;
        next();
    // }
    // return res.status(200).json(new ApiResponse(200, {totalFine : response[0].total}, "Total Fine Fetched !"))
})

const countStudentsWithFine = asyncHandler( async(req, res, next)=>{
    const response = await await Issue.aggregate([
        {
            $match :{
                $and:[
                {$or : [{bookStatus : "Active"}, {bookStatus : "Fine Pending"}]},
                {fine : {$gt:0}}
                ]
            }
        },
        {
            $group:{
                _id: "$student",
            }
        },
        {
            $group:{
                _id:null,
                total : {$sum : 1}
            }
        },
        {
            $project:{
                _id:0
            }
        }
    ]);
    if(!response) throw new ApiError(500,"Error Retriving Data from Database");
    // if(next != null){
        req.responseData = req.responseData || {};
        req.responseData.studentsWithFine = response[0].total ;
        next();
    // }
    // return res.status(200).json(new ApiResponse(200, {studentsWithFine:response[0].total}, "Students with Fine Fetched !"))
});

const countBooksAlreadyDue = asyncHandler( async(req, res, next)=>{
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - maxDaysBeforeRenew);
    const response = await Issue.aggregate([
        {
            $match : {
                updatedAt :{ $lt : lastDate}
            }
        },
        {
            $group:{
                _id:null,
                total : {$sum : 1}
            }
        },
        {
            $project :{
                _id:0
            }
        }
    ])
    if(!response) throw new ApiError(500,"Error Retriving Data from Database");
    // if(next != null){
        req.responseData = req.responseData || {};
        req.responseData.countBooksDue = response[0].total ;
        next();
    // }

    // return res.status(200).json(new ApiResponse(200, {countBooksDue:response[0].count}, "Students with Fine Fetched !"));
});

const getAllInstances = asyncHandler(async(req, res)=>{
    const response = await BookInstance.find({}).sort({title:1});
    if(!response)throw new ApiError(500,"Could not fetch instances");
    return res.status(200).json(new ApiResponse(200,response,"All Instances"))
})

export {totalBooksInLibrary, totalStudentsRegistered, totalActiveIssues, totalFinePending, countStudentsWithFine, countBooksAlreadyDue, getAllInstances};