require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");
const cors = require("cors");

const Product = require("./models/Product");
const Category = require("./models/Category");

const app = express();

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// =========================
// Multer - Image Upload
// =========================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: {
    folder: "moj-ice",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    transformation: [
      {
        width: 800,
        height: 800,
        crop: "limit",
      },
    ],
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("فقط فایل تصویری مجاز است."));
    }
  },
});

// =========================
// Port
// =========================

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// =========================
// MongoDB Connection
// =========================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// ==================================================
// PRODUCTS
// ==================================================

// CREATE PRODUCT
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error getting products",
      error: error.message,
    });
  }
});

// DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// UPDATE PRODUCT
app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});

// GET ONE PRODUCT
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID",
      error: error.message,
    });
  }
});

// ==================================================
// IMAGE UPLOAD
// ==================================================

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No image uploaded",
    });
  }

  const imageUrl = req.file.path;

  res.json({
    imageUrl,
  });
});

// ==================================================
// CATEGORIES
// ==================================================

// CREATE CATEGORY
app.post("/categories", async (req, res) => {
  try {
    const category = new Category(req.body);

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({
      message: "Error creating category",
      error: error.message,
    });
  }
});

// GET ALL CATEGORIES
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error getting categories",
      error: error.message,
    });
  }
});

// UPDATE CATEGORY
app.put("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({
      message: "Error updating category",
      error: error.message,
    });
  }
});

// DELETE CATEGORY
app.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
});

// ==================================================
// MULTER ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "حجم عکس نباید بیشتر از ۵ مگابایت باشد.",
      });
    }

    return res.status(400).json({
      message: "خطا در آپلود عکس.",
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  next();
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
