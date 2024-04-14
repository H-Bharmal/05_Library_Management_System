const loginBtn = document.querySelector(".loginbtn button")
const loginId = document.querySelector(".user-box input");
const password = document.querySelector(".password-box input");

console.log(loginBtn);
async function auth() {
    const API_DOMAIN="https://zero5-library-management-system.onrender.com";
    const url = `${API_DOMAIN}/api/v1/student/login`

    data = {
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
        window.location.assign("../Student/Home Page/index.html")
    }
}

loginBtn.addEventListener('click', (e)=>{
    auth();
})