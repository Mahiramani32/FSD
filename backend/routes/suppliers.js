const express = require("express");
const db = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Get all suppliers
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM suppliers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a supplier
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const [result] = await db.query(
      "INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)",
      [name, phone, email, address]
    );
    res.status(201).json({ id: result.insertId, message: "Supplier added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a supplier
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    await db.query(
      "UPDATE suppliers SET name=?, phone=?, email=?, address=? WHERE id=?",
      [name, phone, email, address, req.params.id]
    );
    res.json({ message: "Supplier updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a supplier
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await db.query("DELETE FROM suppliers WHERE id=?", [req.params.id]);
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(400).json({
      message: "Cannot delete: this supplier is used by products or purchases",
    });
  }
});

module.exports = router;