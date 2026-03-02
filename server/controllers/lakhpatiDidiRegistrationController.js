const LakhpatiDidiModel = require('../models/LakhpatiDidiRegistration.model');

const getAll = async (req, res) => {
  try {
    const rows = await LakhpatiDidiModel.findAll();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const row = await LakhpatiDidiModel.findById(req.params.id);
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
    const row = await LakhpatiDidiModel.create(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const row = await LakhpatiDidiModel.update(req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await LakhpatiDidiModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
