import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi } from '../services/api';
import TextField from '../components/TextField';
import {
  LOCATION_ORDER,
  LOCATION_FIELD_TABLE,
  getFilteredLocationOptions,
  isLocationFieldDisabled,
  clearDependentsOnChange,
} from '../config/locationCascade';

const locationFields = [
  { name: 'country_id', label: 'Country', table: 'countries' },
  { name: 'country_division_id', label: 'Country Division', table: 'country-divisions' },
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'District', table: 'state-divisions' },
  { name: 'state_sub_division_id', label: 'Taluka Division', table: 'state-sub-divisions' },
  { name: 'region_id', label: 'Region', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'block_id', label: 'Block', table: 'blocks' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
];

const businessFields = [
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Products', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];
const EDUCATION_OPTIONS = ['Illiterate', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Other'];
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];

const REQUIRED_FIELDS = [
  { name: 'business_category_id', label: 'Business Category' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category' },
  { name: 'product_id', label: 'Products' },
  { name: 'business_type_id', label: 'Business Type' },
  { name: 'country_id', label: 'Country' },
  { name: 'country_division_id', label: 'Country Division' },
  { name: 'state_id', label: 'State' },
  { name: 'state_division_id', label: 'District' },
  { name: 'state_sub_division_id', label: 'Taluka Division' },
  { name: 'region_id', label: 'Region' },
  { name: 'zone_id', label: 'Zone' },
  { name: 'taluka_id', label: 'Taluka' },
  { name: 'village_id', label: 'Village' },
  { name: 'block_id', label: 'Block' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat' },
  { name: 'first_name', label: 'First Name' },
  { name: 'last_name', label: 'Last Name' },
  { name: 'date_of_birth', label: 'Date of Birth' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'gender', label: 'Gender' },
  { name: 'pan_card_path', label: 'PAN Card' },
  { name: 'father_name', label: "Father's Name" },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
  { name: 'ration_card_path', label: 'Ration Card' },
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

export default function FarmerRegistrationPage({ title }) {
  const [options, setOptions] = useState({});
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
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleNumChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = v ? Number(v) : null;
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, [name]: file ? file.name : '' }));
  };

  const clearForm = () => {
    setForm({});
    setError(null);
    setSuccess(null);
    setFieldErrors({});
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
      ...form,
      country_id: form.country_id || null,
      country_division_id: form.country_division_id || null,
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
          setSuccess('Form successfully submitted.');
          setForm({});
          setFieldErrors({});
        }
      })
      .catch((err) => setError(err.message || 'Failed to save.'))
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>Business Information</div>
            <div style={styles.grid}>
              {businessFields.map((field) => (
                <FieldWithError key={field.name} fieldName={field.name} fieldErrors={fieldErrors} styles={styles}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>{field.label}</label>
                    <select
                      value={form[field.name] != null ? form[field.name] : ''}
                      onChange={handleNumChange(field.name)}
                      onKeyDown={focusNextOnTab}
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
                </FieldWithError>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Geographic Information</div>
            <div style={styles.grid}>
              {locationFields.map((field) => {
                const isLocation = LOCATION_ORDER.includes(field.name);
                const opts = isLocation ? getFilteredLocationOptions(LOCATION_FIELD_TABLE[field.name] || field.table, form, options) : getOptions(field.table);
                const disabled = isLocation ? isLocationFieldDisabled(field.name, form) : false;
                return (
                  <FieldWithError key={field.name} fieldName={field.name} fieldErrors={fieldErrors} styles={styles}>
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>{field.label}</label>
                      <select
                        value={form[field.name] != null ? form[field.name] : ''}
                        onChange={handleNumChange(field.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                        <option value="">Select {field.label}</option>
                        {opts.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FieldWithError>
                );
              })}
              <TextField label="Ward / Area" name="ward" value={form.ward || ''} onChange={handleChange} placeholder="Select Ward" style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Police Station / Inquiry" name="police_station" value={form.police_station || ''} onChange={handleChange} placeholder="Select Police Station" style={styles.fieldWrap} inputStyle={styles.input} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Farmer Information</div>
            <div style={styles.grid}>
              <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <FieldWithError fieldName="father_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Father's Name" name="father_name" value={form.father_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple label="Blood Group" name="blood_group" value={form.blood_group || ''} onChange={handleChange} options={BLOOD_GROUPS} />
              </FieldWithError>
              <FieldWithError fieldName="gender" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple label="Gender" name="gender" value={form.gender || ''} onChange={handleChange} options={GENDERS} />
              </FieldWithError>
              <FileField label="Upload Photo" name="photo_path" value={form.photo_path || ''} onChange={handleFileChange} />
              <SelectSimple label="Education" name="education" value={form.education || ''} onChange={handleChange} options={EDUCATION_OPTIONS} />
              <FieldWithError fieldName="whatsapp_number" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="WhatsApp Number" name="whatsapp_number" numericOnly maxLength={10} format="phonePairs" value={form.whatsapp_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <TextField label="Mobile Number" name="mobile_number" numericOnly maxLength={10} format="phonePairs" value={form.mobile_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FieldWithError fieldName="pan_card_path" fieldErrors={fieldErrors} styles={styles}>
                <FileField label="PAN Card" name="pan_card_path" value={form.pan_card_path || ''} onChange={handleFileChange} />
              </FieldWithError>
              <FileField label="Election Card" name="election_card_path" value={form.election_card_path || ''} onChange={handleFileChange} />
              <FileField label="Aadhaar Card" name="aadhar_card_path" value={form.aadhar_card_path || ''} onChange={handleFileChange} />
              <FieldWithError fieldName="email" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <TextField label="Date of Registration" name="registration_date" type="date" value={form.registration_date || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <FieldWithError fieldName="confirm_password" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
              <FieldWithError fieldName="ration_card_path" fieldErrors={fieldErrors} styles={styles}>
                <FileField label="Ration Card" name="ration_card_path" value={form.ration_card_path || ''} onChange={handleFileChange} />
              </FieldWithError>
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldWithError fieldName="address" fieldErrors={fieldErrors} styles={styles}>
                  <TextField label="Address" name="address" value={form.address || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
                </FieldWithError>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Nominee Information</div>
            <div style={styles.grid}>
              <TextField label="Nominee Name" name="nominee_name" value={form.nominee_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <SelectSimple label="Nominee Relation" name="nominee_relation" value={form.nominee_relation || ''} onChange={handleChange} options={RELATIONS} />
              <TextField label="Date of Birth" name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Nominee's Mobile Number" name="nominee_phone" numericOnly maxLength={10} format="phonePairs" value={form.nominee_phone || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <FileField label="Nominee's Aadhaar Card" name="nominee_aadhar_path" value={form.nominee_aadhar_path || ''} onChange={handleFileChange} />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>Bank Information</div>
            <div style={styles.grid}>
              <TextField label="Bank Name" name="bank_name" value={form.bank_name || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="IFSC Code" name="ifsc_code" value={form.ifsc_code || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Account Number" name="bank_account_number" numericOnly format="groups4" value={form.bank_account_number || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
              <TextField label="Pincode" name="pincode" numericOnly value={form.pincode || ''} onChange={handleChange} style={styles.fieldWrap} inputStyle={styles.input} />
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

function focusNextOnTab(e) {
  if (e.key !== 'Tab') return;
  const form = e.target.closest('form');
  if (!form) return;
  const focusable = form.querySelectorAll(
    'select:not([disabled]), input:not([disabled]):not([type="hidden"]), button:not([disabled])'
  );
  const list = Array.from(focusable);
  const idx = list.indexOf(e.target);
  if (idx === -1) return;
  e.preventDefault();
  if (e.shiftKey) {
    const prev = list[idx - 1];
    if (prev) prev.focus();
  } else {
    const next = list[idx + 1];
    if (next) next.focus();
  }
}

function SelectSimple({ label, name, value, onChange, options }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select name={name} value={value} onChange={(e) => onChange(name)(e)} onKeyDown={focusNextOnTab} style={styles.select}>
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
      <input
        type="file"
        name={name}
        key={`file-${name}-${value || 'none'}`}
        onChange={(e) => onChange(name)(e)}
        style={styles.input}
      />
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
  cascadeHint: { margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#555' },
  grid: {
    padding: '0.75rem 0.75rem 0.9rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: { fontSize: '0.8rem', color: '#c53030', marginTop: 2 },
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
    background: '#15803d',
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
