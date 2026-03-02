import React, { useState, useEffect } from 'react';
import { itemsApi } from '../services/api';

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await itemsApi.getAll();
      if (res.success) setItems(res.data);
      else setError(res.message || 'Failed to load');
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setSubmitLoading(true);
    setError(null);
    try {
      if (editingId) {
        const res = await itemsApi.update(editingId, {
          name,
          description: form.description.trim(),
        });
        if (res.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingId ? res.data : i))
          );
          setEditingId(null);
        } else setError(res.message);
      } else {
        const res = await itemsApi.create({
          name,
          description: form.description.trim(),
        });
        if (res.success) {
          setItems((prev) => [res.data, ...prev]);
        } else setError(res.message);
      }
      setForm({ name: '', description: '' });
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    setError(null);
    try {
      const res = await itemsApi.delete(id);
      if (res.success) setItems((prev) => prev.filter((i) => i.id !== id));
      else setError(res.message);
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          style={styles.input}
        />
        <div style={styles.actions}>
          <button type="submit" disabled={submitLoading} style={styles.btn}>
            {submitLoading ? 'Saving…' : editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={styles.btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.muted}>Loading items…</p>
      ) : items.length === 0 ? (
        <p style={styles.muted}>No items yet. Add one above.</p>
      ) : (
        <ul style={styles.list}>
          {items.map((item) => (
            <li key={item.id} style={styles.item}>
              <div>
                <strong>{item.name}</strong>
                {item.description && (
                  <p style={styles.desc}>{item.description}</p>
                )}
              </div>
              <div style={styles.itemActions}>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  style={styles.btnSmall}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  style={{ ...styles.btnSmall, ...styles.btnDanger }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    color: '#333',
  },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  btn: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: '1px solid #666',
    background: '#fff',
    color: '#333',
  },
  btnSmall: {
    padding: '0.35rem 0.6rem',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
  },
  btnDanger: { background: '#8B1538', color: '#fff' },
  error: {
    padding: '0.75rem',
    borderRadius: 4,
    background: '#fde8e8',
    color: '#8B1538',
    border: '1px solid #e0a0a0',
  },
  muted: { color: '#555', margin: 0 },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem',
    borderRadius: 4,
    background: '#fff',
    border: '1px solid #ddd',
  },
  desc: { margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#555' },
  itemActions: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
};
