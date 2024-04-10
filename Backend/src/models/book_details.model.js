import mongoose from "mongoose";

const bookDetailsSchema = new mongoose.Schema({
    authors : [{
        type : String,
        required : true,
        lowercase : true
    }],
    title : {
        type : String,
        required : true,
        uppercase : true,
    },
    isbn10 : {
        type : String,
        required : true,
    },
    isbn13 : {
        type : String,
        required : true,
    },
    publisher : {
        type : String,
        required : true,
        lowercase : true,
    },
    description : {
        type : String,
    },
    // edition : {
    //     type : String,
    //     default : 1
    // },
    // price : {
    //     type : Number,
    //     required : true
    // },
    thumbnail : {
        type : String  // Google Cloud url
    },
    categories : [{
        type : String,
        lowercase : true,
    }],
    pageCount : {
        type : Number,
    },
    previewLink : {
        type : String
    },
    totalIssues : {
        type : Number,
        default : 0
    }

},{timestamps: true});

export const BookDetails = mongoose.model("BookDetails", bookDetailsSchema);