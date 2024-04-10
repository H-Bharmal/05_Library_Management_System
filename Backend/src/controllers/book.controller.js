// Used for functionality of books as : 
// addBook, RemoveBook, updateBookDetails
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookDetails } from "../models/book_details.model.js";
import { BookInstance } from "../models/bookInstance.model.js";

const registerBookByISBN = asyncHandler(async (req, res)=>{
    // A middleware to first check that admin is loggedin
    if(!req.admin) throw new ApiError(400, "Unauthorized Access");
    console.log("Registering a Book by ISBN");
    // Now check if all things are available first
    const {isbn10, isbn13} = req.body
    let isbn ;
    if(isbn10){
        isbn = isbn10
    }
    else if(isbn13){
        isbn = isbn13
    }
    else{
        throw new ApiError(400, "ISBN number required !");
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    let responseData ;
    await fetch(apiUrl)
    .then(response => response.json())
    .then(async (data) =>{
        responseData = data ;
    })
    .catch(error=>{
        throw new ApiError(400, error.message || "Book Not Found, Try registering manually", [error])
    })
    if (!responseData)
        throw new ApiError(400, "Book Not Found, Try registering manually")

    const items = responseData.items[0] ;
    const volumeInfo = items.volumeInfo ;
    const {title, authors, publisher, description, categories} = volumeInfo ;
    const pageCount = volumeInfo.readingModes.pageCount ;
    const new_isbn13 = volumeInfo.industryIdentifiers[0].identifier ;
    const new_isbn10 = volumeInfo.industryIdentifiers[1].identifier;
    const thumbnail = volumeInfo.imageLinks.thumbnail ;
    const previewLink = volumeInfo.previewLink ;
    console.log(volumeInfo.industryIdentifiers[1]);
    console.log(volumeInfo.industryIdentifiers[0]);
    const existedBook = await BookDetails.findOne({
        $or : [{title, new_isbn10, new_isbn13}]
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

const registerBookManually = asyncHandler( async (req, res)=>{
    const {title, authors, publisher, description, categories, pageCount,isbn10, isbn13, thumbnail, previewLink} = req.body ;

    if(!title || !publisher) throw new ApiError(400, "All Fields are Required")
    if(!isbn10 || !isbn13) throw new ApiError(400, "All Fields are Required")
    if(authors.length == 0)throw new ApiError(400, "All Fields are Required")

    const existedBook = await BookDetails.findOne({
        $or : [{title, new_isbn10, new_isbn13}]
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
    const title = req.body.title.toLowerCase();
    const isbn10 = req.body.isbn10;
    const isbn13 = req.body.isbn13;
    // const edition = req.body.edition ;
    if(!title && !isbn10 && !isbn13) throw new ApiError(400, "No Field Supplied for creating a book instance !");

    const registeredBook = await BookDetails.findOne({
        $or : [{title}, {isbn10}, {isbn13}]
    })

    if(!registeredBook) throw new ApiError("No such Book registered in the database");

    const book = await BookInstance.create({
        title : registeredBook.title,
        isbn10 : registeredBook.isbn10,
        isbn13 : registeredBook.isbn13,
        // edition : edition || 1,
        bookDetails : registeredBook._id,
    })

    if(!book) throw new ApiError(500, "Error while creating book instance", [error]);

    res.status(200)
    .json(new ApiResponse(200, book, "Book Instance registered successfully"));
})
export {registerBookByISBN, registerBookManually, addBookInstance}