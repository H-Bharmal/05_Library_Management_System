// Schema for each book, including when purchases etc.

import mongoose from "mongoose";
import {Counter} from "./counter.model.js"
// autoIncrement.initialize(mongoose.connection);

// can be optimized by not saving the title author isbn every time
const bookSchema = new mongoose.Schema({
    bookNumber :{
        type : Number,
        default : 0
    },
    title : {
        type : String,
        required : true,
    },
    isbn10 : {
        type : Number,
        required : true,
    },
    // edition : {
    //     type : Number,
    //     default : 1
    // },
    isbn13 : {
        type : Number,
        required : true,
    },
    bookDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BookDetails",
        required : true,
    },
    purchaseDate : {
        type : Date,
        default : Date.now()
    },
    // To have a count of total number of issues possible till date
    // totalIssueCount : {
    //     type : Number
    // }
}, {timestamps:true});

bookSchema.pre("save", async function(next){
    const counter = await Counter.findOne({counter : "counter"})

    counter.bookInstanceCounter = counter.bookInstanceCounter+1;
    // console.log(counter.bookInstanceCounter);
    await counter.save({validateBeforeSave : false})
    this.bookNumber = counter.bookInstanceCounter ;
    next();
})
// bookSchema.plugin(autoIncrement.plugin, {
//     model : 'Book',
//     field : '_id',
//     startAt : 10001,
//     incrementBy:1
// })

export const BookInstance = mongoose.model("BookInstance", bookSchema);