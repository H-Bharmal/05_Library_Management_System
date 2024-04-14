function fetchNavBar(){
    const url = "../navbar/navbar.html";
    fetch(url)
    .then(response=> response.text())
    .then(data =>{
        console.log(data);
        document.getElementById("navbar-placeholder").innerHTML = data ;
    })
    console.log("Script Loaded Successfully..");
}

// window.onload = async function(){
    console.log("Starting navbar script");
    fetchNavBar();
// }