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
// Lakhpati Didi: Business Category enabled; Business Position, Sub-Category, Product, Business Type disabled.
const businessFieldConfig = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Product', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

const LAKHPATI_BUSINESS_DISABLED_FIELDS = ['business_position_id', 'business_sub_category_id', 'product_id', 'business_type_id'];

// All fields on the form are required except `middle_name` and `phone_number`.
const REQUIRED_FIELDS = [
  // Geographic & business information
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
  { name: 'business_category_id', label: 'Business Category' },

  // User details
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
  { name: 'aadhar_card', label: 'Aadhar Card' },
  { name: 'pincode', label: 'Pincode' },
  { name: 'photo_path', label: 'Photo' },

  // Password
  // Password fields (kept in UI but disabled)
  // { name: 'password', label: 'Password' },
  // { name: 'confirm_password', label: 'Confirm Password' },

  // Nominee details
  { name: 'nominee_name', label: 'Nominee Name' },
  { name: 'nominee_relation', label: 'Nominee Relation' },
  { name: 'nominee_dob', label: 'Nominee DOB' },
  { name: 'nominee_phone', label: 'Nominee Phone Number' },
  { name: 'nominee_address', label: 'Nominee Address' },
];

const USER_LABELS_MR = {
  first_name: 'पहिले नाव',
  middle_name: 'वडिलांचे नाव',
  last_name: 'आडनाव',
  date_of_birth: 'जन्मतारीख',
  blood_group: 'रक्त गट',
  caste: 'जाती',
  education: 'शिक्षण',
  occupation: 'व्यवसाय',
  business: 'उद्योग/धंदा',
  mobile_number: 'मोबाईल क्रमांक',
  phone_number: 'दूरध्वनी क्रमांक',
  whatsapp_number: 'व्हॉट्सअ‍ॅप क्रमांक',
  pan_card: 'पॅन कार्ड',
  aadhar_card: 'आधार कार्ड',
  pincode: 'पिनकोड',
  photo_path: 'छायाचित्र',
};

const NOMINEE_LABELS_MR = {
  nominee_name: 'नामनिर्देशित व्यक्तीचे नाव',
  nominee_relation: 'नामनिर्देशित व्यक्तीशी नाते',
  nominee_dob: 'नामनिर्देशित व्यक्तीची जन्मतारीख',
  nominee_phone: 'नामनिर्देशित व्यक्तीचा फोन क्रमांक',
  nominee_address: 'नामनिर्देशित पत्ता',
};

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
};

const BUSINESS_LABELS_MR = {
  business_position_id: 'व्यवसाय पद',
  business_category_id: 'व्यवसाय श्रेणी',
  business_sub_category_id: 'उप-व्यवसाय श्रेणी',
  product_id: 'उत्पादन',
  business_type_id: 'व्यवसाय प्रकार',
};

function FieldWithError({ fieldName, fieldErrors, styles, children }) {
  return (
    <div style={styles.fieldWithError}>
      {children}
      {fieldErrors[fieldName] && <div style={styles.fieldError}>{fieldErrors[fieldName]}</div>}
    </div>
  );
}

export default function LakhpatiDidiRegistrationPage({ title, lang = 'en' }) {
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
      new Set([...GEOGRAPHIC_FIELDS, ...businessFieldConfig].map((f) => f.table).filter(Boolean))
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

  const handleChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    const value = name === 'vidhan_sabha_type' ? (v || null) : (v ? Number(v) : null);
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handlePhotoChange = async (e) => {
    if (fieldErrors.photo_path) setFieldErrors((prev) => ({ ...prev, photo_path: undefined }));
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, photo_path: '' }));
      return;
    }
    try {
      const res = await filesApi.upload(file);
      if (res && res.success && res.path) {
        setForm((prev) => ({ ...prev, photo_path: res.path }));
      } else {
        setForm((prev) => ({ ...prev, photo_path: file.name }));
      }
    } catch {
      setForm((prev) => ({ ...prev, photo_path: file.name }));
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
    const requiredFields = REQUIRED_FIELDS;
    for (const { name, label } of requiredFields) {
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
    // Password fields are disabled, so skip password validation
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
      state_circle_id: form.state_circle_id ?? null,
      state_division_id: form.state_division_id ?? null,
      state_sub_division_id: form.state_sub_division_id ?? null,
      region_id: form.region_id ?? null,
      zone_id: form.zone_id ?? null,
      vidhan_sabha_id: form.vidhan_sabha_id ?? null,
      taluka_id: form.taluka_id ?? null,
      block_id: form.block_id ?? null,
      circle_id: form.circle_id ?? null,
      gram_panchayat_id: form.gram_panchayat_id ?? null,
      village_id: form.village_id ?? null,
      business_position_id: form.business_position_id ?? null,
      business_category_id: form.business_category_id ?? null,
      business_sub_category_id: form.business_sub_category_id ?? null,
      product_id: form.product_id ?? null,
      business_type_id: form.business_type_id ?? null,
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {lang === 'mr' ? 'लखपती दीदी नोंदणी' : 'Lakhpati Didi Registration'}
        </h1>
        <form onSubmit={handleSubmit} style={styles.form}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            {lang === 'mr' ? 'व्यवसायाची माहिती' : 'Business Information'}
          </legend>
          <div style={styles.userGrid4}>
            {businessFieldConfig.map((field) => {
              const opts = getBusinessOptions(field.name);
              const disabled = LAKHPATI_BUSINESS_DISABLED_FIELDS.includes(field.name);
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
                      onChange={handleChange(field.name)}
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
              const geoLabelMr = GEO_LABELS_MR[field.name] || field.label;
              if (field.name === 'vidhan_sabha_type') {
                const disabled = isLocationFieldDisabled('vidhan_sabha_type', form);
                const typeOptions = getVidhanSabhaTypeOptionsForZone(form.zone_id, options['vidhan-sabhas'] || []);
                return (
                  <div key={field.name} style={styles.fieldWithError}>
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr' ? geoLabelMr : field.label}
                      </label>
                      <select
                        value={form.vidhan_sabha_type != null ? form.vidhan_sabha_type : ''}
                        onChange={handleChange('vidhan_sabha_type')}
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
                    {fieldErrors[field.name] && (
                      <div style={styles.fieldError}>{fieldErrors[field.name]}</div>
                    )}
                  </div>
                );
              }
              const isLocation = LOCATION_FIELD_TABLE[field.name];
              const opts = isLocation
                ? getFilteredLocationOptions(LOCATION_FIELD_TABLE[field.name], form, options)
                : getOptions(field.table);
              const disabled = isLocation ? isLocationFieldDisabled(field.name, form) : false;
              return (
                <div key={field.name} style={styles.fieldWithError}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>
                      {lang === 'mr' ? geoLabelMr : field.label}
                    </label>
                    <select
                      value={form[field.name] != null ? form[field.name] : ''}
                      onChange={handleChange(field.name)}
                      onKeyDown={focusNextOnTab}
                      style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                      disabled={disabled}
                    >
                      <option value="">
                        {lang === 'mr'
                          ? `Select ${geoLabelMr}`
                          : `Select ${field.label}`}
                      </option>
                      {opts.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors[field.name] && (
                    <div style={styles.fieldError}>{fieldErrors[field.name]}</div>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            {lang === 'mr' ? 'वापरकर्त्याची माहिती' : 'User Details'}
          </legend>
          <div style={styles.userGrid4}>
            <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.first_name : 'First Name'} name="first_name" value={form.first_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label={lang === 'mr' ? USER_LABELS_MR.middle_name : 'Middle Name'} name="middle_name" value={form.middle_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.last_name : 'Last Name'} name="last_name" value={form.last_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.date_of_birth : 'Date of Birth'} name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>

            <FieldWithError fieldName="blood_group" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label={lang === 'mr' ? USER_LABELS_MR.blood_group : 'Blood Group'}
                name="blood_group"
                value={form.blood_group || ''}
                onChange={handleUserChange}
                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
              />
            </FieldWithError>
            <FieldWithError fieldName="caste" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label={lang === 'mr' ? USER_LABELS_MR.caste : 'Caste'}
                name="caste"
                value={form.caste || ''}
                onChange={handleUserChange}
                options={['ST', 'SC', 'OBC', 'OTHERS']}
              />
            </FieldWithError>
            <FieldWithError fieldName="education" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.education : 'Education'} name="education" value={form.education || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="occupation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label={lang === 'mr' ? USER_LABELS_MR.occupation : 'Occupation'}
                name="occupation"
                value={form.occupation || ''}
                onChange={handleUserChange}
                options={['Housewife', 'Employed', 'Self-employed']}
              />
            </FieldWithError>

            <TextField label={lang === 'mr' ? USER_LABELS_MR.business : 'Business'} name="business" value={form.business || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="mobile_number" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.mobile_number : 'Mobile Number'} name="mobile_number" numericOnly maxLength={10} format="phonePairs" value={form.mobile_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <TextField label={lang === 'mr' ? USER_LABELS_MR.phone_number : 'Phone Number'} name="phone_number" numericOnly maxLength={10} format="phonePairs" value={form.phone_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <TextField label={lang === 'mr' ? USER_LABELS_MR.whatsapp_number : 'WhatsApp Number'} name="whatsapp_number" numericOnly maxLength={10} format="phonePairs" value={form.whatsapp_number || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />

            <FieldWithError fieldName="pan_card" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.pan_card : 'PAN Card'} name="pan_card" value={form.pan_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="aadhar_card" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.aadhar_card : 'Aadhar Card'} name="aadhar_card" numericOnly format="groups4" value={form.aadhar_card || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="pincode" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? USER_LABELS_MR.pincode : 'Pincode'} name="pincode" numericOnly value={form.pincode || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>{lang === 'mr' ? USER_LABELS_MR.photo_path : 'Photo'}</label>
              <input
                type="file"
                name="photo"
                accept="image/*,.pdf"
                key={`file-photo_path-${form.photo_path || 'none'}`}
                style={styles.input}
                onChange={handlePhotoChange}
              />
              {form.photo_path && (
                <span style={styles.fileName}>
                  {form.photo_path.split('/').pop() || form.photo_path}
                </span>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            {lang === 'mr' ? 'नामनिर्देशित व्यक्तीची माहिती' : 'Nominee Details'}
          </legend>
          <div style={styles.userGrid4}>
            <FieldWithError fieldName="nominee_name" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_name : 'Nominee Name'} name="nominee_name" value={form.nominee_name || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <FieldWithError fieldName="nominee_relation" fieldErrors={fieldErrors} styles={styles}>
              <SelectSimple
                label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_relation : 'Nominee Relation'}
                name="nominee_relation"
                value={form.nominee_relation || ''}
                onChange={handleUserChange}
                options={['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other']}
              />
            </FieldWithError>
            <TextField label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_dob : 'Nominee DOB'} name="nominee_dob" type="date" value={form.nominee_dob || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            <FieldWithError fieldName="nominee_phone" fieldErrors={fieldErrors} styles={styles}>
              <TextField label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_phone : 'Nominee Phone Number'} name="nominee_phone" numericOnly maxLength={10} format="phonePairs" value={form.nominee_phone || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
            </FieldWithError>
            <div style={{ gridColumn: '1 / span 4' }}>
              <FieldWithError fieldName="nominee_address" fieldErrors={fieldErrors} styles={styles}>
                <TextField label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_address : 'Nominee Address'} name="nominee_address" value={form.nominee_address || ''} onChange={handleUserChange} style={styles.fieldWrap} inputStyle={styles.input} />
              </FieldWithError>
            </div>
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Password</legend>
          <div style={styles.userGrid4}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value=""
                disabled
                style={{ ...styles.input, background: '#f3f4f6', cursor: 'not-allowed', opacity: 0.7 }}
                placeholder="Disabled"
              />
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value=""
                disabled
                style={{ ...styles.input, background: '#f3f4f6', cursor: 'not-allowed', opacity: 0.7 }}
                placeholder="Disabled"
              />
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
  page: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    background: '#fff4e0',
  },
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
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldset: {
    borderRadius: 6,
    border: '1px solid #e0a0a0',
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
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#333' },
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

