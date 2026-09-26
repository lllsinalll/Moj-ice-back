const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    emoji: {
        type: String,
        required: true
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;