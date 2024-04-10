import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    counter  : String,
    bookInstanceCounter : {
        type : Number,
        default : 0 
    }
});

export const Counter = mongoose.model("Counter", counterSchema);