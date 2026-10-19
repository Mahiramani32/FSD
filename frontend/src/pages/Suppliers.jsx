import { useEffect, useState } from "react";
import api from "../api";

const emptyForm = { name: "", phone: "", email: "", address: "" };

export default function Suppliers() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      setMessage("Could not load suppliers");
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

  function openEdit(s) {
    setForm({
      name: s.name,
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
    });
    setEditingId(s.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post("/suppliers", form);
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
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setMessage("");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Supplier
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
            placeholder="Supplier name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
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
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Address</th>
              {isAdmin && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No suppliers yet
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.address}</td>
                {isAdmin && (
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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