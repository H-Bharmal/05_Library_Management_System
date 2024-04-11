import {Router} from "express"
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import {addBookInstance, registerBookByISBN, registerBookManually} from "../controllers/book.controller.js"
import { issueBook, renewBook, returnBook } from "../controllers/issue.controller.js";

const bookRouter = Router();

bookRouter.route("/registerBookByISBN").post(verifyJWTAdmin, registerBookByISBN);
bookRouter.route("/registerBookManually").post(verifyJWTAdmin, registerBookManually);
bookRouter.route("/addBookInstance").post(verifyJWTAdmin, addBookInstance);

bookRouter.route("/issueBook").post(verifyJWTAdmin, issueBook)
bookRouter.route("/renewBook").post(verifyJWTAdmin, renewBook)
bookRouter.route("/returnBook").post(verifyJWTAdmin, returnBook)

export {bookRouter}