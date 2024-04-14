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
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type']
  }))

app.use("/api/v1/student",studentRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/book",bookRouter);

app.get("/api/v1",(req,res)=>{
  res.status(200).
  json({data:"Api working"})
})
export {app}