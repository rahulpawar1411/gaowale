const MasterModel = require('../models/masterData.model');

const getTableName = (param) => {
  if (param == null || typeof param !== 'string') return null;
  const trimmed = param.trim();
  if (!trimmed) return null;
  const map = {
    'continent': 'continents',
    'product': 'products',
    'country-divisions': 'country_divisions',
    'state-divisions': 'state_divisions',
    'state-sub-divisions': 'state_sub_divisions',
    'vidhan-sabhas': 'vidhan_sabhas',
    'gram-panchayats': 'gram_panchayats',
    'business-types': 'business_types',
    'unit-types': 'unit_types',
    'business-categories': 'business_categories',
    'business-sub-categories': 'business_sub_categories',
    'position-allotments': 'position_allotments',
  };
  return map[trimmed] || trimmed.replace(/-/g, '_');
};

const listTables = (req, res) => {
  res.json({
    success: true,
    data: MasterModel.ALLOWED_TABLES.map((t) => t.replace(/_/g, '-')),
  });
};

const getAll = async (req, res) => {
  try {
    const table = getTableName(req.params.table);
    if (!table || !MasterModel.isAllowed(table)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name',
        allowed: MasterModel.ALLOWED_TABLES.map((t) => t.replace(/_/g, '-')),
      });
    }
    const rows = await MasterModel.findAll(table);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const table = getTableName(req.params.table);
    const id = req.params.id;
    if (!table || !MasterModel.isAllowed(table)) {
      return res.status(400).json({ success: false, message: 'Invalid table name' });
    }
    const row = await MasterModel.findById(table, id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const table = getTableName(req.params.table);
    if (!table || !MasterModel.isAllowed(table)) {
      return res.status(400).json({ success: false, message: 'Invalid table name' });
    }
    const body = req.body || {};
    if (body.name !== undefined && !String(body.name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    // Business Sub Category requires a business category
    if (table === 'business_sub_categories' && (body.business_category_id == null || body.business_category_id === '')) {
      return res.status(400).json({ success: false, message: 'Business Category is required' });
    }
    const row = await MasterModel.create(table, body);
    if (!row) {
      return res.status(400).json({ success: false, message: 'Invalid or empty data' });
    }
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('Master create error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const table = getTableName(req.params.table);
    const id = req.params.id;
    if (!table || !MasterModel.isAllowed(table)) {
      return res.status(400).json({ success: false, message: 'Invalid table name' });
    }
    const body = req.body || {};
    if (body.name !== undefined && !String(body.name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (table === 'business_sub_categories' && (body.business_category_id == null || body.business_category_id === '')) {
      return res.status(400).json({ success: false, message: 'Business Category is required' });
    }
    const row = await MasterModel.update(table, id, body);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const table = getTableName(req.params.table);
    const id = req.params.id;
    if (!table || !MasterModel.isAllowed(table)) {
      return res.status(400).json({ success: false, message: 'Invalid table name' });
    }
    const deleted = await MasterModel.remove(table, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: this record is in use by other data.',
      });
    }
    console.error('Delete error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listTables, getAll, getById, create, update, remove };
