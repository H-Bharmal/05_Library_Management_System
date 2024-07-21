import mongoose from "mongoose";
import { userSchema } from "./user.model.js";
const adminSchema = new mongoose.Schema({
    ...userSchema.obj,

    adminId : {
        type : String,
        required : true,
    },
    joiningDate : {
        type : Date,
        required : true,
    },

}, {timestamps : true});

adminSchema.pre("save", async function(next){
    await userSchema.statics.encryptPassword.call(this, next);
})

adminSchema.methods.isPasswordCorrect = function(password){
    return userSchema.statics.isPasswordCorrect.call(this, password);
}

adminSchema.methods.generateAccessToken = function(){
    return userSchema.statics.generateAccessToken.call(this);
}
adminSchema.methods.generateRefreshToken = function(){
    return userSchema.statics.generateRefreshToken.call(this);
}
adminSchema.methods.changePassword = async function(currentPassword, newPassword){
    return await userSchema.statics.changePassword.call(this, currentPassword, newPassword);
}

export const Admin = mongoose.model("Admin", adminSchema);