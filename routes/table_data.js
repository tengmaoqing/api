var express = require('express');
var router = express.Router();
const tableData = require('../controllers/table_data.js');


router.get('/components', tableData.getAllCOM);

module.exports = router;
