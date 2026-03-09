import React, { useState } from 'react';
import { registrationsApi } from '../services/api';

export default function CustomerRegistrationPage({ title }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (name) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirm_password) {
      setError('Password and Confirm Password must match.');
      setSaving(false);
      return;
    }

    const payload = {
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      whatsapp_number: form.whatsapp_number || null,
      password: form.password || null,
    };

    registrationsApi.customer
      .create(payload)
      .then((res) => {
        if (!res.success) {
          setError(res.message || 'Failed to register customer.');
        } else {
          setSuccess('Customer registration completed successfully.');
          setForm({});
        }
      })
      .catch((err) => setError(err.message || 'Failed to register customer.'))
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>Fill this form to create a new customer account.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Personal Information</div>
            <div style={styles.sectionBody}>
              <TextField
                label="First Name"
                name="first_name"
                value={form.first_name || ''}
                onChange={handleChange}
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={form.last_name || ''}
                onChange={handleChange}
              />
              <TextField
                label="WhatsApp Number"
                name="whatsapp_number"
                value={form.whatsapp_number || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Security Information</div>
            <div style={styles.sectionBody}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password || ''}
                onChange={handleChange}
              />
              <TextField
                label="Confirm Password"
                name="confirm_password"
                type="password"
                value={form.confirm_password || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.buttonRow}>
            <button type="submit" disabled={saving} style={styles.submit}>
              {saving ? 'Submitting…' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Customer Registration System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function TextField({ label, name, type = 'text', value, onChange }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name)(e)}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem 0',
    display: 'flex',
    justifyContent: 'center',
    background: '#f2f2f5',
  },
  card: {
    width: '100%',
    maxWidth: 900,
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    padding: '1.5rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#8B1538',
  },
  subtitle: {
    margin: '0.25rem 0 1rem',
    fontSize: '0.95rem',
    textAlign: 'center',
    color: '#555',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  section: {
    borderRadius: 6,
    border: '1px solid #e0a0a0',
    overflow: 'hidden',
  },
  sectionHeader: {
    background: '#c41e3a',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  sectionBody: {
    padding: '0.75rem 0.75rem 0.9rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  input: {
    padding: '0.45rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.9rem',
  },
  buttonRow: { marginTop: '0.75rem', display: 'flex', justifyContent: 'center' },
  submit: {
    minWidth: 220,
    padding: '0.55rem 1.5rem',
    borderRadius: 4,
    border: 'none',
    background: '#15803d',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  error: {
    marginTop: '0.5rem',
    padding: '0.6rem 0.8rem',
    borderRadius: 4,
    border: '1px solid #e0a0a0',
    background: '#fde8e8',
    color: '#8B1538',
  },
  success: {
    marginTop: '0.5rem',
    padding: '0.6rem 0.8rem',
    borderRadius: 4,
    border: '1px solid #9ad29a',
    background: '#e6f6e6',
    color: '#166534',
  },
  footer: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    textAlign: 'center',
    color: '#777',
  },
};

