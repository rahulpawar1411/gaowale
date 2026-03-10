import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi } from '../services/api';
import TextField from '../components/TextField';

const locationFieldConfig = [
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'region_id', label: 'Region', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'circle_id', label: 'Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Panchayat Samiti', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
  { name: 'product_id', label: 'Product', table: 'products' },
  { name: 'unit_id', label: 'Unit', table: 'units' },
];

export default function LakhpatiDidiRegistrationPage({ title }) {
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tables = Array.from(new Set(locationFieldConfig.map((f) => f.table)));
    Promise.all(
      tables.map((t) =>
        masterApi
          .getTable(t)
          .then((res) => ({ t, data: res.success ? res.data || [] : [] }))
          .catch(() => ({ t, data: [] }))
      )
    ).then((all) => {
      const next = {};
      all.forEach(({ t, data }) => {
        next[t] = data;
      });
      setOptions(next);
    });
  }, []);

  const handleChange = (name) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v ? Number(v) : null }));
  };

  const handleUserChange = (name) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      state_id: form.state_id ?? null,
      state_division_id: form.state_division_id ?? null,
      region_id: form.region_id ?? null,
      zone_id: form.zone_id ?? null,
      vidhan_sabha_id: form.vidhan_sabha_id ?? null,
      taluka_id: form.taluka_id ?? null,
      circle_id: form.circle_id ?? null,
      gram_panchayat_id: form.gram_panchayat_id ?? null,
      village_id: form.village_id ?? null,
      business_category_id: form.business_category_id ?? null,
      business_type_id: form.business_type_id ?? null,
      product_id: form.product_id ?? null,
      unit_id: form.unit_id ?? null,
      first_name: form.first_name || null,
      middle_name: form.middle_name || null,
      last_name: form.last_name || null,
      date_of_birth: form.date_of_birth || null,
      blood_group: form.blood_group || null,
      caste: form.caste || null,
      education: form.education || null,
      occupation: form.occupation || null,
      business: form.business || null,
      mobile_number: form.mobile_number || null,
      phone_number: form.phone_number || null,
      whatsapp_number: form.whatsapp_number || null,
      pan_card: form.pan_card || null,
      aadhar_card: form.aadhar_card || null,
      pincode: form.pincode || null,
      photo_path: form.photo_path || null,
      password: form.password || null,
      nominee_name: form.nominee_name || null,
      nominee_relation: form.nominee_relation || null,
      nominee_dob: form.nominee_dob || null,
      nominee_phone: form.nominee_phone || null,
      nominee_address: form.nominee_address || null,
    };
    registrationsApi.lakhpatiDidi
      .create(payload)
      .then((res) => {
        if (!res.success) {
          setError(res.message || 'Failed to save');
        } else {
          setForm({});
        }
      })
      .catch((err) => setError(err.message || 'Failed to save'))
      .finally(() => setSaving(false));
  };

  const getOptions = (table) => options[table] || [];

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>{title}</h1>
      <form onSubmit={handleSubmit}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Location Details</legend>
          <div style={styles.grid}>
            {locationFieldConfig.map((field) => (
              <div key={field.name} style={styles.fieldWrap}>
                <label style={styles.label}>{field.label}</label>
                <select
                  value={form[field.name] != null ? form[field.name] : ''}
                  onChange={handleChange(field.name)}
                  style={styles.select}
                >
                  <option value="">Select {field.label}</option>
                  {getOptions(field.table).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>User Details</legend>
          <div style={styles.userGrid4}>
            <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />

            <SelectSimple
              label="Blood Group"
              name="blood_group"
              value={form.blood_group || ''}
              onChange={handleUserChange}
              options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
            />
            <SelectSimple
              label="Caste"
              name="caste"
              value={form.caste || ''}
              onChange={handleUserChange}
              options={['ST', 'SC', 'OBC', 'OTHERS']}
            />
            <TextField label="Education" name="education" value={form.education || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <SelectSimple
              label="Occupation"
              name="occupation"
              value={form.occupation || ''}
              onChange={handleUserChange}
              options={['Housewife', 'Employed', 'Self-employed']}
            />

            <TextField label="Business" name="business" value={form.business || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Mobile Number" name="mobile_number" numericOnly value={form.mobile_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Phone Number" name="phone_number" numericOnly value={form.phone_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="WhatsApp Number" name="whatsapp_number" numericOnly value={form.whatsapp_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />

            <TextField label="PAN Card" name="pan_card" value={form.pan_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Aadhar Card" name="aadhar_card" numericOnly value={form.aadhar_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Pincode" name="pincode" numericOnly value={form.pincode || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Photo</label>
              <input
                type="file"
                name="photo"
                style={styles.input}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  setForm((prev) => ({ ...prev, photo_path: file ? file.name : '' }));
                }}
              />
            </div>

            <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
          </div>
        </fieldset>

        {error && <div style={styles.error}>{error}</div>}

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Nominee Details</legend>
          <div style={styles.userGrid4}>
            <TextField label="Nominee Name" name="nominee_name" value={form.nominee_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <SelectSimple
              label="Nominee Relation"
              name="nominee_relation"
              value={form.nominee_relation || ''}
              onChange={handleUserChange}
              options={['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other']}
            />
            <TextField label="Nominee DOB" name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Nominee Phone Number" name="nominee_phone" numericOnly value={form.nominee_phone || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <div style={{ gridColumn: '1 / span 4' }}>
              <TextField label="Nominee Address" name="nominee_address" value={form.nominee_address || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </div>
          </div>
        </fieldset>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.payNow}>Pay Now</button>
          <button type="submit" disabled={saving} style={styles.register}>
            {saving ? 'Saving…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SelectSimple({ label, name, value, onChange, options }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name)(e)}
        style={styles.select}
      >
        <option value="">Select-{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  page: { padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  h1: {
    margin: 0,
    fontSize: '1.75rem',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#1a1a1a',
  },
  fieldset: {
    borderRadius: 6,
    border: '1px solid #ddd',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  },
  legend: {
    padding: '0 0.5rem',
    fontWeight: 600,
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
  },
  userGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  select: {
    padding: '0.4rem 0.55rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    fontSize: '0.85rem',
  },
  input: {
    padding: '0.4rem 0.55rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    fontSize: '0.85rem',
  },
  error: {
    marginTop: '0.5rem',
    padding: '0.6rem 0.8rem',
    borderRadius: 4,
    border: '1px solid #e0a0a0',
    background: '#fde8e8',
    color: '#8B1538',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  payNow: {
    padding: '0.55rem 1.25rem',
    borderRadius: 4,
    border: 'none',
    background: '#16863a',
    color: '#fff',
    fontWeight: 600,
  },
  register: {
    padding: '0.55rem 1.25rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontWeight: 600,
  },
};

