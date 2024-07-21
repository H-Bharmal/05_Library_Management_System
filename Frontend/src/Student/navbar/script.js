import { notify } from "../../utils/notify.js";
import { API_DOMAIN } from "../../constants.js";
import { updateProfileImages } from "../../utils/updateProfiles.js";

async function fetchNavBar(){
    const url = "../navbar/navbar.html";
    await fetch(url)
    .then(response=> response.text())
    .then(data =>{
        // console.log(data);
        document.getElementById("navbar-placeholder").innerHTML = data ;
    })
    console.log("Script Loaded Successfully..");
}


// console.log("Starting navbar script");
document.addEventListener("DOMContentLoaded",async function() {
    await fetchNavBar();
    document.getElementById('dropdown-profile-image')
    .addEventListener('click', async (e)=>{
        dropdown();
    })
    document.getElementById('logoutBtn').addEventListener('click', async (e)=>{
        await logout();
    })
    console.log("Navbar - Loading Profile Images");
    await updateProfileImages();
});
// fetchNavBar();

async function logout(){
    const url = `${API_DOMAIN}/student/logout`
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

function dropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}