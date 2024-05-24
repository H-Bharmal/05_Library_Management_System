import { API_DOMAIN } from "../../../../constants.js";
import { notify } from "../../../../utils/notify.js";

async function getBookInstanceDetails(bookNumber){
    const url = `${API_DOMAIN}/book/getCompleteBookDetailsFromInstance`
    const response = await fetch(url,
        {
            method : "POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                bookNumber 
            })
        }
    )
    const responseJson = await response.json();
    if(!response.ok){
        notify(responseJson.message|| "Could not get details","red");
        return ;
    }

    return responseJson?.data
}
async function renderBookForm(bookNumber) {
    const instanceData = await getBookInstanceDetails(bookNumber);
    if(!instanceData) return ;

    const data = instanceData.bookDetails ;
    // const data = await response.json();

    const bookCoverImage = document.getElementById("book-cover");
    const pageCountBox = document.getElementById("page-count");
    const categories = document.getElementById("categories")
    const publisher = document.getElementById("publisher")
    const BookTitle = document.getElementById("book-title")
    const BookTitleLink = document.getElementById("book-title-link")
    const authors = document.getElementById("Author")
    const purchaseDate = document.getElementById("purchaseDate")
    const newBookNumber = document.getElementById("bookNumberNew")
    // const isbn10Box = document.getElementById("form-isbn10")
    // const isbn13Box = document.getElementById("form-isbn13")

    const description = document.getElementById("description")

    data?.thumbnail && (bookCoverImage.src = data.thumbnail);
    data?.categories && (categories.value = data.categories);
    data?.publisher && (publisher.value = data.publisher);
    data?.title && (BookTitle.value = data.title);
    data?.previewLink && (BookTitleLink.href = data.previewLink);
    data?.authors && (authors.value = data.authors);
    data?.description && (description.value = data.description);
    // data?.isbn10 && (isbn10Box.value = data.isbn10);
    // data?.isbn13 && (isbn13Box.value = data.isbn13);
    data?.pageCount && (pageCountBox.value = data.pageCount);
    
    instanceData?.bookNumber && (newBookNumber.value = instanceData.bookNumber);

    if(instanceData.purchaseDate){
        const date = new Date(instanceData.purchaseDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
    
        purchaseDate.value = `${year}-${month}-${day}`;
    }

}
async function modifyBookInstance(){
    const oldBookNumber = document.getElementById('form-bookNumber').value;
    const newBookNumber = document.getElementById('bookNumberNew').value;
    const newPurchaseDate = document.getElementById('purchaseDate').value
    console.log((newPurchaseDate));

    const url = `${API_DOMAIN}/book/modifyBookInstance`;
    const response = await fetch(url,
        {
            method : "POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                oldBookNumber,
                newBookNumber,
                purchaseDate: newPurchaseDate,
            }),
            credentials:'include'
        }
    );

    if(response.ok){
        notify("Book Instance Updated Successfully");
    }
    else{
        notify((await response.json()).message ||"Something went wrong", "red");
    }

}
async function deleteBookInstance(){
    const bookNumber = document.getElementById('form-bookNumber').value;

    
    const url = `${API_DOMAIN}/book/deleteBookInstance`;
    const response = await fetch(url,
        {
            method : "POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                bookNumber,
            }),
            credentials:'include'
        }
    );

    
    if(response.ok){
        notify("Book Instance Deleted Successfully");
    }
    else{
        notify((await response.json()).message ||"Something went wrong", "red");
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

document.addEventListener('DOMContentLoaded', async(e)=>{
    const params = getQueryParams();
    if (params.bookNumber) {
        document.getElementById('form-bookNumber').value = params.bookNumber;
        await renderBookForm(params.bookNumber);
    }
    // Event Listener on search book
    document.getElementById('SearchBook').addEventListener("click",async (e)=>{
        e.preventDefault()
        const bookNumberInput = document.getElementById('form-bookNumber')?.value

        await renderBookForm(bookNumberInput)
    })


    // Modify Instance button
    document.getElementById('modifyBtn').addEventListener('click', async (e)=>{
        e.preventDefault(); 
        await modifyBookInstance();
    })

    // Delete instance
    document.getElementById('DeleteBook').addEventListener('click', async (e)=>{
        e.preventDefault(); 
        await deleteBookInstance();
    })
})