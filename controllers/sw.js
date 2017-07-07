
const getAllRscByPage = require('../utils/getAllRscByPage');
const utils = require('../utils');

exports.get_rsc_by_page = function (req, res, next) {

  let uri = req.query.uri;

  if (!uri) {
    res.json(utils.dataWrap(null, 'uri 是必须的', 1));
    return;
  }

  getAllRscByPage(uri).then(data => {
    res.send(utils.dataWrap(data));
  });
};

// module.exports