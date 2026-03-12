import React, { useState, useEffect } from 'react';
import { registrationsApi } from '../services/api';
import TextField from '../components/TextField';

const REQUIRED_FIELDS = [
  { name: 'first_name', label: 'First Name' },
  { name: 'last_name', label: 'Last Name' },
  { name: 'whatsapp_number', label: 'WhatsApp Number' },
  { name: 'password', label: 'Password' },
  { name: 'confirm_password', label: 'Confirm Password' },
];

function FieldWithError({ fieldName, fieldErrors, styles, children }) {
  return (
    <div style={styles.fieldWithError}>
      {children}
      {fieldErrors[fieldName] && <div style={styles.fieldError}>{fieldErrors[fieldName]}</div>}
    </div>
  );
}

export default function CustomerRegistrationPage({ title }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const getValidationError = () => {
    const fieldErr = {};
    for (const { name, label } of REQUIRED_FIELDS) {
      const val = form[name];
      const isEmpty = val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '');
      if (isEmpty) {
        fieldErr[name] = `${label} is required`;
      }
    }
    if (Object.keys(fieldErr).length > 0) {
      const missingLabels = Object.values(fieldErr).map((e) => e.replace(' is required', ''));
      return { message: `Please fill all required fields: ${missingLabels.join(', ')}`, fieldErrors: fieldErr };
    }
    if (form.password !== form.confirm_password) {
      return { message: 'Password and Confirm Password do not match.', fieldErrors: { confirm_password: 'Password and Confirm Password do not match.' } };
    }
    if (form.whatsapp_number && String(form.whatsapp_number).replace(/\D/g, '').length !== 10) {
      return { message: 'WhatsApp Number must be 10 digits.', fieldErrors: { whatsapp_number: 'WhatsApp Number must be 10 digits.' } };
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const validation = getValidationError();
    if (validation) {
      setError(validation.message);
      setFieldErrors(validation.fieldErrors || {});
      return;
    }

    setSaving(true);

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
          setSuccess('Form successfully submitted.');
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
        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Personal Information</div>
            <div style={styles.sectionBody}>
              <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={form.first_name || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="whatsapp_number" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="WhatsApp Number"
                  name="whatsapp_number"
                  numericOnly
                  maxLength={10}
                  format="phonePairs"
                  value={form.whatsapp_number || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Security Information</div>
            <div style={styles.sectionBody}>
              <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="confirm_password" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
            </div>
          </section>

          {error && (
            <div role="alert" style={styles.alertError}>
              <strong>Validation Error:</strong> {error}
            </div>
          )}
          {success && (
            <div role="status" style={styles.alertSuccess}>
              <strong>Success:</strong> {success}
            </div>
          )}

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
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: {
    fontSize: '0.8rem',
    color: '#c53030',
    marginTop: 2,
  },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  input: {
    padding: '0.45rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.9rem',
  },
  alertError: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    border: '1px solid #c53030',
    background: '#fff5f5',
    color: '#c53030',
    fontSize: '0.95rem',
  },
  alertSuccess: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    border: '1px solid #2f855a',
    background: '#f0fff4',
    color: '#276749',
    fontSize: '0.95rem',
    fontWeight: 600,
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

