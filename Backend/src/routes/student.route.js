import {Router} from "express";
import { registerStudent, loginStudent, logoutStudent } from "../controllers/student.controller.js"; 
import { verifyJWTStudent } from "../middlewares/auth.student.middleware.js";

const studentRouter = Router();

studentRouter.route("/register").post(registerStudent);
studentRouter.route("/login").post(loginStudent);
studentRouter.route("/logout").post(verifyJWTStudent, logoutStudent);
export {studentRouter}