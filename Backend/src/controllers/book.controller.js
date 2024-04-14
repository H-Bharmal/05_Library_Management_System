// Used for functionality of books as : 
// addBook, RemoveBook, updateBookDetails
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookDetails } from "../models/book_details.model.js";
import { BookInstance } from "../models/bookInstance.model.js";
import { addBookInBookDetails } from "../utils/addBookInDetails.js";
import { RequestBook } from "../models/request.model.js";

const registerBookByISBN = asyncHandler(async (req, res)=>{
    // A middleware to first check that admin is loggedin
    if(!req.admin) throw new ApiError(400, "Unauthorized Access");
    console.log("Registering a Book by ISBN");
    // Now check if all things are available first
    const {isbn10, isbn13} = req.body
    // DONE : use function instead
    // console.log(volumeInfo.industryIdentifiers[1]);
    // console.log(volumeInfo.industryIdentifiers[0]);
    // const existedBook = await BookDetails.findOne({
    //     $or : [{title, new_isbn10, new_isbn13}]
    // });
    // console.log(existedBook);
    // if(existedBook) throw new ApiError(400,"Book Already registered !");
    let response ;
    try{
        response =await addBookInBookDetails( isbn10, isbn13);
    }
    catch(error){
        console.log(error);
        throw new ApiError(error.statusCode || 400, error.message || "Could not find book details !");
    }
    
    if(!response) throw new ApiError(500, "Error occured while registering the book");

    return res.status(200)
    .json(new ApiResponse(200,response?.data, response?.message))
})

const registerBookManually = asyncHandler( async (req, res)=>{
    const {title, authors, publisher, description, categories, pageCount,isbn10, isbn13, thumbnail, previewLink} = req.body ;

    if(!title || !publisher) throw new ApiError(400, "All Fields are Required")
    if(!isbn10 || !isbn13) throw new ApiError(400, "All Fields are Required")
    if(authors.length == 0)throw new ApiError(400, "All Fields are Required")

    const existedBook = await BookDetails.findOne({
        $or : [{title, isbn10, isbn13}]
    });
    // console.log(existedBook);
    if(existedBook) throw new ApiError(400,"Book Already registered !");

    const book = await BookDetails.create({
        title, authors, publisher, description, categories, pageCount,isbn10 : new_isbn10, isbn13 :new_isbn13, thumbnail, previewLink
    })
    
    if(!book) throw new ApiError(500, "Error occured while registering the book");
    

    return res.status(200)
    .json(new ApiResponse(200,book, "book registered successfully !"))
})

const addBookInstance = asyncHandler( async (req, res)=>{
    // Title or ISBN Number
    const title = req.body.title?.toLowerCase();
    const isbn10 = req.body.isbn10;
    const isbn13 = req.body.isbn13;
    // const edition = req.body.edition ;
    if(!title && !isbn10 && !isbn13) throw new ApiError(400, "No Field Supplied for creating a book instance !");

    // const registeredBook = await BookDetails.findOne({
    //     $or : [{title}, {isbn10}, {isbn13}]
    // })
    const registeredBookResponse = await addBookInBookDetails(title, isbn10, isbn13);
    const registeredBook = registeredBookResponse?.data ;
    // console.log(registeredBook);
    //DONE-TODO : Instead of giving a error, try to register a new book automatically
    if(!registeredBook) throw new ApiError("No such Book registered in the database");

    const book = await BookInstance.create({
        title : registeredBook.title,
        isbn10 : registeredBook.isbn10,
        isbn13 : registeredBook.isbn13,
        // edition : edition || 1,
        bookDetails : registeredBook._id,
    })

    if(!book) throw new ApiError(500, "Error while creating book instance", [error]);

    // DONE-TODO :Add feature to delete all the bookrequests for this book instance
    // TODO: NOTIFY the students that instance have been added to library

    // No more deleting the requestBooks
    // await RequestBook.deleteMany({
    //     $or : [{title : registeredBook.title},{isbn10 : registeredBook.isbn10},{isbn13 : registeredBook.isbn13}]
    // })

    // Rather using it as history
    await RequestBook.updateMany(
        {
            $or : [{title : registeredBook.title},{isbn10 : registeredBook.isbn10},{isbn13 : registeredBook.isbn13}]
        },
        {
            $set : {
                status : "Completed"
            }
        }
    )
    res.status(200)
    .json(new ApiResponse(200, book, "Book Instance registered successfully"));
})

// const getBookDetail = asyncHandler(async(req, res)=>{
//     const {title, bookNumber, isbn10, isbn13} = req.body ;
//     if(!title && !bookNumber && !isbn10 && !isbn13)
//         throw new ApiError(400,"No valid Parameter given to find book");

//     const book = await BookInstance.findOne({
//         $or : [
//             {title : title?.toUpperCase()},
//             {bookNumber},
//             {isbn10},
//             {isbn13}
//         ]
//     })

//     if(!book) throw new ApiError(404,"No such Book Registered");

//     return res.status(200)
//     .json(new ApiResponse(200, book, "Book Detail Fetched"))
// })

const getBookDetailByBookInstanceId = asyncHandler(async(req, res)=>{
    const BookInstanceId = req.body.bookInstance ;
    console.log("Getting book details");
    // console.log(req.body);
    // console.log(BookInstanceId);
    if(!BookInstanceId) throw new ApiError(400,"Book Instance Invalid")

    const book = await BookInstance.findById(BookInstanceId);

    if(!book) throw new ApiError(400,"No such book Found");

    return res.status(200)
    .json(new ApiResponse(200,book,"Book Details Fetched Successfully!"));
})

const getBookDetailByBookId = asyncHandler( async (req, res)=>{
    console.log(req.body);
    const bookid = req.body.book ;
    console.log(bookid);
    if(!bookid) throw new ApiError(400,"Book ID required !");

    const bookDetail = await BookDetails.findById(bookid);

    if(!bookDetail) throw new ApiError(400,"No such book found !");

    return res.status(200).
    json(new ApiResponse(200,bookDetail,"book details fetched !"))
})

const getBookDetailsByISBN = asyncHandler(async (req, res)=>{
    console.log("Fetching details using ISBN");
    const {isbn10, isbn13} = req.body ;
    console.log(req.body);
    if(!isbn10 && !isbn13) throw new ApiError(400, "Invalid Parameters passed");

    const bookDetails = await BookDetails.findOne({
        $or : [{isbn10}, {isbn13}]
    });

    if(!bookDetails) throw new ApiError(404, "No such book found !");

    return res.status(200)
    .json(new ApiResponse(200, bookDetails, "Book Details fetched!"))
})

const getEntireBookDetailsByBookInstance = asyncHandler(async (req,res)=>{
    const bookInstanceId = req.body.bookInstance ;
    console.log("Getting book details");
    // console.log(req.body);
    console.log(bookInstanceId);
    if(!bookInstanceId) throw new ApiError(400,"Book Instance Invalid")

    const bookDetails = await BookInstance.findById(bookInstanceId).populate("bookDetails")

    if(!bookDetails) throw new ApiError(404,"No such book Found!");
    // console.log(bookDetails);
    res.status(200)
    .json(new ApiResponse(200,bookDetails, "Book Details found !"))
})
export {registerBookByISBN, registerBookManually, addBookInstance, 
    getBookDetailByBookInstanceId, getBookDetailsByISBN,
    getEntireBookDetailsByBookInstance,
    getBookDetailByBookId}