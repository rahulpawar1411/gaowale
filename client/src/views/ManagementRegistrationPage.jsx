import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi, filesApi } from '../services/api';
import TextField from '../components/TextField';
import {
  LOCATION_ORDER,
  LOCATION_FIELD_TABLE,
  getFilteredLocationOptions,
  isLocationFieldDisabled,
  clearDependentsOnChange,
} from '../config/locationCascade';

const BUSINESS_DROPDOWNS = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Products', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

// When these business fields change, clear their dependents so the
// next dropdowns always reflect the latest selection chain.
const BUSINESS_DEPENDENTS = {
  business_category_id: ['business_sub_category_id', 'product_id', 'business_type_id'],
  business_sub_category_id: ['product_id', 'business_type_id'],
  product_id: ['business_type_id'],
};

// Country se village tak – sab parent-dependent (locationCascade)
const GEO_DROPDOWNS = [
  { name: 'country_id', label: 'Country', table: 'countries' },
  { name: 'country_division_id', label: 'Country Division', table: 'country-divisions' },
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_circle_id', label: 'State Circle', table: 'state-circles' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'state_sub_division_id', label: 'State Sub Division', table: 'state-sub-divisions' },
  { name: 'region_id', label: 'Region', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'block_id', label: 'Block', table: 'blocks' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CASTE_OPTIONS = ['ST', 'SC', 'OBC', 'OTHERS'];
const OCCUPATION_OPTIONS = ['Housewife', 'Employed', 'Self-employed', 'Other'];
const NOMINEE_RELATION_OPTIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other'];

// All fields on the form are required except `middle_name` and `phone_number`.
const REQUIRED_FIELDS = [
  // Business information
  { name: 'business_position_id', label: 'Business Position' },
  { name: 'business_category_id', label: 'Business Category' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category' },
  { name: 'product_id', label: 'Products' },
  { name: 'business_type_id', label: 'Business Type' },

  // Geographic information (country se village tak – parent dependent)
  { name: 'country_id', label: 'Country' },
  { name: 'country_division_id', label: 'Country Division' },
  { name: 'state_id', label: 'State' },
  { name: 'state_circle_id', label: 'State Circle' },
  { name: 'state_division_id', label: 'State Division' },
  { name: 'state_sub_division_id', label: 'State Sub Division' },
  { name: 'region_id', label: 'Region' },
  { name: 'zone_id', label: 'Zone' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha' },
  { name: 'taluka_id', label: 'Taluka' },
  { name: 'block_id', label: 'Block' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat' },
  { name: 'village_id', label: 'Village' },

  // Personal information
  { name: 'first_name', label: 'First Name' },
  // middle_name is intentionally NOT required
  { name: 'last_name', label: 'Last Name' },
  { name: 'date_of_birth', label: 'Date of Birth' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'caste', label: 'Caste' },
  { name: 'education', label: 'Education' },
  { name: 'occupation', label: 'Occupation' },
  { name: 'business', label: 'Business' },
  { name: 'mobile_number', label: 'Mobile Number' },
  // phone_number is intentionally NOT required
  { name: 'whatsapp_number', label: 'WhatsApp Number' },
  { name: 'pan_card', label: 'PAN Card' },
  { name: 'aadhar_card', label: 'Aadhaar Card' },
  { name: 'voter_id_path', label: 'Voter ID Card' },
  { name: 'pincode', label: 'Pincode' },
  { name: 'photo_path', label: 'Photo' },
  { name: 'email', label: 'Email' },

  // Nominee info
  { name: 'nominee_name', label: 'Nominee Name' },
  { name: 'nominee_relation', label: 'Nominee Relation' },
  { name: 'nominee_dob', label: 'Nominee Date of Birth' },
  { name: 'nominee_phone', label: 'Nominee Phone Number' },
  { name: 'nominee_address', label: 'Nominee Address' },

  // Financial information
  { name: 'work_form_received', label: 'Forms received from office' },
  { name: 'work_form_deposited', label: 'Forms submitted to office' },
  { name: 'receipt_path', label: 'Receipt' },
  { name: 'business_payment_amount', label: 'Total payment given to management' },
  { name: 'self_contribution_amount', label: 'Self contribution amount' },
  { name: 'total_incentive_amount', label: 'Incentive / honorarium received so far' },

  // Password
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

export default function ManagementRegistrationPage({ title }) {
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
    const tables = Array.from(
      new Set([...BUSINESS_DROPDOWNS, ...GEO_DROPDOWNS].map((f) => f.table))
    );
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

  const handleSelectChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = v ? Number(v) : null;
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
      return;
    }

    // Business cascade (Category -> Sub Category -> Product -> Type)
    if (BUSINESS_DEPENDENTS[name]) {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        BUSINESS_DEPENDENTS[name].forEach((child) => {
          next[child] = null;
        });
        return next;
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleFileChange = (name) => async (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, [name]: '' }));
      return;
    }
    try {
      const res = await filesApi.upload(file);
      if (res && res.success && res.path) {
        setForm((prev) => ({ ...prev, [name]: res.path }));
      } else {
        setForm((prev) => ({ ...prev, [name]: file.name }));
      }
    } catch {
      setForm((prev) => ({ ...prev, [name]: file.name }));
    }
  };

  const getOptions = (table) => options[table] || [];

  const getBusinessOptions = (fieldName) => {
    switch (fieldName) {
      case 'business_position_id':
        return getOptions('designations');
      case 'business_category_id':
        return getOptions('business-categories');
      case 'business_sub_category_id': {
        const all = getOptions('business-sub-categories');
        const catId = form.business_category_id;
        if (!catId) return [];
        const idNum = Number(catId);
        return all.filter((s) => Number(s.business_category_id) === idNum);
      }
      case 'product_id': {
        const all = getOptions('products');
        const subId = form.business_sub_category_id;
        if (!subId) return [];
        const idNum = Number(subId);
        return all.filter((p) => Number(p.business_sub_category_id) === idNum);
      }
      case 'business_type_id': {
        const all = getOptions('business-types');
        const prodId = form.product_id;
        if (!prodId) return [];
        const idNum = Number(prodId);
        return all.filter((t) => Number(t.product_id) === idNum);
      }
      default:
        return [];
    }
  };

  const getValidationError = () => {
    const fieldErr = {};
    for (const { name, label } of REQUIRED_FIELDS) {
      const val = form[name];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (typeof val === 'string' && val.trim() === '');
      if (isEmpty) {
        fieldErr[name] = `${label} is required`;
      }
    }
    if (Object.keys(fieldErr).length > 0) {
      const missingLabels = Object.values(fieldErr).map((e) => e.replace(' is required', ''));
      return {
        message: `Please fill all required fields: ${missingLabels.join(', ')}`,
        fieldErrors: fieldErr,
      };
    }
    if (form.password !== form.confirm_password) {
      return {
        message: 'Password and Confirm Password do not match.',
        fieldErrors: { confirm_password: 'Password and Confirm Password do not match.' },
      };
    }
    if (form.mobile_number && String(form.mobile_number).replace(/\D/g, '').length !== 10) {
      return {
        message: 'Mobile Number must be 10 digits.',
        fieldErrors: { mobile_number: 'Mobile Number must be 10 digits.' },
      };
    }
    if (form.nominee_phone && String(form.nominee_phone).replace(/\D/g, '').length !== 10) {
      return {
        message: 'Nominee Phone Number must be 10 digits.',
        fieldErrors: { nominee_phone: 'Nominee Phone Number must be 10 digits.' },
      };
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

    const name =
      [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ').trim() ||
      form.name ||
      '';

    const payload = {
      ...form,
      name,
      contact: form.mobile_number || form.contact || '',
      email: form.email || '',
    };

    registrationsApi.management
      .create(payload)
      .then((res) => {
        if (!res.success) {
          setError(res.message || 'Failed to submit form.');
        } else {
          setSuccess('Form successfully submitted.');
          setForm({});
          setFieldErrors({});
        }
      })
      .catch((err) => setError(err.message || 'Failed to submit form.'))
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title || 'Management Registration'}</h1>
        <p style={styles.subtitle}>
          Please fill the following details for management registration.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Business Information</legend>
            <div style={styles.grid3}>
              {BUSINESS_DROPDOWNS.map((cfg) => {
                const isBusinessChainField =
                  cfg.name === 'business_position_id' ||
                  cfg.name === 'business_category_id' ||
                  cfg.name === 'business_sub_category_id' ||
                  cfg.name === 'product_id' ||
                  cfg.name === 'business_type_id';

                const opts = isBusinessChainField
                  ? getBusinessOptions(cfg.name)
                  : getOptions(cfg.table);

                const disabled =
                  (cfg.name === 'business_sub_category_id' && !form.business_category_id) ||
                  (cfg.name === 'product_id' && !form.business_sub_category_id) ||
                  (cfg.name === 'business_type_id' && !form.product_id);

                return (
                  <FieldWithError
                    key={cfg.name}
                    fieldName={cfg.name}
                    fieldErrors={fieldErrors}
                    styles={styles}
                  >
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>{cfg.label}</label>
                      <select
                        value={form[cfg.name] ?? ''}
                        onChange={handleSelectChange(cfg.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                        <option value="">Select {cfg.label}</option>
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
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Geographic Information</legend>
            <div style={styles.grid3}>
              {GEO_DROPDOWNS.map((cfg) => {
                const isLocation = LOCATION_FIELD_TABLE[cfg.name];
                const allOpts = getOptions(cfg.table);
                const opts = isLocation
                  ? getFilteredLocationOptions(cfg.table, form, options)
                  : allOpts;
                const disabled = isLocation ? isLocationFieldDisabled(cfg.name, form) : false;
                return (
                  <FieldWithError
                    key={cfg.name}
                    fieldName={cfg.name}
                    fieldErrors={fieldErrors}
                    styles={styles}
                  >
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>{cfg.label}</label>
                      <select
                        value={form[cfg.name] ?? ''}
                        onChange={handleSelectChange(cfg.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                        <option value="">Select {cfg.label}</option>
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
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Personal Information</legend>
            <div style={styles.grid3}>
              <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={form.first_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <TextField
                label="Middle Name"
                name="middle_name"
                value={form.middle_name || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label="Blood Group"
                  name="blood_group"
                  value={form.blood_group || ''}
                  onChange={handleTextChange}
                  options={BLOOD_GROUPS}
                />
              </FieldWithError>
              <FieldWithError fieldName="caste" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label="Caste"
                  name="caste"
                  value={form.caste || ''}
                  onChange={handleTextChange}
                  options={CASTE_OPTIONS}
                />
              </FieldWithError>
              <FieldWithError fieldName="education" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Education"
                  name="education"
                  value={form.education || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="occupation" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label="Occupation"
                  name="occupation"
                  value={form.occupation || ''}
                  onChange={handleTextChange}
                  options={OCCUPATION_OPTIONS}
                />
              </FieldWithError>
              <TextField
                label="Business"
                name="business"
                value={form.business || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="mobile_number" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Mobile Number"
                  name="mobile_number"
                  numericOnly
                  maxLength={10}
                  format="phonePairs"
                  value={form.mobile_number || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <TextField
                label="Phone Number"
                name="phone_number"
                numericOnly
                maxLength={10}
                format="phonePairs"
                value={form.phone_number || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label="WhatsApp Number"
                name="whatsapp_number"
                numericOnly
                maxLength={10}
                format="phonePairs"
                value={form.whatsapp_number || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="pan_card" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="PAN Card"
                  name="pan_card"
                  value={form.pan_card || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FileField
                label="Aadhaar Card"
                name="aadhar_card"
                value={form.aadhar_card}
                onChange={handleFileChange}
              />
              <FileField
                label="Voter ID Card"
                name="voter_id_path"
                value={form.voter_id_path}
                onChange={handleFileChange}
              />
              <FieldWithError fieldName="pincode" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  numericOnly
                  value={form.pincode || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FileField
                label="Photo"
                name="photo_path"
                value={form.photo_path}
                onChange={handleFileChange}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Nominee Info</legend>
            <div style={styles.grid3}>
              <FieldWithError fieldName="nominee_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Nominee Name"
                  name="nominee_name"
                  value={form.nominee_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="nominee_relation" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label="Nominee Relation"
                  name="nominee_relation"
                  value={form.nominee_relation || ''}
                  onChange={handleTextChange}
                  options={NOMINEE_RELATION_OPTIONS}
                />
              </FieldWithError>
              <TextField
                label="Nominee Date of Birth"
                name="nominee_dob"
                type="date"
                value={form.nominee_dob || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="nominee_phone" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Nominee Phone Number"
                  name="nominee_phone"
                  numericOnly
                  maxLength={10}
                  format="phonePairs"
                  value={form.nominee_phone || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="nominee_address" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Nominee Address"
                  name="nominee_address"
                  value={form.nominee_address || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Financial Information</legend>
            <div style={styles.grid3}>
              <TextField
                label="Forms received from office"
                name="work_form_received"
                value={form.work_form_received || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label="Forms submitted to office"
                name="work_form_deposited"
                value={form.work_form_deposited || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FileField
                label="Receipt"
                name="receipt_path"
                value={form.receipt_path}
                onChange={handleFileChange}
              />
              <TextField
                label="Total payment given to management (₹)"
                name="business_payment_amount"
                type="number"
                value={form.business_payment_amount ?? ''}
                onChange={handleTextChange}
                placeholder="0"
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label="Self contribution amount (₹)"
                name="self_contribution_amount"
                type="number"
                value={form.self_contribution_amount ?? ''}
                onChange={handleTextChange}
                placeholder="0"
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label="Incentive / honorarium received so far (₹)"
                name="total_incentive_amount"
                type="number"
                value={form.total_incentive_amount ?? ''}
                onChange={handleTextChange}
                placeholder="0"
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Password</legend>
            <div style={styles.grid3}>
              <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password || ''}
                  onChange={handleTextChange}
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
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
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

function SelectField({ label, name, value, options, onChange }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        value={value != null ? value : ''}
        onChange={(e) => onChange(name)(e)}
        onKeyDown={focusNextOnTab}
        style={styles.select}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
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
      <select
        value={value || ''}
        onChange={(e) => onChange(name)(e)}
        onKeyDown={focusNextOnTab}
        style={styles.select}
      >
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
  page: { padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center', background: '#f2f2f5' },
  card: {
    width: '100%',
    maxWidth: 1040,
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
  fieldset: {
    borderRadius: 6,
    border: '1px solid #e0a0a0',
    padding: '1rem 1.25rem',
    margin: 0,
  },
  legend: { padding: '0 0.5rem', fontWeight: 600, fontSize: '1rem' },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
    marginTop: '0.75rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: { fontSize: '0.8rem', color: '#c53030', marginTop: 2 },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  input: {
    padding: '0.4rem 0.55rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    fontSize: '0.85rem',
  },
  select: {
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
};

