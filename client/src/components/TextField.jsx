import React from 'react';

/**
 * Filters input to digits only (for phone, pincode, aadhar, account number).
 */
function digitsOnly(value) {
  return String(value).replace(/\D/g, '');
}

/**
 * Filters input to digits and at most one decimal point (for currency/amounts).
 */
function decimalOnly(value) {
  const s = String(value).replace(/[^\d.]/g, '');
  const parts = s.split('.');
  if (parts.length <= 1) return s;
  return parts[0] + '.' + parts.slice(1).join('');
}

/**
 * Shared TextField. For number inputs: only numbers allowed.
 * For type="number": digits + one decimal. For numericOnly: digits only. Otherwise: string.
 */
export default function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  numericOnly,
}) {
  const isDecimal = type === 'number';

  const handleChange = (e) => {
    const raw = e.target.value;
    if (type === 'number' || numericOnly) {
      const filtered = isDecimal ? decimalOnly(raw) : digitsOnly(raw);
      const synthetic = { target: { name, value: filtered } };
      onChange(name)(synthetic);
      return;
    }
    onChange(name)(e);
  };

  const inputType = type === 'number' ? 'text' : type;
  const inputMode = type === 'number' ? 'decimal' : numericOnly ? 'numeric' : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>{label}</label>}
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={inputMode}
        style={inputStyle}
      />
    </div>
  );
}
