/**
 * Location dropdown cascade: when user selects State (e.g. Nepal), next dropdowns
 * show only options for that state (divisions, zones, vidhan sabha, etc.).
 * Each dropdown is enabled only when its parent(s) are selected.
 */

export const LOCATION_ORDER = [
  'country_id',
  'country_division_id',
  'state_id',
  'state_division_id',
  'state_sub_division_id',
  'region_id',
  'zone_id',
  'vidhan_sabha_id',
  'taluka_id',
  'block_id',
  'circle_id',
  'gram_panchayat_id',
  'village_id',
];

/** When this field changes, clear these dependent fields (and their dependents). */
export const DEPENDENTS = {
  country_id: ['country_division_id', 'state_id', 'state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  country_division_id: ['state_id', 'state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_id: ['state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_division_id: ['state_sub_division_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_sub_division_id: ['zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  region_id: ['zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  zone_id: ['vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  vidhan_sabha_id: ['taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  taluka_id: ['block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  block_id: ['circle_id', 'gram_panchayat_id', 'village_id'],
  circle_id: ['gram_panchayat_id', 'village_id'],
  gram_panchayat_id: ['village_id'],
  village_id: [],
};

/**
 * Table (API name) to parent form field(s) for filtering.
 * Options are filtered by option[parentKey] === form[parentField].
 */
const TABLE_FILTER = {
  'countries': [],
  'country-divisions': [{ parent: 'country_id', key: 'country_id' }],
  'states': [{ parent: 'country_id', key: 'country_id' }, { parent: 'country_division_id', key: 'country_division_id' }],
  'state-divisions': [{ parent: 'state_id', key: 'state_id' }],
  'state-sub-divisions': [{ parent: 'state_division_id', key: 'state_division_id' }],
  'state_sub_divisions': [{ parent: 'state_division_id', key: 'state_division_id' }],
  'regions': [{ parent: 'state_id', key: 'state_id' }],
  'zones': [{ parent: 'state_id', key: 'state_id' }],
  'vidhan-sabhas': [{ parent: 'state_id', key: 'state_id' }, { parent: 'zone_id', key: 'zone_id' }],
  // For talukas we only require state_id so forms like Farmer Registration
  // (which do not have vidhan_sabha_id) can still filter by state (e.g. Nepal).
  'talukas': [{ parent: 'state_id', key: 'state_id' }],
  'blocks': [{ parent: 'taluka_id', key: 'taluka_id' }],
  'circles': [{ parent: 'state_id', key: 'state_id' }, { parent: 'taluka_id', key: 'taluka_id' }],
  // For gram panchayats in Farmer Registration we only require taluka_id,
  // so Panchayat options appear immediately after selecting Taluka.
  'gram-panchayats': [{ parent: 'taluka_id', key: 'taluka_id' }],
  'villages': [{ parent: 'taluka_id', key: 'taluka_id' }, { parent: 'gram_panchayat_id', key: 'gram_panchayat_id' }],
};

/**
 * Returns options filtered by current form (parent selections).
 * @param {string} table - API table name (e.g. 'state-divisions', 'zones')
 * @param {object} form - Current form state
 * @param {object} allOptions - { 'state-divisions': [...], 'zones': [...], ... }
 * @returns {array} Filtered options for the dropdown
 */
export function getFilteredLocationOptions(table, form, allOptions) {
  const list = allOptions[table] || [];
  const rules = TABLE_FILTER[table];
  if (!rules || rules.length === 0) return list;
  const formVal = (name) => {
    const v = form[name];
    return v === '' || v === undefined ? null : (typeof v === 'number' ? v : Number(v));
  };
  return list.filter((opt) => {
    return rules.every(({ parent, key }) => {
      const parentVal = formVal(parent);
      // If this parent is not selected yet, don't filter on it.
      if (parentVal == null) return true;
      const optVal = opt[key];
      const n = optVal != null ? Number(optVal) : null;
      return n === parentVal;
    });
  });
}

/** Map form field name to API table name for location dropdowns. */
export const LOCATION_FIELD_TABLE = {
  country_id: 'countries',
  country_division_id: 'country-divisions',
  state_id: 'states',
  state_division_id: 'state-divisions',
  state_sub_division_id: 'state-sub-divisions',
  region_id: 'regions',
  zone_id: 'zones',
  vidhan_sabha_id: 'vidhan-sabhas',
  taluka_id: 'talukas',
  block_id: 'blocks',
  circle_id: 'circles',
  gram_panchayat_id: 'gram-panchayats',
  village_id: 'villages',
};

/**
 * Returns true if the dropdown for this field should be disabled (parent not selected).
 */
export function isLocationFieldDisabled(fieldName, form) {
  if (fieldName === 'country_id') return false;
  const table = LOCATION_FIELD_TABLE[fieldName];
  const rules = table ? TABLE_FILTER[table] : [];
  if (!rules || rules.length === 0) return false;
  return rules.some(({ parent }) => {
    // If this parent field does not exist on this form, do not block the dropdown.
    if (!Object.prototype.hasOwnProperty.call(form, parent)) return false;
    const v = form[parent];
    return v === '' || v === undefined || v === null;
  });
}

function getTableByField(fieldName) {
  return LOCATION_FIELD_TABLE[fieldName] || '';
}

/**
 * When a location field changes, return updated form with the new value and all dependents cleared.
 */
export function clearDependentsOnChange(form, fieldName, value) {
  const toClear = DEPENDENTS[fieldName] || [];
  const next = { ...form, [fieldName]: value };
  toClear.forEach((key) => {
    next[key] = null;
  });
  return next;
}
