import {Router} from "express";
import { registerStudent, loginStudent, logoutStudent, getStudentDetails, getStudentBookHistory } from "../controllers/student.controller.js"; 
import { verifyJWTStudent } from "../middlewares/auth.student.middleware.js";
import { verifyJWTAdmin } from "../middlewares/auth.admin.middleware.js";
import {booksWithFineStudent} from "../controllers/fine.controller.js"

const studentRouter = Router();

studentRouter.route("/register").post(verifyJWTAdmin, registerStudent);
studentRouter.route("/login").post(loginStudent);
studentRouter.route("/logout").post(verifyJWTStudent, logoutStudent);

studentRouter.route("/getStudentDetails").get(verifyJWTStudent, getStudentDetails);
studentRouter.route("/getStudentBookHistory").get(verifyJWTStudent, getStudentBookHistory);

studentRouter.route("/booksWithFineStudent").get(verifyJWTStudent, booksWithFineStudent);

export {studentRouter}