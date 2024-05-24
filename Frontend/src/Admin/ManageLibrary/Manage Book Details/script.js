import { API_DOMAIN } from "../../../constants.js";
import { notify } from "../../../utils/notify.js"

async function getBookDetailsViaInternet(isbn10, isbn13) {
    const url = `${API_DOMAIN}/book/getBookDetailsViaInternet`;
    console.log(isbn10);
    let isbn;
    if (isbn10) {
        isbn = isbn10;
    }
    else {
        isbn = isbn13;
    }
    const response = await fetch(url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                isbn10: isbn,
                isbn13: isbn,
            }),
        })
    if (!response.ok) {
        notify("Something went Wrong");
        return;
    }
    const responseJSON = await response.json();
    console.log(responseJSON?.data);
    return responseJSON?.data;
}

async function renderBookForm(isbn10, isbn13) {
    const data = await getBookDetailsViaInternet(isbn10, isbn13);

    // const data = await response.json();

    const bookCoverImage = document.getElementById("book-cover");
    const pageCountBox = document.getElementById("page-count");
    const categories = document.getElementById("categories")
    const publisher = document.getElementById("publisher")
    const BookTitle = document.getElementById("book-title")
    const BookTitleLink = document.getElementById("book-title-link")
    const authors = document.getElementById("Author")
    const isbn10Box = document.getElementById("form-isbn10")
    const isbn13Box = document.getElementById("form-isbn13")

    const description = document.getElementById("description")

    data?.thumbnail && (bookCoverImage.src = data.thumbnail);
    data?.categories && (categories.value = data.categories);
    data?.publisher && (publisher.value = data.publisher);
    data?.title && (BookTitle.value = data.title);
    data?.previewLink && (BookTitleLink.href = data.previewLink);
    data?.authors && (authors.value = data.authors);
    data?.description && (description.value = data.description);
    data?.isbn10 && (isbn10Box.value = data.isbn10);
    data?.isbn13 && (isbn13Box.value = data.isbn13);
    data?.pageCount && (pageCountBox.value = data.pageCount);

}

async function addBook() {
    // Get the values
    const bookCoverImage = document.getElementById("book-cover")?.src?.trim();
    const categories = document.getElementById("categories")?.value?.trim();
    const publisher = document.getElementById("publisher")?.value?.trim();
    const BookTitle = document.getElementById("book-title")?.value?.trim();
    const BookTitleLink = document.getElementById("book-title-link")?.href?.trim();
    const authors = document.getElementById("Author")?.value?.trim();
    const isbn10Box = document.getElementById("form-isbn10")?.value?.trim();
    const isbn13Box = document.getElementById("form-isbn13")?.value?.trim();
    const pageCount = document.getElementById("page-count")?.value?.trim();
    const description = document.getElementById("description")?.value?.trim();

    if (!pageCount || isNaN(pageCount)) {
        notify("Invalid page count", "red");
        return;
    }

    if ((isbn10Box && isNaN(isbn10Box)) || (isbn13Box && isNaN(isbn13Box))) {
        notify("Invalid ISBN", "red");
        return;
    }

    if (!bookCoverImage || !categories || !publisher || !BookTitle || !BookTitleLink || !authors || !description) {
        // console.log(bookCoverImage, categories, publisher, BookTitle, BookTitleLink, authors, description);
        notify("Invalid input values", "red");
        return;
    }


    const body = {
        title: BookTitle,
        authors: authors.split(','),
        publisher: publisher,
        description: description,
        categories: categories,
        pageCount: pageCount,
        isbn10: isbn10Box,
        isbn13: isbn13Box,
        thumbnail: bookCoverImage,
        previewLink: BookTitleLink
    }
    // console.log(body);

    const url = `${API_DOMAIN}/book/registerBookManually`;
    const response = await fetch(url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(body)
        }
    )
    // console.log("Response",response);
    if (response.ok) {
        notify("Book Added successfully");
    }
    else {
        notify((await response.json()).message || "Something went wrong", "red");
    }

}

async function deleteBook(){
    const isbn10 = document.getElementById("form-isbn10")?.value?.trim();
    const isbn13 = document.getElementById("form-isbn13")?.value?.trim();
    if(!isbn10 && !isbn13){
        notify('No parameters',"red");
    }
    const url = `${API_DOMAIN}/book/deregisterBook`;
    const response = await fetch(url, 
        {
            method : "POST",
            credentials:'include',
            headers:{
                "Content-Type":'application/json'
            },
            body:JSON.stringify({
                isbn10,
                isbn13
            })
        }
    )

    if(response.ok) notify("Book Deleted Successfully");
    else{
        notify((await response.json()).message|| "Something went Wrong", "red");
    }

}
document.addEventListener('DOMContentLoaded', async (e) => {
    const isbn10 = document.getElementById("form-isbn10")
    const isbn13 = document.getElementById("form-isbn13")

    document.getElementById('reqeust-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log(isbn10.value);
        await renderBookForm(isbn10.value, isbn13.value);

    })

    document.getElementById('addBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await addBook();
    })
    document.getElementById('DeleteBook').addEventListener('click', async (e) => {
        await deleteBook();
    })
})