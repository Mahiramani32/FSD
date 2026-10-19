const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Get all sales
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sa.id, sa.quantity, sa.sale_date, p.name AS product_name, p.price
       FROM sales sa
       JOIN products p ON sa.product_id = p.id
       ORDER BY sa.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a sale (stock goes DOWN)
router.post("/", verifyToken, async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Product and a quantity above 0 are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE locks this row so two sales can't use the same stock
    const [products] = await conn.query(
      "SELECT quantity FROM products WHERE id = ? FOR UPDATE",
      [product_id]
    );
    if (products.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Product not found" });
    }
    if (products[0].quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({
        message: `Not enough stock. Only ${products[0].quantity} available`,
      });
    }

    await conn.query("INSERT INTO sales (product_id, quantity) VALUES (?, ?)", [product_id, quantity]);
    await conn.query("UPDATE products SET quantity = quantity - ? WHERE id = ?", [quantity, product_id]);

    await conn.commit();
    res.status(201).json({ message: "Sale recorded, stock updated" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;