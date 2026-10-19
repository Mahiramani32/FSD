import { useEffect, useState } from "react";
import api from "../api";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", quantity: "" });
  const [message, setMessage] = useState({ text: "", ok: true });

  async function loadData() {
    try {
      const [sa, p] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);
      setSales(sa.data);
      setProducts(p.data);
    } catch (err) {
      setMessage({ text: "Could not load data", ok: false });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/sales", form);
      setMessage({ text: res.data.message, ok: true });
      setForm({ product_id: "", quantity: "" });
      loadData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Something went wrong",
        ok: false,
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      {message.text && (
        <p className={`mb-4 ${message.ok ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-6 grid grid-cols-3 gap-4"
      >
        <select
          name="product_id"
          value={form.product_id}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (stock: {p.quantity})
            </option>
          ))}
        </select>

        <input
          name="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />

        <button className="bg-blue-600 text-white rounded hover:bg-blue-700">
          Record Sale
        </button>
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Product</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No sales yet
                </td>
              </tr>
            )}
            {sales.map((sa) => (
              <tr key={sa.id} className="border-b">
                <td className="p-3">{new Date(sa.sale_date).toLocaleString()}</td>
                <td className="p-3">{sa.product_name}</td>
                <td className="p-3">{sa.quantity}</td>
                <td className="p-3">₹{(sa.price * sa.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}