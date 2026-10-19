const express = require("express");
const db = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Work out stock status (not stored in the database)
function getStatus(p) {
  if (p.quantity === 0) return "Out of Stock";
  if (p.quantity <= p.minimum_stock) return "Low Stock";
  return "Available";
}

// Get all products (with supplier name and stock status)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, s.name AS supplier_name
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY p.id DESC`
    );
    const products = rows.map((p) => ({ ...p, status: getStatus(p) }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a product
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, category, price, quantity, minimum_stock, supplier_id } = req.body;
    const [result] = await db.query(
      `INSERT INTO products (name, category, price, quantity, minimum_stock, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, price, quantity || 0, minimum_stock || 5, supplier_id || null]
    );
    res.status(201).json({ id: result.insertId, message: "Product added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a product
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, category, price, minimum_stock, supplier_id } = req.body;
    await db.query(
      `UPDATE products
       SET name=?, category=?, price=?, minimum_stock=?, supplier_id=?
       WHERE id=?`,
      [name, category, price, minimum_stock, supplier_id || null, req.params.id]
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id=?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({
      message: "Cannot delete: this product has purchase or sale records",
    });
  }
});

module.exports = router;