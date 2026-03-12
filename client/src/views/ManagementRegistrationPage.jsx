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

const dropdownConfig = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'country_id', label: 'Country', table: 'countries' },
  { name: 'country_division_id', label: 'Country Division', table: 'country-divisions' },
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'region_id', label: 'Region', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'block_id', label: 'Block', table: 'blocks' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Products', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CASTE_OPTIONS = ['ST', 'SC', 'OBC', 'OTHERS'];
const OCCUPATION_OPTIONS = ['Housewife', 'Employed', 'Self-employed'];
const NOMINEE_RELATION_OPTIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other'];

// Required fields: { name, label } for validation messages
const REQUIRED_FIELDS = [
  { name: 'business_category_id', label: 'Business Category' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category' },
  { name: 'product_id', label: 'Products' },
  { name: 'business_type_id', label: 'Business Type' },
  { name: 'business_position_id', label: 'Business Position' },
  { name: 'country_id', label: 'Country' },
  { name: 'country_division_id', label: 'Country Division' },
  { name: 'state_id', label: 'State' },
  { name: 'state_division_id', label: 'State Division' },
  { name: 'region_id', label: 'Region' },
  { name: 'zone_id', label: 'Zone' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha' },
  { name: 'taluka_id', label: 'Taluka' },
  { name: 'block_id', label: 'Block' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat' },
  { name: 'village_id', label: 'Village' },
  { name: 'first_name', label: 'First Name' },
  { name: 'last_name', label: 'Last Name' },
  { name: 'date_of_birth', label: 'Date of Birth' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'caste', label: 'Caste' },
  { name: 'education', label: 'Education' },
  { name: 'occupation', label: 'Occupation' },
  { name: 'mobile_number', label: 'Mobile Number' },
  { name: 'pan_card', label: 'PAN Card' },
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
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = v ? (name.endsWith('_id') ? Number(v) : v) : null;
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTextChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleFileChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, [name]: file ? file.name : '' }));
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
      const missingLabels = Object.values(fieldErr);
      return { message: `Please fill all required fields: ${missingLabels.map((e) => e.replace(' is required', '')).join(', ')}`, fieldErrors: fieldErr };
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
    const name = [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ').trim() || form.name || '';
    const payload = {
      name: name || '',
      contact: form.mobile_number || form.contact || '',
      email: form.email || '',
      state_id: form.state_id || null,
      region_id: form.region_id || null,
      country_id: form.country_id || null,
      country_division_id: form.country_division_id || null,
      business_position_id: form.business_position_id || null,
      incharge_user_id: form.incharge_user_id || null,
      target_to_fill_farm: form.target_to_fill_farm != null && form.target_to_fill_farm !== '' ? Number(form.target_to_fill_farm) : null,
      target_completed_so_far: form.target_completed_so_far != null && form.target_completed_so_far !== '' ? Number(form.target_completed_so_far) : null,
      existing_terms_according_to_target: form.existing_terms_according_to_target || null,
      state_division_id: form.state_division_id || null,
      zone_id: form.zone_id || null,
      vidhan_sabha_id: form.vidhan_sabha_id || null,
      taluka_id: form.taluka_id || null,
      block_id: form.block_id || null,
      circle_id: form.circle_id || null,
      gram_panchayat_id: form.gram_panchayat_id || null,
      village_id: form.village_id || null,
      business_category_id: form.business_category_id || null,
      business_sub_category_id: form.business_sub_category_id || null,
      product_id: form.product_id || null,
      business_type_id: form.business_type_id || null,
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
      management_net_worth: form.management_net_worth != null && form.management_net_worth !== '' ? Number(form.management_net_worth) : null,
      baseline_family_net_worth: form.baseline_family_net_worth != null && form.baseline_family_net_worth !== '' ? Number(form.baseline_family_net_worth) : null,
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
          setSuccess('Form successfully submitted.');
          setForm({});
        }
      })
      .catch((err) => setError(err.message || 'Failed to save'))
      .finally(() => setSaving(false));
  };

  const getOptions = (table) => options[table] || [];
  const getLocationOptions = (fieldName) =>
    LOCATION_FIELD_TABLE[fieldName]
      ? getFilteredLocationOptions(LOCATION_FIELD_TABLE[fieldName], form, options)
      : [];

  const FieldWithError = ({ fieldName, children }) => (
    <div style={styles.fieldWithError}>
      {children}
      {fieldErrors[fieldName] && <div style={styles.fieldError}>{fieldErrors[fieldName]}</div>}
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>{title}</h1>
      <form onSubmit={handleSubmit}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Business Info</legend>
          <div style={styles.grid4}>
            <FieldWithError fieldName="business_category_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Business Category" name="business_category_id" value={form.business_category_id} options={getOptions('business-categories')} onChange={handleChange} />
            </FieldWithError>
            <FieldWithError fieldName="business_sub_category_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Business Sub-Category" name="business_sub_category_id" value={form.business_sub_category_id} options={getOptions('business-sub-categories')} onChange={handleChange} />
            </FieldWithError>
            <FieldWithError fieldName="product_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Products" name="product_id" value={form.product_id} options={getOptions('products')} onChange={handleChange} />
            </FieldWithError>
            <FieldWithError fieldName="business_type_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Business Type" name="business_type_id" value={form.business_type_id} options={getOptions('business-types')} onChange={handleChange} />
            </FieldWithError>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Management Info</legend>
          <div style={styles.grid4}>
            <FieldWithError fieldName="business_position_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField
                label="Business Position"
                name="business_position_id"
                value={form.business_position_id}
                options={getOptions('designations')}
                onChange={handleChange}
              />
            </FieldWithError>
            <TextField label="Target to fill the farm" name="target_to_fill_farm" type="number" value={form.target_to_fill_farm ?? ''} onChange={handleTextChange} placeholder="0" style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Target completed so far" name="target_completed_so_far" type="number" value={form.target_completed_so_far ?? ''} onChange={handleTextChange} placeholder="0" style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Existing terms according to Target" name="existing_terms_according_to_target" value={form.existing_terms_according_to_target || ''} onChange={handleTextChange} placeholder="Terms" style={styles.fieldWrap} inputStyle={styles.input} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Geographic Info</legend>
          <div style={styles.grid3}>
            <FieldWithError fieldName="country_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Country" name="country_id" value={form.country_id} options={getLocationOptions('country_id')} onChange={handleChange} disabled={false} />
            </FieldWithError>
            <FieldWithError fieldName="country_division_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Country Division" name="country_division_id" value={form.country_division_id} options={getLocationOptions('country_division_id')} onChange={handleChange} disabled={isLocationFieldDisabled('country_division_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="state_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="State" name="state_id" value={form.state_id} options={getLocationOptions('state_id')} onChange={handleChange} disabled={isLocationFieldDisabled('state_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="state_division_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="State Division" name="state_division_id" value={form.state_division_id} options={getLocationOptions('state_division_id')} onChange={handleChange} disabled={isLocationFieldDisabled('state_division_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="region_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Region" name="region_id" value={form.region_id} options={getLocationOptions('region_id')} onChange={handleChange} disabled={isLocationFieldDisabled('region_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="zone_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Zone" name="zone_id" value={form.zone_id} options={getLocationOptions('zone_id')} onChange={handleChange} disabled={isLocationFieldDisabled('zone_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="vidhan_sabha_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Vidhan Sabha" name="vidhan_sabha_id" value={form.vidhan_sabha_id} options={getLocationOptions('vidhan_sabha_id')} onChange={handleChange} disabled={isLocationFieldDisabled('vidhan_sabha_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="taluka_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Taluka" name="taluka_id" value={form.taluka_id} options={getLocationOptions('taluka_id')} onChange={handleChange} disabled={isLocationFieldDisabled('taluka_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="block_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Block" name="block_id" value={form.block_id} options={getLocationOptions('block_id')} onChange={handleChange} disabled={isLocationFieldDisabled('block_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="circle_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Panchayat Samiti Circle" name="circle_id" value={form.circle_id} options={getLocationOptions('circle_id')} onChange={handleChange} disabled={isLocationFieldDisabled('circle_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="gram_panchayat_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Gram Panchayat" name="gram_panchayat_id" value={form.gram_panchayat_id} options={getLocationOptions('gram_panchayat_id')} onChange={handleChange} disabled={isLocationFieldDisabled('gram_panchayat_id', form)} />
            </FieldWithError>
            <FieldWithError fieldName="village_id" fieldErrors={fieldErrors} styles={styles}>
              <SelectField label="Village" name="village_id" value={form.village_id} options={getLocationOptions('village_id')} onChange={handleChange} disabled={isLocationFieldDisabled('village_id', form)} />
            </FieldWithError>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Personal Info</legend>
          <div style={styles.grid4}>
            <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label="Middle Name" name="middle_name" value={form.middle_name || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple label="Blood Group" name="blood_group" value={form.blood_group || ''} onChange={handleTextChange} options={BLOOD_GROUPS} />
            </FieldWithError>
            <FieldWithError fieldName="caste" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple label="Caste" name="caste" value={form.caste || ''} onChange={handleTextChange} options={CASTE_OPTIONS} />
            </FieldWithError>
            <FieldWithError fieldName="education" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Education" name="education" value={form.education || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="occupation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple label="Occupation" name="occupation" value={form.occupation || ''} onChange={handleTextChange} options={OCCUPATION_OPTIONS} />
            </FieldWithError>
            <FieldWithError fieldName="mobile_number" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Mobile Number" name="mobile_number" numericOnly maxLength={10} format="phonePairs" value={form.mobile_number || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label="Phone Number" name="phone_number" numericOnly maxLength={10} format="phonePairs" value={form.phone_number || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="WhatsApp Number" name="whatsapp_number" numericOnly maxLength={10} format="phonePairs" value={form.whatsapp_number || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="pan_card" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="PAN Card" name="pan_card" value={form.pan_card || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FileField label="Aadhaar Card" name="aadhar_card" value={form.aadhar_card} onChange={handleFileChange} />
            <FileField label="Voter ID Card" name="voter_id_path" value={form.voter_id_path} onChange={handleFileChange} />
            <FieldWithError fieldName="pincode" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Pincode" name="pincode" numericOnly value={form.pincode || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FileField label="Photo" name="photo_path" value={form.photo_path} onChange={handleFileChange} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Nominee Info</legend>
          <div style={styles.grid4}>
            <FieldWithError fieldName="nominee_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Nominee Name" name="nominee_name" value={form.nominee_name || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="nominee_relation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple label="Relation" name="nominee_relation" value={form.nominee_relation || ''} onChange={handleTextChange} options={NOMINEE_RELATION_OPTIONS} />
            </FieldWithError>
            <TextField label="Date of Birth" name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="nominee_phone" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Nominee Phone Number" name="nominee_phone" numericOnly maxLength={10} format="phonePairs" value={form.nominee_phone || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldWithError fieldName="nominee_address" fieldErrors={fieldErrors} styles={styles}>
                <TextField label="Nominee Address" name="nominee_address" value={form.nominee_address || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
            </div>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Other Info</legend>
          <div style={styles.grid4}>
            <TextField label="Net Worth (₹)" name="management_net_worth" type="number" value={form.management_net_worth ?? ''} onChange={handleTextChange} placeholder="0" style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label="Baseline Family Net Worth (₹)" name="baseline_family_net_worth" type="number" value={form.baseline_family_net_worth ?? ''} onChange={handleTextChange} placeholder="0" style={styles.fieldWrap} inputStyle={styles.input} />
            <FileField label="Passport" name="passport_path" value={form.passport_path} onChange={handleFileChange} />
            <FileField label="Birth Certificate / School Leaving Certificate (S.L.C)" name="birth_certificate_path" value={form.birth_certificate_path} onChange={handleFileChange} />
            <FileField label="Bank Book or Chequebook Copy" name="bank_book_path" value={form.bank_book_path} onChange={handleFileChange} />
            <FileField label="Income Certificate (Parents)" name="income_certificate_path" value={form.income_certificate_path} onChange={handleFileChange} />
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Password</legend>
          <div style={styles.grid4}>
            <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Password" name="password" type="password" value={form.password || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="confirm_password" fieldErrors={fieldErrors} styles={styles}>
              <TextField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password || ''} onChange={handleTextChange} style={styles.fieldWrap} inputStyle={styles.input} />
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

function SelectField({ label, name, value, options, optionLabel, onChange, disabled }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        value={value != null ? value : ''}
        onChange={(e) => onChange(name)(e)}
        onKeyDown={focusNextOnTab}
        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
        disabled={disabled}
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
      <select value={value || ''} onChange={(e) => onChange(name)(e)} onKeyDown={focusNextOnTab} style={styles.select}>
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
  page: { padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  h1: { margin: 0, fontSize: '1.75rem', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a' },
  subtitle: { margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#555' },
  fieldset: { borderRadius: 6, border: '1px solid #ddd', padding: '1rem 1.25rem', marginBottom: '1rem' },
  legend: { padding: '0 0.5rem', fontWeight: 600, fontSize: '1rem' },
  cascadeHint: { margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#555' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem 1rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem 1rem' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: {
    fontSize: '0.8rem',
    color: '#c53030',
    marginTop: 2,
  },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#333' },
  select: { padding: '0.4rem 0.55rem', borderRadius: 4, border: '1px solid #aaa', background: '#fff', fontSize: '0.85rem' },
  input: { padding: '0.4rem 0.55rem', borderRadius: 4, border: '1px solid #aaa', background: '#fff', fontSize: '0.85rem' },
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
  error: { marginTop: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: 4, border: '1px solid #e0a0a0', background: '#fde8e8', color: '#8B1538' },
  success: { marginTop: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: 4, border: '1px solid #2d8a4e', background: '#e6f6ed', color: '#166534', fontWeight: 500 },
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
