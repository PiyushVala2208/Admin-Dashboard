require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoute = require("./routes/userRoutes");
const inventoryRoute = require("./routes/inventoryRoutes");
const authRoute = require("./routes/authRoutes");
const productRoute = require("./routes/productRoutes");
const orderRoute = require("./routes/orderRoutes");
const addressRoute = require("./routes/addressRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "22mb" }));
app.use(express.urlencoded({ extended: true, limit: "22mb" }));

app.get("/", (req, res) => {
  res.send("Server is running smoothly!");
});

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/addresses", addressRoute);
app.use("/api/categories", categoryRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
