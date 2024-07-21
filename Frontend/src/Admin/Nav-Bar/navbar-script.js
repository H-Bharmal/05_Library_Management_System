import {API_DOMAIN} from "../../constants.js"
import {notify} from "../../utils/notify.js"

async function fetchNavBar(){
    // console.log(`${window.location.origin}/Frontend/src/Admin/Nav-Bar/navbar.html`);
    const url = `${window.location.origin}/Frontend/src/Admin/Nav-Bar/navbar.html`;
    await fetch(url)
    .then(response=> response.text())
    .then(data =>{
        // console.log(data);
        document.getElementById("navbar-placeholder").innerHTML = data ;
    })
    // console.log("Script Loaded Successfully..");
}
function createLinks(){
    document.getElementById('Home').href = `${window.location.origin}/Frontend/src/Admin/Home`
    document.getElementById('ManageBookDetails').href = `${window.location.origin}/Frontend/src/Admin/ManageLibrary/Manage Book Details`
    document.getElementById('ManageBookInstance').href = `${window.location.origin}/Frontend/src/Admin/ManageLibrary/Manage Book Instance/LandingPage/`
    document.getElementById('AddInstances').href = `${window.location.origin}/Frontend/src/Admin/ManageLibrary/Manage Book Instance/AddInstance/`
    document.getElementById('ModifyInstances').href = `${window.location.origin}/Frontend/src/Admin/ManageLibrary/Manage Book Instance/Modify_Delete Instance/`


    document.getElementById('navbar-profile').src = `${window.location.origin}/Frontend/Images/user.png`
    document.getElementById('switchUser').href = `${window.location.origin}/Frontend/src/Login/admin-login.html`
    document.getElementById('profileSettings').href = `${window.location.origin}/Frontend/src/Admin/Profile_Settings/`
}
document.addEventListener('DOMContentLoaded', async (e)=>{
    await fetchNavBar();
    // console.log("Navigation Bar Fetched");
    createLinks();
    document.getElementById('logoutBtn').addEventListener('click', async (e)=>{
        await logout();
    })
    await updateProfileImages(false, true);
})

async function logout(){
    const url = `${API_DOMAIN}/admin/logout`
    try{
        const response = await fetch(url,
        {
            method : "POST",
            credentials : 'include'
        })
        if(response && response.ok){
            notify("LogOut Successful");
            window.location.assign(`${window.location.origin}/Frontend/src/Login/admin-login.html`);
        }
        else{
            throw Error()
        }
    }catch(e){
        // Clear cookies unsuccessful
        // console.log(document.cookie);
        notify("Something went Wrong !");
    }
}