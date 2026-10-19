const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const [[products]] = await db.query("SELECT COUNT(*) AS total FROM products");
    const [[lowStock]] = await db.query(
      "SELECT COUNT(*) AS total FROM products WHERE quantity <= minimum_stock"
    );
    const [[purchases]] = await db.query(
      "SELECT COALESCE(SUM(quantity), 0) AS total FROM purchases"
    );
    const [[sales]] = await db.query(
      "SELECT COALESCE(SUM(quantity), 0) AS total FROM sales"
    );

    res.json({
      totalProducts: products.total,
      lowStockItems: lowStock.total,
      totalPurchased: Number(purchases.total),
      totalSold: Number(sales.total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;