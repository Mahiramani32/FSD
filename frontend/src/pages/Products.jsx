import { useEffect, useState } from "react";
import api from "../api";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  quantity: 0,
  minimum_stock: 5,
  supplier_id: "",
};

const statusColors = {
  Available: "bg-green-100 text-green-800",
  "Low Stock": "bg-yellow-100 text-yellow-800",
  "Out of Stock": "bg-red-100 text-red-800",
};

export default function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.role === "admin";

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const [p, s] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setProducts(p.data);
      setSuppliers(s.data);
    } catch (err) {
      setMessage("Could not load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      category: p.category || "",
      price: p.price,
      quantity: p.quantity,
      minimum_stock: p.minimum_stock,
      supplier_id: p.supplier_id || "",
    });
    setEditingId(p.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage("");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        )}
      </div>

      {message && <p className="text-red-600 mb-4">{message}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4"
        >
          <input
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="minimum_stock"
            type="number"
            placeholder="Minimum stock"
            value={form.minimum_stock}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />

          {/* Starting quantity only when adding. After that, stock changes through purchases and sales */}
          {!editingId && (
            <input
              name="quantity"
              type="number"
              placeholder="Starting quantity"
              value={form.quantity}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          )}

          <select
            name="supplier_id"
            value={form.supplier_id}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="col-span-2 flex gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
              {isAdmin && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No products yet
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.supplier_name || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}