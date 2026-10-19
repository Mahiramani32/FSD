require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./config/db");

async function run() {
  const hashed = await bcrypt.hash("staff123", 10);
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Staff User", "staff@example.com", hashed, "staff"]
  );
  console.log("Staff user created!");
  process.exit();
}

run();