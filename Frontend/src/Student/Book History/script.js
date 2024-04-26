import { API_DOMAIN } from "../../constants.js";
async function getEntireBookDetailsByBookInstance(bookInstance) {
    const url = `${API_DOMAIN}/book/getEntireBookDetailsByBookInstance`;
    const response = await fetch(url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bookInstance: bookInstance
            })
        })
    const responseJson = await response.json();
    // console.log(responseJson);
    return responseJson.data;
}

function generateBookRow(entireBookDetails, issueDate, tableBody) {
    const bookDetails = entireBookDetails?.bookDetails;
    console.log(entireBookDetails);
    const row = document.createElement('tr');

    const IssueDate = document.createElement("td");
    IssueDate.innerText = new Date(issueDate).toLocaleDateString("en-GB");

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

    const BookNumber = document.createElement("td");
    BookNumber.innerHTML = entireBookDetails?.bookNumber;

    const Description = document.createElement("td");
    const para = document.createElement("p");
    para.innerText = bookDetails?.description;
    Description.appendChild(para);

    const Pages = document.createElement("td");
    Pages.innerText = bookDetails.pageCount;



    row.appendChild(IssueDate);
    row.appendChild(BookTitle);
    row.appendChild(BookCover);
    row.appendChild(Author);
    row.appendChild(Categories);
    row.appendChild(Publisher);
    row.appendChild(ISBN);
    row.appendChild(BookNumber);
    row.appendChild(Description);
    row.appendChild(Pages);

    tableBody.appendChild(row);
}

async function getBooksHistory() {
    const url = `${API_DOMAIN}/student/getStudentBookHistory`;
    const response = await fetch(
        url,
        {
            method: "GET",
            credentials: "include",
        }
    )
    const responseJson = await response.json()
    return responseJson.data;
}

async function pageRender() {
    const bookHistory = await getBooksHistory();

    const tableBody = document.querySelector("#bookHistoryTableBody");

    bookHistory.forEach(async (book) => {
        
        const bookDetail = await getEntireBookDetailsByBookInstance(book._id)
        const issueDate = book.IssueDate ;

        generateBookRow(bookDetail, issueDate, tableBody);

    });
}

window.onload = async function(){
    
    await pageRender();
    document.getElementById("BookHistory").classList.add("active");
}