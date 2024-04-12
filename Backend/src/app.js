import express from "express"
import cors from "cors"
import { studentRouter } from "./routes/student.route.js";
import cookieParser from "cookie-parser"
import { adminRouter } from "./routes/admin.route.js";
import { bookRouter } from "./routes/book.route.js";

const app = express();

app.use(express.json({
    limit : "16kb"
}))

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
  }))

app.use("/api/v1/student",studentRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/book",bookRouter);

export {app}