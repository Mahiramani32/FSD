import { useEffect, useState } from "react";
import api from "../api";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ product_id: "", supplier_id: "", quantity: "" });
  const [message, setMessage] = useState({ text: "", ok: true });

  async function loadData() {
    try {
      const [pu, p, s] = await Promise.all([
        api.get("/purchases"),
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setPurchases(pu.data);
      setProducts(p.data);
      setSuppliers(s.data);
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
      const res = await api.post("/purchases", form);
      setMessage({ text: res.data.message, ok: true });
      setForm({ product_id: "", supplier_id: "", quantity: "" });
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
      <h1 className="text-2xl font-bold mb-6">Purchases</h1>

      {message.text && (
        <p className={`mb-4 ${message.ok ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-6 grid grid-cols-4 gap-4"
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

        <select
          name="supplier_id"
          value={form.supplier_id}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="">Product's supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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
          Record Purchase
        </button>
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Product</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No purchases yet
                </td>
              </tr>
            )}
            {purchases.map((pu) => (
              <tr key={pu.id} className="border-b">
                <td className="p-3">{new Date(pu.purchase_date).toLocaleString()}</td>
                <td className="p-3">{pu.product_name}</td>
                <td className="p-3">{pu.supplier_name || "-"}</td>
                <td className="p-3">{pu.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}