import {API_DOMAIN} from "../../../../constants.js"
import {notify} from "../../../../utils/notify.js"

async function fetchAllInstances(){
    const url = `${API_DOMAIN}/info/getAllInstances`
    const response = await fetch(url,{
        method:"GET",
        credentials:"include"
    })
    const responseJson = await response.json();
    if(!response.ok){
        notify(responseJson.message||"Something went wrong");
        return ;
    }
    return responseJson.data ;
}

async function renderRow(tableBody, rowData){
    const tableRow = document.createElement("tr");
        const bookTitle = document.createElement("td");
        const BookNumber = document.createElement("td");
        BookNumber.classList.add('bookNumber')
        const DatePurchased = document.createElement("td");
        // const Publisher = document.createElement("td");
        const ISBN10 = document.createElement("td");
        ISBN10.classList.add('isbn10');
        const ISBN13 = document.createElement("td");
        ISBN13.classList.add('isbn13');
        const Modify = document.createElement("td");
        const AddInstance = document.createElement('td');
        const ModifyButton = document.createElement("button");
        const AddInstanceButton = document.createElement('button');

        ModifyButton.innerText = "Modify / Delete"
        ModifyButton.addEventListener('click',function(e){
            const row = this.parentNode.parentNode;
            const bookNumber = row.querySelector('.bookNumber').innerText

            window.location.href = `../Modify_Delete Instance/index.html?bookNumber=${encodeURIComponent(bookNumber)}`;
        })

        AddInstanceButton.innerText = "Add"
        AddInstanceButton.addEventListener('click',function(e){
            const row = this.parentNode.parentNode;
            const isbn10 = row.querySelector('.isbn10').innerText
            const isbn13 = row.querySelector('.isbn13').innerText

            window.location.href = `../AddInstance/index.html?isbn10=${encodeURIComponent(isbn10)}&isbn13=${encodeURIComponent(isbn13)}`;
        })

        Modify.appendChild(ModifyButton);
        AddInstance.appendChild(AddInstanceButton);

        bookTitle.innerText = rowData.title;
        BookNumber.innerText = rowData.bookNumber ;
        DatePurchased.innerText = (new Date(rowData.purchaseDate)).toLocaleDateString("en-GB") ;

        ISBN10.innerText = rowData.isbn10 ;
        ISBN13.innerText = rowData.isbn13 ;

        // Append the row
        tableRow.appendChild(bookTitle);
        tableRow.appendChild(BookNumber);
        tableRow.appendChild(DatePurchased);
        tableRow.appendChild(ISBN10);
        tableRow.appendChild(ISBN13);
        tableRow.appendChild(Modify);
        tableRow.appendChild(AddInstance);
        tableBody.appendChild(tableRow)
}

async function renderInstanceList(){
    const data = await fetchAllInstances();
    if(!data) return;
    const tableBody = document.getElementById('tableBody');
    data.forEach(bookInstance => {
        renderRow(tableBody, bookInstance)
        // console.log(bookInstance);
    });
}

document.addEventListener('DOMContentLoaded', async (e)=>{
    await renderInstanceList();
})