
exports.dataWrap = function (data, msg, status = 0) {

  return {
    data,
    status,
    msg
  }
}