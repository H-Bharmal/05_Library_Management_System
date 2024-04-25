import { BookDetails } from "../models/book_details.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "./ApiResponse.js";


const addBookInBookDetails = async(titleInput,isbn10, isbn13)=>{
    console.log("Book details adding");
    // Check if we have title, isbn
    console.log(titleInput, isbn10, isbn13);
    if(!isbn10 && ! isbn13 && !titleInput) throw new ApiError(400,"No field supplied");
    
    let isbn ;
    if(isbn10){
        isbn = isbn10
    }
    else if(isbn13){
        isbn = isbn13
    }
    // else{
    //     throw new ApiError(400, "ISBN number required !");
    // }

    const alreadyExisted = await BookDetails.findOne({
        $or : [{title:titleInput?.toUpperCase()},{isbn10:isbn}, {isbn13:isbn}]
    });
    
    if(alreadyExisted){
        // console.log(alreadyExisted);
        console.log("Book Exists !");
        return new ApiResponse(200,alreadyExisted, "Book Already Exists") ;
    }
    // console.log("Oy return no thyu !!!!");
    // Create a book

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    let responseData ;
    await fetch(apiUrl)
    .then(response => response.json())
    .then(async (data) =>{
        responseData = data ;
    })
    .catch(error=>{
        throw new ApiError(404, error.message || "Book Not Found, Try registering manually", [error])
    })
    console.log(responseData);
    if (responseData.totalItems < 1)
        throw new ApiError(404, "Book Not Found, Try registering manually")

    const items = responseData.items[0] ;
    const volumeInfo = items.volumeInfo ;
    const {title, authors, publisher, description, categories} = volumeInfo ;
    const pageCount = volumeInfo.pageCount ;
    console.log(volumeInfo)
    // const new_isbn13 = volumeInfo.industryIdentifiers[0]?.identifier || isbn13;
    // const new_isbn10 = volumeInfo.industryIdentifiers[1]?.identifier || isbn10;

    const thumbnail = volumeInfo.imageLinks.thumbnail ;
    const previewLink = volumeInfo.previewLink ;

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

    const book = await BookDetails.create({
        title, authors, publisher, description, categories, pageCount, isbn10 : new_isbn10, isbn13 :new_isbn13, thumbnail, previewLink
    })

    if(!book) throw new ApiError(500, "Error occured while registering the book");
    return new ApiResponse(200,book, "Book Registered Successfully") ;
}

export {addBookInBookDetails}