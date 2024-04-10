import { ApiError } from "./ApiError.js";

// function asyncHandler(func){
//     return async function (req, res, next) {
//         try {
//             await func(req, res, next);
//         } catch (error) {
//             console.log(error);
//             res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message, [error]));
//         }
//     }
// }

const asyncHandler = (requestHandler)=>{
    return (req, res, next)=>{
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error)=>{
            next(error)
        })
    }
}

export {asyncHandler}