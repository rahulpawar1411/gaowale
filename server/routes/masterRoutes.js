const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/', masterDataController.listTables);
router.get('/:table/search', masterDataController.search);
router.get('/:table/lookup', masterDataController.lookup);
router.get('/:table/:id', masterDataController.getById);
router.get('/:table', masterDataController.getAll);
router.post('/:table', masterDataController.create);
router.put('/:table/:id', masterDataController.update);
router.delete('/:table/:id', masterDataController.remove);

module.exports = router;
