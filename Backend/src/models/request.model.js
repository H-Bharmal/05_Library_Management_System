import mongoose from "mongoose"

const requestBookSchema = new mongoose.Schema({
    // Request a book 
    // 1. New Book
    // 2. Old book quantity
    // Hence field like requestCount --> to track the students interested in requesting the book
    // To prevent same student request again, hashmap like
    // OR
    // count all requests when needed
    // i.e field as stduent, and book request from book detail
    // If the book is there or not it doesnt matter
    // if there is no book, retrive the information from google api, if not possible ask to request manually
    isbn10 : {
        type : String,
    },
    isbn13 :{
        type : String,
    },
    title : {
        type : String,
        uppercase : true,
        required : true,
    },
    book : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BookDetails",
    },
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Student",
    },
    status : {
        type : String,
        // Pending : yet to conclude.
        // Accepted/Rejected : To say whether it is granted
        // Completed : Book is now available in library
        enum : ["Completed", "Request Accepted", "Request Rejected", "Pending"],
        default : "Pending"
    }

}, {timestamps:true});

export const RequestBook = mongoose.model("RequestBook",requestBookSchema);