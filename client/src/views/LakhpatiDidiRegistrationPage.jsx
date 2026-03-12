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

const locationFieldConfig = [
  { name: 'country_id', label: 'Country', table: 'countries' },
  { name: 'country_division_id', label: 'Country Division', table: 'country-divisions' },
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

const REQUIRED_FIELDS = [
  { name: 'country_id', label: 'Country' },
  { name: 'country_division_id', label: 'Country Division' },
  { name: 'state_id', label: 'State' },
  { name: 'state_division_id', label: 'State Division' },
  { name: 'region_id', label: 'Region' },
  { name: 'zone_id', label: 'Zone' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha' },
  { name: 'taluka_id', label: 'Taluka' },
  { name: 'circle_id', label: 'Circle' },
  { name: 'gram_panchayat_id', label: 'Panchayat Samiti' },
  { name: 'village_id', label: 'Village' },
  { name: 'business_category_id', label: 'Business Category' },
  { name: 'business_type_id', label: 'Business Type' },
  { name: 'product_id', label: 'Product' },
  { name: 'unit_id', label: 'Unit' },
  { name: 'first_name', label: 'First Name' },
  { name: 'last_name', label: 'Last Name' },
  { name: 'date_of_birth', label: 'Date of Birth' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'caste', label: 'Caste' },
  { name: 'education', label: 'Education' },
  { name: 'occupation', label: 'Occupation' },
  { name: 'mobile_number', label: 'Mobile Number' },
  { name: 'pan_card', label: 'PAN Card' },
  { name: 'aadhar_card', label: 'Aadhar Card' },
  { name: 'pincode', label: 'Pincode' },
  { name: 'nominee_name', label: 'Nominee Name' },
  { name: 'nominee_relation', label: 'Nominee Relation' },
  { name: 'nominee_phone', label: 'Nominee Phone Number' },
  { name: 'nominee_address', label: 'Nominee Address' },
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

export default function LakhpatiDidiRegistrationPage({ title }) {
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
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = v ? Number(v) : null;
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserChange = (name) => (e) => {
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
    if (form.mobile_number && String(form.mobile_number).replace(/\D/g, '').length !== 10) {
      return { message: 'Mobile Number must be 10 digits.', fieldErrors: { mobile_number: 'Mobile Number must be 10 digits.' } };
    }
    if (form.nominee_phone && String(form.nominee_phone).replace(/\D/g, '').length !== 10) {
      return { message: 'Nominee Phone Number must be 10 digits.', fieldErrors: { nominee_phone: 'Nominee Phone Number must be 10 digits.' } };
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
      country_id: form.country_id ?? null,
      country_division_id: form.country_division_id ?? null,
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
          setSuccess('Form successfully submitted.');
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
          <legend style={styles.legend}>Geographic Information</legend>
          <div style={styles.grid}>
            {locationFieldConfig.map((field) => {
              const isLocation = LOCATION_FIELD_TABLE[field.name];
              const opts = isLocation ? getFilteredLocationOptions(LOCATION_FIELD_TABLE[field.name], form, options) : getOptions(field.table);
              const disabled = isLocation ? isLocationFieldDisabled(field.name, form) : false;
              return (
                <div key={field.name} style={styles.fieldWithError}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>{field.label}</label>
                    <select
                      value={form[field.name] != null ? form[field.name] : ''}
                      onChange={handleChange(field.name)}
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
                  {fieldErrors[field.name] && <div style={styles.fieldError}>{fieldErrors[field.name]}</div>}
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>User Details</legend>
          <div style={styles.userGrid4}>
            <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>

            <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label="Blood Group"
                name="blood_group"
                value={form.blood_group || ''}
                onChange={handleUserChange}
                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
              />
            </FieldWithError>
            <FieldWithError fieldName="caste" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label="Caste"
                name="caste"
                value={form.caste || ''}
                onChange={handleUserChange}
                options={['ST', 'SC', 'OBC', 'OTHERS']}
              />
            </FieldWithError>
            <FieldWithError fieldName="education" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Education" name="education" value={form.education || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="occupation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label="Occupation"
                name="occupation"
                value={form.occupation || ''}
                onChange={handleUserChange}
                options={['Housewife', 'Employed', 'Self-employed']}
              />
            </FieldWithError>

            <TextField label="Business" name="business" value={form.business || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="mobile_number" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Mobile Number" name="mobile_number" numericOnly maxLength={10} format="phonePairs" value={form.mobile_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label="Phone Number" name="phone_number" numericOnly maxLength={10} format="phonePairs" value={form.phone_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="WhatsApp Number" name="whatsapp_number" numericOnly maxLength={10} format="phonePairs" value={form.whatsapp_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />

            <FieldWithError fieldName="pan_card" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="PAN Card" name="pan_card" value={form.pan_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="aadhar_card" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Aadhar Card" name="aadhar_card" numericOnly format="groups4" value={form.aadhar_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="pincode" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Pincode" name="pincode" numericOnly value={form.pincode || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Photo</label>
              <input
                type="file"
                name="photo"
                key={`file-photo_path-${form.photo_path || 'none'}`}
                style={styles.input}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  setForm((prev) => ({ ...prev, photo_path: file ? file.name : '' }));
                }}
              />
              {form.photo_path && <span style={styles.fileName}>{form.photo_path}</span>}
            </div>

            <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="confirm_password" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Nominee Details</legend>
          <div style={styles.userGrid4}>
            <FieldWithError fieldName="nominee_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Nominee Name" name="nominee_name" value={form.nominee_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="nominee_relation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label="Nominee Relation"
                name="nominee_relation"
                value={form.nominee_relation || ''}
                onChange={handleUserChange}
                options={['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other']}
              />
            </FieldWithError>
            <TextField label="Nominee DOB" name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="nominee_phone" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Nominee Phone Number" name="nominee_phone" numericOnly maxLength={10} format="phonePairs" value={form.nominee_phone || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <div style={{ gridColumn: '1 / span 4' }}>
              <FieldWithError fieldName="nominee_address" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Nominee Address" name="nominee_address" value={form.nominee_address || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
            </div>
          </div>
        </fieldset>

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
            {saving ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
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
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name)(e)}
        onKeyDown={focusNextOnTab}
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
  cascadeHint: { margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#555' },
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
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: {
    fontSize: '0.8rem',
    color: '#c53030',
    marginTop: 2,
  },
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
  fileName: { fontSize: '0.8rem', color: '#666', marginTop: 2 },
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
    border: '1px solid #2d8a4e',
    background: '#e6f6ed',
    color: '#166534',
    fontWeight: 500,
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
    alignItems: 'center',
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
};

