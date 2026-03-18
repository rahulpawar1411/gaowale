const masterDataService = require('../services/masterDataService');

const listTables = async (req, res, next) => {
  try {
    const data = await masterDataService.listTables();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const rows = await masterDataService.getAll(req.params.table);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const row = await masterDataService.getById(req.params.table, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const row = await masterDataService.create(req.params.table, req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const row = await masterDataService.update(req.params.table, req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await masterDataService.remove(req.params.table, req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

const lookup = async (req, res, next) => {
  try {
    const row = await masterDataService.lookup(req.params.table, req.query || {});
    res.json({ success: true, data: row || null });
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    const rows = await masterDataService.search(req.params.table, req.query || {});
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTables, getAll, getById, lookup, search, create, update, remove };
