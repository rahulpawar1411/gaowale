const FarmerModel = require('../models/FarmerRegistration.model');

const getAll = async (req, res) => {
  try {
    const rows = await FarmerModel.findAll();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const row = await FarmerModel.findById(req.params.id);
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
    const row = await FarmerModel.create(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('Farmer registration create error:', err.code || err.errno, err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create farmer registration',
      code: err.code,
      errno: err.errno,
    });
  }
};

const update = async (req, res) => {
  try {
    const row = await FarmerModel.update(req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await FarmerModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeAll = async (req, res) => {
  try {
    const count = await FarmerModel.removeAll();
    res.json({ success: true, message: `Deleted ${count} farmer registration(s).`, deletedCount: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, removeAll };
