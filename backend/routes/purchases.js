const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Get all purchases
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pu.id, pu.quantity, pu.purchase_date,
              p.name AS product_name, s.name AS supplier_name
       FROM purchases pu
       JOIN products p ON pu.product_id = p.id
       LEFT JOIN suppliers s ON pu.supplier_id = s.id
       ORDER BY pu.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a purchase (stock goes UP)
router.post("/", verifyToken, async (req, res) => {
  const { product_id, supplier_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Product and a quantity above 0 are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [products] = await conn.query("SELECT supplier_id FROM products WHERE id = ?", [product_id]);
    if (products.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    // If no supplier is sent, use the product's own supplier
    const finalSupplier = supplier_id || products[0].supplier_id;

    await conn.query(
      "INSERT INTO purchases (product_id, supplier_id, quantity) VALUES (?, ?, ?)",
      [product_id, finalSupplier, quantity]
    );
    await conn.query("UPDATE products SET quantity = quantity + ? WHERE id = ?", [quantity, product_id]);

    await conn.commit();
    res.status(201).json({ message: "Purchase recorded, stock updated" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;