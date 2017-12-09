/*
* @Author: tengmaoqing
* @Date:   2017-11-29 17:05:52
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2017-11-29 20:01:05
*/

var express = require('express');
var router = express.Router();
const imgMap = require('../utils/img_map.js');

router.post('/addImgMap', imgMap.add);

module.exports = router;
