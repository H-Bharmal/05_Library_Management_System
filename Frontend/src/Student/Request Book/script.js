import {API_DOMAIN} from "../../constants.js"
import {notify as notification} from "../../utils/notify.js"

function generateBookRow(bookDetails, bookRequest, tableBody) {

    const row = document.createElement('tr');

    const IssueDate = document.createElement("td");
    IssueDate.innerText = new Date(bookRequest.createdAt).toLocaleDateString("en-GB");

    const BookTitle = document.createElement("td");
    const bookLink = document.createElement("a");
    bookLink.href = bookDetails?.previewLink;
    bookLink.innerText = bookDetails?.title;
    BookTitle.appendChild(bookLink);

    const BookCover = document.createElement("td");
    const bookCoverImage = document.createElement("img");
    bookCoverImage.src = bookDetails.thumbnail;
    BookCover.appendChild(bookCoverImage);

    const Author = document.createElement("td");
    Author.innerText = bookDetails?.authors

    const Categories = document.createElement("td");
    Categories.innerHTML = bookDetails?.categories;

    const Publisher = document.createElement("td");
    Publisher.innerText = bookDetails?.publisher?.toUpperCase();

    const ISBN = document.createElement("td");
    ISBN.innerHTML = `<b>ISBN10</b> : ${bookDetails?.isbn10}<br><b>ISBN13</b> : ${bookDetails?.isbn13}`;

    const Description = document.createElement("td");
    const para = document.createElement("p");
    para.innerText = bookDetails?.description;
    Description.appendChild(para);

    const Status = document.createElement("td");
    Status.innerText = bookRequest.status;

    row.appendChild(IssueDate);
    row.appendChild(BookTitle);
    row.appendChild(BookCover);
    row.appendChild(Description);
    row.appendChild(Author);
    row.appendChild(Categories);
    row.appendChild(Publisher);
    row.appendChild(ISBN);
    row.appendChild(Status);

    tableBody.appendChild(row);
}

async function getAllBookRequested(){
    const url = `${API_DOMAIN}/api/v1/book/getBookRequestStudent`;

    const response = await fetch(url,
        {
            method :"GET",
            credentials : "include"
        })
    const responseJSON = await response.json();
    console.log(responseJSON);
    return responseJSON?.data ;
}

async function getBookDetailsByISBN(isbn10, isbn13){
    const url = `${API_DOMAIN}/api/v1/book/getBookDetailByISBN`;

    const response = await fetch(url,
        {
            method :"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({
                isbn10 : isbn10,
                isbn13 : isbn13,
            })
        })
    const responseJSON = await response.json();
    console.log(responseJSON?.data);
    return responseJSON?.data ;
}
async function pageRender(){
    // My request section
    const myrequestTable = document.getElementById("bookListTableBodyRequestedBook");
    const requestHistoryTable = document.getElementById("TableBodyHistoryRequestedBook");

    const bookDetails = await getAllBookRequested();
    // console.log(typeof bookDetails);
    bookDetails.forEach(async bookRequest => {
        const bookDetail = await getBookDetailsByISBN(bookRequest?.isbn10, bookRequest?.isbn13)
        if(bookRequest.status == "Pending"){
            generateBookRow(bookDetail, bookRequest, myrequestTable);
        }
        else{
            generateBookRow(bookDetail, bookRequest, requestHistoryTable);
        }
    });

}


async function onRequestFormSubmit(){
    const titleInput = document.getElementById("form-book-title");
    const isbn10Input = document.getElementById("form-isbn10");
    const isbn13Input = document.getElementById("form-isbn13");

    const title = titleInput.value ;
    const isbn10 = isbn10Input.value ;
    const isbn13 = isbn13Input.value ;

    titleInput.value = "";
    isbn10Input.value = "";
    isbn13Input.value = "";
    
    if(!title && !isbn10 && !isbn13){
        notification("All fields cannot be Empty");
        return ;
    }
    
    const url = `${API_DOMAIN}/api/v1/book/requestBookByISBN`
    const response = await fetch(url,
        {
            method:'POST',
            headers :{
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                title : title,
                isbn10 : isbn10,
                isbn13 : isbn13
            }),
            credentials : "include"
        });

    if(!response.ok){ 

        console.log(response);
        notification("Could not Complete the request"); 
        return ;
    }
    const responseJSON = await response.json();
    notification(responseJSON.message)
    console.log("Request Successful",responseJSON);
    // fetch book details
    const book = responseJSON.data?.book ;
    const url2 = `${API_DOMAIN}/api/v1/book/getBookDetailByBookID`;
    const responseDetails = await fetch(url2,
        {
            method:'POST',
            headers :{
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                book:book
            }),
            credentials:"include"
        })
    
    if(!responseDetails.ok){
        notification("Could not fetch the requested book details!")
        console.log("Error while fetching details"); return;}

    const responseDetailsJSON = await responseDetails.json();
    renderRequestBook(responseDetailsJSON.data);
}

function renderRequestBook(data){
    const bookCoverImage = document.getElementById("book-cover");
    const categories = document.getElementById("categories")
    const publisher = document.getElementById("publisher")
    const BookTitle = document.getElementById("book-title")
    const BookTitleLink = document.getElementById("book-title-link")
    const authors = document.getElementById("Author")
    const isbn10 = document.getElementById("isbn10")
    const isbn13 = document.getElementById("isbn13")
    const description = document.getElementById("description")

    bookCoverImage.src = data.thumbnail ;
    categories.innerText = data.categories;
    publisher.innerText = data.publisher;
    BookTitle.innerText = data.title;
    BookTitleLink.href = data.previewLink;
    authors.innerText = data.authors;
    isbn10.innerText = data.isbn10;
    isbn13.innerText = data.isbn13;
    description.innerText = data.description;

    document.getElementsByClassName("acknowledgeBookRequest")[0].style.display="flex"

}



window.onload = async function(){
    await pageRender();
    addEventListeners();
    document.getElementById("RequestBook").classList.add("active");
    document.getElementById("reqeust-form")
    .addEventListener('submit',async(e)=> {
        e.preventDefault();
        onRequestFormSubmit();
    });
}

function addEventListeners(){
    let coll = document.querySelectorAll(".collapsible");
    console.log(coll.length);
    let i;
    for (i = 0; i < coll.length; i++) {
        console.log("Event listener added");
        coll[i].addEventListener("click", function () {
            console.log("button clicekd");
            this.classList.toggle("collapse-active");
            var content = this.nextElementSibling;
            console.log(content);
            if (content.style.display === "inherit") {
                content.style.display = "none";
            } else {
                content.style.display = "inherit";
            }
        });
    }

    let tablinks = document.getElementsByClassName("tablinks");
    for(i=0;i<tablinks.length;i++){
        tablinks[i].addEventListener("click", (e)=>{
            activepage();
        })
    }
}

function activepage() {
    const buttons = document.getElementsByClassName("tablinks");
    const content = document.getElementsByClassName("tabcontent");
    console.log(buttons);
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("tabactive");
        content[i].classList.toggle("tabactive");
    }
}