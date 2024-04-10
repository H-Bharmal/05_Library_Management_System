import mongoose from "mongoose";
import { maxIssueAllowed } from "../constants.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const issueSchema = new mongoose.Schema({
    // This defines how many times a user can issue this particular book
    issueCount : {
        type : Number,
        default : 0,
    },
    book : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BookInstance"
    },
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Student",
    },
    fine : {
        type : Number,
        default : 0,
    }

},{timestamps : true});

// throws error if issue count exceeds max issue allowed
issueSchema.pre("save", function (next){
    updateFine();
    if(this.issueCount >= maxIssueAllowed){
        throw new ApiError(400,"Maximum Time Issued !");
    }
    this.issueCount++;
    next();
})

// methods to renew book 
issueSchema.methods.renewBook = function (){
    if(this.issueCount >= maxIssueAllowed){
        throw new ApiError(400,"Maximum Time Issued !");
    }
    else{
        this.issueCount++;
        return new ApiResponse(200, this, "Book Issued Successfully");
    }
}

issueSchema.methods.updateFine = function(){
    this.fine = getFine();
}
issueSchema.methods.getFine = function(){
    const dateIssue = this.updatedAt ;
    const dateToday = Date.now();
    const differenceMs = Math.abs(dateToday - dateIssue);
    const days = Math.ceil(differenceMs/(60*60*24*1000));
    let fine = this.fine ;
    if(days > maxDaysBeforeRenew){
        fine += days - maxDaysBeforeRenew ;
    }
    return fine ;
}