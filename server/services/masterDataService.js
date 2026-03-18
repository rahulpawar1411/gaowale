const MasterModel = require('../models/masterData.model');
const { httpError } = require('../utils/httpError');

const getTableName = (param) => {
  if (param == null || typeof param !== 'string') return null;
  const trimmed = param.trim();
  if (!trimmed) return null;
  const map = {
    continent: 'continents',
    product: 'products',
    'country-divisions': 'country_divisions',
    'state-circles': 'state_circles',
    'state-divisions': 'state_divisions',
    'state-sub-divisions': 'state_sub_divisions',
    'vidhan-sabhas': 'vidhan_sabhas',
    'gram-panchayats': 'gram_panchayats',
    'business-types': 'business_types',
    'unit-types': 'types_of_units',
    'business-categories': 'business_categories',
    'business-sub-categories': 'business_sub_categories',
    'business-positions': 'business_positions',
    'business-sectors': 'business_sectors',
    'position-allotments': 'position_allotments',
    'business-unit-allotments': 'business_unit_allotments',
    'lakhpati-didi-users': 'lakhpati_didi_users',
  };
  return map[trimmed] || trimmed.replace(/-/g, '_');
};

function assertAllowed(tableParam) {
  const table = getTableName(tableParam);
  if (!table || !MasterModel.isAllowed(table)) {
    throw httpError(400, 'Invalid table name');
  }
  return table;
}

function validateBody(table, body) {
  const data = body || {};
  const skipNameCheck = table === 'position_allotments' || table === 'business_unit_allotments';
  if (!skipNameCheck && data.name !== undefined && !String(data.name).trim()) {
    throw httpError(400, 'Name is required');
  }
  if (table === 'business_sub_categories' && (data.business_category_id == null || data.business_category_id === '')) {
    throw httpError(400, 'Business Category is required');
  }
  if (table === 'state_circles' && (data.state_id == null || data.state_id === '')) {
    throw httpError(400, 'State is required');
  }
  return data;
}

async function listTables() {
  return MasterModel.ALLOWED_TABLES.map((t) => t.replace(/_/g, '-'));
}

async function getAll(tableParam) {
  const table = assertAllowed(tableParam);
  return MasterModel.findAll(table);
}

async function getById(tableParam, id) {
  const table = assertAllowed(tableParam);
  const row = await MasterModel.findById(table, id);
  if (!row) throw httpError(404, 'Not found');
  return row;
}

async function create(tableParam, body) {
  const table = assertAllowed(tableParam);
  const data = validateBody(table, body);
  const row = await MasterModel.create(table, data);
  if (!row) throw httpError(400, 'Invalid or empty data');
  return row;
}

async function update(tableParam, id, body) {
  const table = assertAllowed(tableParam);
  const data = validateBody(table, body);
  const row = await MasterModel.update(table, id, data);
  if (!row) throw httpError(404, 'Not found');
  return row;
}

async function remove(tableParam, id) {
  const table = assertAllowed(tableParam);
  try {
    const deleted = await MasterModel.remove(table, id);
    if (!deleted) throw httpError(404, 'Not found');
    return true;
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      throw httpError(400, 'Cannot delete: this record is in use by other data.');
    }
    throw err;
  }
}

async function lookup(tableParam, query) {
  const table = assertAllowed(tableParam);
  if (table !== 'business_unit_allotments') throw httpError(400, 'Lookup not supported for this table');
  const aadhar = query.aadhar || query.aadhaar || query.aadhar_card_number;
  const pan = query.pan || query.pan_card_number;
  return MasterModel.findBusinessUnitAllotmentByKyc({ aadhar, pan });
}

async function search(tableParam, query) {
  const table = assertAllowed(tableParam);
  if (table !== 'business_unit_allotments') throw httpError(400, 'Search not supported for this table');
  const aadhar = query.aadhar || query.aadhaar || query.aadhar_card_number;
  const pan = query.pan || query.pan_card_number;
  return MasterModel.findBusinessUnitAllotmentsByKyc({ aadhar, pan });
}

module.exports = {
  listTables,
  getAll,
  getById,
  create,
  update,
  remove,
  lookup,
  search,
};

