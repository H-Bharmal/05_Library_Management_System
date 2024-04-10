import {Router} from "express"
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import {addBookInstance, registerBookByISBN, registerBookManually} from "../controllers/book.controller.js"

const bookRouter = Router();

bookRouter.route("/registerBookByISBN").post(verifyJWTAdmin, registerBookByISBN);
bookRouter.route("/registerBookManually").post(verifyJWTAdmin, registerBookManually);
bookRouter.route("/addBookInstance").post(verifyJWTAdmin, addBookInstance);

export {bookRouter}