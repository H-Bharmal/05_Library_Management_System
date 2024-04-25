// TODO : Request a book manually
// Take input as isbn number, and give some details,
// Now if user wants to change anything, it can,
// Once changed it again sends request to add the book to request page
// then the book details are stored and new request is created
// PROBLEM : user can request any false information

// This works currently based on requesting the book by ISBN
// User has to provide a isbn value, if that is registered or is found,
// we proceed to next step by adding that to requestBook collection
// Once the request is created, message is send back along with the book details
import { BookDetails } from "../models/book_details.model.js";
import { RequestBook } from "../models/request.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { addBookInBookDetails } from "../utils/addBookInDetails.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const requestBook = asyncHandler( async (req,res)=>{
    // expected isbn number
    console.log("hurry",req.body);
    let {isbn10, isbn13, title} = req.body ;
    const student = req.student ;
    if (isbn10 === undefined && isbn13 === undefined && title === undefined) {
        throw new ApiError(400, "No field supplied");
    }
    if (
        (typeof isbn10 !== 'string' && typeof isbn10 !== 'number') &&
        (typeof isbn13 !== 'string' && typeof isbn13 !== 'number') &&
        (typeof title !== 'string')
    ) {
        throw new ApiError(400, "No valid field supplied");
    }
    if(!isbn10 && !isbn13 && !title) throw new ApiError(400,"No field supplied");

    title = title?.toLowerCase();
    isbn10 = isbn10?.replace(/\D/g, "");
    isbn13 = isbn13?.replace(/\D/g, "");
    console.log("I am going to be called : addBookInBookDetails");
    const bookResponse = await addBookInBookDetails(title, isbn10, isbn13);
    
    if(bookResponse.statusCode != 200) throw new ApiError(400, "Invalid Book Requested !");

    // console.log(bookResponse);
    const bookTitle = bookResponse.data?.title ;
    // Now check if this book is already requested by the student before
    const alreadyRequested = await RequestBook.findOne({
        $and : [{title:bookTitle}, {student:student._id}, {status : "Pending"}]
    });

    // if(alreadyRequested) throw new ApiError(409, "Book already requested once !");
    if(alreadyRequested){
        return res.status(200)
        .json(new ApiResponse(200,alreadyRequested,"Book Requested Already Present"))
    }
    const request = await RequestBook.create({
        isbn10 : bookResponse?.data.isbn10,
        isbn13 :bookResponse?.data.isbn13,
        title : bookResponse?.data.title,
        book : bookResponse.data?._id,
        student : student._id
    });

    if(!request) throw new ApiError(500,"Something went wrong while creating book request");

    return res.status(200)
    .json(new ApiResponse(200,request,"Book Request Successful!"))
})

const getAllBookRequestStudent = asyncHandler( async(req, res)=>{
    const student = req.student ;
    if(!student) throw new ApiError(400,"Student required !");

    const response = await RequestBook.aggregate([
        {
            $match : {
                student : student._id
            }
        }
    ])
    if(!response) throw new ApiError(500,"Something went wrong while fetching book requests !")
    // console.log(response);
    
    return res.status(200)
    .json(new ApiResponse(200,response, "Book Fetched Successfully"));

})
export {requestBook, getAllBookRequestStudent}