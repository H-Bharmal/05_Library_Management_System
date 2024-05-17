import { asyncHandler } from "./asyncHandler.js";
import { ApiResponse } from "./ApiResponse.js";

const middlewareDataAssembler = asyncHandler(async (req, res)=>{
    res.status(200).json(new ApiResponse(200, req.responseData, "All data Fetched"));
});

export {middlewareDataAssembler};