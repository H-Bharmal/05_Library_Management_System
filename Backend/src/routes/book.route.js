import {Router} from "express"
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import {addBookInstance, registerBookByISBN, registerBookManually,
    getBookDetailByBookInstanceId,
    getBookDetailsByISBN,
    getEntireBookDetailsByBookInstance} from "../controllers/book.controller.js"
import { issueBook, renewBook, returnBook } from "../controllers/issue.controller.js";

const bookRouter = Router();

bookRouter.route("/registerBookByISBN").post(verifyJWTAdmin, registerBookByISBN);
bookRouter.route("/registerBookManually").post(verifyJWTAdmin, registerBookManually);
bookRouter.route("/addBookInstance").post(verifyJWTAdmin, addBookInstance);

bookRouter.route("/issueBook").post(verifyJWTAdmin, issueBook)
bookRouter.route("/renewBook").post(verifyJWTAdmin, renewBook)
bookRouter.route("/returnBook").post(verifyJWTAdmin, returnBook)

// Book Details
bookRouter.route("/getBookDetailByBookInstanceId").post(getBookDetailByBookInstanceId);
bookRouter.route("/getBookDetailByISBN").post(getBookDetailsByISBN);
bookRouter.route("/getEntireBookDetailsByBookInstance").post(getEntireBookDetailsByBookInstance);

export {bookRouter}