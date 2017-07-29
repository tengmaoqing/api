var express = require('express');
var router = express.Router();

const editpage = require('../controllers/editpage.js');

/* GET home page. */
router.get('/h5', editpage.h5Base);

router.post('/generateTpl', editpage.generateTpl);

router.post('/page', editpage.updatePage);
router.post('/getComponents', editpage.getComponents);
router.post('/getDirectives', editpage.getDirectives);


module.exports = router;
