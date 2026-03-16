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

function formatGroupsOf4(digits) {
  if (!digits) return '';
  const clean = digitsOnly(digits);
  if (clean.length <= 10) return clean;
  const chunks = [];
  for (let i = 0; i < clean.length; i += 4) {
    chunks.push(clean.slice(i, i + 4));
  }
  return chunks.join('-');
}

function formatPhonePairs(digits) {
  if (!digits) return '';
  const clean = digitsOnly(digits).slice(0, 10);
  const chunks = [];
  for (let i = 0; i < clean.length; i += 2) {
    chunks.push(clean.slice(i, i + 2));
  }
  return chunks.join('-');
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
  maxLength,
  format,
}) {
  const isDecimal = type === 'number';

  const handleChange = (e) => {
    const raw = e.target.value;
    if (type === 'number' || numericOnly) {
      let filtered = isDecimal ? decimalOnly(raw) : digitsOnly(raw);
      if (typeof maxLength === 'number' && maxLength > 0) {
        filtered = filtered.slice(0, maxLength);
      }
      const synthetic = { target: { name, value: filtered } };
      onChange(name)(synthetic);
      return;
    }
    onChange(name)(e);
  };

  const inputType = type === 'number' ? 'text' : type;
  const inputMode = type === 'number' ? 'decimal' : numericOnly ? 'numeric' : undefined;

  let displayValue = value;
  if (numericOnly && typeof value === 'string') {
    if (format === 'phonePairs') {
      displayValue = formatPhonePairs(value);
    } else if (format === 'groups4') {
      displayValue = formatGroupsOf4(value);
    } else {
      displayValue = digitsOnly(value);
    }
  }
  // Ensure input is always controlled with a string (avoids undefined/null issues)
  const safeValue = displayValue != null ? String(displayValue) : '';

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>{label}</label>}
      <input
        type={inputType}
        name={name}
        value={safeValue}
        onChange={handleChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{ padding: 0, ...inputStyle }}
      />
    </div>
  );
}

function handleInputKeyDown(e) {
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
