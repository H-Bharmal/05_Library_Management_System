import {API_DOMAIN} from "../../constants.js"
async function getIssuedBooks() {
    const url = `${API_DOMAIN}/student/booksWithFineStudent`;
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
function generateBookRow(entireBookDetails, issueDetails, tableBody) {
    const bookDetails = entireBookDetails?.bookDetails;

    const row = document.createElement('tr');
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

    const BookNumber = document.createElement("td");
    BookNumber.innerHTML = entireBookDetails?.bookNumber;

    const DateIssued = document.createElement("td");
    DateIssued.innerText = (new Date(issueDetails.updatedAt)).toLocaleDateString("en-GB");

    const IssueCount = document.createElement("td");
    IssueCount.innerText = issueDetails.issueCount;

    const FinePending = document.createElement("td");
    FinePending.innerText = issueDetails.fine;

    const Publisher = document.createElement("td");
    Publisher.innerText = bookDetails?.publisher?.toUpperCase();

    const PayFine = document.createElement("td");
    const button = document.createElement('button');
    button.innerText = "Pay Fine"
    PayFine.appendChild(button);

    row.appendChild(BookTitle);
    row.appendChild(BookCover);
    row.appendChild(Author);
    row.appendChild(Publisher);
    row.appendChild(BookNumber);
    row.appendChild(DateIssued);
    row.appendChild(IssueCount);
    row.appendChild(FinePending);
    row.appendChild(PayFine);

    tableBody.appendChild(row);
}
async function pageRender() {
    const allBookInstance = (await getIssuedBooks())?.books;
    // console.log(allBookInstance);   
    // TODO: Pending to make it work for active, pending fine, requested to add in library

    const tableBodyIssuedBooks = document.querySelector("#bookListTableBodyCurrentIssuedBooks")
    const tableBodyReturnedBooks = document.querySelector("#bookListTableBodyPendingFine")
    allBookInstance.forEach(async (issue) => {
        
        const bookDetail = await getEntireBookDetailsByBookInstance(issue.book)
        
        if(issue.bookStatus === "Active"){
            generateBookRow(bookDetail, issue, tableBodyIssuedBooks)
        }
        else{
            generateBookRow(bookDetail, issue, tableBodyReturnedBooks)
        }


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
}

window.onload = async function () {
    await pageRender();
    document.getElementById("MyBooks").classList.add("active");
    // console.log("Page Rendering done");
    addEventListeners();
}