import { useState } from "react";
import ItemForm from "./ItemForm";

const PRIORITY_COLORS = { low: "#6dbf67", medium: "#f0a500", high: "#e05c5c" };

export default function ItemCard({ item, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  function handleUpdate(data) {
    onUpdate(item.id, data);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="item-card editing">
        <ItemForm
          initial={item}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`item-card ${item.completed ? "completed" : ""}`}>
      <div className="item-card-header">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle(item.id, !item.completed)}
          />
          <span className="item-title">{item.title}</span>
        </label>
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
        >
          {item.priority}
        </span>
      </div>
      {item.description && (
        <p className="item-description">{item.description}</p>
      )}
      <div className="item-card-footer">
        <span className="item-date">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
        <div className="item-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
