async function getIssuedBooks(){
    const url = "http://localhost:8000/api/v1/student/booksWithFineStudent";
    const response = await fetch(
        url,
        { 
            method : "GET",
            credentials : "include",
        }
    )
    const responseJson = await response.json()
    return responseJson.data ;
}

async function getEntireBookDetailsByBookInstance(bookInstance){
    const url = "http://localhost:8000/api/v1/book/getEntireBookDetailsByBookInstance";
    const response = await fetch(url,
        {
            method : "POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                bookInstance : bookInstance
            })
        })
    const responseJson = await response.json();
    // console.log(responseJson);
    return responseJson.data ;
}
function generateBookRow(entireBookDetails, issueDetails, tableBody){
    const bookDetails = entireBookDetails?.bookDetails;

    const row = document.createElement('tr');
    const BookTitle = document.createElement("td");
    const bookLink = document.createElement("a");
    bookLink.href = bookDetails?.previewLink ;
    bookLink.innerText = bookDetails?.title;
    BookTitle.appendChild(bookLink);

    const BookCover = document.createElement("td");
    const bookCoverImage = document.createElement("img");
    bookCoverImage.src = bookDetails.thumbnail ;
    BookCover.appendChild(bookCoverImage);

    const Author = document.createElement("td");
    Author.innerText = bookDetails?.authors

    const BookNumber = document.createElement("td");
    BookNumber.innerHTML = entireBookDetails?.bookNumber;

    const DateIssued = document.createElement("td");
    DateIssued.innerText = (new Date(issueDetails.updatedAt)).toLocaleDateString("en-GB") ;

    const IssueCount = document.createElement("td");
    IssueCount.innerText = issueDetails.issueCount ;

    const FinePending = document.createElement("td");
    FinePending.innerText = issueDetails.fine ;
    
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
async function pageRender(){
    const tableBody = document.querySelector("#bookListTableBody")
    const allBookInstance = (await getIssuedBooks())?.books;
    // console.log(allBookInstance);   
    allBookInstance.forEach(async (issue) => {
        // console.log(issue);
        const bookDetail = await getEntireBookDetailsByBookInstance(issue.book)
        // console.log(bookDetail);
        
        generateBookRow(bookDetail, issue,tableBody)
    });
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

window.onload = async function(){
    await pageRender();
}