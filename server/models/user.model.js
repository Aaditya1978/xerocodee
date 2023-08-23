const mongoose = require("mongoose");

const User = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["developer", "organization", "company"],
    },
    typeName: {
        type: String,
    },
    hosting: {
        type: String,
        enum: ["self", "xerocodee"],
    },
});

module.exports = mongoose.model("User", User);