import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO : Add feature for filters by year, page, author, publication etc.
const searchBooksAvailableInDB = asyncHandler( async(req, res)=>{
    // Anything related to book
    // Title, isbn, categories, description, author, publication

})

// Using Google Api
const searchBooksOverInternet = asyncHandler( async (req, res)=>{
    const {title, author, keywords, publisher, isbn} = req.body ;

    // const query = `${keywords||''} intitle:${title||''}|inauthor:${author||''}|inpublisher:${publisher||''}|isbn:${isbn||''}`
    let query = ``;
    if(keywords) query += `${keywords}`
    if(title) query += `|intitle:${title}`
    if(author) query += `|inauthor:${author}`
    if(publisher) query += `|inpublisher:${publisher}`
    if(isbn) query += `|isbn:${isbn}`

    console.log(query);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.GOOGLE_BOOKS_API_KEY}`

    const response = await fetch(url, 
    {
        method : "GET"
    })
    const responseJson =await response?.json();
    // console.log(responseJson);
    res.status(200)
    .json(new ApiResponse(200, responseJson, "Books Searched From Internet"));
})

export {searchBooksOverInternet};