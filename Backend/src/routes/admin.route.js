import {Router} from "express"
import { loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import { allStudentFine, checkFineStudent } from "../controllers/fine.controller.js";

const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin)
adminRouter.route("/logout").post(verifyJWTAdmin, logoutAdmin)

adminRouter.route("/checkFineStudent").get(verifyJWTAdmin, checkFineStudent);
adminRouter.route("/checkFineAll").get(verifyJWTAdmin, allStudentFine);

export {adminRouter}