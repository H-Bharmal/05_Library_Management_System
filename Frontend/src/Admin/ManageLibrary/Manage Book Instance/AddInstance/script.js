import { API_DOMAIN } from "../../../../constants.js";
import { notify } from "../../../../utils/notify.js"

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
        notify((await response.json()).message||"Something went Wrong","red");
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
async function addBook(){
    const bookCoverImage = document.getElementById("book-cover").src;
    const pageCount = document.getElementById("page-count").value;
    const categories = document.getElementById("categories").value;
    const publisher = document.getElementById("publisher").value;
    const bookTitle = document.getElementById("book-title").value;
    const bookTitleLink = document.getElementById("book-title-link").href;
    const authors = document.getElementById("Author").value;
    const isbn10 = document.getElementById("form-isbn10").value;
    const isbn13 = document.getElementById("form-isbn13").value;
    const count = document.getElementById("instanceCount").value;
    const bookNumberStart = document.getElementById("bookNumberStart").value;
    const description = document.getElementById("description").value;

    // Create JSON object
    const requestBody = {
        thumbnail: bookCoverImage,
        pageCount: pageCount,
        categories: categories,
        publisher: publisher,
        title: bookTitle,
        previewLink: bookTitleLink,
        authors: authors,
        isbn10: isbn10,
        isbn13: isbn13,
        description: description,
        count,
        bookNumberStart
    };

    const url = `${API_DOMAIN}/book/addBookInstances`

    const response = await fetch(url,
        {
            method :"POST",
            body : JSON.stringify(requestBody),
            headers:{
                'Content-Type':'application/json'
            },
            credentials:'include'
        }
    )

    if(response.ok){
        notify("Book Instances Added")
    }
    else{
        notify((await response.json()).message||"Something went wrong","red")
    }
}

function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const vars = queryString.split("&");
    vars.forEach(function (v) {
        // console.log(v);
        const pair = v.split("=");
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    });
    return params;
}

document.addEventListener('DOMContentLoaded', async (e) => {
    const isbn10 = document.getElementById("form-isbn10")
    const isbn13 = document.getElementById("form-isbn13")
    
    const params = getQueryParams();
    if (params.isbn10 || params.isbn13) {
        document.getElementById('form-isbn10').value = params.isbn10;
        document.getElementById('form-isbn13').value = params.isbn13;
        await renderBookForm(params.isb10, params.isbn13);
    }

    document.getElementById('SearchBook').addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('clicked');
        console.log(isbn10.value);
        await renderBookForm(isbn10.value, isbn13.value);

    })

    document.getElementById('addBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await addBook();
    })

})