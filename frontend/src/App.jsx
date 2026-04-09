import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import ItemForm from "./components/ItemForm";
import ItemCard from "./components/ItemCard";
import "./App.css";

const FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Pending", value: "false" },
  { label: "Completed", value: "true" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [completedFilter, setCompletedFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (completedFilter !== "") params.completed = completedFilter;
      if (priorityFilter !== "") params.priority = priorityFilter;
      const data = await api.getItems(params);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [completedFilter, priorityFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleCreate(data) {
    try {
      await api.createItem(data);
      setShowForm(false);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(id, completed) {
    try {
      await api.updateItem(id, { completed });
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(id, data) {
    try {
      await api.updateItem(id, data);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.deleteItem(id);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  const pendingCount = items.filter((i) => !i.completed).length;
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Item Tracker</h1>
        <p className="app-subtitle">Track your tasks with FastAPI &amp; PostgreSQL</p>
      </header>

      <main className="app-main">
        <div className="stats-bar">
          <span className="stat">Total: <strong>{items.length}</strong></span>
          <span className="stat pending">Pending: <strong>{pendingCount}</strong></span>
          <span className="stat done">Done: <strong>{completedCount}</strong></span>
        </div>

        <div className="controls">
          <div className="filters">
            <div className="filter-group">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-btn ${completedFilter === opt.value ? "active" : ""}`}
                  onClick={() => setCompletedFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <select
              className="priority-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary add-btn"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "✕ Cancel" : "+ Add Item"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h2>New Item</h2>
            <ItemForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading items…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No items found. Add your first item!</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
