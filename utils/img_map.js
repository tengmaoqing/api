/*
* @Author: tengmaoqing
* @Date:   2017-11-29 17:08:16
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2017-12-06 20:08:37
*/

const fs = require('fs');
const path = require('path');
const fileDir = path.join(__dirname, '../public/temp.json');
const utils = require('../utils');

exports.add = function (req, res, next) {
  let query = req.body;
  const fileName = query.fileName;
  const url = query.url;

  if (!fileName || !url) {
    res.json(utils.dataWrap(null, 'url、fileName必须', 1));
    return;
  }

  fs.readFile(fileDir, 'utf8', (err, data) => {
    if (err) next(err);

    try {
      let C = {};
      if (data) {
        C = JSON.parse(data);
      }
      C[fileName] = url;
      const fileC = JSON.stringify(C, null, 2);
      fs.writeFile(fileDir, fileC, (err, data) => {
        if (err) next(err);
        res.json(utils.dataWrap(null, '成功'))
      });
    } catch (err) {
      next(err);
    }

  });
};

// var pushImgInfo = (url, fileName, cb, err) => {

//   $.ajax({
//     url: 'http://127.0.0.1:3000/utils/addImgMap',
//     type: 'post',
//     data: {
//       url,
//       fileName
//     },
//     dataType: 'json',
//     success: function (res) {
//       if (res.status !== 0) {
//         return;
//       }
//       cb && cb();
//     },
//     error: function () {
//       err && err();
//     }
//   })
// }

// var nextPage = () => {
//   const nextDom = $('.pagination .servernext');
//   if (nextDom.hasClass('disabled')) {
//     return;
//   }
//   nextDom.click();
//   setTimeout(() => {
//     eachImg();
//   }, 3000);
// };

// var eachImg = (i = 0) => {
//   var imgWapper = $('#J_Picture .item');
//   if (!imgWapper[i]) {
//     nextPage();
//     return;
//   }
//   const fileName = imgWapper.eq(i).find('.img-name').attr('title');
//   imgWapper.eq(i).find('.copy-link').click();
//   const url = $('#J_Modal .modal-body textarea').val();
//   $('#J_Modal .close').click();
//   pushImgInfo(url, fileName, () => {
//     setTimeout(() => {
//       i++;
//       eachImg(i);
//     }, 300);
//   }, () => {
//     eachImg(i);
//   });
// }