import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi } from '../services/api';
import TextField from '../components/TextField';

const locationFields = [
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'District Division', table: 'state-divisions' },
  { name: 'state_sub_division_id', label: 'Taluka Division', table: 'state-sub-divisions' },
  { name: 'region_id', label: 'Region / Area', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'taluka_id', label: 'Taluka / Subdivision', table: 'talukas' },
  { name: 'village_id', label: 'Village / City', table: 'villages' },
  { name: 'block_id', label: 'Panchayat / Circle / Group', table: 'blocks' },
  { name: 'circle_id', label: 'Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
];

const businessFields = [
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Category', table: 'business-sub-categories' },
  { name: 'business_type_id', label: 'Type / Class', table: 'business-types' },
  { name: 'product_id', label: 'Product Type', table: 'products' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];
const EDUCATION_OPTIONS = ['Illiterate', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Other'];
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];

export default function FarmerRegistrationPage({ title }) {
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const tables = [
    ...locationFields.map((f) => f.table),
    ...businessFields.map((f) => f.table),
  ];

  useEffect(() => {
    Promise.all(
      [...new Set(tables)].map((t) =>
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

  const getOptions = (table) => options[table] || [];

  const handleChange = (name) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleNumChange = (name) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v ? Number(v) : null }));
  };

  const handleFileChange = (name) => (e) => {
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, [name]: file ? file.name : '' }));
  };

  const clearForm = () => {
    setForm({});
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (form.password && form.password !== form.confirm_password) {
      setError('Password and Confirm Password must match.');
      setSaving(false);
      return;
    }
    const payload = {
      ...form,
      state_id: form.state_id || null,
      state_division_id: form.state_division_id || null,
      state_sub_division_id: form.state_sub_division_id || null,
      region_id: form.region_id || null,
      zone_id: form.zone_id || null,
      taluka_id: form.taluka_id || null,
      village_id: form.village_id || null,
      block_id: form.block_id || null,
      circle_id: form.circle_id || null,
      gram_panchayat_id: form.gram_panchayat_id || null,
      business_category_id: form.business_category_id || null,
      business_sub_category_id: form.business_sub_category_id || null,
      business_type_id: form.business_type_id || null,
      product_id: form.product_id || null,
      password: form.password || undefined,
    };
    registrationsApi.farmer
      .create(payload)
      .then((res) => {
        if (!res.success) {
          setError(res.message || 'Failed to save.');
        } else {
          setSuccess('Farmer registration submitted successfully.');
          clearForm();
        }
      })
      .catch((err) => setError(err.message || 'Failed to save.'))
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>
          Fill the form below to register a new farmer. Data is stored in the farmer_registrations table.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Geographic Information</div>
            <div style={styles.grid}>
              {locationFields.map((field) => (
                <div key={field.name} style={styles.fieldWrap}>
                  <label style={styles.label}>{field.label}</label>
                  <select
                    value={form[field.name] != null ? form[field.name] : ''}
                    onChange={handleNumChange(field.name)}
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
              <TextField label="Ward / Area" name="ward" value={form.ward || ''} onChange={handleChange} placeholder="Select Ward" style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Police Station / Inquiry" name="police_station" value={form.police_station || ''} onChange={handleChange} placeholder="Select Police Station" style={styles.fieldWrap} inputStyle={styles.input} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Business Information</div>
            <div style={styles.grid}>
              {businessFields.map((field) => (
                <div key={field.name} style={styles.fieldWrap}>
                  <label style={styles.label}>{field.label}</label>
                  <select
                    value={form[field.name] != null ? form[field.name] : ''}
                    onChange={handleNumChange(field.name)}
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
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Farmer Information</div>
            <div style={styles.grid}>
              <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <SelectSimple label="Blood Group" name="blood_group" value={form.blood_group || ''} onChange={handleChange} options={BLOOD_GROUPS} />
              <SelectSimple label="Gender" name="gender" value={form.gender || ''} onChange={handleChange} options={GENDERS} />
              <FileField label="Upload Photo" name="photo_path" value={form.photo_path || ''} onChange={handleFileChange('photo_path')} />
              <SelectSimple label="Education" name="education" value={form.education || ''} onChange={handleChange} options={EDUCATION_OPTIONS} />
              <TextField label="WhatsApp Number" name="whatsapp_number" numericOnly value={form.whatsapp_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Mobile Number" name="mobile_number" numericOnly value={form.mobile_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FileField label="PAN Card" name="pan_card_path" value={form.pan_card_path || ''} onChange={handleFileChange('pan_card_path')} />
              <FileField label="Election Card" name="election_card_path" value={form.election_card_path || ''} onChange={handleFileChange('election_card_path')} />
              <FileField label="Aadhaar Card" name="aadhar_card_path" value={form.aadhar_card_path || ''} onChange={handleFileChange('aadhar_card_path')} />
              <TextField label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Date of Registration" name="registration_date" type="date" value={form.registration_date || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Father's Name" name="father_name" value={form.father_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FileField label="Ration Card" name="ration_card_path" value={form.ration_card_path || ''} onChange={handleFileChange('ration_card_path')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <TextField label="Address" name="address" value={form.address || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Relative Information</div>
            <div style={styles.grid}>
              <TextField label="Relative's Name" name="family_member_name" value={form.family_member_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <SelectSimple label="Relation" name="family_relation" value={form.family_relation || ''} onChange={handleChange} options={RELATIONS} />
              <TextField label="Date of Birth" name="family_dob" type="date" value={form.family_dob || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Relative's Mobile Number" name="family_phone" numericOnly value={form.family_phone || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FileField label="Relative's Aadhaar Card" name="family_aadhar_path" value={form.family_aadhar_path || ''} onChange={handleFileChange('family_aadhar_path')} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Bank Information</div>
            <div style={styles.grid}>
              <TextField label="Bank Name" name="bank_name" value={form.bank_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="IFSC Code" name="ifsc_code" value={form.ifsc_code || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Account Number" name="bank_account_number" numericOnly value={form.bank_account_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Pincode" name="pincode" numericOnly value={form.pincode || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </div>
          </section>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.buttonRow}>
            <button type="button" onClick={clearForm} style={styles.secondary}>
              Clear
            </button>
            <button type="submit" disabled={saving} style={styles.submit}>
              {saving ? 'Saving…' : 'Submit Registration'}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Farmer Registration Form. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function SelectSimple({ label, name, value, onChange, options }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select name={name} value={value} onChange={(e) => onChange(name)(e)} style={styles.select}>
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileField({ label, name, value, onChange }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input type="file" name={name} onChange={onChange} style={styles.input} />
      {value && <span style={styles.fileName}>{value}</span>}
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
    maxWidth: 960,
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
  grid: {
    padding: '0.75rem 0.75rem 0.9rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
  select: {
    padding: '0.45rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.9rem',
    background: '#fff',
    minWidth: 120,
  },
  fileName: { fontSize: '0.8rem', color: '#666' },
  buttonRow: {
    marginTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  submit: {
    minWidth: 220,
    padding: '0.55rem 1.5rem',
    borderRadius: 4,
    border: 'none',
    background: '#c41e3a',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  secondary: {
    padding: '0.55rem 1.25rem',
    borderRadius: 4,
    border: '1px solid #999',
    background: '#fff',
    color: '#333',
    fontWeight: 600,
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
