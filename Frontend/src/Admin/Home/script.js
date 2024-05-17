import {API_DOMAIN} from "../../constants.js"

async function renderDashBoard(){
    const adminName =(await getAdminDetails())?.firstName ;
    const countData = await getCountInformationAll();
    // console.log(adminName);
    document.getElementById('name').innerText = adminName
    document.getElementById('totalBook').innerText = countData.bookCount;
    document.getElementById('totalStudents').innerText = countData.studentCount;
    document.getElementById('totalActiveIssues').innerText = countData.activeIssues;
    document.getElementById('totalFinePending').innerText = countData.totalFine;
    document.getElementById('StudentsWithFine').innerText = countData.studentsWithFine;
    document.getElementById('TotalBooksDue').innerText = countData.countBooksDue;
}

document.addEventListener('DOMContentLoaded',async (e)=>{
    await renderDashBoard();
})

async function getAdminDetails(){
    const url = `${API_DOMAIN}/admin/getAdminDetails`

    const response = await fetch(url,
        {
            method:'GET',
            headers:{
                "Content-Type" : "application/json"
            },
            credentials : "include",
        });
        if(!response.ok){
            console.log("Error fetching Admin details");
        }
        const jsonResponse = await response.json();
        console.log(jsonResponse.data);

    return jsonResponse.data ;
}
async function getCountInformationAll(){
    const url = `${API_DOMAIN}/info/getCountInformationAll`
    const response = await fetch(url, 
        {
            method:'GET',
            headers:{
                "Content-Type" : "application/json"
            },
            credentials : "include",
        }
    );
    const jsonResponse = await response.json();
    // console.log(jsonResponse.data);

    return jsonResponse.data ;

}
