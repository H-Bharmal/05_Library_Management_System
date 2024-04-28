import { API_DOMAIN } from "../constants.js";

async function getProfilePicture(){
    const url = `${API_DOMAIN}/student/getStudentProfilePicture`;
    const response = await fetch(url,{
        method : "GET",
        headers : {
            "content-type" : "application/json"
        },
        credentials : "include"
    })
    if(response.ok){
        const responseJson = await response.json();
        return responseJson.data.profilePicture;
    }
    else{
        return null ;
    }
}
async function updateProfileImages(imageUrl){
    // console.log("Entering update prfileimages function");
    if(!imageUrl){
        const response = await getProfilePicture();
        // console.log(response);
        imageUrl = response || "../../../Images/user.png";
    }
    // console.log(imageUrl);
    const profilePictureImage = document.getElementById("profile-picture-img")
    if(profilePictureImage) profilePictureImage.src = imageUrl ;
    
    const profileNavBar = document.getElementById("dropdown-profile-image");
    if(profileNavBar) profileNavBar.src = imageUrl ;
    // console.log("Exiting update prfileimages function");
}

export {updateProfileImages}