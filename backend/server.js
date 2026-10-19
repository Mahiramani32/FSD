require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/auth");
const supplierRoutes = require("./routes/suppliers");
const productRoutes = require("./routes/products");
const { verifyToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CoreInventory backend is running!");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM products");
    res.json({ message: "Database connected!", products: rows[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
const purchaseRoutes = require("./routes/purchases");
const saleRoutes = require("./routes/sales");
const dashboardRoutes = require("./routes/dashboard");
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/api/me", verifyToken, (req, res) => {
  res.json(req.user);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});