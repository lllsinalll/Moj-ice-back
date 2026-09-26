const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  ingredients: {
    type: String,
    required: false,
  },

  image: {
    type: String,
    required: false,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
