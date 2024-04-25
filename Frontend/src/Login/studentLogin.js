const loginBtn = document.querySelector(".loginbtn button")
const loginId = document.querySelector(".user-box input");
const password = document.querySelector(".password-box input");
import { API_DOMAIN } from '../constants.js';
import { notify } from '../utils/notify.js';


async function auth() {
    const url = `${API_DOMAIN}/api/v1/student/login`

    const data = {
        studentId : loginId.value,
        email : loginId.value,
        password : password.value
    }
    // Create a POST request using the Fetch API
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Specify the content type
        },
        body: JSON.stringify(data), // Convert the data to JSON format
        credentials: 'include'
    })
    // pending to complere the code
    console.log(response);
    if(response.ok){
        console.log("Login successful");
        notify("Login Successful !");
        window.location.assign("../Student/Home Page/")
    }
    else if(response.status == 401){
        notify("Invalid Credentials", 'red');
    }
    else{
        notify("Something went wrong !", 'red');
    }
}

document.getElementById('login-form').addEventListener('submit',async (e)=>{
    e.preventDefault();
    notify("Signing In...");
    await auth();
})
// loginBtn.addEventListener('click', (e)=>{
//     notify("Signing In...");
//     auth();
// })