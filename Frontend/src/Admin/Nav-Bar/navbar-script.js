import {API_DOMAIN} from "../../constants.js"
import {notify} from "../../utils/notify.js"

async function fetchNavBar(){
    const url = "../Nav-Bar/navbar.html";
    await fetch(url)
    .then(response=> response.text())
    .then(data =>{
        // console.log(data);
        document.getElementById("navbar-placeholder").innerHTML = data ;
    })
    console.log("Script Loaded Successfully..");
}

document.addEventListener('DOMContentLoaded', async (e)=>{
    await fetchNavBar();
    console.log("Navigation Bar Fetched");

    document.getElementById('logoutBtn').addEventListener('click', async (e)=>{
        await logout();
    })
})

async function logout(){
    const url = `${API_DOMAIN}/admin/logout`
    const response = await fetch(url,
    {
        method : "POST",
        credentials : 'include'
    })

    if(response.ok){
        notify("LogOut Successful");
        window.location.assign("../../Login/admin-login.html");
    }
    else{
        notify("Something went Wrong !");
    }
}