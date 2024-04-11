import mongoose from "mongoose";
import { userSchema } from "./user.model.js";
const studentSchema = new mongoose.Schema({
    ...userSchema.obj,
    
    studentId : {
        type : String,
        required : true,
        lowercase : true,
        unique:true,
    },
    course : {
        type : String,
        enum : ["BE", "BCA", "Architecture", "M.Tech", "MCA", "MBA", "LAW"],
        required : true,
    },
    branch : {
        type : String,
        // enum can be created for branches present
        enum : ["CSE", "ISE", "ECE", "ME", "CV"],
        required : true,
    },
    semester : {
        type : Number,
        requied : true
    },
    bookHistory :[{
        book : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BookInstance"
        },
        IssueDate : {
            type : Date,
            default : Date.now()
        }
    }]
    // ,
    // totalFine : {
    //     type : Number,
    //     default : 0
    // }
},
{timestamps : true});

studentSchema.pre('save', async function(next){
    await userSchema.statics.encryptPassword.call(this, next);
}
);
studentSchema.methods.generateRefreshToken = function(){
    return userSchema.statics.generateRefreshToken.call(this);
}
studentSchema.methods.generateAccessToken = function(){
    return userSchema.statics.generateAccessToken.call(this);
}
studentSchema.methods.isPasswordCorrect = function(password){
    return userSchema.statics.isPasswordCorrect.call(this, password);
}

export const Student = mongoose.model("Student", studentSchema);