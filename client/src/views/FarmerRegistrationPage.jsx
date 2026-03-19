import React, { useEffect, useState } from 'react';
import { masterApi, registrationsApi, filesApi } from '../services/api';
import TextField from '../components/TextField';
import {
  LOCATION_ORDER,
  LOCATION_FIELD_TABLE,
  GEOGRAPHIC_FIELDS,
  getFilteredLocationOptions,
  isLocationFieldDisabled,
  clearDependentsOnChange,
  getVidhanSabhaTypeOptionsForZone,
} from '../config/locationCascade';
// Farmer: only Business Category enabled; Position, Sub-Category, Product, Business Type disabled.
const businessFieldConfig = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Products', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

const FARMER_BUSINESS_DISABLED_FIELDS = ['business_position_id', 'business_sub_category_id', 'product_id', 'business_type_id'];
const BUSINESS_LABELS_MR = {
  business_position_id: 'व्यवसाय पद',
  business_category_id: 'व्यवसाय श्रेणी',
  business_sub_category_id: 'उप-व्यवसाय श्रेणी',
  product_id: 'उत्पादन',
  business_type_id: 'व्यवसाय प्रकार',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];
const EDUCATION_OPTIONS = ['Illiterate', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Other'];
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];

// All fields on the form are required except `middle_name` and `phone_number`.
const REQUIRED_FIELDS = [
  // Business information (Farmer: only Business Category required)
  { name: 'business_category_id', label: 'Business Category' },

  // Geographic information
  { name: 'country_id', label: 'Country' },
  { name: 'country_division_id', label: 'Country Division' },
  { name: 'state_id', label: 'State' },
  { name: 'state_circle_id', label: 'State Circle' },
  { name: 'state_division_id', label: 'State Division' },
  { name: 'state_sub_division_id', label: 'State Sub Division' },
  { name: 'region_id', label: 'Region' },
  { name: 'zone_id', label: 'Zone' },
  { name: 'vidhan_sabha_type', label: 'Vidhan Sabha types' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha' },
  { name: 'taluka_id', label: 'Taluka' },
  { name: 'block_id', label: 'Block' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat' },
  { name: 'village_id', label: 'Village' },
  { name: 'ward', label: 'Ward / Area' },
  { name: 'police_station', label: 'Police Station / Inquiry' },

  // Farmer information
  { name: 'first_name', label: 'First Name' },
  // middle_name is intentionally NOT required
  { name: 'last_name', label: 'Last Name' },
  { name: 'father_name', label: "Father's Name" },
  { name: 'date_of_birth', label: 'Date of Birth' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'gender', label: 'Gender' },
  { name: 'education', label: 'Education' },
  { name: 'whatsapp_number', label: 'WhatsApp Number' },
  { name: 'mobile_number', label: 'Mobile Number' },
  { name: 'pan_card_path', label: 'PAN Card' },
  { name: 'election_card_path', label: 'Election Card' },
  { name: 'aadhar_card_path', label: 'Aadhaar Card' },
  { name: 'email', label: 'Email' },
  { name: 'registration_date', label: 'Date of Registration' },
  { name: 'password', label: 'Password' },
  { name: 'confirm_password', label: 'Confirm Password' },
  { name: 'ration_card_path', label: 'Ration Card' },
  { name: 'address', label: 'Address' },

  // Nominee information
  { name: 'nominee_name', label: 'Nominee Name' },
  { name: 'nominee_relation', label: 'Nominee Relation' },
  { name: 'nominee_dob', label: 'Nominee Date of Birth' },
  { name: 'nominee_phone', label: "Nominee's Mobile Number" },
  { name: 'nominee_aadhar_path', label: "Nominee's Aadhaar Card" },

  // Bank information
  { name: 'bank_name', label: 'Bank Name' },
  { name: 'ifsc_code', label: 'IFSC Code' },
  { name: 'bank_account_number', label: 'Account Number' },
  { name: 'pincode', label: 'Pincode' },
];

const GEO_LABELS_MR = {
  country_id: 'देश',
  country_division_id: 'देश विभाग',
  state_id: 'राज्य',
  state_circle_id: 'राज्य सर्कल',
  state_division_id: 'राज्य विभाग',
  state_sub_division_id: 'राज्य उपविभाग',
  region_id: 'प्रदेश',
  zone_id: 'झोन',
  vidhan_sabha_type: 'विधानसभेचे प्रकार',
  vidhan_sabha_id: 'विधानसभा',
  taluka_id: 'तालुका',
  block_id: 'ब्लॉक',
  circle_id: 'पंचायत समिती सर्कल',
  gram_panchayat_id: 'ग्रामपंचायत',
  village_id: 'गाव',
  ward: 'वॉर्ड / क्षेत्र',
  police_station: 'पोलीस स्टेशन / चौकशी',
};

const FARMER_LABELS_MR = {
  first_name: 'पहिले नाव',
  middle_name: 'वडिलांचे नाव',
  last_name: 'आडनाव',
  father_name: 'वडिलांचे पूर्ण नाव',
  date_of_birth: 'जन्मतारीख',
  blood_group: 'रक्त गट',
  gender: 'लिंग',
  education: 'शिक्षण',
  whatsapp_number: 'व्हॉट्सअ‍ॅप क्रमांक',
  mobile_number: 'मोबाईल क्रमांक',
  pan_card_path: 'पॅन कार्ड',
  election_card_path: 'मतदार ओळखपत्र',
  aadhar_card_path: 'आधार कार्ड',
  email: 'ई-मेल',
  registration_date: 'नोंदणीची तारीख',
  password: 'संकेतशब्द',
  confirm_password: 'संकेतशब्दाची पुष्टी करा',
  ration_card_path: 'रेशन कार्ड',
  address: 'पत्ता',
};

const NOMINEE_LABELS_MR = {
  nominee_name: 'नामनिर्देशित व्यक्तीचे नाव',
  nominee_relation: 'नामनिर्देशित व्यक्तीशी नाते',
  nominee_dob: 'नामनिर्देशित व्यक्तीची जन्मतारीख',
  nominee_phone: 'नामनिर्देशित व्यक्तीचा मोबाईल क्रमांक',
  nominee_aadhar_path: 'नामनिर्देशित व्यक्तीचा आधार कार्ड',
};

const BANK_LABELS_MR = {
  bank_name: 'बँकेचे नाव',
  ifsc_code: 'IFSC कोड',
  bank_account_number: 'खाते क्रमांक',
  pincode: 'पिनकोड',
};

function FieldWithError({ fieldName, fieldErrors, styles, children }) {
  return (
    <div style={styles.fieldWithError}>
      {children}
      {fieldErrors[fieldName] && <div style={styles.fieldError}>{fieldErrors[fieldName]}</div>}
    </div>
  );
}

export default function FarmerRegistrationPage({ title, lang = 'en' }) {
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
    ...GEOGRAPHIC_FIELDS.map((f) => f.table).filter(Boolean),
    ...businessFieldConfig.map((f) => f.table),
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

  const handleChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleNumChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = name === 'vidhan_sabha_type' ? (v || null) : (v ? Number(v) : null);

    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const clearForm = () => {
    setForm({});
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  const getValidationError = () => {
    const fieldErr = {};
    const requiredFields = REQUIRED_FIELDS;
    for (const { name, label } of requiredFields) {
      const val = form[name];
      const isEmpty = val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '');
      if (isEmpty) {
        fieldErr[name] = `${label} is required`;
      }
    }
    // Email format validation (only if provided)
    if (form.email) {
      const email = String(form.email).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        fieldErr.email = 'Please enter a valid Email address.';
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
      state_circle_id: form.state_circle_id || null,
      state_division_id: form.state_division_id || null,
      state_sub_division_id: form.state_sub_division_id || null,
      region_id: form.region_id || null,
      zone_id: form.zone_id || null,
      vidhan_sabha_id: form.vidhan_sabha_id || null,
      taluka_id: form.taluka_id || null,
      village_id: form.village_id || null,
      block_id: form.block_id || null,
      circle_id: form.circle_id || null,
      gram_panchayat_id: form.gram_panchayat_id || null,
      business_position_id: form.business_position_id || null,
      business_category_id: form.business_category_id || null,
      business_sub_category_id: form.business_sub_category_id || null,
      product_id: form.product_id || null,
      business_type_id: form.business_type_id || null,
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
        <h1 style={styles.title}>
          {lang === 'mr' ? 'शेतकरी नोंदणी' : 'Farmer Registration'}
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'व्यवसायाची माहिती' : 'Business Information'}
            </legend>
            <div style={styles.grid}>
              {businessFieldConfig.map((field) => {
                const opts = getBusinessOptions(field.name);
                const disabled = FARMER_BUSINESS_DISABLED_FIELDS.includes(field.name);
                const labelMr = BUSINESS_LABELS_MR[field.name] || field.label;
                return (
                  <FieldWithError
                    key={field.name}
                    fieldName={field.name}
                    fieldErrors={fieldErrors}
                    styles={styles}
                  >
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr' ? labelMr : field.label}
                      </label>
                      <select
                        value={form[field.name] != null ? form[field.name] : ''}
                        onChange={handleNumChange(field.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                        <option value="">
                          {lang === 'mr'
                            ? `Select ${labelMr}`
                            : `Select ${field.label}`}
                        </option>
                        {(opts || []).map((opt) => (
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
            <legend style={styles.legend}>
              {lang === 'mr' ? 'भौगोलिक माहिती' : 'Geographic Information'}
            </legend>
            <div style={styles.grid}>
              {GEOGRAPHIC_FIELDS.map((field) => {
                const labelMr = GEO_LABELS_MR[field.name] || field.label;
                if (field.name === 'vidhan_sabha_type') {
                  const disabled = isLocationFieldDisabled('vidhan_sabha_type', form);
                  const typeOptions = getVidhanSabhaTypeOptionsForZone(form.zone_id, options['vidhan-sabhas'] || []);
                  return (
                    <FieldWithError key={field.name} fieldName={field.name} fieldErrors={fieldErrors} styles={styles}>
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>
                          {lang === 'mr' ? labelMr : field.label}
                        </label>
                        <select
                          value={form.vidhan_sabha_type != null ? form.vidhan_sabha_type : ''}
                          onChange={handleNumChange('vidhan_sabha_type')}
                          onKeyDown={focusNextOnTab}
                          style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                          disabled={disabled}
                        >
                          <option value="">
                            {lang === 'mr'
                              ? 'विधानसभेचा प्रकार निवडा'
                              : 'Select Vidhan Sabha type'}
                          </option>
                          {typeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </FieldWithError>
                  );
                }
                const isLocation = LOCATION_ORDER.includes(field.name);
                const opts = isLocation ? getFilteredLocationOptions(LOCATION_FIELD_TABLE[field.name] || field.table, form, options) : getOptions(field.table);
                const disabled = isLocation ? isLocationFieldDisabled(field.name, form) : false;
                return (
                  <FieldWithError key={field.name} fieldName={field.name} fieldErrors={fieldErrors} styles={styles}>
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr' ? labelMr : field.label}
                      </label>
                      <select
                        value={form[field.name] != null ? form[field.name] : ''}
                        onChange={handleNumChange(field.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                        <option value="">
                          {lang === 'mr'
                            ? `Select ${labelMr}`
                            : `Select ${field.label}`}
                        </option>
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
              <TextField
                label={lang === 'mr' ? GEO_LABELS_MR.ward : 'Ward / Area'}
                name="ward"
                value={form.ward || ''}
                onChange={handleChange}
                placeholder={lang === 'mr' ? 'वॉर्ड निवडा' : 'Select Ward'}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? GEO_LABELS_MR.police_station
                    : 'Police Station / Inquiry'
                }
                name="police_station"
                value={form.police_station || ''}
                onChange={handleChange}
                placeholder={
                  lang === 'mr' ? 'पोलीस स्टेशन निवडा' : 'Select Police Station'
                }
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'शेतकरी माहिती' : 'Farmer Information'}
            </legend>
            <div style={styles.grid}>
              <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? FARMER_LABELS_MR.first_name : 'First Name'}
                  name="first_name"
                  value={form.first_name || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <TextField
                label={lang === 'mr' ? FARMER_LABELS_MR.middle_name : 'Middle Name'}
                name="middle_name"
                value={form.middle_name || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? FARMER_LABELS_MR.last_name : 'Last Name'}
                  name="last_name"
                  value={form.last_name || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="father_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.father_name
                      : "Father's Name"
                  }
                  name="father_name"
                  value={form.father_name || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.date_of_birth
                      : 'Date of Birth'
                  }
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.blood_group
                      : 'Blood Group'
                  }
                  name="blood_group"
                  value={form.blood_group || ''}
                  onChange={handleChange}
                  options={BLOOD_GROUPS}
                />
              </FieldWithError>
              <FieldWithError fieldName="gender" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label={lang === 'mr' ? FARMER_LABELS_MR.gender : 'Gender'}
                  name="gender"
                  value={form.gender || ''}
                  onChange={handleChange}
                  options={GENDERS}
                />
              </FieldWithError>
              <FileField
                label={
                  lang === 'mr'
                    ? 'छायाचित्र अपलोड करा'
                    : 'Upload Photo'
                }
                name="photo_path"
                value={form.photo_path || ''}
                onChange={handleFileChange}
              />
              <SelectSimple
                label={
                  lang === 'mr'
                    ? FARMER_LABELS_MR.education
                    : 'Education'
                }
                name="education"
                value={form.education || ''}
                onChange={handleChange}
                options={EDUCATION_OPTIONS}
              />
              <FieldWithError fieldName="whatsapp_number" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.whatsapp_number
                      : 'WhatsApp Number'
                  }
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
              <TextField
                label={
                  lang === 'mr'
                    ? FARMER_LABELS_MR.mobile_number
                    : 'Mobile Number'
                }
                name="mobile_number"
                numericOnly
                maxLength={10}
                format="phonePairs"
                value={form.mobile_number || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="pan_card_path" fieldErrors={fieldErrors} styles={styles}>
                <FileField
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.pan_card_path
                      : 'PAN Card'
                  }
                  name="pan_card_path"
                  value={form.pan_card_path || ''}
                  onChange={handleFileChange}
                />
              </FieldWithError>
              <FileField
                label={
                  lang === 'mr'
                    ? FARMER_LABELS_MR.election_card_path
                    : 'Election Card'
                }
                name="election_card_path"
                value={form.election_card_path || ''}
                onChange={handleFileChange}
              />
              <FileField
                label={
                  lang === 'mr'
                    ? FARMER_LABELS_MR.aadhar_card_path
                    : 'Aadhaar Card'
                }
                name="aadhar_card_path"
                value={form.aadhar_card_path || ''}
                onChange={handleFileChange}
              />
              <FieldWithError fieldName="email" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? FARMER_LABELS_MR.email : 'Email'}
                  name="email"
                  type="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <TextField
                label={
                  lang === 'mr'
                    ? FARMER_LABELS_MR.registration_date
                    : 'Date of Registration'
                }
                name="registration_date"
                type="date"
                value={form.registration_date || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="password" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? FARMER_LABELS_MR.password : 'Password'}
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
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.confirm_password
                      : 'Confirm Password'
                  }
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password || ''}
                  onChange={handleChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="ration_card_path" fieldErrors={fieldErrors} styles={styles}>
                <FileField
                  label={
                    lang === 'mr'
                      ? FARMER_LABELS_MR.ration_card_path
                      : 'Ration Card'
                  }
                  name="ration_card_path"
                  value={form.ration_card_path || ''}
                  onChange={handleFileChange}
                />
              </FieldWithError>
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldWithError fieldName="address" fieldErrors={fieldErrors} styles={styles}>
                  <TextField
                    label={
                      lang === 'mr'
                        ? FARMER_LABELS_MR.address
                        : 'Address'
                    }
                    name="address"
                    value={form.address || ''}
                    onChange={handleChange}
                    style={styles.fieldWrap}
                    inputStyle={styles.input}
                  />
                </FieldWithError>
              </div>
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'नामनिर्देशित माहिती' : 'Nominee Information'}
            </legend>
            <div style={styles.grid}>
              <TextField
                label={
                  lang === 'mr'
                    ? NOMINEE_LABELS_MR.nominee_name
                    : 'Nominee Name'
                }
                name="nominee_name"
                value={form.nominee_name || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <SelectSimple
                label={
                  lang === 'mr'
                    ? NOMINEE_LABELS_MR.nominee_relation
                    : 'Nominee Relation'
                }
                name="nominee_relation"
                value={form.nominee_relation || ''}
                onChange={handleChange}
                options={RELATIONS}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? NOMINEE_LABELS_MR.nominee_dob
                    : 'Date of Birth'
                }
                name="nominee_dob"
                type="date"
                value={form.nominee_dob || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? NOMINEE_LABELS_MR.nominee_phone
                    : "Nominee's Mobile Number"
                }
                name="nominee_phone"
                numericOnly
                maxLength={10}
                format="phonePairs"
                value={form.nominee_phone || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FileField
                label={
                  lang === 'mr'
                    ? NOMINEE_LABELS_MR.nominee_aadhar_path
                    : "Nominee's Aadhaar Card"
                }
                name="nominee_aadhar_path"
                value={form.nominee_aadhar_path || ''}
                onChange={handleFileChange}
              />
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'बँक माहिती' : 'Bank Information'}
            </legend>
            <div style={styles.grid}>
              <TextField
                label={
                  lang === 'mr'
                    ? BANK_LABELS_MR.bank_name
                    : 'Bank Name'
                }
                name="bank_name"
                value={form.bank_name || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? BANK_LABELS_MR.ifsc_code
                    : 'IFSC Code'
                }
                name="ifsc_code"
                value={form.ifsc_code || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? BANK_LABELS_MR.bank_account_number
                    : 'Account Number'
                }
                name="bank_account_number"
                numericOnly
                format="groups4"
                value={form.bank_account_number || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? BANK_LABELS_MR.pincode
                    : 'Pincode'
                }
                name="pincode"
                numericOnly
                value={form.pincode || ''}
                onChange={handleChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
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
    padding: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
    background: '#fff4e0',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: '100%',
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    padding: '1rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem 1rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: { fontSize: '0.8rem', color: '#c53030', marginTop: 2 },
  label: { fontSize: '0.85rem', fontWeight: 700, color: '#333' },
  input: {
    padding: '0.65rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.95rem',
    minHeight: 42,
  },
  select: {
    padding: '0.65rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.95rem',
    background: '#fff',
    minWidth: 120,
    minHeight: 42,
  },
  fileName: { fontSize: '0.8rem', color: '#666' },
  buttonRow: {
    marginTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  submit: {
    width: '100%',
    maxWidth: 360,
    padding: '0.75rem 1rem',
    borderRadius: 4,
    border: 'none',
    background: '#15803d',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  secondary: {
    padding: '0.75rem 1rem',
    borderRadius: 4,
    border: '1px solid #999',
    background: '#fff',
    color: '#333',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    maxWidth: 360,
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
