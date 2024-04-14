async function getUser() {
    const url = "http://localhost:8000/api/v1/student/getStudentDetails";
    const res = await fetch(url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(data),
            credentials: 'include'
        })
    const resJson = await res.json();
    const data = resJson.data
    console.log(data);

    return data;
}
async function getBooksWithFine() {
    const url = "http://localhost:8000/api/v1/student/booksWithFineStudent";
    const response = await fetch(url,
        {
            method: "GET",
            credentials: "include"
        })

    const responseJson = await response.json();
    console.log(responseJson);
    const data = responseJson.data
    console.log("Book Data", data);

    return data;
}

async function getBookDetail(bookInstanceId){
    const url = "http://localhost:8000/api/v1/book/getBookDetailByBookInstanceId";
    console.log(bookInstanceId);
    const response = await fetch(url,
        {
            method : "POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                bookInstance : bookInstanceId
            })
        });

    const responseJson = await response.json();
    // console.log(responseJson);
    return responseJson.data;
}

async function renderDashBoard() {

    // Username and Profile SetUp
    const student = await getUser();
    const username = document.querySelector("#username");
    const profilePic = document.querySelector(".profile img");
    username.innerHTML = student.firstName;
    profilePic.src = student.profilePic || "../Images/user.png"

    // Book List along with issue date and Fine
    const bookData = await getBooksWithFine();
    const books = bookData.books;
    console.log(books);
    const fineTile = document.querySelector("#fine")
    const renewDateTile = document.querySelector("#renewDate")
    const bookCountTile = document.querySelector("#totalBook")

    // Fine Tile
    fineTile.innerHTML = bookData.totalFine;

    // Upcoming Renew Date
    let earliestUpdatedAt;
    let activeBookCount = 0 ;
    books.forEach(element => {
        if (element.bookStatus === "Active") {
            activeBookCount++;
            if (!earliestUpdatedAt || element.updatedAt < earliestUpdatedAt) {
                earliestUpdatedAt = element.updatedAt;
            }
        }
    });

    if (earliestUpdatedAt) {
        let renewDate = new Date(earliestUpdatedAt);
        const maxDaysBeforeRenew = 20;
        renewDate.setDate(renewDate.getDate() + maxDaysBeforeRenew);
        renewDateTile.innerHTML = renewDate.toLocaleDateString('en-GB');
    }
    else{
        renewDateTile.innerHTML = "-"
    }
    // Active Book Count
    bookCountTile.innerHTML = activeBookCount

    // Book List
    const bookListTableBody = document.querySelector("#bookListTableBody")
    
    books.forEach(async (book)=>{
        const tableRow = document.createElement("tr");
        const bookTitle = document.createElement("td");
        const BookNumber = document.createElement("td");
        const DateIssued = document.createElement("td");
        const IssueCount = document.createElement("td");
        const FinePending = document.createElement("td");
        const Status = document.createElement("td");
        const PayFineButton = document.createElement("td");
        const button = document.createElement('button');
        button.innerText = "Pay Fine"
        PayFineButton.appendChild(button);
        const bookDetails =await getBookDetail(book.book);
        // console.log(book);
        // console.log(bookDetails);

        bookTitle.innerText = bookDetails.title;
        BookNumber.innerText = bookDetails.bookNumber ;
        DateIssued.innerText = (new Date(book.updatedAt)).toLocaleDateString("en-GB") ;
        IssueCount.innerText = book.issueCount ;
        FinePending.innerText = book.fine ;
        Status.innerText = book.bookStatus ;


        // Append the row
        tableRow.appendChild(bookTitle);
        tableRow.appendChild(BookNumber);
        tableRow.appendChild(DateIssued);
        tableRow.appendChild(IssueCount);
        tableRow.appendChild(FinePending);
        tableRow.appendChild(Status);
        tableRow.appendChild(PayFineButton);
        bookListTableBody.appendChild(tableRow)
    })
}

window.onload = async function () {
    console.log("Calling user");
    await renderDashBoard();
    document.getElementById("Home").classList.add("active");
};
