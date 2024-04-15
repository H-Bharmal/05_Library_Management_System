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

const allowedOrigins = ['https://05-library-management-system.vercel.app', 'http://localhost:5500'];

app.use(cors({
  origin: function(origin, callback) {
    console.log("Request from origin",origin);
    // Check if the origin is allowed or a request from a browser
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable sending credentials (e.g., cookies) with CORS requests
  // Other CORS options...
}));
// app.use(cors({
//   origin: ['https://05-library-management-system.vercel.app', 'http://localhost'],
//   credentials: true,
//   allowedHeaders: ['Content-Type']
// }));

app.use("/api/v1/student",studentRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/book",bookRouter);

app.get("/api/v1",(req,res)=>{
  res.status(200).
  json({data:"Api working"})
})
export {app}