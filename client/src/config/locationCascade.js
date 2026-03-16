/**
 * Location dropdown cascade: when user selects State (e.g. Nepal), next dropdowns
 * show only options for that state (divisions, zones, vidhan sabha, etc.).
 * Each dropdown is enabled only when its parent(s) are selected.
 */

export const LOCATION_ORDER = [
  'country_id',
  'country_division_id',
  'state_id',
  'state_circle_id',
  'state_division_id',
  'state_sub_division_id',
  'region_id',
  'zone_id',
  'vidhan_sabha_type',
  'vidhan_sabha_id',
  'taluka_id',
  'block_id',
  'circle_id',
  'gram_panchayat_id',
  'village_id',
];

/**
 * Returns Vidhan Sabha type options for the selected zone (from Vidhan Sabha master data).
 * e.g. PAK zone may have only Arbun, IND zone only Ruler – options are zone-based.
 * @param {number|string|null} zoneId - Selected zone id
 * @param {array} vidhanSabhasList - Full list from options['vidhan-sabhas']
 * @returns {string[]} Distinct vidhan_sabha_type values for that zone, sorted
 */
export function getVidhanSabhaTypeOptionsForZone(zoneId, vidhanSabhasList) {
  if (zoneId == null || zoneId === '' || !Array.isArray(vidhanSabhasList)) return [];
  const zoneNum = Number(zoneId);
  if (Number.isNaN(zoneNum)) return [];
  const types = new Set();
  vidhanSabhasList.forEach((vs) => {
    const vsZone = vs.zone_id != null ? Number(vs.zone_id) : null;
    if (vsZone === zoneNum && vs.vidhan_sabha_type != null && String(vs.vidhan_sabha_type).trim() !== '') {
      types.add(String(vs.vidhan_sabha_type).trim());
    }
  });
  return Array.from(types).sort();
}

/**
 * Same Geographic Information fields for all registration forms (Management, Farmer, Customer, Lakhpati Didi).
 * Country → … → Zone → Vidhan Sabha types → Vidhan Sabha → Taluka → Block → Panchayat Samiti Circle → Gram Panchayat → Village.
 */
export const GEOGRAPHIC_FIELDS = [
  { name: 'country_id', label: 'Country', table: 'countries' },
  { name: 'country_division_id', label: 'Country Division', table: 'country-divisions' },
  { name: 'state_id', label: 'State', table: 'states' },
  { name: 'state_circle_id', label: 'State Circle', table: 'state-circles' },
  { name: 'state_division_id', label: 'State Division', table: 'state-divisions' },
  { name: 'state_sub_division_id', label: 'State Sub Division', table: 'state-sub-divisions' },
  { name: 'region_id', label: 'Region', table: 'regions' },
  { name: 'zone_id', label: 'Zone', table: 'zones' },
  { name: 'vidhan_sabha_type', label: 'Vidhan Sabha types' },
  { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { name: 'taluka_id', label: 'Taluka', table: 'talukas' },
  { name: 'block_id', label: 'Block', table: 'blocks' },
  { name: 'circle_id', label: 'Panchayat Samiti Circle', table: 'circles' },
  { name: 'gram_panchayat_id', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { name: 'village_id', label: 'Village', table: 'villages' },
];

/** When this field changes, clear these dependent fields (and their dependents). */
export const DEPENDENTS = {
  country_id: ['country_division_id', 'state_id', 'state_circle_id', 'state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  country_division_id: ['state_id', 'state_circle_id', 'state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_id: ['state_circle_id', 'state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_circle_id: ['state_division_id', 'state_sub_division_id', 'region_id', 'zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_division_id: ['state_sub_division_id', 'zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  state_sub_division_id: ['zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  region_id: ['zone_id', 'vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  zone_id: ['vidhan_sabha_type', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
  vidhan_sabha_type: ['vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'],
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
  'state-circles': [{ parent: 'state_id', key: 'state_id' }],
  'state-divisions': [{ parent: 'state_circle_id', key: 'state_circle_id' }],
  'state-sub-divisions': [{ parent: 'state_division_id', key: 'state_division_id' }],
  'state_sub_divisions': [{ parent: 'state_division_id', key: 'state_division_id' }],
  'regions': [{ parent: 'state_id', key: 'state_id' }],
  'zones': [{ parent: 'state_id', key: 'state_id' }],
  'vidhan-sabhas': [{ parent: 'state_id', key: 'state_id' }, { parent: 'zone_id', key: 'zone_id' }, { parent: 'vidhan_sabha_type', key: 'vidhan_sabha_type', stringMatch: true }],
  // Talukas filtered by state and Vidhan Sabha so next fields (Block, Circle, GP, Village) are based on Vidhan Sabha type (Ruler/Arbun).
  'talukas': [{ parent: 'state_id', key: 'state_id' }, { parent: 'vidhan_sabha_id', key: 'vidhan_sabha_id' }],
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
    return rules.every(({ parent, key, stringMatch }) => {
      const parentVal = stringMatch ? (form[parent] ?? '') : formVal(parent);
      // If this parent is not selected yet, don't filter on it.
      if (stringMatch) {
        if (parentVal === '' || parentVal == null) return true;
        return (opt[key] != null ? String(opt[key]).trim() : '') === String(parentVal).trim();
      }
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
  state_circle_id: 'state-circles',
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
 * First field (Country) is always enabled; each next field is enabled only after its parent has a value.
 */
export function isLocationFieldDisabled(fieldName, form) {
  if (fieldName === 'country_id') return false;
  // Vidhan Sabha types is enabled only when Zone is selected.
  if (fieldName === 'vidhan_sabha_type') {
    const v = form.zone_id;
    return v === '' || v === undefined || v === null;
  }
  const table = LOCATION_FIELD_TABLE[fieldName];
  const rules = table ? TABLE_FILTER[table] : [];
  if (!rules || rules.length === 0) return false;
  return rules.some(({ parent }) => {
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
