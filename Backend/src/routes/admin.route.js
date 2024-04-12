import {Router} from "express"
import { loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import { allStudentFine, booksWithFineStudent } from "../controllers/fine.controller.js";

const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin)
adminRouter.route("/logout").post(verifyJWTAdmin, logoutAdmin)

adminRouter.route("/booksWithFineStudent").get(verifyJWTAdmin, booksWithFineStudent);
adminRouter.route("/checkFineAll").get(verifyJWTAdmin, allStudentFine);

export {adminRouter}