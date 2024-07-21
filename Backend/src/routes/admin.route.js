import {Router} from "express"
import { changePassword, getAdminDetails, getProfilePicture, loginAdmin, logoutAdmin, registerAdmin, removeProfilePicture, updateInformation } from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import { allStudentFine, booksWithFineStudent } from "../controllers/fine.controller.js";
import {multerUpload} from "../middlewares/multer.middleware.js";

const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin)
adminRouter.route("/logout").post(verifyJWTAdmin, logoutAdmin)

adminRouter.route("/changePassword").post(verifyJWTAdmin, changePassword)
adminRouter.route("/updateInformation").post(verifyJWTAdmin, multerUpload.single('profilePicture'), updateInformation)
adminRouter.route("/getAdminProfilePicture").get(verifyJWTAdmin, getProfilePicture);
adminRouter.route("/removeProfilePicture").get(verifyJWTAdmin, removeProfilePicture);

adminRouter.route('/getAdminDetails').get(verifyJWTAdmin, getAdminDetails)

adminRouter.route("/booksWithFineStudent").get(verifyJWTAdmin, booksWithFineStudent);
adminRouter.route("/checkFineAll").get(verifyJWTAdmin, allStudentFine);

export {adminRouter}