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
// Management: Business Position and Business Category enabled; Sub-Category / Product / Type are disabled.
const BUSINESS_DROPDOWNS = [
  { name: 'business_position_id', label: 'Business Position', table: 'designations' },
  { name: 'business_category_id', label: 'Business Category', table: 'business-categories' },
  { name: 'business_sub_category_id', label: 'Business Sub-Category', table: 'business-sub-categories' },
  { name: 'product_id', label: 'Product', table: 'products' },
  { name: 'business_type_id', label: 'Business Type', table: 'business-types' },
];

const MANAGEMENT_BUSINESS_DISABLED_FIELDS = ['business_sub_category_id', 'product_id', 'business_type_id'];

// Post/Position info fields after Business Position (from पद माहिती section) – numbers only
const BUSINESS_INFO_FIELDS_AFTER_POSITION = [
  { name: 'target_to_fill_farm', label: 'Form filling target', type: 'number' },
  { name: 'target_completed_so_far', label: 'Target completed so far', type: 'number' },
  { name: 'existing_terms_according_to_target', label: 'Current post according to target', type: 'number' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CASTE_OPTIONS = ['ST', 'SC', 'OBC', 'OTHERS'];
const OCCUPATION_OPTIONS = ['Housewife', 'Employed', 'Self-employed', 'Other'];
const NOMINEE_RELATION_OPTIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other'];

// All fields on the form are required except `middle_name` and `phone_number`.
const REQUIRED_FIELDS = [
  // Business information (Management: only Business Position required; Category/Sub-Category/Product/Type disabled)
  { name: 'business_position_id', label: 'Business Position' },

  // Geographic information (country se village tak – parent dependent)
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
  // Password fields (kept in UI but disabled)
  // { name: 'password', label: 'Password' },
  // { name: 'confirm_password', label: 'Confirm Password' },
];

const GEOGRAPHIC_LABELS_MR = {
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
  business_category_id: 'व्यवसाय श्रेणी',
  business_sub_category_id: 'उप-व्यवसाय श्रेणी',
  product_id: 'उत्पादन',
  business_type_id: 'व्यवसाय प्रकार',
  target_to_fill_farm: 'फॉर्म भरण्याचे लक्ष्य',
  target_completed_so_far: 'आतापर्यंत पूर्ण केलेले लक्ष्य',
  existing_terms_according_to_target: 'लक्ष्यानुसार सध्याचे पद',
};

const FINANCIAL_LABELS_MR = {
  work_form_received: 'कार्यालयातून मिळालेले फॉर्म',
  work_form_deposited: 'कार्यालयात जमा केलेले फॉर्म',
  receipt_path: 'पावती',
  business_payment_amount: 'व्यवस्थापनास दिलेली एकूण रक्कम (₹)',
  self_contribution_amount: 'स्वतःचा योगदान रक्कम (₹)',
  total_incentive_amount: 'आतापर्यंत मिळालेले मानधन / प्रोत्साहन (₹)',
};

const PERSONAL_LABELS_MR = {
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
  voter_id_path: 'मतदार ओळखपत्र',
  pincode: 'पिनकोड',
  photo_path: 'छायाचित्र',
  email: 'ई-मेल',
};

const NOMINEE_LABELS_MR = {
  nominee_name: 'नामनिर्देशित व्यक्तीचे नाव',
  nominee_relation: 'नामनिर्देशित व्यक्तीशी नाते',
  nominee_dob: 'नामनिर्देशित व्यक्तीची जन्मतारीख',
  nominee_phone: 'नामनिर्देशित व्यक्तीचा फोन क्रमांक',
  nominee_address: 'नामनिर्देशित व्यक्तीचा पत्ता',
};

function FieldWithError({ fieldName, fieldErrors, styles, children }) {
  return (
    <div style={styles.fieldWithError}>
      {children}
      {fieldErrors[fieldName] && <div style={styles.fieldError}>{fieldErrors[fieldName]}</div>}
    </div>
  );
}

export default function ManagementRegistrationPage({ title, lang = 'en' }) {
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
      new Set([...BUSINESS_DROPDOWNS, ...GEOGRAPHIC_FIELDS].map((f) => f.table).filter(Boolean))
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
    const value = name === 'vidhan_sabha_type' ? (v || null) : (v ? Number(v) : null);
    if (LOCATION_ORDER.includes(name)) {
      setForm((prev) => clearDependentsOnChange(prev, name, value));
      return;
    }

    // When Business Position request changes → set fixed Form filling target
    if (name === 'business_position_id') {
      const list = getBusinessOptions('business_position_id') || getOptions('designations') || [];
      const selected = list.find((opt) => Number(opt.id) === Number(value));
      const rawLabel = String(
        selected?.code || selected?.short_name || selected?.name || ''
      )
        .toUpperCase()
        .trim();

      const getTargetForCode = (code) => {
        switch (code) {
          case 'UGL':
            return 30;
          case 'PD':
            return 150;
          case 'FD':
            return 150;
          case 'ED':
            return 300;
          case 'AMD':
            return 600;
          default:
            return null;
        }
      };

      let code = null;
      if (rawLabel.includes('UGL')) code = 'UGL';
      else if (rawLabel.includes('PD')) code = 'PD';
      else if (rawLabel.includes('FD')) code = 'FD';
      else if (rawLabel.includes('ED')) code = 'ED';
      else if (rawLabel.includes('AMD')) code = 'AMD';

      // Special positions (LD, PF, CP, GAT ADHYAKSH) always use 30
      const isThirtyBucket =
        rawLabel.includes(' LD') ||
        rawLabel.startsWith('LD') ||
        rawLabel.includes(' PF') ||
        rawLabel.startsWith('PF') ||
        rawLabel.includes(' CP') ||
        rawLabel.startsWith('CP') ||
        rawLabel.includes('GAT ADHYAKSH');

      const target = isThirtyBucket ? 30 : code ? getTargetForCode(code) : null;

      setForm((prev) => ({
        ...prev,
        [name]: value,
        target_to_fill_farm: target != null ? String(target) : prev.target_to_fill_farm,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (name) => (e) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    const raw = e.target.value;

    // Helper: map numeric target → business position code
    const getPositionCodeForTarget = (num) => {
      if (!Number.isFinite(num) || num <= 0) return null;
      if (num <= 30) return 'UGL';          // upto 30
      if (num <= 150) return 'PD';          // 31–150
      if (num <= 300) return 'FD';          // 151–300
      if (num <= 600) return 'ED';          // 301–600
      return 'AMD';                         // >600
    };

    // User should not type into Form filling target (it is driven by Business Position)
    if (name === 'target_to_fill_farm') {
      return;
    }

    setForm((prev) => {
      const next = { ...prev, [name]: raw };

      // When "Target completed so far" changes → auto-set Current post according to target
      if (name === 'target_completed_so_far') {
        let num = Number(raw);
        // Treat anything between 1 and UGL threshold as UGL (30)
        if (Number.isFinite(num) && num > 0 && num < 30) {
          num = 30;
        }
        const code = getPositionCodeForTarget(num);
        if (code) {
          const list = options.designations || [];
          const match =
            list.find(
              (d) =>
                String(d.name || '')
                  .toUpperCase()
                  .trim() === code
            ) ||
            list.find(
              (d) =>
                String(d.code || d.short_name || '')
                  .toUpperCase()
                  .trim() === code
            );
          // Store the human-readable Business Position name in "Current post according to target"
          next.existing_terms_according_to_target = match?.name || code;
        } else {
          next.existing_terms_according_to_target = '';
        }
      }

      return next;
    });
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
    const requiredFields = REQUIRED_FIELDS;
    for (const { name, label } of requiredFields) {
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
      return {
        message: `Please fill all required fields: ${missingLabels.join(', ')}`,
        fieldErrors: fieldErr,
      };
    }
    // Password fields are disabled, so skip password validation
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
        <h1 style={styles.title}>
          {lang === 'mr' ? 'व्यवस्थापन नोंदणी' : 'Management Registration'}
        </h1>
        <p style={styles.subtitle}>
          {lang === 'mr'
            ? 'कृपया व्यवस्थापन नोंदणीसाठी खालील माहिती भरा.'
            : 'Please fill the following details for management registration.'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'व्यवसाय पद विनंती' : 'Business Position request'}
            </legend>
            <div style={styles.grid4}>
              <FieldWithError
                key="business_position_id"
                fieldName="business_position_id"
                fieldErrors={fieldErrors}
                styles={styles}
              >
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    {lang === 'mr' ? 'व्यवसाय पद विनंती' : 'Business Position request'}
                  </label>
                  <select
                    value={form.business_position_id ?? ''}
                    onChange={handleSelectChange('business_position_id')}
                    onKeyDown={focusNextOnTab}
                    style={styles.select}
                  >
                    <option value="">
                      {lang === 'mr'
                        ? 'व्यवसाय पद विनंती निवडा'
                        : 'Select Business Position request'}
                    </option>
                    {(getBusinessOptions('business_position_id') || getOptions('designations') || []).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FieldWithError>
              {BUSINESS_INFO_FIELDS_AFTER_POSITION.map((cfg) => (
                <FieldWithError
                  key={cfg.name}
                  fieldName={cfg.name}
                  fieldErrors={fieldErrors}
                  styles={styles}
                >
                  {cfg.name === 'target_to_fill_farm' ? (
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr'
                          ? BUSINESS_LABELS_MR.target_to_fill_farm
                          : cfg.label}
                      </label>
                      <input
                        type="text"
                        name={cfg.name}
                        value={form[cfg.name] ?? ''}
                        readOnly
                        style={{ ...styles.input, background: '#f9fafb', cursor: 'default' }}
                        placeholder={
                          lang === 'mr'
                            ? 'व्यवसाय पद विनंतीवरून स्वयंचलित'
                            : 'Auto from Business Position request'
                        }
                      />
                    </div>
                  ) : cfg.name === 'existing_terms_according_to_target' ? (
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr'
                          ? BUSINESS_LABELS_MR.existing_terms_according_to_target
                          : cfg.label}
                      </label>
                      <input
                        type="text"
                        name={cfg.name}
                        value={form[cfg.name] ?? ''}
                        readOnly
                        style={{ ...styles.input, background: '#f9fafb', cursor: 'default' }}
                        placeholder={
                          lang === 'mr' ? 'स्वयंचलित गणना' : 'Auto calculated'
                        }
                      />
                    </div>
                  ) : (
                    <TextField
                      label={
                        lang === 'mr'
                          ? BUSINESS_LABELS_MR[cfg.name] || cfg.label
                          : cfg.label
                      }
                      name={cfg.name}
                      type="number"
                      value={form[cfg.name] ?? ''}
                      onChange={handleTextChange}
                      style={styles.fieldWrap}
                      inputStyle={styles.input}
                    />
                  )}
                </FieldWithError>
              ))}
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'व्यवसायाची माहिती' : 'Business Information'}
            </legend>
            <div style={styles.grid4}>
              {/* Enabled Business Category */}
              <FieldWithError
                key="business_category_id"
                fieldName="business_category_id"
                fieldErrors={fieldErrors}
                styles={styles}
              >
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    {lang === 'mr' ? 'व्यवसाय श्रेणी' : 'Business Category'}
                  </label>
                  <select
                    value={form.business_category_id ?? ''}
                    onChange={handleSelectChange('business_category_id')}
                    onKeyDown={focusNextOnTab}
                    style={styles.select}
                  >
                    <option value="">
                      {lang === 'mr'
                        ? 'व्यवसाय श्रेणी निवडा'
                        : 'Select Business Category'}
                    </option>
                    {(getBusinessOptions('business_category_id') || getOptions('business-categories') || []).map(
                      (opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </FieldWithError>

              {/* Disabled Sub-Category / Product / Type */}
              {BUSINESS_DROPDOWNS.filter((cfg) =>
                MANAGEMENT_BUSINESS_DISABLED_FIELDS.includes(cfg.name)
              ).map((cfg) => {
                const opts = getBusinessOptions(cfg.name) || getOptions(cfg.table);
                return (
                  <FieldWithError
                    key={cfg.name}
                    fieldName={cfg.name}
                    fieldErrors={fieldErrors}
                    styles={styles}
                  >
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>
                        {lang === 'mr'
                          ? BUSINESS_LABELS_MR[cfg.name] || cfg.label
                          : cfg.label}
                      </label>
                      <select
                        value={form[cfg.name] ?? ''}
                        onChange={handleSelectChange(cfg.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: 0.7 }}
                        disabled
                        >
                        <option value="">
                          {lang === 'mr'
                            ? `Select ${BUSINESS_LABELS_MR[cfg.name] || cfg.label}`
                            : `Select ${cfg.label}`}
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
            <div style={styles.grid3}>
              {GEOGRAPHIC_FIELDS.map((cfg) => {
                const geoLabelMr = GEOGRAPHIC_LABELS_MR[cfg.name] || cfg.label;
                if (cfg.name === 'vidhan_sabha_type') {
                  const disabled = isLocationFieldDisabled('vidhan_sabha_type', form);
                  const typeOptions = getVidhanSabhaTypeOptionsForZone(form.zone_id, options['vidhan-sabhas'] || []);
                  return (
                    <FieldWithError
                      key={cfg.name}
                      fieldName={cfg.name}
                      fieldErrors={fieldErrors}
                      styles={styles}
                    >
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>
                          {lang === 'mr' ? geoLabelMr : cfg.label}
                        </label>
                        <select
                          value={form.vidhan_sabha_type ?? ''}
                          onChange={handleSelectChange('vidhan_sabha_type')}
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
                        <label style={styles.label}>
                          {lang === 'mr' ? geoLabelMr : cfg.label}
                        </label>
                      <select
                        value={form[cfg.name] ?? ''}
                        onChange={handleSelectChange(cfg.name)}
                        onKeyDown={focusNextOnTab}
                        style={{ ...styles.select, opacity: disabled ? 0.7 : 1 }}
                        disabled={disabled}
                      >
                          <option value="">
                            {lang === 'mr'
                              ? `Select ${geoLabelMr}`
                              : `Select ${cfg.label}`}
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
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              {lang === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Information'}
            </legend>
            <div style={styles.grid3}>
              <FieldWithError fieldName="first_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.first_name : 'First Name'}
                  name="first_name"
                  value={form.first_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <TextField
                label={lang === 'mr' ? PERSONAL_LABELS_MR.middle_name : 'Middle Name'}
                name="middle_name"
                value={form.middle_name || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="last_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.last_name : 'Last Name'}
                  name="last_name"
                  value={form.last_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="date_of_birth" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.date_of_birth : 'Date of Birth'}
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
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.blood_group : 'Blood Group'}
                  name="blood_group"
                  value={form.blood_group || ''}
                  onChange={handleTextChange}
                  options={BLOOD_GROUPS}
                />
              </FieldWithError>
              <FieldWithError fieldName="caste" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.caste : 'Caste'}
                  name="caste"
                  value={form.caste || ''}
                  onChange={handleTextChange}
                  options={CASTE_OPTIONS}
                />
              </FieldWithError>
              <FieldWithError fieldName="education" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.education : 'Education'}
                  name="education"
                  value={form.education || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="occupation" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.occupation : 'Occupation'}
                  name="occupation"
                  value={form.occupation || ''}
                  onChange={handleTextChange}
                  options={OCCUPATION_OPTIONS}
                />
              </FieldWithError>
              <TextField
                label={lang === 'mr' ? PERSONAL_LABELS_MR.business : 'Business'}
                name="business"
                value={form.business || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="mobile_number" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.mobile_number : 'Mobile Number'}
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
                label={lang === 'mr' ? PERSONAL_LABELS_MR.phone_number : 'Phone Number'}
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
                label={lang === 'mr' ? PERSONAL_LABELS_MR.whatsapp_number : 'WhatsApp Number'}
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
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.pan_card : 'PAN Card'}
                  name="pan_card"
                  value={form.pan_card || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="aadhar_card" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.aadhar_card : 'Aadhaar Card'}
                  name="aadhar_card"
                  numericOnly
                  format="groups4"
                  value={form.aadhar_card || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FileField
                label={lang === 'mr' ? PERSONAL_LABELS_MR.voter_id_path : 'Voter ID Card'}
                name="voter_id_path"
                value={form.voter_id_path}
                onChange={handleFileChange}
              />
              <FieldWithError fieldName="pincode" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? PERSONAL_LABELS_MR.pincode : 'Pincode'}
                  name="pincode"
                  numericOnly
                  value={form.pincode || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FileField
                label={lang === 'mr' ? PERSONAL_LABELS_MR.photo_path : 'Photo'}
                name="photo_path"
                value={form.photo_path}
                onChange={handleFileChange}
              />
              <TextField
                label={lang === 'mr' ? PERSONAL_LABELS_MR.email : 'Email'}
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
            <legend style={styles.legend}>
              {lang === 'mr' ? 'नामनिर्देशित व्यक्तीची माहिती' : 'Nominee Info'}
            </legend>
            <div style={styles.grid3}>
              <FieldWithError fieldName="nominee_name" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_name : 'Nominee Name'}
                  name="nominee_name"
                  value={form.nominee_name || ''}
                  onChange={handleTextChange}
                  style={styles.fieldWrap}
                  inputStyle={styles.input}
                />
              </FieldWithError>
              <FieldWithError fieldName="nominee_relation" fieldErrors={fieldErrors} styles={styles}>
                <SelectSimple
                  label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_relation : 'Nominee Relation'}
                  name="nominee_relation"
                  value={form.nominee_relation || ''}
                  onChange={handleTextChange}
                  options={NOMINEE_RELATION_OPTIONS}
                />
              </FieldWithError>
              <TextField
                label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_dob : 'Nominee Date of Birth'}
                name="nominee_dob"
                type="date"
                value={form.nominee_dob || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FieldWithError fieldName="nominee_phone" fieldErrors={fieldErrors} styles={styles}>
                <TextField
                  label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_phone : 'Nominee Phone Number'}
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
                  label={lang === 'mr' ? NOMINEE_LABELS_MR.nominee_address : 'Nominee Address'}
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
            <legend style={styles.legend}>
              {lang === 'mr' ? 'आर्थिक माहिती' : 'Financial Information'}
            </legend>
            <div style={styles.grid3}>
              <TextField
                label={
                  lang === 'mr'
                    ? FINANCIAL_LABELS_MR.work_form_received
                    : 'Forms received from office'
                }
                name="work_form_received"
                value={form.work_form_received || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? FINANCIAL_LABELS_MR.work_form_deposited
                    : 'Forms submitted to office'
                }
                name="work_form_deposited"
                value={form.work_form_deposited || ''}
                onChange={handleTextChange}
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <FileField
                label={
                  lang === 'mr' ? FINANCIAL_LABELS_MR.receipt_path : 'Receipt'
                }
                name="receipt_path"
                value={form.receipt_path}
                onChange={handleFileChange}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? FINANCIAL_LABELS_MR.business_payment_amount
                    : 'Total payment given to management (₹)'
                }
                name="business_payment_amount"
                type="number"
                value={form.business_payment_amount ?? ''}
                onChange={handleTextChange}
                placeholder="0"
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? FINANCIAL_LABELS_MR.self_contribution_amount
                    : 'Self contribution amount (₹)'
                }
                name="self_contribution_amount"
                type="number"
                value={form.self_contribution_amount ?? ''}
                onChange={handleTextChange}
                placeholder="0"
                style={styles.fieldWrap}
                inputStyle={styles.input}
              />
              <TextField
                label={
                  lang === 'mr'
                    ? FINANCIAL_LABELS_MR.total_incentive_amount
                    : 'Incentive / honorarium received so far (₹)'
                }
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
  page: { padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center', background: '#fff4e0' },
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
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.75rem 1rem',
    marginTop: '0.75rem',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWithError: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldError: { fontSize: '0.8rem', color: '#c53030', marginTop: 2 },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#333' },
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

