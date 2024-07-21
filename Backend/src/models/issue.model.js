import mongoose from "mongoose";
import { maxIssueAllowedPerBook, maxDaysBeforeRenew } from "../constants.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const issueSchema = new mongoose.Schema({
    // This defines how many times a user can issue this particular book
    issueCount : {
        type : Number,
        default : 1,
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
    },
    bookStatus : {
        type : String,
        // If a status is fine pending, means that the user has returned the book
        // But has still not paid the fine amount.
        enum : ["Returned", "Fine Pending", "Active"],
        // required : true,
        default : "Active"
    }

},{timestamps : true});

// throws error if issue count exceeds max issue allowed
// issueSchema.pre("save",async function (next){
//     await this.updateFine();
//     next();
// })

// methods to renew book 
// issueSchema.methods.renewBook = function (){
//     if(this.issueCount >= maxIssueAllowedPerBook){
//         throw new ApiError(400,"Maximum Time Issued !");
//     }
//     else{
//         this.issueCount++;
//         return new ApiResponse(200, this, "Book Issued Successfully");
//     }
// }

issueSchema.methods.updateFine =async function(){
    this.fine = this.getFine();
    await this.save();
}
issueSchema.methods.getFine = function(){
    const dateIssue = this.updatedAt ;
    const dateToday =new Date();
    const differenceMs = Math.abs(dateToday - dateIssue);
    const days = Math.ceil(differenceMs/(60*60*24*1000));
    // console.log(days);
    // console.log(dateToday.toLocaleString());
    // console.log(dateIssue.toLocaleString());
    let fine = this.fine ;
    if(days > maxDaysBeforeRenew){
        fine += days - maxDaysBeforeRenew ;
    }
    // console.log("The fine is now :", fine)
    return fine ;
}

export const Issue = mongoose.model("Issue",issueSchema);