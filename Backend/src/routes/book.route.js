import {Router} from "express"
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import {addBookInstance, registerBookByISBN, registerBookManually,
    getBookDetailByBookInstanceId,
    getBookDetailsByISBN,
    getEntireBookDetailsByBookInstance, getBookDetailByBookId} from "../controllers/book.controller.js"
import { issueBook, renewBook, returnBook } from "../controllers/issue.controller.js";

import {verifyJWTStudent} from "../middlewares/auth.student.middleware.js"
import { requestBook, getAllBookRequestStudent } from "../controllers/requestBook.controller.js";

const bookRouter = Router();

// Book Request
bookRouter.route("/requestBookByISBN").post(verifyJWTStudent, requestBook);

bookRouter.route("/registerBookByISBN").post(verifyJWTAdmin, registerBookByISBN);
bookRouter.route("/registerBookManually").post(verifyJWTAdmin, registerBookManually);
bookRouter.route("/addBookInstance").post(verifyJWTAdmin, addBookInstance);

// admin related
bookRouter.route("/issueBook").post(verifyJWTAdmin, issueBook)
bookRouter.route("/renewBook").post(verifyJWTAdmin, renewBook)
bookRouter.route("/returnBook").post(verifyJWTAdmin, returnBook)

// Book Details
bookRouter.route("/getBookDetailByBookInstanceId").post(getBookDetailByBookInstanceId);
bookRouter.route("/getBookDetailByISBN").post(getBookDetailsByISBN);
bookRouter.route("/getBookDetailByBookID").post(getBookDetailByBookId);
bookRouter.route("/getEntireBookDetailsByBookInstance").post(getEntireBookDetailsByBookInstance);

bookRouter.route("/getBookRequestStudent").get(verifyJWTStudent,getAllBookRequestStudent)

export {bookRouter}