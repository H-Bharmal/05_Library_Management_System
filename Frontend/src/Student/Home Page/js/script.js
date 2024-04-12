async function getUser(){
    const url = "http://localhost:8000/api/v1/student/dashboardRender";
    const res = await fetch(url,
    {
        method : 'GET',
        headers :{
            'Content-Type' : 'application/json'
        },
        // body: JSON.stringify(data),
        credentials : 'include'
    })
    const resJson = await res.json();
    const data = resJson.data
    console.log(data);
    renderDashBoard(data);
}
function renderDashBoard(userObj){
    const username = document.querySelector("#username");
    username.innerHTML = userObj.firstName ;
}

window.onload = async function() {
    console.log("Calling user");
    await getUser();
};