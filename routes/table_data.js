var express = require('express');
var router = express.Router();
const tableData = require('../controllers/table_data.js');

router.get('/components', tableData.getAllCOM);
router.get('/template', tableData.getAllCOMHTML);
router.get('/src', tableData.getAllSRC);
router.get('/categorys', tableData.getCategorys);

module.exports = router;
