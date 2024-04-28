import {API_DOMAIN} from "../../constants.js";
import {notify} from "../../utils/notify.js"
import { updateProfileImages } from "../../utils/updateProfiles.js";

const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const profile = document.querySelector('.profile-info'); 
const passwordSection = document.querySelector('.password');
const profilePictureDiv= document.querySelector(".profile-pic");
const profilePictureDropdown= document.querySelector(".profile-pic .dropdown");

function toggleTabs(e){
    if(!e.target.classList.contains("cur-tab-profile-btn")){
        btn1.classList.toggle("cur-tab-profile-btn");
        btn2.classList.toggle("cur-tab-profile-btn");

        if(e.target.id =='btn1'){
            // Switch to profile
            profile.style.display = "flex";
            passwordSection.style.display = "none";
        }
        else{
            profile.style.display = "none";
            passwordSection.style.display = "flex";
        }
    }
    
    profile.classList.toggle("cur-tab-profile");

    document.querySelector('.password').classList.toggle("cur-tab-profile");
}

async function renderInformation(){
    const url = `${API_DOMAIN}/student/getStudentDetails`;

    
    const response = await fetch(url,{
        method:"GET",
        credentials:'include'
    })
    if(!response) {
        notify("Error fetching Information");
        return ;
    }
    
    const responseJson =await response.json();
    const data = responseJson?.data;
    
    const username = document.getElementById('username');
    username.innerText = data.firstName ;

    const first = document.getElementById('first');
    first.placeholder = data.firstName
    const middle = document.getElementById('middle');
    middle.placeholder = data.middleName
    const last = document.getElementById('last');
    last.placeholder = data.lastName
    const studentid = document.getElementById('studentid');
    studentid.placeholder = data.studentId
    
    const DateofBirth = document.getElementById('dob');
    const date = new Date(data.dob);
    DateofBirth.value = date.toISOString().split('T')[0] ;
    const course = document.getElementById('course');
    course.placeholder = data.course
    const branch = document.getElementById('branch');
    branch.placeholder = data.branch
    const semester = document.getElementById('semester');
    semester.placeholder = data.semester
    
    const mobile = document.getElementById('mobile');
    mobile.placeholder = data.mobileNumber
    const email = document.getElementById('email');
    email.placeholder = data.email

    const profile = document.getElementById('profile-picture-img');
    profile.src = data.profilePicture || "../../../Images/user.png";
    
}

async function updateInformation(){
    // DONE-TODO:Create profile picture files, cloudinary, multer etc.
    // DONE-TODO:Create a controller for updating information
    const mobileInput = document.getElementById("mobile").value;
    const emailInput = document.getElementById("email").value;
    const imageInput = document.getElementById("profile-pic-input");
    // console.log(imageInput);
    let updateMobile=null, updateEmail=null, updateImage=null ;
    if(mobileInput?.trim() !=''){
        updateMobile = mobileInput?.trim();
    }
    if(emailInput?.trim() !=''){
        updateEmail = emailInput?.trim() ;
    }
    const imageFile = imageInput?.files[0];
    if(imageFile){
        updateImage = imageFile ;
    }
    console.log(updateMobile)
    console.log(updateEmail)
    console.log(typeof updateImage);

    if(!updateEmail && !updateMobile && !updateImage){
        notify("No information to Update !", "red");
        return ;
    }

    const formData = new FormData();
    formData.append("mobile",updateMobile);
    formData.append("email",updateEmail);
    formData.append("profilePicture",updateImage);
    // console.log(formData);
    const url = `${API_DOMAIN}/student/updateInformation`;

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", url, true);

    // xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    // xhr.setRequestHeader("Content-Type","multipart/form-data; boundary="+formData._boundary);
    xhr.send(formData);

    xhr.onreadystatechange =async function(){
        if(xhr.readyState ===4){
            if (xhr.status >= 200 && xhr.status < 300){
                notify("Information Updated Successfully !");
                // const jsonResponse = await JSON.parse(xhr.responseText);
                // await renderInformation();
                await resetValues();
            }
            else{
                notify("Something went wrong while updating !", "red");
                await resetValues();
                // await updateProfileImages();
                // await renderInformation();
            }
        }
        else{
            // console.log(await JSON.parse(xhr.responseText));
        }
    }
    // const response = await fetch(url, 
    // {
    //     method : "POST",
    //     headers : {
    //         "content-type" : 'multipart/form-data; boundary=' + formData._boundary
    //     },
    //     body: formData,
    //     credentials : "include",

    // });

    // if(!response.ok){
    //     notify("Something went wrong while updating !", "red");
    //     await updateProfileImages();
    //     await renderInformation();
    //     return ;
    // }
    // else{
    //     notify("Information Updated Successfully !");
    //     await renderInformation();
    //     // await updateProfileImages();
    // }
}

async function changeProfilePicture(){
    const imageInput = document.getElementById("profile-pic-input");
    const imageFile = imageInput.files[0];
    if(imageFile){
        updateProfileImages(URL.createObjectURL(imageFile));
        // notify("Image Choosen");
    }
    else{
        notify("No Image Choosen");
    }
}

async function removeProfilePicture(){
    const url = `${API_DOMAIN}/student/removeProfilePicture`;
    try{
        const response = await fetch(url,
        {
            method : "GET",
            headers : {
                "content-type" : "application/json"
            },
            credentials : "include"
        })

        if(response.ok){
            notify("Profile removed successfully")
        }
        else{
            const responseJson = await response.json();

            notify(responseJson.message, "red");
            // return false ;
        }
        updateProfileImages();
    }
    catch(error){
        notify("Profile Could not be removed !", "red");
    }
}

async function changePassword(){
    
    const currentPassword = document.getElementById('curPass').value;
    const newPassword = document.getElementById('newPass').value;

    const url = `${API_DOMAIN}/student/changePassword`
    const response = await fetch(url,
    {
        method : "POST",
        credentials : 'include',
        headers:{
            "Content-Type" : "application/json"
        },
        body : await JSON.stringify({
            currentPassword : currentPassword,
            newPassword : newPassword
        })
    })
    const responseJson = await response.json()
    console.log(responseJson);
    if(response.ok)
    {
        notify("Password Changed Successfullly");
    }
    else{
        notify(responseJson.message||"Something went Wrong !", "red");
    }
}

async function cancelModification(){
    await resetValues();
}
async function resetValues (){
    document.getElementById("mobile").value = ""
    document.getElementById("email").value = ""
    await updateProfileImages();
    await renderInformation();
}


document.addEventListener('DOMContentLoaded', function() {
    btn1.addEventListener('click',(e)=>{
        toggleTabs(e);
    })
    btn2.addEventListener('click',(e)=>{
        toggleTabs(e);
    })

    //For disabling the inmmutable fields
    const inputs = document.querySelectorAll(".immutable .field input");
    console.log(inputs);
    for(const inp of inputs){
        inp.readOnly = true;
    }

    //Profile picture dropdown
    profilePictureDiv.addEventListener('click', (e)=>{
        console.log("clciked");
        // Toggle the display of dropdown
        console.log(profilePictureDropdown.style.display);
        if(profilePictureDropdown.style.display == "inherit"){
            profilePictureDropdown.style.display = "none";
        }
        else{
            profilePictureDropdown.style.display = "inherit";
        }
    })

    //remove profile picture 
    document.getElementById("Remove-Profile").addEventListener('click',async (e)=>{
        if(window.confirm("Do you want to remove the Profile Picture ?")){
            notify("Removing Profile...")
            await removeProfilePicture();
        }
    })

    //Uploading profile picture
    document.getElementById("profile-pic-input").addEventListener('change',async (e)=>{
        await changeProfilePicture();
    })

    //Updating the information
    document.getElementById('update-info').addEventListener('click', async (e)=>{
        notify("Updating information...");
        await updateInformation();

    })
    //Cancelling the updation
    document.getElementById('CancelBtn').addEventListener('click', async (e)=>{
        notify("Cancelling...")
        await cancelModification();
    })
    
    //change password
    const form = document.getElementById('ChangePassword')
    form.addEventListener('submit',(e)=>{
        e.preventDefault(); 
        notify("Changing..")
        changePassword();
    })
    renderInformation();

})