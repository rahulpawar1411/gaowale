import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi } from '../services/api';

const dropdownConfig = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'region_id', label: 'Region / Zone', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'circle_id', label: 'Division Council / Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Product / Type', table: 'products' },
  { name: 'unit_type_id', label: 'Product Type', table: 'unit-types' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CASTE_OPTIONS = ['ST', 'SC', 'OBC', 'OTHERS'];
const OCCUPATION_OPTIONS = ['Housewife', 'Employed', 'Self-employed'];
const NOMINEE_RELATION_OPTIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other'];

export default function ManagementRegistrationPage({ title }) {
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tables = Array.from(new Set(dropdownConfig.map((f) => f.table)));
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
    setForm((prev) => ({ ...prev, [name]: v ? (e.target.type === 'number' || name.endsWith('_id') ? Number(v) : v) : null }));
  };

  const handleTextChange = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleFileChange = (name) => (e) => {
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, [name]: file ? file.name : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const name = [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ').trim() || form.name || '';
    const payload = {
      name: name || '',
      contact: form.mobile_number || form.contact || '',
      email: form.email || '',
      state_id: form.state_id || null,
      region_id: form.region_id || null,
      incharge_user_id: form.incharge_user_id || null,
      target_to_fill_farm: form.target_to_fill_farm != null && form.target_to_fill_farm !== '' ? Number(form.target_to_fill_farm) : null,
      target_completed_so_far: form.target_completed_so_far != null && form.target_completed_so_far !== '' ? Number(form.target_completed_so_far) : null,
      existing_terms_according_to_target: form.existing_terms_according_to_target || null,
      state_division_id: form.state_division_id || null,
      zone_id: form.zone_id || null,
      vidhan_sabha_id: form.vidhan_sabha_id || null,
      taluka_id: form.taluka_id || null,
      circle_id: form.circle_id || null,
      gram_panchayat_id: form.gram_panchayat_id || null,
      village_id: form.village_id || null,
      business_category_id: form.business_category_id || null,
      business_sub_category_id: form.business_sub_category_id || null,
      product_id: form.product_id || null,
      unit_type_id: form.unit_type_id || null,
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
      voter_id_path: form.voter_id_path || null,
      password_hash: form.password || null,
      nominee_name: form.nominee_name || null,
      nominee_relation: form.nominee_relation || null,
      nominee_dob: form.nominee_dob || null,
      nominee_phone: form.nominee_phone || null,
      nominee_address: form.nominee_address || null,
      management_net_work: form.management_net_work != null && form.management_net_work !== '' ? Number(form.management_net_work) : null,
      total_work_baseline_family: form.total_work_baseline_family != null && form.total_work_baseline_family !== '' ? Number(form.total_work_baseline_family) : null,
      passport_path: form.passport_path || null,
      birth_certificate_path: form.birth_certificate_path || null,
      bank_book_path: form.bank_book_path || null,
      income_certificate_path: form.income_certificate_path || null,
    };
    registrationsApi.management
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
      <p style={styles.subtitle}>Management Position and Business Selection Form. Complete registration of management staff and beneficiaries.</p>
      <form onSubmit={handleSubmit}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Management Info</legend>
          <div style={styles.grid4}>
            <SelectField
              label="Business Position"
              name="business_position_id"
              value={form.business_position_id}
              options={getOptions('designations')}
              onChange={handleChange}
            />
            <TextField label="Target to fill the farm" name="target_to_fill_farm" type="number" value={form.target_to_fill_farm ?? ''} onChange={handleTextChange} placeholder="0" />
            <TextField label="Target completed so far" name="target_completed_so_far" type="number" value={form.target_completed_so_far ?? ''} onChange={handleTextChange} placeholder="0" />
            <TextField label="Existing terms according to Target" name="existing_terms_according_to_target" value={form.existing_terms_according_to_target || ''} onChange={handleTextChange} placeholder="Terms" />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Geographic Info</legend>
          <div style={styles.grid3}>
            <SelectField label="State" name="state_id" value={form.state_id} options={getOptions('states')} onChange={handleChange} />
            <SelectField label="State Division" name="state_division_id" value={form.state_division_id} options={getOptions('state-divisions')} onChange={handleChange} />
            <SelectField label="Region / Zone" name="region_id" value={form.region_id} options={getOptions('regions')} onChange={handleChange} />
            <SelectField label="Zone" name="zone_id" value={form.zone_id} options={getOptions('zones')} onChange={handleChange} />
            <SelectField label="Vidhan Sabha" name="vidhan_sabha_id" value={form.vidhan_sabha_id} options={getOptions('vidhan-sabhas')} onChange={handleChange} />
            <SelectField label="Taluka" name="taluka_id" value={form.taluka_id} options={getOptions('talukas')} onChange={handleChange} />
            <SelectField label="Division Council / Circle" name="circle_id" value={form.circle_id} options={getOptions('circles')} onChange={handleChange} />
            <SelectField label="Gram Panchayat" name="gram_panchayat_id" value={form.gram_panchayat_id} options={getOptions('gram-panchayats')} onChange={handleChange} />
            <SelectField label="Village" name="village_id" value={form.village_id} options={getOptions('villages')} onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Business Info</legend>
          <div style={styles.grid4}>
            <SelectField label="Business Category" name="business_category_id" value={form.business_category_id} options={getOptions('business-categories')} onChange={handleChange} />
            <SelectField label="Business Sub-Category" name="business_sub_category_id" value={form.business_sub_category_id} options={getOptions('business-sub-categories')} onChange={handleChange} />
            <SelectField label="Product / Type" name="product_id" value={form.product_id} options={getOptions('products')} onChange={handleChange} />
            <SelectField label="Product Type" name="unit_type_id" value={form.unit_type_id} options={getOptions('unit-types')} onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Personal Info</legend>
          <div style={styles.grid4}>
            <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleTextChange} />
            <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleTextChange} />
            <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleTextChange} />
            <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleTextChange} />
            <SelectSimple label="Blood Group" name="blood_group" value={form.blood_group || ''} onChange={handleTextChange} options={BLOOD_GROUPS} />
            <SelectSimple label="Caste" name="caste" value={form.caste || ''} onChange={handleTextChange} options={CASTE_OPTIONS} />
            <TextField label="Education" name="education" value={form.education || ''} onChange={handleTextChange} />
            <SelectSimple label="Occupation" name="occupation" value={form.occupation || ''} onChange={handleTextChange} options={OCCUPATION_OPTIONS} />
            <TextField label="Mobile Number" name="mobile_number" value={form.mobile_number || ''} onChange={handleTextChange} />
            <TextField label="Phone Number" name="phone_number" value={form.phone_number || ''} onChange={handleTextChange} />
            <TextField label="WhatsApp Number" name="whatsapp_number" value={form.whatsapp_number || ''} onChange={handleTextChange} />
            <TextField label="PAN Card" name="pan_card" value={form.pan_card || ''} onChange={handleTextChange} />
            <FileField label="Aadhaar Card" name="aadhar_card" value={form.aadhar_card} onChange={handleFileChange} />
            <FileField label="Voter ID Card" name="voter_id_path" value={form.voter_id_path} onChange={handleFileChange} />
            <TextField label="Pincode" name="pincode" value={form.pincode || ''} onChange={handleTextChange} />
            <FileField label="Photo" name="photo_path" value={form.photo_path} onChange={handleFileChange} />
            <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleTextChange} />
            <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleTextChange} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Nominee Info</legend>
          <div style={styles.grid4}>
            <TextField label="Nominee Name" name="nominee_name" value={form.nominee_name || ''} onChange={handleTextChange} />
            <SelectSimple label="Relation" name="nominee_relation" value={form.nominee_relation || ''} onChange={handleTextChange} options={NOMINEE_RELATION_OPTIONS} />
            <TextField label="Date of Birth" name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleTextChange} />
            <TextField label="Nominee Phone Number" name="nominee_phone" value={form.nominee_phone || ''} onChange={handleTextChange} />
            <div style={{ gridColumn: '1 / -1' }}>
              <TextField label="Nominee Address" name="nominee_address" value={form.nominee_address || ''} onChange={handleTextChange} />
            </div>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Other Info</legend>
          <div style={styles.grid4}>
            <TextField label="Management Net Work (₹)" name="management_net_work" type="number" value={form.management_net_work ?? ''} onChange={handleTextChange} placeholder="0" />
            <TextField label="Total Work of Baseline Family (₹)" name="total_work_baseline_family" type="number" value={form.total_work_baseline_family ?? ''} onChange={handleTextChange} placeholder="0" />
            <FileField label="Passport" name="passport_path" value={form.passport_path} onChange={handleFileChange} />
            <FileField label="Birth Certificate / School Leaving Certificate (S.L.C)" name="birth_certificate_path" value={form.birth_certificate_path} onChange={handleFileChange} />
            <FileField label="Bank Book or Chequebook Copy" name="bank_book_path" value={form.bank_book_path} onChange={handleFileChange} />
            <FileField label="Income Certificate (Parents)" name="income_certificate_path" value={form.income_certificate_path} onChange={handleFileChange} />
          </div>
        </fieldset>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttonRow}>
          <button type="submit" disabled={saving} style={styles.submit}>
            {saving ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
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

function SelectField({ label, name, value, options, optionLabel, onChange }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        value={value != null ? value : ''}
        onChange={(e) => onChange(name)(e)}
        style={styles.select}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {optionLabel ? (opt[optionLabel] ?? opt.name) : opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectSimple({ label, name, value, onChange, options }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(name)(e)} style={styles.select}>
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
      <input type="file" name={name} onChange={(e) => onChange(name)(e)} style={styles.input} />
      {value && <span style={styles.fileName}>{value}</span>}
    </div>
  );
}

const styles = {
  page: { padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  h1: { margin: 0, fontSize: '1.75rem', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a' },
  subtitle: { margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#555' },
  fieldset: { borderRadius: 6, border: '1px solid #ddd', padding: '1rem 1.25rem', marginBottom: '1rem' },
  legend: { padding: '0 0.5rem', fontWeight: 600, fontSize: '1rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem 1rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem 1rem' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  select: { padding: '0.4rem 0.55rem', borderRadius: 4, border: '1px solid #aaa', background: '#fff', fontSize: '0.85rem' },
  input: { padding: '0.4rem 0.55rem', borderRadius: 4, border: '1px solid #aaa', background: '#fff', fontSize: '0.85rem' },
  fileName: { fontSize: '0.8rem', color: '#666', marginTop: 2 },
  error: { marginTop: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: 4, border: '1px solid #e0a0a0', background: '#fde8e8', color: '#8B1538' },
  buttonRow: { marginTop: '0.75rem' },
  submit: { padding: '0.55rem 1.25rem', borderRadius: 4, border: 'none', background: '#c41e3a', color: '#fff', fontWeight: 600 },
};
