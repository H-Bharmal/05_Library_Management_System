import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const dashboardRender = asyncHandler( async(req, res, next)=>{
    const student = req.student ;
    console.log("Dashboard renderer called.");
    
    res.status(200)
    .json(new ApiResponse(200,student,"Student fetched !"));
})


export {dashboardRender}