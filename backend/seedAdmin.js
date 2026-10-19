require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./config/db");

async function run() {
  const hashed = await bcrypt.hash("admin123", 10);
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin", "admin@example.com", hashed, "admin"]
  );
  console.log("Admin user created!");
  process.exit();
}

run();