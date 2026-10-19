import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const statusColors = {
  "Low Stock": "bg-yellow-100 text-yellow-800",
  "Out of Stock": "bg-red-100 text-red-800",
};

function Card({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [d, p] = await Promise.all([
          api.get("/dashboard"),
          api.get("/products"),
        ]);
        setStats(d.data);
        setLowStock(
          p.data.filter(
            (x) => x.status === "Low Stock" || x.status === "Out of Stock"
          )
        );
      } catch (err) {
        setError("Could not load dashboard");
      }
    }
    loadData();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card title="Total Products" value={stats.totalProducts} color="text-blue-600" />
        <Card title="Low Stock Items" value={stats.lowStockItems} color="text-yellow-600" />
        <Card title="Total Purchased" value={stats.totalPurchased} color="text-green-600" />
        <Card title="Total Sold" value={stats.totalSold} color="text-purple-600" />
      </div>

      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Needs Restocking</h2>
          <Link to="/purchases" className="text-blue-600 text-sm hover:underline">
            Record purchase →
          </Link>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Minimum</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  All products are well stocked
                </td>
              </tr>
            )}
            {lowStock.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.minimum_stock}</td>
                <td className="p-3">{p.supplier_name || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}