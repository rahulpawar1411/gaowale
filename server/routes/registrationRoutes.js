const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementRegistrationController');
const farmerController = require('../controllers/farmerRegistrationController');
const customerController = require('../controllers/customerRegistrationController');
const lakhpatiDidiController = require('../controllers/lakhpatiDidiRegistrationController');

router.get('/management', managementController.getAll);
router.get('/management/:id', managementController.getById);
router.post('/management', managementController.create);
router.put('/management/:id', managementController.update);
router.delete('/management/:id', managementController.remove);

router.get('/farmer', farmerController.getAll);
router.get('/farmer/:id', farmerController.getById);
router.post('/farmer', farmerController.create);
router.put('/farmer/:id', farmerController.update);
router.delete('/farmer/:id', farmerController.remove);

router.get('/customer', customerController.getAll);
router.get('/customer/:id', customerController.getById);
router.post('/customer', customerController.create);
router.put('/customer/:id', customerController.update);
router.delete('/customer/:id', customerController.remove);

router.get('/lakhpati-didi', lakhpatiDidiController.getAll);
router.get('/lakhpati-didi/:id', lakhpatiDidiController.getById);
router.post('/lakhpati-didi', lakhpatiDidiController.create);
router.put('/lakhpati-didi/:id', lakhpatiDidiController.update);
router.delete('/lakhpati-didi/:id', lakhpatiDidiController.remove);

module.exports = router;
