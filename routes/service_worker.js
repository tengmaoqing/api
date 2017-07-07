var express = require('express');
var router = express.Router();
const sw = require('../controllers/sw.js');


router.get('/get_rsc_by_page', sw.get_rsc_by_page);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
