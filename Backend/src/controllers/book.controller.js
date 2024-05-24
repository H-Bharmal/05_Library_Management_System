// Used for functionality of books as : 
// addBook, RemoveBook, updateBookDetails
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookDetails } from "../models/book_details.model.js";
import { BookInstance } from "../models/bookInstance.model.js";
import { addBookInBookDetails } from "../utils/addBookInDetails.js";
import { RequestBook } from "../models/request.model.js";
import { Issue } from "../models/issue.model.js";

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

const registerBookManually = asyncHandler(async (req, res, next) => {
    let { title, authors, publisher, description, categories, pageCount, isbn10, isbn13, thumbnail, previewLink } = req.body;
    
    console.log(req.body);
    if(!title && !isbn10 && !isbn13) throw new ApiError(400, "All Fields are Required")
    title = title?.trim()?.toUpperCase()
    isbn10 = isbn10?.trim()
    isbn13 = isbn13?.trim()

    if(!title && !isbn10 && !isbn13) throw new ApiError(400, "All Fields are Required")
    
    // If Book already exists, Go ahead
    const existedBook = await BookDetails.findOne({
        $or: [{ title}, {isbn10}, {isbn13 }]
    });    
    console.log(existedBook);
    req.responseData = req.responseData || {}
    if (existedBook) {
        req.responseData.registeredBook = existedBook;
        return next();
    }

    // Input validation
    if (!title?.trim() || !publisher?.trim() || !isbn10?.trim() || !isbn13?.trim() || !authors.length)
        throw new ApiError(400, "All Fields are Required");

    if (isNaN(Number(pageCount))) throw new ApiError(400, "Page count must be a number");
    pageCount = Number(pageCount);

    if (isNaN(Number(isbn10)) || isNaN(Number(isbn13)))
        throw new ApiError(400, "ISBN must be a number");

    isbn10 = Number(isbn10);
    isbn13 = Number(isbn13);
    console.log(authors);
    if(typeof authors ==="string")
        authors = authors.split(',')
    if (!Array.isArray(authors) || authors.some(author => typeof author !== 'string' || !author.trim()))
        throw new ApiError(400, "Authors must be non-empty strings");

    // // Optional fields validation
    // if (thumbnail && typeof thumbnail !== 'string')
    //     throw new ApiError(400, "Thumbnail must be a string if provided");

    // if (previewLink && typeof previewLink !== 'string')
    //     throw new ApiError(400, "Preview link must be a string if provided");

    // Trimming strings
    title = title?.trim();
    authors = authors.map(author => author.trim());
    publisher = publisher?.trim();
    description = description ? description?.trim() : '';
    categories = categories ? categories?.trim() : '';
    thumbnail = thumbnail ? thumbnail?.trim() : '';
    previewLink = previewLink ? previewLink?.trim() : '';

    const book = await BookDetails.create({
        title, authors, publisher, description, categories, pageCount, isbn10, isbn13, thumbnail, previewLink
    });

    if (!book) throw new ApiError(500, "Error occurred while registering the book");
    req.responseData.registeredBook = book;
    next();
    // return res.status(200)
    //     .json(new ApiResponse(200, book, "Book registered successfully!"));
});
const deregisterBook = asyncHandler( async(req, res)=>{
    // Expect the isbnnumer
    console.log(req.body);
    const isbn10In = req.body?.isbn10?.trim();
    const isbn13In = req.body?.isbn13?.trim();
    if(!isbn10In && !isbn13In) throw new ApiError(400, "No Parameters passed");
    if(isNaN(isbn10In) && isNaN(isbn13In)) throw new ApiError(400, "Invalid Parameters passed");
    console.log(isbn10In);
    let isbn;
    if(isbn10In){
        isbn = isbn10In
    }
    else{
        isbn = isbn13In
    }
    // check if book is found in database
    const response = await BookDetails.findOneAndDelete({
        $or : [{isbn10:isbn}, {isbn13:isbn}]
    });
    if(!response) throw new ApiError(404,"Error Deleting from databse");
    
    return res.status(200).json(new ApiResponse(200,{}, "BookDetail Deleted Successfully"))
})

const addBookInstances = asyncHandler(async(req,res)=>{
    const registeredBook = req?.responseData?.registeredBook ;
    let count = req.body?.count;
    let bookNumberStart = req.body?.bookNumber

    if(!registeredBook) throw new ApiError("No such Book registered in the database");
    if(!count) count = 1;

    let book;
    for(let i=0;i<count;i++){
        book = await BookInstance.create({
            title : registeredBook.title,
            isbn10 : registeredBook.isbn10,
            isbn13 : registeredBook.isbn13,
            bookNumber : bookNumberStart? (bookNumberStart+i):0,
            // edition : edition || 1,
            bookDetails : registeredBook._id,
        })
        if(!book) throw new ApiError(500, "Error while creating book instance", [error]);
    }


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
    .json(new ApiResponse(200, {book:{book},count:{count}}, "Book Instances registered successfully"));
})

const modifyBookInstance = asyncHandler( async(req, res)=>{
    // Find the book instance from book number
    const oldBookNumber = req.body.oldBookNumber;
    const newBookNumber = req.body.newBookNumber;
    const purchaseDate = req.body.purchaseDate ;
    console.log(purchaseDate);
    if(!oldBookNumber) throw new ApiError(400,"No book Number supplied")
    if(!newBookNumber) throw new ApiError(400,"No book Number supplied")
    let updateFields = {}
    updateFields.bookNumber = newBookNumber
    if(purchaseDate){
        const date = new Date(purchaseDate)
        updateFields.purchaseDate = date
    }
    const response = await BookInstance.findOneAndUpdate({
        bookNumber : oldBookNumber
    }, 
    {
        $set : updateFields
    })
    if(!response) throw new ApiError(500,"Could not update the book instance")

    res.status(200)
    .json(new ApiResponse(200, {}, "Book Instance updated"));
})

const deleteBookInstance = asyncHandler(async(req, res)=>{
    const bookNumber = req.body.bookNumber;
    if(!bookNumber)throw new ApiError(400,"No booknumber supplied");

    const response = await BookInstance.findOne({
        bookNumber
    })

    if(!response) throw new ApiError(500,"Could not delete book instance");
    // Check if the book is issued to any student currently
    const studentIssued =await Issue.findOne({
        book:response._id
    })
    if(studentIssued) throw new ApiError(400,"Book Issued to Student");

    // Otherwise delete
    const response2 = await BookInstance.findOneAndDelete({
        bookNumber
    })
    if(!response2) throw new ApiError(500,"Could not delete book instance");
    return res.status(200).json(new ApiResponse(200,"Instance deleted successfully"))
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
    // const registeredBook = req.registeredBook ;
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

// This function can return all the details about a book, if the book has atleast one instance
const getCompleteBookDetailsFromInstance = asyncHandler(async(req, res)=>{
    let {title, bookNumber, isbn10, isbn13} = req.body ;
    title = title?.trim();
    bookNumber = Number(bookNumber)
    // bookNumber = bookNumber?.trim();
    isbn10 = isbn10?.trim();
    isbn13 = isbn13?.trim();
    if(!title && !bookNumber && !isbn10 && !isbn13)
        throw new ApiError(400,"No valid Parameter given to find book");

    const book = await BookInstance.findOne({
        $or : [
            {title : title?.toUpperCase()},
            {bookNumber},
            {isbn10},
            {isbn13}
        ]
    }).populate('bookDetails');

    if(!book) throw new ApiError(404,"No such Book Found");

    return res.status(200)
    .json(new ApiResponse(200, book, "Book Detail Fetched"))
})

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

// Note : The name of function is misleading, If the book is available in store, it checks directly from database, else INTERNET
const getBookDetailsViaInternet = asyncHandler(async (req, res)=>{
    console.log(req.body);
    let isbn10 = req.body.isbn10;
    let isbn13 = req.body.isbn13;
    if(isNaN(isbn10)) isbn10 = undefined ;
    if(isNaN(isbn13)) isbn13 = undefined ;
    let isbn ;
    if(isbn10){
        isbn = isbn10
    }
    else if(isbn13){
        isbn = isbn13
    }
    if(!isbn10 && !isbn13) throw new ApiError(400,"No parameters supplied");
    
    // Check if details are available in our database
    const bookLocal = await BookDetails.findOne({
        $or :[{isbn10}, {isbn13}]
    })
    if(bookLocal){
        return res.status(201).json(new ApiResponse(201,bookLocal,"Book Fetched Locally"))
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    const response = await fetch(apiUrl)
    if(!response.ok) throw new ApiError(500, "Error fetching details");

    const responseData = await response.json()
    const items = responseData.items[0] ;
    const volumeInfo = items.volumeInfo ;
    const {title, authors, publisher, description, categories} = volumeInfo ;
    const pageCount = volumeInfo?.pageCount ;
    const thumbnail = volumeInfo?.imageLinks?.thumbnail ;
    const previewLink = volumeInfo?.previewLink ;

    // To get the correct isbn numbers
    const industryIdentifiers = volumeInfo?.industryIdentifiers ;
    let new_isbn10;
    let new_isbn13;
    industryIdentifiers.forEach(element => {
        if(element?.type =="ISBN_10"){
            new_isbn10 = element?.identifier ;
        }
        else if(element?.type =="ISBN_13"){
            new_isbn13 = element?.identifier ;
        }
        
    });

    res.status(200).json(new ApiResponse(200,{title, authors, publisher, description, categories, pageCount, isbn10 : new_isbn10, isbn13 :new_isbn13, thumbnail, previewLink}));
})

export {registerBookByISBN, registerBookManually, addBookInstance, 
    getBookDetailByBookInstanceId, getBookDetailsByISBN,
    getEntireBookDetailsByBookInstance,
    getBookDetailByBookId, getBookDetailsViaInternet, deregisterBook,
    getCompleteBookDetailsFromInstance, modifyBookInstance,deleteBookInstance,addBookInstances
}