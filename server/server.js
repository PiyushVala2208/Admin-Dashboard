require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoute = require("./routes/userRoutes");
const inventoryRoute = require("./routes/inventoryRoutes");
const authRoute = require("./routes/authRoutes");
const productRoute = require("./routes/productRoutes");
const orderRoute = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is running smoothly!");
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);

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
