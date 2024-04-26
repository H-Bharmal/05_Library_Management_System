import {API_DOMAIN} from "../../constants.js";
import {notify} from "../../utils/notify.js"

const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const profile = document.querySelector('.profile-info'); 
const passwordSection = document.querySelector('.password');

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
    // TODO:Create profile picture files, cloudinary, multer etc.
    // TODO:Create a controller for updating information
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

document.addEventListener('DOMContentLoaded', function() {
    btn1.addEventListener('click',(e)=>{
        toggleTabs(e);
    })
    btn2.addEventListener('click',(e)=>{
        toggleTabs(e);
    })
    const inputs = document.querySelectorAll(".immutable .field input");
    console.log(inputs);
    for(const inp of inputs){
        inp.readOnly = true;
    }

    const form = document.getElementById('ChangePassword')
    form.addEventListener('submit',(e)=>{
        e.preventDefault(); 
        notify("Changing..")
        changePassword();
    })
    renderInformation();

})