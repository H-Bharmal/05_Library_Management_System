import {Router} from "express"
import { loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";

const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin)
adminRouter.route("/logout").post(verifyJWTAdmin, logoutAdmin)

export {adminRouter}