import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi } from '../services/api';

const locationFields = [
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'state_sub_division_id', label: 'State Sub Division', table: 'state-sub-divisions' },
  { name: 'region_id', label: 'Region / Zone', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'village_id', label: 'Village', table: 'villages' },
  { name: 'block_id', label: 'Panchayat Samiti / Block', table: 'blocks' },
  { name: 'circle_id', label: 'Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
];

const businessFields = [
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub Category', table: 'business-sub-categories' },
  { name: 'business_type_id', label: 'Type / Nature', table: 'business-types' },
  { name: 'product_id', label: 'Product Type', table: 'products' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CASTES = ['ST', 'SC', 'OBC', 'General', 'Others'];
const EDUCATION_OPTIONS = ['Illiterate', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Other'];
const REGISTRATION_TYPES = ['New', 'Renewal', 'Update', 'Other'];
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];

export default function FarmerRegistrationPage({ title }) {
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [list, setList] = useState([]);
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

  useEffect(() => {
    registrationsApi.farmer
      .getAll()
      .then((res) => setList(res.success && res.data ? res.data : []))
      .catch(() => setList([]));
  }, [success]);

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

  const loadForEdit = (id) => {
    setEditingId(id);
    setError(null);
    setSuccess(null);
    registrationsApi.farmer
      .getById(id)
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            state_id: d.state_id ?? '',
            state_division_id: d.state_division_id ?? '',
            state_sub_division_id: d.state_sub_division_id ?? '',
            region_id: d.region_id ?? '',
            zone_id: d.zone_id ?? '',
            taluka_id: d.taluka_id ?? '',
            village_id: d.village_id ?? '',
            block_id: d.block_id ?? '',
            circle_id: d.circle_id ?? '',
            gram_panchayat_id: d.gram_panchayat_id ?? '',
            business_category_id: d.business_category_id ?? '',
            business_sub_category_id: d.business_sub_category_id ?? '',
            business_type_id: d.business_type_id ?? '',
            product_id: d.product_id ?? '',
            first_name: d.first_name ?? '',
            father_name: d.father_name ?? '',
            last_name: d.last_name ?? '',
            date_of_birth: d.date_of_birth ? d.date_of_birth.slice(0, 10) : '',
            blood_group: d.blood_group ?? '',
            caste: d.caste ?? '',
            photo_path: d.photo_path ?? '',
            education: d.education ?? '',
            ration_card_path: d.ration_card_path ?? '',
            address: d.address ?? '',
            mobile_number: d.mobile_number ?? '',
            whatsapp_number: d.whatsapp_number ?? '',
            pan_card_path: d.pan_card_path ?? '',
            bank_account_number: d.bank_account_number ?? '',
            aadhar_card_path: d.aadhar_card_path ?? '',
            registration_type: d.registration_type ?? '',
            farm_area: d.farm_area ?? '',
            email: d.email ?? '',
            bank_name: d.bank_name ?? '',
            pincode: d.pincode ?? '',
            family_member_name: d.family_member_name ?? '',
            family_relation: d.family_relation ?? '',
            family_dob: d.family_dob ? d.family_dob.slice(0, 10) : '',
            family_phone: d.family_phone ?? '',
            family_aadhar_path: d.family_aadhar_path ?? '',
            transactions_below_15_lakh: d.transactions_below_15_lakh ?? '',
            e_bank_account: d.e_bank_account ?? '',
            additional_production: d.additional_production ?? '',
          });
        }
      })
      .catch(() => setError('Failed to load farmer.'));
  };

  const clearForm = () => {
    setEditingId(null);
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
    const promise = editingId
      ? registrationsApi.farmer.update(editingId, payload)
      : registrationsApi.farmer.create(payload);
    promise
      .then((res) => {
        if (!res.success) {
          setError(res.message || 'Failed to save.');
        } else {
          setSuccess(editingId ? 'Farmer updated successfully.' : 'Farmer registration submitted successfully.');
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
          Register a new farmer or select an existing record to edit. All data is stored in the farmer registration table.
        </p>

        {list.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Existing Farmers</div>
            <div style={styles.listWrap}>
              <select
                value={editingId || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) loadForEdit(Number(v));
                  else clearForm();
                }}
                style={styles.select}
              >
                <option value="">— New registration —</option>
                {list.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name || [f.first_name, f.last_name].filter(Boolean).join(' ') || `ID ${f.id}`}
                  </option>
                ))}
              </select>
              <span style={styles.hint}>Select to load and edit existing data.</span>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Geographical Information</div>
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
            <div style={styles.sectionHeader}>Personal Information</div>
            <div style={styles.grid}>
              <TextField label="Name" name="first_name" value={form.first_name || ''} onChange={handleChange} />
              <TextField label="Father's Name" name="father_name" value={form.father_name || ''} onChange={handleChange} />
              <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleChange} />
              <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleChange} />
              <SelectSimple label="Blood Group" name="blood_group" value={form.blood_group || ''} onChange={handleChange} options={BLOOD_GROUPS} />
              <SelectSimple label="Caste" name="caste" value={form.caste || ''} onChange={handleChange} options={CASTES} />
              <FileField label="Photo" name="photo_path" value={form.photo_path || ''} onChange={handleFileChange('photo_path')} />
              <SelectSimple label="Education" name="education" value={form.education || ''} onChange={handleChange} options={EDUCATION_OPTIONS} />
              <FileField label="Ration Card" name="ration_card_path" value={form.ration_card_path || ''} onChange={handleFileChange('ration_card_path')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <TextField label="Address" name="address" value={form.address || ''} onChange={handleChange} />
              </div>
              <TextField label="Mobile Number" name="mobile_number" value={form.mobile_number || ''} onChange={handleChange} />
              <TextField label="WhatsApp Number" name="whatsapp_number" value={form.whatsapp_number || ''} onChange={handleChange} />
              <FileField label="PAN Card" name="pan_card_path" value={form.pan_card_path || ''} onChange={handleFileChange('pan_card_path')} />
              <TextField label="Bank Account Number" name="bank_account_number" value={form.bank_account_number || ''} onChange={handleChange} />
              <FileField label="Aadhar Card" name="aadhar_card_path" value={form.aadhar_card_path || ''} onChange={handleFileChange('aadhar_card_path')} />
              <SelectSimple label="Registration Type" name="registration_type" value={form.registration_type || ''} onChange={handleChange} options={REGISTRATION_TYPES} />
              <TextField label="Farm Area" name="farm_area" value={form.farm_area || ''} onChange={handleChange} placeholder="e.g. in acres" />
              <TextField label="Email ID" name="email" type="email" value={form.email || ''} onChange={handleChange} />
              <TextField label="Bank Name" name="bank_name" value={form.bank_name || ''} onChange={handleChange} />
              <TextField label="Pincode" name="pincode" value={form.pincode || ''} onChange={handleChange} />
              <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleChange} />
              <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleChange} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Family Information</div>
            <div style={styles.grid}>
              <TextField label="Family Member's Name" name="family_member_name" value={form.family_member_name || ''} onChange={handleChange} />
              <SelectSimple label="Relation" name="family_relation" value={form.family_relation || ''} onChange={handleChange} options={RELATIONS} />
              <TextField label="Date of Birth" name="family_dob" type="date" value={form.family_dob || ''} onChange={handleChange} />
              <TextField label="Family Member's Phone Number" name="family_phone" value={form.family_phone || ''} onChange={handleChange} />
              <FileField label="Family Member's Aadhar Card" name="family_aadhar_path" value={form.family_aadhar_path || ''} onChange={handleFileChange('family_aadhar_path')} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Additional Information</div>
            <div style={styles.grid}>
              <TextField label="Transactions below 15 lakhs (total bank accounts)" name="transactions_below_15_lakh" value={form.transactions_below_15_lakh || ''} onChange={handleChange} placeholder="e.g. Rs 1.5 lakh" />
              <TextField label="E-Bank Account" name="e_bank_account" value={form.e_bank_account || ''} onChange={handleChange} placeholder="Rs 0" />
              <TextField label="Additional Production" name="additional_production" value={form.additional_production || ''} onChange={handleChange} placeholder="Rs 0.00 / year" />
            </div>
          </section>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.buttonRow}>
            <button type="button" onClick={clearForm} style={styles.secondary}>
              Clear
            </button>
            <button type="submit" disabled={saving} style={styles.submit}>
              {saving ? 'Saving…' : editingId ? 'Update Registration' : 'Submit Registration'}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Mahabalay. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function TextField({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name)(e)}
        style={styles.input}
        placeholder={placeholder}
      />
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
  listWrap: {
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  hint: { fontSize: '0.8rem', color: '#666' },
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
