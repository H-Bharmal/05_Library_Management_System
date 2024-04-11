// To issue, renew, return a book

import { maxNumberOfBooksAllowed, maxIssueAllowedPerBook } from "../constants.js";
import { BookInstance } from "../models/bookInstance.model.js";
import { Issue } from "../models/issue.model.js";
import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const issueBook = asyncHandler(async (req, res, next)=>{
    // Find the bookNumber and check if that book exists in library
    // Input : bookNumber and StudentId
    let {bookNumber, studentId} = req.body;
    console.log(req.body);
    studentId = studentId.toLowerCase();

    // Find if student exists in library systme
    const bookInstance = await BookInstance.findOne ({   bookNumber    })
    const student = await Student.findOne   ({     studentId   })
    if(!bookInstance) throw new ApiError(400,"No such book exists in library")
    if(!student) throw new ApiError(400, "Student Not Registered in System")

    // Check if student has not exeeded max issue limits
    const query = {Student : student._id, bookStatus : "Active"};
    let bookCount= await Issue.countDocuments(query)
    console.log("Book Count",bookCount);
    if(bookCount > maxNumberOfBooksAllowed){
        throw new ApiError(400,"Maximum Number of Books Issued !")
    }

    // Check if this bookInstance is already taken by some another/same student
    const alreadyTaken =await Issue.findOne({
        $and : [{book : bookInstance._id},{bookStatus : "Active"}]
    })
    if(alreadyTaken)
    {
        if(alreadyTaken.student?.equals(student._id)){
            throw new ApiError(400,"Book Already taken by you");
        }
        else{
            throw new ApiError(400,"Book Already taken by someone else");
        }
    }
    

    // check if the student has already issued this book or has a pending fine on this
    const bookTakenPreviously = await Issue.findOne({
        $and : [{book : bookInstance._id},{student:student._id}]
    })
    let issuedBook;
    if(bookTakenPreviously){
        // simply change the status to active and issuecount to 0
        bookTakenPreviously.issueCount = 1;
        bookTakenPreviously.bookStatus = "Active";
        await bookTakenPreviously.save();
        issuedBook = bookTakenPreviously;
    }
    else{
        // Issue the book
        issuedBook = await Issue.create({
            book : bookInstance._id,
            student : student._id,
        })
    }
    // update the book history
    if(!issuedBook) throw new ApiError(500,"Error occured while book issue")

    student.bookHistory.push(bookInstance._id);
    await student.save({validateBeforeSave : false});

    res.status(200)
    .json(new ApiResponse(200,issuedBook,"Book Issued Successfully"))
})

const renewBook = asyncHandler( async (req, res, next)=>{
    // Check if user has issued the book already
    const studentId = req.body.studentId ;
    const bookNumber = req.body.bookNumber ;

    const student = await Student.findOne({studentId});
    const bookInstance = await BookInstance.findOne({bookNumber})

    if(!bookInstance) throw new ApiError(400,"No such book exists in library")
    if(!student) throw new ApiError(400, "Student Not Registered in System")

    const issuedBook = await Issue.findOne({
        $and : [{student : student}, {book : bookInstance}, {bookStatus : "Active"}]
    })

    if(!issuedBook) throw new ApiError(400,"Book is never issued");

    if(issuedBook.issueCount >= maxIssueAllowedPerBook){
        throw new ApiError(400,"Book has been issued for a maximum time !");
    }
    issuedBook.updateFine();
    issuedBook.issueCount++;
    await issuedBook.save({validateBeforeSave:false});
    
    res.status(200)
    .json(new ApiResponse(200, issuedBook, "Book Reissued Successfully"));
})

const returnBook = asyncHandler(async (req, res)=>{
    const studentId = req.body.studentId ;
    const bookNumber = req.body.bookNumber ;

    const student = await Student.findOne({studentId});
    const bookInstance = await BookInstance.findOne({bookNumber})

    if(!bookInstance) throw new ApiError(400,"No such book exists in library")
    if(!student) throw new ApiError(400, "Student Not Registered in System")

    const issuedBook = await Issue.findOne({
        $and : [{student : student}, {book : bookInstance}, {bookStatus : "Active"}]
    })

    if(!issuedBook) throw new ApiError(400,"Book is never issued");
    
    // Check if there is some fine
    // If there is some fine, change status to fine pending,
    // else delete the entry from database
    const fine  = issuedBook.getFine()  ;
    issuedBook.updateFine();

    if(fine > 0){
        issuedBook.bookStatus = "Fine Pending"
        await issuedBook.save();
    }
    else{
        await Issue.findByIdAndDelete(issuedBook._id);
    }

    res.status(200)
    .json(new ApiResponse(200,{},"Book Returned Successfully !"));
})

export {issueBook, renewBook, returnBook}